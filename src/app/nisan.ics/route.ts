import { icsFile } from '@/lib/calendar'
import { siteUrl } from '@/lib/site'

// Derleme sırasında bir kez üretilir, statik dosya gibi sunulur.
export const dynamic = 'force-static'

/** /nisan.ics — iPhone'da dokununca "Takvime ekle" penceresi açılır. */
export function GET() {
  return new Response(icsFile(siteUrl().href), {
    headers: {
      'content-type': 'text/calendar; charset=utf-8',
      'content-disposition': 'attachment; filename="sinan-sule-nisan.ics"',
    },
  })
}
