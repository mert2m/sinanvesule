import Link from 'next/link'
import { Monogram } from '@/components/marks'

export default function NotFound() {
  return (
    <main className="tone-night grain grid min-h-svh place-items-center px-[var(--gutter)] text-center">
      <div className="grid justify-items-center gap-6">
        <Monogram className="h-40 w-auto" />
        <p className="t-display text-[2.25rem]">
          Bu sayfa <em>yok.</em>
        </p>
        <Link href="/" className="btn">
          <span>Davetiyeye dön</span>
          <span className="arrow" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </main>
  )
}
