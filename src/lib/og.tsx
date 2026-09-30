import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { MONOGRAM_BOLD } from './monogram'

/**
 * OG görseli ve ikonlar için yazı tipleri. Satori (next/og) woff2 ve
 * değişken fontları desteklemediği için projede küçük, statik TTF alt
 * kümeleri durur (Türkçe karakterler dahil; toplam ~70 KB, SIL OFL).
 */
const dir = join(process.cwd(), 'src/assets/og')

export async function ogFonts() {
  const [imbue, newsreader, hanken] = await Promise.all([
    readFile(join(dir, 'Imbue-Display-300.ttf')),
    readFile(join(dir, 'Newsreader-Italic-300.ttf')),
    readFile(join(dir, 'HankenGrotesk-500.ttf')),
  ])
  return [
    { name: 'Imbue', data: imbue, weight: 300 as const, style: 'normal' as const },
    { name: 'Newsreader', data: newsreader, weight: 300 as const, style: 'italic' as const },
    { name: 'Hanken', data: hanken, weight: 500 as const, style: 'normal' as const },
  ]
}

export const OG_COLORS = {
  night: '#12100d',
  bone: '#efe8dc',
  bone2: '#aaa296',
  red: '#d13d2c',
}

/** Monogram (satori içinde SVG olarak). */
export function MonogramSvg({ height, body = OG_COLORS.bone, cengel = OG_COLORS.red }: { height: number; body?: string; cengel?: string }) {
  const m = MONOGRAM_BOLD
  const width = (m.width / m.height) * height
  return (
    <svg width={width} height={height} viewBox={`0 0 ${m.width} ${m.height}`}>
      <path d={m.body} fill={body} />
      <path d={m.cengel} fill={cengel} />
    </svg>
  )
}

/**
 * "ŞULE" gibi bir kelimede Ş'nin çengelini kırmızı yapar.
 * Alttaki katman kırmızı Ş, üstteki katman taban çizgisinde kırpılmış açık renkli Ş.
 * Imbue metrikleri: ascent 0.95em, descent 0.25em → satır yüksekliği 1'de
 * taban çizgisi 0.85em'de; kesim biraz altında (0.868em).
 */
export function CengelLetterOg({ letter, size, color, red }: { letter: string; size: number; color: string; red: string }) {
  return (
    <div style={{ position: 'relative', display: 'flex', lineHeight: 1, height: size, color: red }}>
      <span>{letter}</span>
      <div style={{ position: 'absolute', left: 0, top: 0, height: size * 0.868, overflow: 'hidden', display: 'flex', color }}>
        <span>{letter}</span>
      </div>
    </div>
  )
}
