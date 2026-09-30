/**
 * ─────────────────────────────────────────────────────────────────────
 *  SİNAN & ŞULE — Davetiye arka ucu (Google Apps Script + Google Sheets)
 *
 *  Veri akışı:  Misafir → Vercel (/api/*) → bu web uygulaması → Google Sheet
 *  Tarayıcı bu adresi hiç görmez; her istek gizli anahtarla (API_SECRET) gelir.
 *
 *  KURULUM (README'de adım adım):
 *   1. Yeni bir Google Sheet açın → Uzantılar → Apps Script.
 *   2. Bu dosyanın tamamını Code.gs içine yapıştırıp kaydedin.
 *   3. Üstteki listeden `setup` fonksiyonunu seçip ▶ Çalıştır'a basın.
 *      (İlk seferde Google izin ister.) RSVP ve GUESTBOOK sayfaları kurulur,
 *      API_SECRET üretilir ve "Yürütme günlüğü"ne yazılır.
 *   4. Dağıt → Yeni dağıtım → Tür: Web uygulaması
 *        Şu kullanıcı olarak yürüt: Ben
 *        Erişimi olanlar: Herkes
 *      → Dağıt → "Web uygulaması URL'si"ni (…/exec) kopyalayın.
 *   5. Vercel → Settings → Environment Variables:
 *        APPS_SCRIPT_URL    = …/exec adresi
 *        APPS_SCRIPT_SECRET = günlükteki API_SECRET
 *
 *  Kodu değiştirirseniz: Dağıt → Dağıtımları yönet → düzenle (kalem) →
 *  Sürüm: "Yeni sürüm" → Dağıt. (Adres aynı kalır.)
 * ─────────────────────────────────────────────────────────────────────
 */

var SHEETS = {
  rsvp: {
    name: 'RSVP',
    headers: ['id', 'name', 'phone', 'attendance', 'guest_count', 'note', 'created_at', 'updated_at'],
    widths: [90, 200, 150, 110, 110, 320, 150, 150],
  },
  guestbook: {
    name: 'GUESTBOOK',
    headers: ['id', 'name', 'message', 'visibility', 'approved', 'created_at'],
    widths: [90, 160, 420, 110, 90, 150],
  },
};

var LIMITS = { name: 80, phone: 24, note: 500, message: 400, noteName: 60, maxGuests: 20 };

// Hız sınırları: [izin verilen istek sayısı, pencere (saniye)]
// Not: mobil operatörler birçok kullanıcıyı aynı IP'de toplar (CGNAT); sınırlar cömert tutuldu.
var RATE = {
  rsvp: [25, 600], // aynı IP'den 10 dakikada 25 RSVP
  guestbook: [15, 600], // aynı IP'den 10 dakikada 15 not
  writes: [400, 3600], // tüm site için saatte 400 yazma (spam seli sigortası)
};

/* ───────────────────────────── Giriş noktaları ───────────────────────────── */

function doPost(e) {
  var body;
  try {
    body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return json_({ ok: false, error: 'bad_json' });
  }

  var secret = PropertiesService.getScriptProperties().getProperty('API_SECRET');
  if (!secret || !safeEqual_(body.secret, secret)) return json_({ ok: false, error: 'unauthorized' });

  try {
    var client = body.client || {};
    switch (body.action) {
      case 'rsvp.submit':
        return json_(submitRsvp_(body.payload || {}, client));
      case 'guestbook.submit':
        return json_(submitNote_(body.payload || {}, client));
      case 'guestbook.list':
        return json_(listNotes_(body.payload || {}));
      case 'admin.summary':
        return json_(adminSummary_());
      case 'ping':
        return json_({ ok: true, now: new Date().toISOString() });
      default:
        return json_({ ok: false, error: 'unknown_action' });
    }
  } catch (err) {
    console.error(err && err.stack ? err.stack : err);
    return json_({ ok: false, error: 'server_error' });
  }
}

/** Sağlık kontrolü: tarayıcıda /exec açılınca veri göstermez. */
function doGet() {
  return json_({ ok: true, service: 'sinan-sule-davetiye' });
}

/* ───────────────────────────────── Kurulum ───────────────────────────────── */

function setup() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  ss.setSpreadsheetTimeZone('Europe/Istanbul');

  var rsvp = ensureSheet_(SHEETS.rsvp);
  rsvp.getRange('C:C').setNumberFormat('@'); // telefon: metin (baştaki + ve 0 kaybolmasın)
  rsvp.getRange('E:E').setNumberFormat('0');
  rsvp.getRange('G:H').setNumberFormat('dd.MM.yyyy HH:mm');

  var guestbook = ensureSheet_(SHEETS.guestbook);
  guestbook.getRange('F:F').setNumberFormat('dd.MM.yyyy HH:mm');
  guestbook.getRange('C:C').setWrap(true);

  // Boş varsayılan sayfayı (Sayfa1 / Sheet1) temizle
  ss.getSheets().forEach(function (sheet) {
    var n = sheet.getName();
    if ((n === 'Sayfa1' || n === 'Sheet1') && sheet.getLastRow() === 0 && ss.getSheets().length > 2) ss.deleteSheet(sheet);
  });

  var props = PropertiesService.getScriptProperties();
  var secret = props.getProperty('API_SECRET');
  if (!secret) {
    secret = (Utilities.getUuid() + Utilities.getUuid()).replace(/-/g, '');
    props.setProperty('API_SECRET', secret);
  }
  if (props.getProperty('GUESTBOOK_AUTO_APPROVE') === null) props.setProperty('GUESTBOOK_AUTO_APPROVE', 'true');

  console.log('Kurulum tamam. Vercel\'e APPS_SCRIPT_SECRET olarak şunu girin:\n' + secret);
}

/* ─────────────────────────────────── RSVP ─────────────────────────────────── */

// attendance: yes (katılıyor) · no (katılamıyor) · maybe (belirsiz)
function submitRsvp_(p, client) {
  var attendance = ['yes', 'no', 'maybe'].indexOf(p.attendance) >= 0 ? p.attendance : null;
  var coming = attendance === 'yes' || attendance === 'maybe';
  var name = oneLine_(p.name, LIMITS.name);
  var phone = String(p.phone || '').replace(/[^\d+]/g, '').slice(0, LIMITS.phone);
  var guests = coming ? Math.floor(Number(p.guestCount)) : 0;
  var note = multiLine_(p.note, LIMITS.note);

  if (!attendance || name.length < 2) return { ok: false, error: 'invalid' };
  if (coming && !(guests >= 1 && guests <= LIMITS.maxGuests)) return { ok: false, error: 'invalid' };

  return withLock_(function () {
    if (!allow_('rsvp', client.ipHash) || !allow_('writes', 'all')) return { ok: false, error: 'rate_limited' };

    var sheet = sheet_(SHEETS.rsvp);
    var values = sheet.getDataRange().getValues();
    var index = findRsvp_(values, name, phone);
    var now = new Date();

    // Aynı kişi (aynı telefon ya da telefonsuz aynı isim) tekrar yanıtlarsa satırı güncelle
    if (index > 0) {
      sheet.getRange(index + 1, 2, 1, 5).setValues([[text_(name), text_(phone), attendance, guests, text_(note)]]);
      sheet.getRange(index + 1, 8).setValue(now);
      return { ok: true, status: 'updated' };
    }

    sheet.appendRow([newId_(), text_(name), text_(phone), attendance, guests, text_(note), now, now]);
    return { ok: true, status: 'created' };
  });
}

function findRsvp_(values, name, phone) {
  var key = norm_(name);
  // Son 10 hane: "+90 555…", "0555…" ve "555…" aynı numara sayılır
  var tail = function (value) {
    var d = String(value || '').replace(/\D/g, '');
    return d.length >= 10 ? d.slice(-10) : d;
  };
  var digits = tail(phone);
  var byName = -1;
  for (var i = values.length - 1; i >= 1; i--) {
    var rowDigits = tail(values[i][2]);
    if (digits && rowDigits && rowDigits === digits) return i;
    if (byName < 0 && norm_(values[i][1]) === key && (!digits || !rowDigits)) byName = i;
  }
  return byName;
}

/* ───────────────────────────────── Notlar ───────────────────────────────── */

function submitNote_(p, client) {
  var message = multiLine_(p.message, LIMITS.message);
  var name = oneLine_(p.name, LIMITS.noteName);
  var visibility = ['public', 'anonymous', 'private'].indexOf(p.visibility) >= 0 ? p.visibility : null;
  if (message.length < 2 || !visibility || (visibility === 'public' && !name)) return { ok: false, error: 'invalid' };

  return withLock_(function () {
    if (!allow_('guestbook', client.ipHash) || !allow_('writes', 'all')) return { ok: false, error: 'rate_limited' };

    var sheet = sheet_(SHEETS.guestbook);
    var last = sheet.getLastRow();

    // Aynı not kısa süre içinde ikinci kez gelirse (çift tıklama vb.) yazma
    if (last > 1) {
      var from = Math.max(2, last - 59);
      var recent = sheet.getRange(from, 3, last - from + 1, 1).getValues();
      var key = norm_(message);
      for (var i = 0; i < recent.length; i++) if (norm_(recent[i][0]) === key) return { ok: true, status: 'duplicate' };
    }

    var approved = PropertiesService.getScriptProperties().getProperty('GUESTBOOK_AUTO_APPROVE') !== 'false';
    var id = newId_();
    var now = new Date();
    var row = last + 1;
    sheet.getRange(row, 5).insertCheckboxes(); // "approved" sütunu tek tıkla açılıp kapansın
    sheet.getRange(row, 1, 1, 6).setValues([[id, text_(name), text_(message), visibility, approved, now]]);

    if (visibility === 'private') return { ok: true, status: 'private' };
    if (!approved) return { ok: true, status: 'pending' };
    return {
      ok: true,
      status: 'published',
      note: { id: id, name: visibility === 'public' ? name : null, message: message, createdAt: now.toISOString() },
    };
  });
}

function listNotes_(p) {
  var limit = Math.min(Math.max(Number(p.limit) || 50, 1), 200);
  var sheet = sheet_(SHEETS.guestbook);
  var last = sheet.getLastRow();
  if (last < 2) return { ok: true, notes: [] };

  var rows = sheet.getRange(2, 1, last - 1, 6).getValues();
  var notes = [];
  for (var i = rows.length - 1; i >= 0 && notes.length < limit; i--) {
    var r = rows[i];
    if (!isTrue_(r[4]) || r[3] === 'private' || !r[2]) continue;
    notes.push({
      id: String(r[0]),
      name: r[3] === 'public' ? String(r[1] || '') || null : null,
      message: String(r[2]),
      createdAt: iso_(r[5]),
    });
  }
  return { ok: true, notes: notes };
}

/* ────────────────────────────────── Yönetim ────────────────────────────────── */

function adminSummary_() {
  var rsvps = rows_(SHEETS.rsvp).map(function (r) {
    return {
      id: String(r[0]),
      name: String(r[1] || ''),
      phone: String(r[2] || ''),
      attendance: r[3] === 'yes' || r[3] === 'maybe' ? r[3] : 'no',
      guestCount: Number(r[4]) || 0,
      note: String(r[5] || ''),
      createdAt: iso_(r[6]),
      updatedAt: iso_(r[7] || r[6]),
    };
  });
  rsvps.sort(function (a, b) {
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  var notes = rows_(SHEETS.guestbook)
    .map(function (r) {
      return {
        id: String(r[0]),
        name: String(r[1] || ''),
        message: String(r[2] || ''),
        visibility: r[3] === 'public' || r[3] === 'private' ? r[3] : 'anonymous',
        approved: isTrue_(r[4]),
        createdAt: iso_(r[5]),
      };
    })
    .reverse();

  var attending = rsvps.filter(function (r) {
    return r.attendance === 'yes';
  });
  var maybe = rsvps.filter(function (r) {
    return r.attendance === 'maybe';
  });
  var sum = function (list) {
    return list.reduce(function (total, r) {
      return total + r.guestCount;
    }, 0);
  };
  return {
    ok: true,
    stats: {
      responses: rsvps.length,
      attending: attending.length,
      declined: rsvps.length - attending.length - maybe.length,
      maybe: maybe.length,
      guests: sum(attending),
      maybeGuests: sum(maybe),
      notes: notes.length,
    },
    rsvps: rsvps,
    notes: notes,
    generatedAt: new Date().toISOString(),
  };
}

/* ─────────────────────────────── Yardımcılar ─────────────────────────────── */

function json_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}

function safeEqual_(a, b) {
  a = String(a || '');
  b = String(b || '');
  if (a.length !== b.length) return false;
  var diff = 0;
  for (var i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

function withLock_(fn) {
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(15000)) return { ok: false, error: 'busy' };
  try {
    return fn();
  } finally {
    lock.releaseLock();
  }
}

/** CacheService ile basit hız sınırı (tüm Vercel örnekleri için ortak). */
function allow_(bucket, key) {
  var rule = RATE[bucket];
  if (!rule) return true;
  var cache = CacheService.getScriptCache();
  var cacheKey = 'rl:' + bucket + ':' + String(key || 'anon').slice(0, 40);
  var count = Number(cache.get(cacheKey) || 0);
  if (count >= rule[0]) return false;
  cache.put(cacheKey, String(count + 1), rule[1]);
  return true;
}

function ensureSheet_(def) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(def.name) || ss.insertSheet(def.name);
  if (sheet.getLastRow() === 0) sheet.appendRow(def.headers);
  sheet.getRange(1, 1, 1, def.headers.length).setFontWeight('bold').setBackground('#f2ede4');
  sheet.setFrozenRows(1);
  def.widths.forEach(function (w, i) {
    sheet.setColumnWidth(i + 1, w);
  });
  return sheet;
}

function sheet_(def) {
  return SpreadsheetApp.getActiveSpreadsheet().getSheetByName(def.name) || ensureSheet_(def);
}

function rows_(def) {
  var sheet = sheet_(def);
  var last = sheet.getLastRow();
  if (last < 2) return [];
  return sheet.getRange(2, 1, last - 1, def.headers.length).getValues().filter(function (r) {
    return r[0] !== '';
  });
}

var INVISIBLE_ = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁠-⁤⁦-⁩﻿]/g;

function oneLine_(value, max) {
  return String(value == null ? '' : value)
    .replace(INVISIBLE_, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, max);
}

function multiLine_(value, max) {
  return String(value == null ? '' : value)
    .replace(/\r\n?/g, '\n')
    .replace(INVISIBLE_, '')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim()
    .slice(0, max);
}

/** Formül enjeksiyonuna karşı: =, +, -, @ ile başlayan metinler düz metin olarak yazılır. */
function text_(value) {
  var s = String(value == null ? '' : value);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

/** Türkçe duyarlı karşılaştırma anahtarı: "Ayşe  YILMAZ" → "ayse yilmaz" */
function norm_(value) {
  var map = { ç: 'c', ğ: 'g', ı: 'i', ö: 'o', ş: 's', ü: 'u', â: 'a', î: 'i', û: 'u' };
  return String(value || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[çğıöşüâîû]/g, function (c) {
      return map[c];
    })
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

function isTrue_(value) {
  return value === true || String(value).toUpperCase() === 'TRUE';
}

function iso_(value) {
  if (value instanceof Date) return value.toISOString();
  var d = new Date(value);
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

function newId_() {
  return Utilities.getUuid().replace(/-/g, '').slice(0, 10);
}
