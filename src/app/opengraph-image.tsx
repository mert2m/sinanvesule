import { ImageResponse } from 'next/og'
import { invitation } from '@/content/invitation'
import { clock, dotted, upperTr, weekday } from '@/lib/format'
import { CengelLetterOg, OG_COLORS as C, ogFonts } from '@/lib/og'

export const alt = invitation.seo.ogAlt
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

/**
 * WhatsApp / iMessage önizlemesi. Önemli her şey ortadaki sütunda:
 * WhatsApp küçük önizlemede görseli kareye kırpsa da isimler ve tarih görünür.
 */
export default async function Image() {
  const { couple, event, venue, copy } = invitation
  const first = upperTr(couple.first)
  const second = upperTr(couple.second)
  const cIndex = second.search(/Ş/)
  const NAME = 184

  const corner = {
    position: 'absolute' as const,
    fontFamily: 'Hanken',
    fontSize: 17,
    letterSpacing: '0.18em',
    color: C.bone2,
  }

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: C.night,
          color: C.bone,
          position: 'relative',
        }}
      >
        <div style={{ ...corner, top: 44, left: 56 }}>{upperTr(copy.hero.eyebrow)}</div>
        <div style={{ ...corner, top: 44, right: 56 }}>{upperTr(`${weekday(event.start)} · ${clock(event.start)}`)}</div>
        <div style={{ ...corner, bottom: 44, left: 56 }}>{upperTr(`${venue.name} · ${venue.area}`)}</div>
        <div style={{ ...corner, bottom: 44, right: 56 }}>İSTANBUL</div>

        <div style={{ display: 'flex', fontFamily: 'Imbue', fontSize: NAME, lineHeight: 1, height: NAME * 0.84 }}>
          {first}
        </div>
        <div
          style={{
            display: 'flex',
            fontFamily: 'Newsreader',
            fontStyle: 'italic',
            fontSize: 50,
            color: C.bone2,
            margin: '8px 0 10px',
          }}
        >
          &amp;
        </div>
        <div
          style={{ display: 'flex', fontFamily: 'Imbue', fontSize: NAME, lineHeight: 1, height: NAME * 0.96, marginTop: -NAME * 0.13 }}
        >
          {cIndex >= 0 ? (
            <>
              {second.slice(0, cIndex)}
              <CengelLetterOg letter={second[cIndex]} size={NAME} color={C.bone} red={C.red} />
              {second.slice(cIndex + 1)}
            </>
          ) : (
            second
          )}
        </div>
        <div
          style={{
            display: 'flex',
            marginTop: 30,
            fontFamily: 'Hanken',
            fontSize: 24,
            letterSpacing: '0.42em',
            color: C.bone,
          }}
        >
          {dotted(event.start)}
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
