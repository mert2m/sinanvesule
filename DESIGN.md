# Çengel — Sinan & Şule tasarım sistemi

## 1. Referans analizi (in-vitely “vintage” teması)

**Alınan mantık:** tek sayfalık hikâye akışı (kapak → davet → tarih → mekan → geri sayım → program → katılım → kapanış),
sabit müzik düğmesi, kaydırma ipucu, bulanıklıktan netleşen yazı girişleri, katılımda “Katılacağım / Katılamayacağım +
kişi sayısı + not”, mekan için tek dokunuşla yol tarifi.

**Bilerek bırakılanlar:** tül, dantel kartlar, gümüş çerçeve, çiçek görselleri, el yazısı font (Allura), ~15 font
ailesinin birden yüklenmesi, her bölümde farklı süs. Bunlar tam da “hazır şablon” hissini üreten şeyler.

**Birebir korunan:** mekan — “Bahçe”, Baklacı, Hisar Sk. No:6, 34830 Beykoz/İstanbul ve referanstaki Google Haritalar
bağlantısı (place_id dahil). Koordinat (41.063863, 29.160189) bu bağlantının açtığı konumdan okundu.

## 2. Araştırmadan çıkan ilkeler (2025–2026)

- Süs yerine **tipografik ölçek farkı**, bol boşluk, asimetrik dergi düzeni.
- Düğünler “marka” gibi ele alınıyor: davetiye, QR, önizleme görseli, ikon — **tek bir kimlik sistemi**.
- Hareket: gürültülü geçişler yerine **yavaş, kontrollü** hareket; hafif film greni.
- Kişisel anlam taşıyan **tek bir sembol** (monogram).
- Yeni klişeler (kaçınıldı): dantel/kroşe, nötr yeşillik, botanik çizim, “karalama” çizgiler, script fontlar.

## 3. Üç yön

**A · Kurdele** — Kâğıt + mürekkep + tek bir kurdele kırmızısı. Nişanda yüzükleri bağlayan kırmızı kurdele sayfaya ince
bir çizgi olarak girer: isimleri bağlar, açılışta ortadan kesilir. *Güçlü:* nişana özgü, kültürel. *Zayıf:* her nişan
çiftine uyar.

**B · Gece bahçesi** — Tamamen karanlık, sinematik; ekim akşamında Beykoz’da bir bahçe: sıcak ışık halkaları, gren,
dar başlık harfleri, jenerik gibi kapanış. *Güçlü:* atmosfer. *Zayıf:* “film teması” kolayca kostüme döner.

**C · Çengel** ✅ — Sinan’ın **S**’si ile Şule’nin **Ş**’si arasındaki tek fark küçük bir **çengel**. Tek bir harf,
çengelsiz okunursa Sinan, çengelle Şule: **tek harf, iki isim**. Bu içgörü yalnızca bu çifte ait; başka bir davetiyeye
taşınamaz. Çengelin rengi nişan kurdelesinden gelir.

**Seçim:** C. A’nın kurdele kırmızısını ve kurdele kesme anını, B’nin gece ritmini ve grenini *ayrı süsler olarak değil*,
C’nin anlatısının parçaları olarak içerir: **çengel harfte, kurdele çizgide.**

## 4. Sistem

### Renk

| Token | Değer | Kullanım |
|---|---|---|
| `night` | `#12100D` | Açılış ve kapanış (sıcak siyah) |
| `paper` | `#F2EDE4` | Ana zemin (sıcak kâğıt; saf beyaz yok) |
| `ink` | `#1A1714` | Kâğıt üstünde metin |
| `ink-2` | `#5C554C` | İkincil metin (AA kontrast) |
| `bone` | `#EFE8DC` | Gece üstünde metin |
| `bone-2` | `#AAA296` | Gece üstünde ikincil metin (AA) |
| `kurdele` | `#B3261E` | Tek vurgu — kâğıt üstünde (metin için AA) |
| `kurdele-lit` | `#D13D2C` | Tek vurgu — gece üstünde |

Kırmızı yalnızca şuralarda: çengel, kurdele çizgisi, odak halkası, hata mesajı. Başka hiçbir yerde.

### Tipografi — üç ses

| Ses | Font | Nerede |
|---|---|---|
| **Başlık** (sinematik) | Imbue — dar Didone, opsz 100 | İsimler, büyük rakamlar (17, saatler, geri sayım), monogram |
| **Anlatıcı** (editoryal) | Newsreader — optik boyutlu serif, italik | Başlıklar (küçük harf, sıkı aralık), metin, alıntılar |
| **Arayüz** (bilgi) | Hanken Grotesk | Etiketler (BÜYÜK, geniş aralık), düğmeler, form |

Hepsi Türkçe karakterleri tam destekler (Ş, İ, ı, ğ). Fontlar `next/font` ile kendi sunucumuzdan, `latin` + `latin-ext`
alt kümeleriyle yüklenir; Google’a istek gitmez.

**Çengel tekniği:** Ş’nin çengeli fontun kendi glifinden, `background-clip: text` ile taban çizgisinin altından
kırmızıya boyanır (metin olarak kalır, seçilebilir, ekran okuyucu “Şule” okur). Monogram, favicon ve QR ortası için
aynı glifin vektör çizgileri kullanılır (`src/lib/monogram.ts`).

### Aralık ve ızgara

- 4 px tabanlı; yan boşluk mobilde 20 px (+ güvenli alan), tablette 32, masaüstünde 48.
- Bölümler arası dikey ritim `clamp(6rem, 19vw, 10.5rem)`.
- ≥ 1024 px: iki sütun — solda yapışkan bölüm etiketi, sağda içerik.

### Hareket

| An | Hareket |
|---|---|
| Açılış | İsimler maskeden yükselir → çengel kırmızıyla “damlar” → tarih harf aralığı daralarak gelir → cümle |
| Açılış çıkışı | Kurdele ortadan çizilir, **ortadan kesilir**, perde yukarı–aşağı açılır |
| Kapak | Monogram bulanıklıktan netleşir, çengeli ayrıca düşer |
| Bölümler | Başlık maskeden yükselir; etiketteki kurdele çizgisi çizilir; metin yumuşakça belirir |
| RSVP başarı | Kırmızı çengel düşer, başlık yükselir |
| Not | Yeni not duvarın başına süzülür |

Eğriler: `ease-out-expo (0.16, 1, 0.3, 1)` ve perde için `(0.76, 0, 0.24, 1)`. Açılış yazıları **CSS ile, JS
beklemeden** oynar (yavaş bağlantıda bile). `prefers-reduced-motion` açıksa her şey anında görünür.

### Ritim

Gece (açılış) → kâğıt (bütün hikâye) → gece (kapanış). Açılış ve kapanış birbirinin aynası; aradaki her şey tek bir kâğıt sayfada akar.

### Süs dili

- **Tek süs:** çengel. **Tek yapısal çizgi:** kurdele (1 px kırmızı) ve 1 px ince ayırıcılar.
- Çerçeve, gölge, gradyan, ikon seti yok. Oklar (→ ↓ ↗) yazı tipinin kendi karakterleri.
- Gren yalnızca gece yüzeylerinde, döşeme olarak (animasyonsuz; açılışta hafif titreşimli).

### Bölüm yapısı

```
01 ── DAVET            ← numara + kurdele çizgisi + etiket (Hanken, büyük harf)
Davetlisiniz.          ← Newsreader başlık, en fazla bir italik vurgu
…                      ← içerik
```

## 5. Kimlik uygulamaları

- **Favicon / iPhone simgesi:** gece zemininde Ş monogramı (kalın kesim).
- **WhatsApp önizlemesi:** açılış kompozisyonu; önemli her şey ortada (kareye kırpılsa da okunur).
- **QR:** yuvarlatılmış modüller, özel köşe gözleri, ortada monogram (H seviye hata düzeltme).
