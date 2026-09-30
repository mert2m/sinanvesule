/**
 * ─────────────────────────────────────────────────────────────────────
 *  SİNAN & ŞULE — DAVETİYE İÇERİĞİ
 *
 *  Sitedeki bütün metinler, tarih, mekan, program, fotoğraflar, müzik ve
 *  form ayarları bu dosyadan yönetilir. Tasarım koduna dokunmanız gerekmez.
 *
 *  Küçük notlar:
 *  • Metinlerde *yıldız içindeki* kelimeler italik yazılır.
 *  • Tarihler Türkiye saatiyle (+03:00) yazılır.
 *  • Müzik için /public/audio/muzik.mp3 dosyasını eklemeniz yeterli;
 *    dosya yoksa müzik düğmesi hiç görünmez.
 * ─────────────────────────────────────────────────────────────────────
 */

import type { InvitationConfig } from './types'

export const invitation: InvitationConfig = {
  couple: {
    first: 'Sinan',
    second: 'Şule',
    /** Kapanışta ve metinlerde kullanılan birleşik hâl */
    together: 'Sinan & Şule',
    /** İsteğe bağlı: "Yılmaz ve Kaya aileleriyle birlikte" gibi bir satır. Boş bırakılırsa görünmez. */
    hosts: '',
  },

  event: {
    kind: 'Nişan',
    /** ⚠️ Saat referans davetiyeden alındı (14.00) — kesinleşince güncelleyin. */
    start: '2026-10-17T14:00:00+03:00',
    /** Takvim kaydının bitişi (tahmini). */
    end: '2026-10-17T19:00:00+03:00',
  },

  /** Mekan bilgileri referans davetiyeden birebir alınmıştır. */
  venue: {
    name: 'Bahçe',
    area: 'Baklacı, Beykoz',
    addressLines: ['Baklacı, Hisar Sk. No:6', '34830 Beykoz/İstanbul, Türkiye'],
    address: 'Baklacı, Hisar Sk. No:6, 34830 Beykoz/İstanbul, Türkiye',
    coordinates: { lat: 41.063863, lng: 29.160189 },
    googleMapsUrl:
      'https://www.google.com/maps/search/?api=1&query=Baklac%C4%B1%2C%20Hisar%20Sk.%20No%3A6%2C%2034830%20Beykoz%2F%C4%B0stanbul%2C%20T%C3%BCrkiye&query_place_id=ChIJedQcOhjMyhQR3dUb8IbJXFE',
  },

  /** ⚠️ Program saatleri örnektir (referanstaki saatlere göre) — kesinleşince güncelleyin. */
  program: [
    { time: '14.00', title: 'Karşılama', text: 'Bahçede buluşuyor, ilk sarılmaları yapıyoruz.' },
    { time: '15.30', title: 'Yüzük töreni', text: 'Kurdele kesiliyor, yüzükler takılıyor.', highlight: true },
    { time: 'Sonrası', title: 'Kutlama', text: 'Müzik, sohbet ve bol bol tebrik.' },
  ],

  music: {
    /** Dosya yolu /public altından. Dosya yoksa düğme görünmez. */
    src: '/audio/muzik.mp3',
    /** true yapılırsa "Davetiyeyi aç"a basıldığında müzik kendiliğinden başlar. */
    startOnEnter: false,
    volume: 0.55,
  },

  rsvp: {
    enabled: true,
    /** ⚠️ Son yanıt tarihi örnektir — dilediğiniz gibi değiştirin. */
    deadline: '2026-10-10',
    /** true yapılırsa son tarihten sonra form kapanır. */
    closeAfterDeadline: false,
    /** "Kaç kişisiniz?" sorusu için üst sınır (misafir dahil). */
    maxGuests: 6,
    /** Katılacaklardan telefon numarası istensin mi? */
    requirePhone: true,
  },

  guestbook: {
    enabled: true,
    maxLength: 280,
    /** İlk açılışta kaç not gösterilsin. */
    pageSize: 6,
  },

  seo: {
    title: 'Sinan & Şule',
    description: '17 Ekim 2026 · Nişan davetiyesi',
    ogAlt: 'Sinan & Şule — 17 Ekim 2026 nişan davetiyesi',
    /** Arama motorlarında görünmesin (WhatsApp önizlemesi yine çalışır). */
    indexable: false,
  },

  /* ───────────────────────────── METİNLER ───────────────────────────── */
  copy: {
    opening: {
      tagline: 'Yüzükleri bağlayan kurdele o gün kesiliyor.',
      enter: 'Davetiyeyi aç',
      skip: 'Geç',
    },

    hero: {
      eyebrow: 'Nişan Daveti',
      lead: 'Tek harf, iki isim.',
      note: 'Sinan’ın S’si, Şule’nin Ş’si. Aralarındaki tek fark küçük bir çengel; rengini nişan kurdelesinden aldı.',
      scroll: 'Devamı aşağıda',
    },

    invitation: {
      kicker: 'Davet',
      title: 'Davetlisiniz.',
      paragraphs: [
        '17 Ekim’de yüzüklerimizi takıyoruz. Kurdeleyi büyüklerimiz kesecek, alkışı sizden bekliyoruz.',
        'Uzun uzun söze gerek yok: o gün en çok görmek istediğimiz yüzlerden biri *sizinki.*',
      ],
    },

    date: {
      kicker: 'Tarih',
      countdownLabel: 'Kurdeleye kalan',
      units: { days: 'gün', hours: 'saat', minutes: 'dakika', seconds: 'saniye' },
      today: 'Bugün o gün.',
      after: 'Kurdele kesildi. Gelen herkese teşekkürler.',
      calendar: 'Takvime ekle',
      calendarApple: 'iPhone / iCal',
      calendarGoogle: 'Google Takvim',
    },

    venue: {
      kicker: 'Mekan',
      cta: 'Beni oraya götür',
      ctaHint: 'Google Haritalar’da açılır',
      appleMaps: 'Apple Haritalar',
      copy: 'Adresi kopyala',
      copied: 'Kopyalandı',
    },

    program: {
      kicker: 'Akış',
      title: 'O gün, *saat saat.*',
    },

    rsvp: {
      kicker: 'Katılım',
      title: 'O gün *orada* mısınız?',
      intro: 'Hazırlıklarımızı planlayabilmek için {deadline} tarihine kadar haber verirseniz çok seviniriz.',
      yes: { label: 'Katılıyorum', sub: 'Oradayım' },
      no: { label: 'Katılamıyorum', sub: 'Gönlüm sizinle' },
      maybe: { label: 'Belirsiz', sub: 'Kesinleşince haber vereceğim' },
      name: 'Ad Soyad',
      namePlaceholder: 'Adınız ve soyadınız',
      phone: 'Telefon',
      phonePlaceholder: '05xx xxx xx xx',
      guests: 'Kaç kişisiniz?',
      guestsHint: 'Siz dahil',
      guestsMaybe: 'Gelirseniz kaç kişi olursunuz?',
      note: 'Notunuz',
      noteOptional: 'İsteğe bağlı',
      notePlaceholderYes: 'Çocuklarla geliyoruz, yemek tercihimiz var… ne varsa yazın.',
      notePlaceholderNo: 'Onlara iletmek istediğiniz bir şey varsa…',
      notePlaceholderMaybe: 'Neye bağlı olduğunu yazmak isterseniz…',
      submit: 'Yanıtı gönder',
      sending: 'Gönderiliyor',
      privacy: 'Bilgileriniz yalnızca Sinan & Şule ile paylaşılır.',
      successYesTitle: 'Yeriniz hazır, {name}.',
      successYesTitleGroup: '{count} kişilik yeriniz hazır, {name}.',
      successYesBody: '17 Ekim’de bahçede görüşürüz. Kurdele kesilirken ilk alkış sizden.',
      successNoTitle: 'Gönlünüz bizimle, {name}.',
      successNoBody: 'Haber verdiğiniz için teşekkür ederiz. O gün sizi de anacağız.',
      successMaybeTitle: 'Umarız gelebilirsiniz, {name}.',
      successMaybeBody: 'Planınız netleşince bu sayfadan yanıtınızı güncellemeniz yeterli; {deadline} tarihine kadar haber verirseniz çok seviniriz.',
      updated: 'Yanıtınızı güncelledik.',
      stored: 'Yanıtınız bize ulaştı',
      change: 'Yanıtı değiştir',
      closed: 'Katılım bildirimi kapandı. Bir değişiklik varsa lütfen Sinan ya da Şule’ye doğrudan yazın.',
      floating: 'Katılımınızı bildirin',
    },

    guestbook: {
      kicker: 'Notlar',
      title: 'Bir not *bırakın.*',
      intro: 'Bir dilek, bir anı, bir tavsiye… Hepsini okuyup saklayacağız.',
      message: 'Notunuz',
      messagePlaceholder: 'Mutluluğunuz daim olsun…',
      name: 'Adınız',
      namePlaceholder: 'İsim görünmesin isterseniz boş bırakın',
      visibility: {
        public: 'Adımla paylaş',
        anonymous: 'İsimsiz paylaş',
        private: 'Yalnızca Sinan & Şule okusun',
      },
      submit: 'Notu bırak',
      sending: 'Bırakılıyor',
      anonymousName: 'Bir misafir',
      empty: 'Henüz not yok. İlk notu siz bırakın.',
      successPublic: 'Notunuz duvara eklendi. Teşekkürler!',
      successPrivate: 'Notunuz yalnızca Sinan & Şule’ye iletildi.',
      successPending: 'Notunuz alındı; kısa süre içinde burada görünecek.',
      another: 'Bir not daha bırak',
      more: 'Daha fazla not',
    },

    closing: {
      line: 'Bahçede görüşmek üzere.',
      colophon: 'Bu sayfadaki tek süs o küçük çengeldi; gerisini 17 Ekim’de siz tamamlayacaksınız.',
      backToTop: 'Başa dön',
    },

    music: { on: 'Müziği aç', off: 'Müziği kapat' },

    errors: {
      generic: 'Bir şeyler ters gitti. Lütfen biraz sonra tekrar deneyin.',
      network: 'Bağlantı kurulamadı. İnternetinizi kontrol edip tekrar deneyin.',
      rateLimited: 'Çok sık denediniz; birkaç dakika sonra tekrar deneyin.',
      notConfigured: 'Form henüz bağlanmadı. Lütfen Sinan ya da Şule’ye doğrudan yazın.',
    },
  },
}
