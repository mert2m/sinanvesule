/** Tarayıcı ve sunucu arasında paylaşılan veri tipleri. */

export type PublicNote = { id: string; name: string | null; message: string; createdAt: string }

export type RsvpRow = {
  id: string
  name: string
  phone: string
  attendance: 'yes' | 'no' | 'maybe'
  guestCount: number
  note: string
  createdAt: string
  updatedAt: string
}

export type NoteRow = {
  id: string
  name: string
  message: string
  visibility: 'public' | 'anonymous' | 'private'
  approved: boolean
  createdAt: string
}

export type AdminSummary = {
  stats: {
    responses: number
    attending: number
    declined: number
    maybe: number
    /** Katılacakların toplam kişi sayısı */
    guests: number
    /** Belirsizlerin olası kişi sayısı */
    maybeGuests: number
    notes: number
  }
  rsvps: RsvpRow[]
  notes: NoteRow[]
  generatedAt: string
}

