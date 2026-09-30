import { Fragment, type ReactNode, type SVGProps } from 'react'
import { CENGEL_BOX, MONOGRAM, MONOGRAM_BOLD } from '@/lib/monogram'

/**
 * Bir kelimedeki Ş/ş harfinin çengelini kurdele kırmızısıyla boyar.
 * Harf, fontun kendi glifidir; sadece taban çizgisinin altı kırmızıdır.
 */
export function CengelWord({ word, serif = false }: { word: string; serif?: boolean }) {
  const index = word.search(/[Şş]/)
  if (index < 0) return <>{word}</>
  return (
    <>
      {word.slice(0, index)}
      <span className={serif ? 'cengel cengel--serif' : 'cengel'}>{word[index]}</span>
      {word.slice(index + 1)}
    </>
  )
}

/** Tek başına çengel işareti (bölüm etiketleri, vurgular). */
export function CengelMark(props: SVGProps<SVGSVGElement>) {
  const { x, y, width, height } = CENGEL_BOX
  return (
    <svg viewBox={`${x} ${y} ${width} ${height}`} aria-hidden="true" focusable="false" {...props}>
      <path d={MONOGRAM.cengel} fill="currentColor" />
    </svg>
  )
}

/** Ş monogramı: çengelsiz okunursa Sinan, çengelle Şule. */
export function Monogram({
  bold = false,
  bodyColor = 'currentColor',
  cengelColor = 'var(--accent)',
  title,
  ...props
}: SVGProps<SVGSVGElement> & { bold?: boolean; bodyColor?: string; cengelColor?: string; title?: string }) {
  const m = bold ? MONOGRAM_BOLD : MONOGRAM
  return (
    <svg
      viewBox={`0 0 ${m.width} ${m.height}`}
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      focusable="false"
      {...props}
    >
      <path d={m.body} fill={bodyColor} />
      <path className="mono-cengel" d={m.cengel} fill={cengelColor} />
    </svg>
  )
}

/**
 * Metin içinde *yıldızlı* kısımları italik yapar:
 * "O gün *orada* mısınız?" → O gün <em>orada</em> mısınız?
 */
export function Rich({ text }: { text: string }): ReactNode {
  const parts = text.split(/(\*[^*]+\*)/g)
  return parts.map((part, i) =>
    part.startsWith('*') && part.endsWith('*') && part.length > 2 ? (
      <em key={i}>{part.slice(1, -1)}</em>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  )
}

/** Düz metin: yıldızları kaldırır (başlık etiketleri, erişilebilir adlar için). */
export const plain = (text: string) => text.replace(/\*/g, '')
