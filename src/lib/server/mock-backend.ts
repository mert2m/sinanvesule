import 'server-only'
import type { NoteInput, RsvpInput } from '@/lib/validation'

/**
 * Yerel geliştirme için sahte arka uç. APPS_SCRIPT_URL tanımlı değilken
 * `npm run dev` altında formlar bununla çalışır; veriler sunucu yeniden
 * başlayınca silinir. Üretimde kullanılmaz (MOCK_BACKEND=1 hariç).
 */

type Row = RsvpInput & { id: string; createdAt: string; updatedAt: string }
type Note = NoteInput & { id: string; approved: boolean; createdAt: string }

const g = globalThis as unknown as { __svsMock?: { rsvps: Row[]; notes: Note[] } }
const db = (g.__svsMock ??= {
  rsvps: [],
  notes: [
    { id: 'demo3', name: 'Elif', message: 'İkinize de ömür boyu mutluluk! Kurdele kesilirken en ön sıradayım.', visibility: 'public', approved: true, createdAt: new Date(Date.now() - 36e5).toISOString() },
    { id: 'demo2', name: '', message: 'Bu kadar yakışan iki insan az görülür. Hep böyle gülümseyin.', visibility: 'anonymous', approved: true, createdAt: new Date(Date.now() - 864e5).toISOString() },
    { id: 'demo1', name: 'Kerem', message: 'Sinan, nihayet! Şule, sabrın için teşekkürler. 17 Ekim’de görüşürüz.', visibility: 'public', approved: true, createdAt: new Date(Date.now() - 2 * 864e5).toISOString() },
  ],
})

const id = () => Math.random().toString(36).slice(2, 10)
const key = (s: string) => s.toLocaleLowerCase('tr-TR').replace(/\s+/g, ' ').trim()

export async function mockBackend(action: string, payload: unknown): Promise<unknown> {
  await new Promise((r) => setTimeout(r, 450))
  const now = new Date().toISOString()

  switch (action) {
    case 'rsvp.submit': {
      const p = payload as RsvpInput
      const existing = db.rsvps.find(
        (r) => (p.phone && r.phone === p.phone) || (key(r.name) === key(p.name) && (!r.phone || !p.phone)),
      )
      if (existing) {
        Object.assign(existing, p, { updatedAt: now })
        return { ok: true, status: 'updated' }
      }
      db.rsvps.unshift({ ...p, id: id(), createdAt: now, updatedAt: now })
      return { ok: true, status: 'created' }
    }
    case 'guestbook.submit': {
      const p = payload as NoteInput
      if (db.notes.some((n) => key(n.message) === key(p.message))) return { ok: true, status: 'duplicate' }
      const note: Note = { ...p, id: id(), approved: true, createdAt: now }
      db.notes.unshift(note)
      if (p.visibility === 'private') return { ok: true, status: 'private' }
      return {
        ok: true,
        status: 'published',
        note: { id: note.id, name: p.visibility === 'public' ? p.name : null, message: p.message, createdAt: now },
      }
    }
    case 'guestbook.list': {
      const { limit } = payload as { limit: number }
      const notes = db.notes
        .filter((n) => n.approved && n.visibility !== 'private')
        .slice(0, limit)
        .map((n) => ({ id: n.id, name: n.visibility === 'public' ? n.name : null, message: n.message, createdAt: n.createdAt }))
      return { ok: true, notes }
    }
    case 'admin.summary': {
      const attending = db.rsvps.filter((r) => r.attendance === 'yes')
      const maybe = db.rsvps.filter((r) => r.attendance === 'maybe')
      return {
        ok: true,
        stats: {
          responses: db.rsvps.length,
          attending: attending.length,
          declined: db.rsvps.filter((r) => r.attendance === 'no').length,
          maybe: maybe.length,
          guests: attending.reduce((sum, r) => sum + r.guestCount, 0),
          maybeGuests: maybe.reduce((sum, r) => sum + r.guestCount, 0),
          notes: db.notes.length,
        },
        rsvps: db.rsvps,
        notes: db.notes,
        generatedAt: now,
      }
    }
    default:
      return { ok: false, error: 'unknown_action' }
  }
}
