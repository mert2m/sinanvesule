export type ProgramItem = {
  /** "14.00" gibi; saat belli değilse "Sonrası" gibi bir kelime de olabilir. */
  time: string
  title: string
  text?: string
  /** Kırmızı çengelle işaretlenecek ana an (yüzük töreni gibi). */
  highlight?: boolean
}

export type InvitationConfig = {
  couple: { first: string; second: string; together: string; hosts?: string }
  event: { kind: string; start: string; end: string }
  venue: {
    name: string
    area: string
    addressLines: string[]
    address: string
    coordinates: { lat: number; lng: number }
    googleMapsUrl: string
  }
  program: ProgramItem[]
  music: { src: string; startOnEnter: boolean; volume: number }
  rsvp: {
    enabled: boolean
    deadline: string
    closeAfterDeadline: boolean
    maxGuests: number
    requirePhone: boolean
  }
  guestbook: { enabled: boolean; maxLength: number; pageSize: number }
  seo: { title: string; description: string; ogAlt: string; indexable: boolean }
  copy: {
    opening: { tagline: string; enter: string; skip: string }
    hero: { eyebrow: string; lead: string; note: string; scroll: string }
    invitation: { kicker: string; title: string; paragraphs: string[] }
    date: {
      kicker: string
      countdownLabel: string
      units: { days: string; hours: string; minutes: string; seconds: string }
      today: string
      after: string
      calendar: string
      calendarApple: string
      calendarGoogle: string
    }
    venue: { kicker: string; cta: string; ctaHint: string; appleMaps: string; copy: string; copied: string }
    program: { kicker: string; title: string }
    rsvp: {
      kicker: string
      title: string
      intro: string
      yes: { label: string; sub: string }
      no: { label: string; sub: string }
      maybe: { label: string; sub: string }
      name: string
      namePlaceholder: string
      phone: string
      phonePlaceholder: string
      guests: string
      guestsHint: string
      guestsMaybe: string
      note: string
      noteOptional: string
      notePlaceholderYes: string
      notePlaceholderNo: string
      notePlaceholderMaybe: string
      submit: string
      sending: string
      privacy: string
      successYesTitle: string
      successYesTitleGroup: string
      successYesBody: string
      successNoTitle: string
      successNoBody: string
      successMaybeTitle: string
      successMaybeBody: string
      updated: string
      stored: string
      change: string
      closed: string
      floating: string
    }
    guestbook: {
      kicker: string
      title: string
      intro: string
      message: string
      messagePlaceholder: string
      name: string
      namePlaceholder: string
      visibility: { public: string; anonymous: string; private: string }
      submit: string
      sending: string
      anonymousName: string
      empty: string
      successPublic: string
      successPrivate: string
      successPending: string
      another: string
      more: string
    }
    closing: { line: string; colophon: string; backToTop: string }
    music: { on: string; off: string }
    errors: { generic: string; network: string; rateLimited: string; notConfigured: string }
  }
}
