'use client'

import { useMemo, useState } from 'react'
import qrcode from 'qrcode-generator'
import { MONOGRAM_BOLD } from '@/lib/monogram'

type Theme = { name: string; bg: string; fg: string; accent: string }

const THEMES: Theme[] = [
  { name: 'Kâğıt', bg: '#f2ede4', fg: '#1a1714', accent: '#b3261e' },
  { name: 'Gece (açık renkli kod — bazı eski okuyucular zorlanabilir)', bg: '#12100d', fg: '#efe8dc', accent: '#d13d2c' },
  { name: 'Beyaz', bg: '#ffffff', fg: '#000000', accent: '#b3261e' },
]

/**
 * Davetiyenin kimliğine uygun QR: yuvarlatılmış modüller, köşe "göz"leri
 * ve ortada Ş monogramı. Hata düzeltme seviyesi H (%30) olduğu için
 * ortadaki monogram okunabilirliği bozmaz. Çıktı saf vektör (yazı tipi içermez).
 */
function buildSvg(url: string, theme: Theme) {
  const qr = qrcode(0, 'H')
  qr.addData(url)
  qr.make()
  const n = qr.getModuleCount()
  const quiet = 4
  const size = n + quiet * 2

  // Ortadaki monogram alanı (tek sayıda modül, merkezde). Sürüm 7+ kodlarda
  // merkezde hizalama deseni olduğu için alan küçültülür.
  let hole = Math.round(n * (n >= 45 ? 0.16 : 0.22))
  if (hole % 2 === 0) hole += 1
  const holeStart = (n - hole) / 2
  const inHole = (r: number, c: number) =>
    r >= holeStart && r < holeStart + hole && c >= holeStart && c < holeStart + hole
  const inFinder = (r: number, c: number) => (r < 7 && c < 7) || (r < 7 && c >= n - 7) || (r >= n - 7 && c < 7)

  const dots: string[] = []
  for (let r = 0; r < n; r++) {
    for (let c = 0; c < n; c++) {
      if (!qr.isDark(r, c) || inFinder(r, c) || inHole(r, c)) continue
      dots.push(`<rect x="${c + quiet + 0.06}" y="${r + quiet + 0.06}" width="0.88" height="0.88" rx="0.3"/>`)
    }
  }

  const eye = (x: number, y: number) =>
    `<rect x="${x + 0.5}" y="${y + 0.5}" width="6" height="6" rx="1.7" fill="none" stroke="${theme.fg}" stroke-width="1"/>` +
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="0.9" fill="${theme.fg}"/>`

  // Monogram: yüksekliği deliğin ~%80'i
  const m = MONOGRAM_BOLD
  const markH = hole * 0.82
  const scale = markH / m.height
  const markW = m.width * scale
  const mx = quiet + holeStart + (hole - markW) / 2
  const my = quiet + holeStart + (hole - markH) / 2

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="geometricPrecision">
<rect width="${size}" height="${size}" fill="${theme.bg}"/>
<g fill="${theme.fg}">${dots.join('')}</g>
${eye(quiet, quiet)}${eye(quiet + n - 7, quiet)}${eye(quiet, quiet + n - 7)}
<g transform="translate(${mx.toFixed(3)} ${my.toFixed(3)}) scale(${scale.toFixed(5)})">
<path d="${m.body}" fill="${theme.fg}"/><path d="${m.cengel}" fill="${theme.accent}"/>
</g>
</svg>`
}

function download(name: string, blob: Blob) {
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 2000)
}

export function QrStudio({ defaultUrl }: { defaultUrl: string }) {
  const [url, setUrl] = useState(defaultUrl)
  const [themeIndex, setThemeIndex] = useState(0)
  const theme = THEMES[themeIndex]
  const svg = useMemo(() => {
    try {
      return url.trim() ? buildSvg(url.trim(), theme) : ''
    } catch {
      return ''
    }
  }, [url, theme])

  async function savePng() {
    const img = new Image()
    const blobUrl = URL.createObjectURL(new Blob([svg], { type: 'image/svg+xml' }))
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve()
      img.onerror = reject
      img.src = blobUrl
    })
    const px = 2000
    const canvas = document.createElement('canvas')
    canvas.width = px
    canvas.height = px
    canvas.getContext('2d')!.drawImage(img, 0, 0, px, px)
    URL.revokeObjectURL(blobUrl)
    canvas.toBlob((b) => b && download('sinan-sule-qr.png', b), 'image/png')
  }

  return (
    <div className="grid gap-8 md:grid-cols-[minmax(0,22rem)_minmax(0,1fr)] md:items-start">
      <div
        className="aspect-square w-full max-w-[22rem] border border-[var(--rule)]"
        // SVG yalnızca bu bileşende, kullanıcının kendi girdiği URL'den üretiliyor.
        dangerouslySetInnerHTML={{ __html: svg }}
      />
      <div className="grid max-w-md gap-6">
        <div className="field">
          <label htmlFor="qr-url" className="field__label t-label">
            Bağlantı
          </label>
          <input id="qr-url" className="input" value={url} onChange={(e) => setUrl(e.target.value)} inputMode="url" />
        </div>
        <fieldset className="grid gap-1">
          <legend className="t-label muted mb-2">Renk</legend>
          {THEMES.map((t, i) => (
            <label key={t.name} className="option">
              <input type="radio" name="qr-theme" checked={i === themeIndex} onChange={() => setThemeIndex(i)} />
              <span>{t.name}</span>
            </label>
          ))}
        </fieldset>
        <div className="grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            className="btn btn--solid"
            disabled={!svg}
            onClick={() => download('sinan-sule-qr.svg', new Blob([svg], { type: 'image/svg+xml' }))}
          >
            <span>SVG indir</span>
            <span className="arrow" aria-hidden="true">
              ↓
            </span>
          </button>
          <button type="button" className="btn" disabled={!svg} onClick={savePng}>
            <span>PNG indir</span>
            <span className="arrow" aria-hidden="true">
              ↓
            </span>
          </button>
        </div>
        <p className="t-ui muted text-[0.875rem]">
          Matbaa için SVG’yi tercih edin (sonsuz ölçeklenir). Baskıda en az 2,5 × 2,5 cm olsun; basmadan önce telefonla bir kez
          okutup deneyin.
        </p>
      </div>
    </div>
  )
}
