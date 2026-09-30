'use client'

import { useEffect, useId, useRef, useState, type FormEvent } from 'react'
import { AnimatePresence, LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import { invitation } from '@/content/invitation'
import { errorMessage } from '@/lib/messages'
import type { PublicNote } from '@/lib/types'
import { LIMITS, validateNote, type FieldErrors, type NoteInput, type Visibility } from '@/lib/validation'

const EASE = [0.16, 1, 0.3, 1] as const
type Outcome = 'published' | 'pending' | 'private' | 'duplicate'

export function Guestbook() {
  const { guestbook: settings, copy } = invitation
  const c = copy.guestbook
  const ids = useId()

  const [notes, setNotes] = useState<PublicNote[] | null>(null)
  const [shown, setShown] = useState<number>(settings.pageSize)
  const [fresh, setFresh] = useState<string | null>(null)

  const [message, setMessage] = useState('')
  const [name, setName] = useState('')
  const [visibility, setVisibility] = useState<Visibility>('public')
  const [errors, setErrors] = useState<FieldErrors<keyof NoteInput>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const clear = (key: keyof NoteInput) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  const [sending, setSending] = useState(false)
  const [outcome, setOutcome] = useState<Outcome | null>(null)

  const wall = useRef<HTMLDivElement>(null)
  const openedAt = useRef(0)
  const honeypot = useRef<HTMLInputElement>(null)

  // Notları ancak bölüme yaklaşınca yükle (ilk açılışı hafif tutar)
  useEffect(() => {
    openedAt.current = performance.now()
    const el = wall.current
    if (!el) return
    let cancelled = false
    const load = () =>
      fetch('/api/guestbook')
        .then((r) => r.json())
        .then((d: { notes?: PublicNote[] }) => {
          if (!cancelled) setNotes((current) => merge(d.notes ?? [], current))
        })
        .catch(() => {
          if (!cancelled) setNotes((current) => current ?? [])
        })
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        io.disconnect()
        load()
      },
      { rootMargin: '800px 0px' },
    )
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
    }
  }, [])

  async function submit(e: FormEvent) {
    e.preventDefault()
    setServerError(null)
    const result = validateNote({ message, name, visibility }, settings.maxLength)
    if (!result.ok) {
      setErrors(result.errors)
      return
    }
    setErrors({})
    setSending(true)
    try {
      const res = await fetch('/api/guestbook', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          website: honeypot.current?.value ?? '',
          dt: Math.round(performance.now() - openedAt.current),
        }),
      })
      const data = (await res.json().catch(() => null)) as
        | { ok: true; status: Outcome; note?: PublicNote }
        | { ok: false; error?: string; fields?: FieldErrors<keyof NoteInput> }
        | null
      if (!res.ok || !data || !data.ok) {
        const failure = data && !data.ok ? data : null
        if (failure?.fields) setErrors(failure.fields)
        setServerError(errorMessage(failure?.error, res.status))
        return
      }
      if (data.status === 'published' && data.note) {
        const note = data.note
        setNotes((current) => [note, ...(current ?? []).filter((n) => n.id !== note.id)])
        setFresh(note.id)
      }
      setOutcome(data.status)
      setMessage('')
    } catch {
      setServerError(copy.errors.network)
    } finally {
      setSending(false)
    }
  }

  const outcomeText =
    outcome === 'private' ? c.successPrivate : outcome === 'pending' ? c.successPending : c.successPublic
  const remaining = settings.maxLength - message.length

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="mt-10 max-w-[36rem]">
        <AnimatePresence mode="wait" initial={false}>
          {outcome ? (
            <m.div
              key="thanks"
              role="status"
              className="border-y border-[var(--rule)] py-7"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <p className="t-lead">
                <em>{outcomeText}</em>
              </p>
              <button type="button" className="link t-ui mt-5" onClick={() => setOutcome(null)}>
                {c.another}
              </button>
            </m.div>
          ) : (
            <m.form
              key="form"
              onSubmit={submit}
              noValidate
              className="grid gap-7"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } }}
              exit={{ opacity: 0, transition: { duration: 0.2 } }}
            >
              <div className="field" data-invalid={Boolean(errors.message)}>
                <div className="field__label t-label">
                  <label htmlFor={`${ids}-msg`}>{c.message}</label>
                  <span className={`tracking-normal ${remaining < 30 ? 'text-[var(--accent)]' : ''}`} aria-hidden="true">
                    {remaining}
                  </span>
                </div>
                <textarea
                  id={`${ids}-msg`}
                  className="input"
                  rows={3}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    clear('message')
                  }}
                  placeholder={c.messagePlaceholder}
                  maxLength={settings.maxLength}
                  aria-invalid={Boolean(errors.message)}
                />
                {errors.message && <p className="field__error">{errors.message}</p>}
              </div>

              <div className="field" data-invalid={Boolean(errors.name)}>
                <label htmlFor={`${ids}-name`} className="field__label t-label">
                  <span>{c.name}</span>
                </label>
                <input
                  id={`${ids}-name`}
                  className="input"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value)
                    clear('name')
                  }}
                  placeholder={c.namePlaceholder}
                  autoComplete="name"
                  autoCapitalize="words"
                  maxLength={LIMITS.noteName}
                  aria-invalid={Boolean(errors.name)}
                />
                {errors.name && <p className="field__error">{errors.name}</p>}
              </div>

              <fieldset className="grid gap-1">
                <legend className="sr-only">Notunuz nasıl görünsün?</legend>
                {(['public', 'anonymous', 'private'] as const).map((value) => (
                  <label key={value} className="option">
                    <input
                      type="radio"
                      name={`${ids}-visibility`}
                      value={value}
                      checked={visibility === value}
                      onChange={() => {
                        setVisibility(value)
                        clear('name')
                      }}
                    />
                    <span>{c.visibility[value]}</span>
                  </label>
                ))}
              </fieldset>

              <div className="hp" aria-hidden="true">
                <label>
                  Web siteniz
                  <input ref={honeypot} name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </label>
              </div>

              {serverError && (
                <p className="field__error" role="alert">
                  {serverError}
                </p>
              )}

              <button type="submit" className="btn w-full" disabled={sending}>
                <span className={sending ? 'dots' : undefined}>{sending ? c.sending : c.submit}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </m.form>
          )}
        </AnimatePresence>

        <div ref={wall} className="mt-16" aria-live="polite" aria-busy={notes === null}>
          {notes === null ? (
            <div className="grid gap-3" aria-hidden="true">
              <div className="h-4 w-4/5 animate-pulse bg-[var(--rule)]" />
              <div className="h-4 w-3/5 animate-pulse bg-[var(--rule)]" />
            </div>
          ) : notes.length === 0 ? (
            <p className="t-body muted">
              <em>{c.empty}</em>
            </p>
          ) : (
            <>
              <ul>
                {notes.slice(0, shown).map((note) => (
                  <li key={note.id} className="note" data-fresh={note.id === fresh}>
                    <p className="note__text">“{note.message}”</p>
                    <p className="t-label muted mt-3">— {note.name || c.anonymousName}</p>
                  </li>
                ))}
              </ul>
              {notes.length > shown && (
                <button type="button" className="link t-ui mt-4" onClick={() => setShown((n) => n + settings.pageSize)}>
                  {c.more} ({notes.length - shown})
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </LazyMotion>
  )
}

/** Sunucudan gelen listeyi, yerelde yeni eklenmiş notu kaybetmeden birleştirir. */
function merge(incoming: PublicNote[], current: PublicNote[] | null) {
  if (!current?.length) return incoming
  const ids = new Set(incoming.map((n) => n.id))
  return [...current.filter((n) => !ids.has(n.id)), ...incoming]
}
