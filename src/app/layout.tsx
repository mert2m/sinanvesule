import type { Metadata, Viewport } from 'next'
import localFont from 'next/font/local'
import { invitation } from '@/content/invitation'
import { siteUrl } from '@/lib/site'
import './globals.css'

/*
 * Yazı tipleri kendi sunucumuzdan gelir (Google'a istek gitmez) ve yalnızca
 * Latin + Türkçe karakterlerle, kullandığımız ağırlık/optik boyut aralıklarıyla
 * alt kümelenmiştir: 4 dosya, toplam ~200 KB. (Kaynak: Google Fonts, SIL OFL)
 */

// Başlık sesi: isimler ve büyük rakamlar (dar Didone, sinematik) — opsz 36–100
const imbue = localFont({
  src: '../assets/fonts/Imbue-300.woff2',
  weight: '300',
  style: 'normal',
  variable: '--font-imbue',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

// Anlatıcı sesi: başlıklar, metin, italik vurgular — opsz 12–72
const newsreader = localFont({
  src: [
    { path: '../assets/fonts/Newsreader-Roman.woff2', weight: '300 400', style: 'normal' },
    { path: '../assets/fonts/Newsreader-Italic.woff2', weight: '300', style: 'italic' },
  ],
  variable: '--font-newsreader',
  display: 'swap',
  adjustFontFallback: 'Times New Roman',
})

// Arayüz sesi: etiketler, düğmeler, form
const hanken = localFont({
  src: '../assets/fonts/HankenGrotesk.woff2',
  weight: '400 500',
  style: 'normal',
  variable: '--font-hanken',
  display: 'swap',
  adjustFontFallback: 'Arial',
})

const { seo } = invitation

export const metadata: Metadata = {
  metadataBase: siteUrl(),
  title: seo.title,
  description: seo.description,
  applicationName: seo.title,
  robots: seo.indexable ? undefined : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    title: seo.title,
    description: seo.description,
    siteName: seo.title,
    url: '/',
  },
  twitter: { card: 'summary_large_image', title: seo.title, description: seo.description },
  formatDetection: { telephone: false, address: false, email: false },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#12100d',
  colorScheme: 'light',
}

const firstFamily = (f: { style: { fontFamily: string } }) => f.style.fontFamily.split(',')[0].trim()

/**
 * Hidrasyondan önce çalışır:
 * - html.js: JS var, animasyonlu hâller devreye girebilir
 * - html.skip-opening: bu oturumda davetiye zaten açıldıysa ya da #bağlantıyla gelindiyse
 * - html.fonts-ready: açılış yazıları doğru fontla oynasın diye (en geç 1.5 sn)
 */
const bootScript = `(function(){var d=document.documentElement;d.classList.add('js');
try{if(sessionStorage.getItem('svs-opened')==='1'||(location.hash&&location.hash.length>1)){d.classList.add('skip-opening','stage-hero','hero-fast')}}catch(e){}
var go=function(){d.classList.add('fonts-ready')};setTimeout(go,1500);
try{Promise.all([document.fonts.load("300 1em ${firstFamily(imbue)}","SİNAN&ŞULE"),document.fonts.load("italic 300 1em ${firstFamily(newsreader)}","Yüzükleri bağlayan"),document.fonts.load("500 1em ${firstFamily(hanken)}","17.10.2026")]).then(go,go)}catch(e){go()}})();`

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="tr"
      className={`${imbue.variable} ${newsreader.variable} ${hanken.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
      </head>
      <body>{children}</body>
    </html>
  )
}
