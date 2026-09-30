import { invitation } from '@/content/invitation'
import { icsStamp } from './format'

const title = () => `${invitation.couple.together} — ${invitation.event.kind}`
const location = () => `${invitation.venue.name}, ${invitation.venue.address}`

export function googleCalendarUrl(siteUrl?: string) {
  const { event } = invitation
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title(),
    dates: `${icsStamp(event.start)}/${icsStamp(event.end)}`,
    location: location(),
    ctz: 'Europe/Istanbul',
    details: siteUrl ? `Davetiye: ${siteUrl}` : '',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function appleMapsUrl() {
  const { venue } = invitation
  const { lat, lng } = venue.coordinates
  return `https://maps.apple.com/?q=${encodeURIComponent(venue.name)}&address=${encodeURIComponent(venue.address)}&ll=${lat},${lng}`
}

/** RFC 5545: satırlar 75 bayttan uzunsa katlanır, özel karakterler kaçırılır. */
const escape = (s: string) => s.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\r?\n/g, '\\n')

function fold(line: string) {
  const bytes = new TextEncoder().encode(line)
  if (bytes.length <= 75) return line
  const out: string[] = []
  let current = ''
  let size = 0
  for (const ch of line) {
    const n = new TextEncoder().encode(ch).length
    if (size + n > (out.length ? 74 : 75)) {
      out.push(current)
      current = ''
      size = 0
    }
    current += ch
    size += n
  }
  out.push(current)
  return out.join('\r\n ')
}

export function icsFile(siteUrl: string) {
  const { event, venue } = invitation
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sinan ve Sule//Nisan Davetiyesi//TR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${icsStamp(event.start)}-nisan@${new URL(siteUrl).host}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(event.start)}`,
    `DTEND:${icsStamp(event.end)}`,
    `SUMMARY:${escape(title())}`,
    `LOCATION:${escape(location())}`,
    `GEO:${venue.coordinates.lat};${venue.coordinates.lng}`,
    `DESCRIPTION:${escape(`Davetiye ve yol tarifi: ${siteUrl}`)}`,
    `URL:${siteUrl}`,
    'BEGIN:VALARM',
    'ACTION:DISPLAY',
    `DESCRIPTION:${escape(`Yarın: ${title()}`)}`,
    'TRIGGER:-P1D',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
  return lines.map(fold).join('\r\n') + '\r\n'
}
