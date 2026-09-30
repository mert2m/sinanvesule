# Sinan & Şule — Nişan Davetiyesi

17 Ekim 2026 · Bahçe, Baklacı / Beykoz

Tek sayfalık, mobil öncelikli, sinematik bir dijital davetiye. Katılım (RSVP) ve not defteri
verileri **Google Sheets**'e yazılır; sunucu tarafı **Google Apps Script**, site **Vercel**'de
çalışır. Toplam maliyet: **0 TL** (alan adı yok, ücretli veritabanı yok).

```
Misafirin telefonu ──► Vercel (Next.js sayfası + /api/*) ──► Apps Script web uygulaması ──► Google Sheet
                         (gizli anahtar sunucuda kalır)        (kilitli yazma, hız sınırı)     (RSVP, GUESTBOOK)
```

- **Tasarım:** “Çengel” — bkz. [DESIGN.md](DESIGN.md)
- **Teknoloji:** Next.js 16 (App Router, TypeScript), Tailwind CSS 4, Motion (Framer Motion), Google Apps Script, Google Sheets, Vercel

---

## 1. İçeriği düzenlemek

**Bütün içerik tek dosyada:** [`src/content/invitation.ts`](src/content/invitation.ts)
İsimler, tarih/saat, mekan, program, müzik, RSVP ayarları ve sayfadaki bütün cümleler buradadır.
Tasarım koduna dokunmanız gerekmez.

> ⚠️ **Yayından önce doğrulayın:** Etkinlik saati (14.00), program saatleri ve son yanıt tarihi (10 Ekim)
> referans davetiyeye göre **örnek** olarak girildi. Kesin bilgilerle güncelleyin.
> Mekan bilgisi (Bahçe · Hisar Sk. No:6, Baklacı, Beykoz · Google Haritalar bağlantısı) referanstan birebir alındı.

### Müzik

`public/audio/muzik.mp3` dosyasını ekleyin — hepsi bu. Dosya varsa sağ altta küçük bir ses düğmesi çıkar;
yoksa hiç görünmez. Müzik **kapalı** başlar (tarayıcıların otomatik oynatma kuralları); misafir düğmeyle açar.
“Davetiyeyi aç”a basınca kendiliğinden başlasın isterseniz `music.startOnEnter: true` yapın.
Telif hakkı olan bir şarkı kullanıyorsanız bunun sorumluluğu size aittir; 2–4 MB’lık 128 kbps bir MP3 idealdir.

### Metinler

`copy` bölümündeki her cümle değiştirilebilir. `*yıldız içindeki*` kelimeler italik yazılır.

---

## 2. Google Sheets + Apps Script kurulumu (≈10 dakika)

1. [sheets.new](https://sheets.new) ile yeni bir Google Sheet açın, adını “Sinan & Şule — Davetiye” yapın.
2. **Uzantılar → Apps Script**. Açılan editörde `Code.gs` içindekileri silin ve bu projedeki
   [`apps-script/Code.gs`](apps-script/Code.gs) dosyasının **tamamını** yapıştırın. Kaydedin (⌘S / Ctrl+S).
3. Üstteki fonksiyon listesinden **`setup`**'ı seçip **▶ Çalıştır**'a basın.
   - İlk seferde Google izin ister: *İzinleri incele → hesabınız → Gelişmiş → (güvenli değil) projesine git → İzin ver.*
     Bu uyarı, betiği sizin yazdığınız için çıkar; betik yalnızca bu tabloya erişir.
   - Alttaki **Yürütme günlüğü**'nde uzun bir **API_SECRET** görünecek. Kopyalayın (Vercel’de lazım).
   - Tabloda `RSVP` ve `GUESTBOOK` sayfaları başlıklarıyla oluşur.
4. **Dağıt → Yeni dağıtım** → dişli simgesi → **Web uygulaması**
   - *Açıklama:* davetiye
   - *Şu kullanıcı olarak yürüt:* **Ben**
   - *Erişimi olanlar:* **Herkes**
   - **Dağıt** → çıkan **Web uygulaması URL’sini** (`https://script.google.com/macros/s/…/exec`) kopyalayın.

> “Herkes” erişimi, adresi bilen herkesin *istek atabileceği* anlamına gelir; ama gizli anahtar olmadan
> hiçbir veri okunamaz ve yazılamaz. Tablonuz herkese açık **olmaz**, paylaşım ayarlarına dokunmayın.

**Apps Script ayarları** (isteğe bağlı, *Proje Ayarları → Komut dosyası özellikleri*):

| Özellik | Varsayılan | Anlamı |
|---|---|---|
| `API_SECRET` | `setup` üretir | Vercel’deki `APPS_SCRIPT_SECRET` ile aynı olmalı |
| `GUESTBOOK_AUTO_APPROVE` | `true` | `false` yaparsanız notlar siz `approved` kutusunu işaretleyene kadar sitede görünmez |

Bir notu sitede gizlemek için `GUESTBOOK` sayfasında o satırın `approved` kutusunun işaretini kaldırmanız yeterli.

---

## 3. Vercel’e yayınlamak

1. Projeyi GitHub’a gönderin (özel/private depo olabilir).
2. [vercel.com/new](https://vercel.com/new) → depoyu içe aktarın. **Project Name** alanı adresinizi belirler:
   `sinanvesule` → **https://sinanvesule.vercel.app** (alınmışsa `sinan-ve-sule`, `sinanvesule-1710` gibi bir ad seçin).
3. **Environment Variables** bölümüne ekleyin:

   | Değişken | Değer |
   |---|---|
   | `APPS_SCRIPT_URL` | Apps Script `…/exec` adresi |
   | `APPS_SCRIPT_SECRET` | Günlükteki `API_SECRET` |
   | `ADMIN_PASSWORD` | `/admin` için bir şifre (en az 6 karakter; kolay tahmin edilmesin) |
   | `SHEET_URL` | *(isteğe bağlı)* Google Sheet adresi — admin panelinde bağlantı olur |

4. **Deploy**. Birkaç dakika sonra site yayında.
5. Deneyin: siteden bir test RSVP’si ve not gönderin → Google Sheet’te satırların oluştuğunu görün → test satırlarını silin.

İçeriği değiştirdiğinizde (`invitation.ts`, müzik dosyası) GitHub’a göndermeniz yeterli; Vercel otomatik yeniden yayınlar.

> **WhatsApp önizlemesi:** Linki ilk paylaştığınızda WhatsApp başlık, tarih ve özel görseli gösterir.
> Görseli değiştirdikten sonra eski önizleme bir süre önbellekte kalabilir; test ederken linkin sonuna `?v=2` ekleyebilirsiniz.

---

## 4. Yönetim paneli — `/admin`

`https://…vercel.app/admin` → `ADMIN_PASSWORD` ile giriş.

- Toplam misafir, katılacak / katılamayacak yanıt sayıları
- Tüm yanıtlar (telefona dokununca arama), notlar ve görünürlükleri
- **Baskı için QR kod** (aşağıda)

Google Sheet ana veri kaynağıdır; panel hızlı bakış içindir. Şifreyi değiştirmek için Vercel’de `ADMIN_PASSWORD`’u
güncelleyip yeniden dağıtın — eski oturumlar otomatik kapanır.

## 5. QR kod

`/admin` sayfasının altındaki **Baskı için QR kod** bölümü, site adresini davetiyenin kimliğine uygun bir QR’a çevirir:
yuvarlatılmış modüller, özel köşe “gözleri” ve ortada Ş monogramı. Hata düzeltme seviyesi **H (%30)** olduğu için
monogram okunabilirliği bozmaz.

- **SVG indir** → matbaa için (vektör, sonsuz ölçeklenir). **PNG indir** → 2000×2000 px.
- Baskıda en az **2,5 × 2,5 cm** olsun. Basmadan önce telefon kamerasıyla bir kez okutun.
- “Kâğıt”, “Gece” ve “Beyaz” renk seçenekleri var. Gece (açık renkli kod) bazı eski okuyucularda zorlanabilir.

---

## 6. Yerelde çalıştırmak

```bash
npm install
```

```bash
npm run dev
```

http://localhost:3000 — `APPS_SCRIPT_URL` tanımlı değilken formlar **deneme modunda** çalışır (veriler bellekte tutulur,
sunucu kapanınca silinir). Gerçek tabloya bağlamak için `.env.example`’ı `.env.local` olarak kopyalayıp doldurun.

- Açılışı yeniden görmek için: yeni bir sekme açın ya da `sessionStorage`’ı temizleyin (açılış oturum başına bir kez oynar).
- `/#katilim` gibi bir bağlantıyla gelinirse açılış atlanır ve doğrudan o bölüme gidilir.

---

## 7. Güvenlik ve kötüye kullanım önlemleri

- Google Sheet herkese açık değildir; tarayıcı Apps Script adresini hiç görmez (istekler Vercel üzerinden gider).
- Her istek gizli anahtarla imzalanır (`APPS_SCRIPT_SECRET` ↔ `API_SECRET`).
- Sunucu tarafı doğrulama (uzunluk, telefon biçimi, kişi sayısı, bağlantı engeli) hem Vercel’de hem Apps Script’te.
- **Tekrar eden RSVP:** aynı telefon (ya da telefonsuz aynı isim) yeniden gönderirse yeni satır açılmaz, eski satır güncellenir.
- **Hız sınırı:** Vercel’de IP başına + Apps Script’te (CacheService) IP başına ve tüm site için saatlik tavan.
- **Bal tuzağı (honeypot)** alanı ve “insanüstü hız” kontrolü: botlara başarılıymış gibi yanıt verilir, hiçbir şey yazılmaz.
- **Formül enjeksiyonu** koruması: `=`, `+`, `-`, `@` ile başlayan metinler tabloya düz metin olarak yazılır.
- Yalnızca aynı siteden gelen POST istekleri kabul edilir (Origin / Sec-Fetch-Site kontrolü).
- Admin şifresi kodda değil ortam değişkenindedir; oturum imzalı, `httpOnly` ve `SameSite=Strict` bir çerezle tutulur.
- Site arama motorlarına kapalıdır (`noindex`); WhatsApp önizlemesi bundan etkilenmez.

## 8. Sorun giderme

| Belirti | Olası neden |
|---|---|
| Formda “Form henüz bağlanmadı” | Vercel’de `APPS_SCRIPT_URL` / `APPS_SCRIPT_SECRET` eksik ya da dağıtımdan sonra değişken eklendi → yeniden dağıtın |
| “Bir şeyler ters gitti” | Apps Script dağıtımında erişim “Herkes” değil, ya da gizli anahtarlar eşleşmiyor (Vercel → Logs’a bakın) |
| Apps Script’i değiştirdim, etkisi yok | *Dağıt → Dağıtımları yönet → düzenle → Sürüm: Yeni sürüm → Dağıt* |
| Notlar geç görünüyor | Liste Vercel’de 30 sn önbelleklenir; yazan kişi kendi notunu hemen görür |

## 9. Dosya yapısı

```
apps-script/Code.gs            Google Apps Script arka ucu (Sheets'e yazar)
src/content/invitation.ts      ← BÜTÜN İÇERİK
src/app/page.tsx               Sayfa kurgusu (bölüm sırası)
src/app/globals.css            Tasarım sistemi (renk, tipografi, hareket)
src/app/api/…                  RSVP, not defteri, admin giriş/çıkış
src/app/admin/                 Yönetim paneli + QR stüdyosu
src/app/opengraph-image.tsx    WhatsApp/sosyal önizleme görseli
src/app/nisan.ics/             “Takvime ekle” dosyası
src/components/                Açılış, kapak, bölümler, formlar
src/lib/                       Doğrulama, tarih biçimleri, sunucu yardımcıları
public/audio/                  Müzik (muzik.mp3)
```

## Lisanslar

Yazı tipleri: Imbue, Newsreader, Hanken Grotesk — SIL Open Font License (Google Fonts). Ş monogramı Imbue’nun
kendi glifinden türetilmiştir.
