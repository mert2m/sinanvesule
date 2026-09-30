import { ImageResponse } from 'next/og'
import { MonogramSvg, OG_COLORS } from '@/lib/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

/** iPhone ana ekran simgesi: gece zemininde Ş monogramı. */
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: OG_COLORS.night,
        }}
      >
        <MonogramSvg height={128} />
      </div>
    ),
    size,
  )
}
