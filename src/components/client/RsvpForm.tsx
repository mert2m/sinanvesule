'use client'

import { useEffect, useId, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { AnimatePresence, LazyMotion, domAnimation } from 'motion/react'
import * as m from 'motion/react-m'
import { invitation } from '@/content/invitation'
import { clock, dayMonth, fill, firstName, longDate } from '@/lib/format'
import { errorMessage } from '@/lib/messages'
import { LIMITS, validateRsvp, type Attendance, type FieldErrors, type RsvpInput } from '@/lib/validation'
import { CengelMark } from '../marks'
import { useIsAfter, useStoredRsvpRaw } from './hooks'
import { writeStoredRsvp, type StoredRsvp } from './storage'

const EASE = [0.16, 1, 0.3, 1] as const
type Done = { status: 'created' | 'updated'; record: StoredRsvp }

export function RsvpForm() {
  const { rsvp: settings, copy } = invitation
  const c = copy.rsvp
  const ids = useId()

  const storedRaw = useStoredRsvpRaw()
  const stored = useMemo<StoredRsvp | null>(() => {
    try {
      return storedRaw ? (JSON.parse(storedRaw) as StoredRsvp) : null
    } catch {
      return null
    }
  }, [storedRaw])
  const closed = useIsAfter(Date.parse(`${settings.deadline}T23:59:59+03:00`)) && settings.closeAfterDeadline

  const [editing, setEditing] = useState(false)
  const [done, setDone] = useState<Done | null>(null)
  const [sending, setSending] = useState(false)
  const [attendance, setAttendance] = useState<Attendance | null>(null)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [guests, setGuests] = useState(1)
  const [note, setNote] = useState('')
  const [errors, setErrors] = useState<FieldErrors<keyof RsvpInput>>({})
  const [serverError, setServerError] = useState<string | null>(null)
  const clear = (key: keyof RsvpInput) => setErrors((e) => (e[key] ? { ...e, [key]: undefined } : e))
  // Belirsiz diyenlerden de telefon ve olası kişi sayısı alınır
  const coming = attendance === 'yes' || attendance === 'maybe'

  const openedAt = useRef(0)
  const honeypot = useRef<HTMLInputElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const resultRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    openedAt.current = performance.now()
  }, [])

  const view: 'closed' | 'stored' | 'done' | 'form' = done
    ? 'done'
    : closed
      ? 'closed'
      : stored && !editing
        ? 'stored'
        : 'form'

  function startEdit() {
    const from = done?.record ?? stored
    if (from) {
      setAttendance(from.attendance)
      setName(from.name)
      setPhone(from.phone ?? '')
      setGuests(Math.max(1, from.guestCount || 1))
    }
    setDone(null)
    setEditing(true)
  }

  function choose(value: Attendance) {
    setAttendance(value)
    clear('attendance')
  }

  async function submit(e: FormEvent) {
    e.preventDefault()
    setServerError(null)
    const result = validateRsvp({ attendance, name, phone, guestCount: guests, note }, settings)
    if (!result.ok) {
      setErrors(result.errors)
      const first = Object.keys(result.errors)[0]
      formRef.current?.querySelector<HTMLElement>(`[data-field="${first}"]`)?.focus()
      return
    }
    setErrors({})
    setSending(true)
    try {
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...result.data,
          website: honeypot.current?.value ?? '',
          dt: Math.round(performance.now() - openedAt.current),
        }),
      })
      const data = (await res.json().catch(() => null)) as
        | { ok: true; status: 'created' | 'updated' }
        | { ok: false; error?: string; fields?: FieldErrors<keyof RsvpInput> }
        | null
      if (!res.ok || !data || !data.ok) {
        const failure = data && !data.ok ? data : null
        if (failure?.fields) setErrors(failure.fields)
        setServerError(errorMessage(failure?.error, res.status))
        return
      }
      const record: StoredRsvp = {
        attendance: result.data.attendance,
        name: result.data.name,
        phone: result.data.phone,
        guestCount: result.data.guestCount,
        at: new Date().toISOString(),
      }
      writeStoredRsvp(record)
      setDone({ status: data.status, record })
      setEditing(false)
      setNote('')
      document.dispatchEvent(new CustomEvent('svs:rsvp', { detail: record }))
      requestAnimationFrame(() => resultRef.current?.focus())
    } catch {
      setServerError(copy.errors.network)
    } finally {
      setSending(false)
    }
  }

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="mt-10 max-w-[36rem]">
        <AnimatePresence mode="wait" initial={false}>
          {view === 'closed' && (
            <m.p key="closed" className="t-lead muted border-y border-[var(--rule)] py-6" {...fadeUp}>
              {c.closed}
            </m.p>
          )}

          {view === 'stored' && stored && (
            <m.div key="stored" className="border-y border-[var(--rule)] py-6" {...fadeUp}>
              <p className="t-label muted">{c.stored}</p>
              <p className="t-lead mt-3">
                {c[stored.attendance].label}
                {stored.attendance !== 'no' ? <span className="muted"> · {stored.guestCount} kişi</span> : null}
              </p>
              <p className="t-ui muted mt-1">{stored.name}</p>
              <button type="button" className="btn mt-6" onClick={startEdit}>
                <span>{c.change}</span>
                <span className="arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </m.div>
          )}

          {view === 'done' && done && (
            <m.div
              key="done"
              ref={resultRef}
              tabIndex={-1}
              role="status"
              className="outline-none"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, transition: { duration: 0.25 } }}
            >
              <Success done={done} onEdit={startEdit} />
            </m.div>
          )}

          {view === 'form' && (
            <m.form key="form" ref={formRef} onSubmit={submit} noValidate className="grid gap-8" {...fadeUp}>
              <fieldset>
                <legend className="sr-only">Katılım durumu</legend>
                <div className="grid grid-cols-2 gap-3" role="radiogroup" aria-invalid={Boolean(errors.attendance)}>
                  {(['yes', 'no', 'maybe'] as const).map((value) => (
                    <label
                      key={value}
                      className={value === 'maybe' ? 'choice choice--wide' : 'choice'}
                      data-checked={attendance === value}
                    >
                      <input
                        type="radio"
                        name={`${ids}-attendance`}
                        value={value}
                        className="sr-only"
                        checked={attendance === value}
                        onChange={() => choose(value)}
                        data-field={value === 'yes' ? 'attendance' : undefined}
                      />
                      <CengelMark className="choice__mark" />
                      <span className="choice__label">{c[value].label}</span>
                      <span className="choice__sub">{c[value].sub}</span>
                    </label>
                  ))}
                </div>
                {errors.attendance && <p className="field__error">{errors.attendance}</p>}
              </fieldset>

              <AnimatePresence initial={false}>
                {attendance && (
                  <m.div
                    key="fields"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.65, ease: EASE }}
                    className="-mx-1 overflow-hidden px-1"
                  >
                    <div className="grid gap-7 pb-1">
                      <Field id={`${ids}-name`} label={c.name} error={errors.name}>
                        <input
                          id={`${ids}-name`}
                          data-field="name"
                          className="input"
                          value={name}
                          onChange={(e) => {
                            setName(e.target.value)
                            clear('name')
                          }}
                          placeholder={c.namePlaceholder}
                          autoComplete="name"
                          autoCapitalize="words"
                          enterKeyHint="next"
                          maxLength={LIMITS.name}
                          aria-invalid={Boolean(errors.name)}
                          aria-describedby={errors.name ? `${ids}-name-err` : undefined}
                        />
                      </Field>

                      {coming && (
                        <Field
                          id={`${ids}-phone`}
                          label={c.phone}
                          hint={settings.requirePhone ? undefined : c.noteOptional}
                          error={errors.phone}
                        >
                          <input
                            id={`${ids}-phone`}
                            data-field="phone"
                            className="input"
                            type="tel"
                            inputMode="tel"
                            autoComplete="tel"
                            enterKeyHint="next"
                            value={phone}
                            onChange={(e) => {
                              setPhone(e.target.value)
                              clear('phone')
                            }}
                            placeholder={c.phonePlaceholder}
                            maxLength={LIMITS.phone}
                            aria-invalid={Boolean(errors.phone)}
                            aria-describedby={errors.phone ? `${ids}-phone-err` : undefined}
                          />
                        </Field>
                      )}

                      {coming && (
                        <div className="field">
                          <p className="field__label t-label" id={`${ids}-guests`}>
                            <span>{attendance === 'maybe' ? c.guestsMaybe : c.guests}</span>
                            <span className="normal-case tracking-normal">{c.guestsHint}</span>
                          </p>
                          <div className="stepper mt-2" role="group" aria-labelledby={`${ids}-guests`}>
                            <button
                              type="button"
                              className="stepper__btn"
                              onClick={() => setGuests((n) => Math.max(1, n - 1))}
                              disabled={guests <= 1}
                              aria-label="Bir kişi azalt"
                            >
                              −
                            </button>
                            <output className="stepper__value" aria-live="polite" data-field="guestCount" tabIndex={-1}>
                              {guests}
                            </output>
                            <button
                              type="button"
                              className="stepper__btn"
                              onClick={() => setGuests((n) => Math.min(settings.maxGuests, n + 1))}
                              disabled={guests >= settings.maxGuests}
                              aria-label="Bir kişi artır"
                            >
                              +
                            </button>
                          </div>
                          {errors.guestCount && <p className="field__error">{errors.guestCount}</p>}
                        </div>
                      )}

                      <Field id={`${ids}-note`} label={c.note} hint={c.noteOptional} error={errors.note}>
                        <textarea
                          id={`${ids}-note`}
                          data-field="note"
                          className="input"
                          rows={3}
                          value={note}
                          onChange={(e) => {
                            setNote(e.target.value)
                            clear('note')
                          }}
                          placeholder={
                            attendance === 'yes'
                              ? c.notePlaceholderYes
                              : attendance === 'maybe'
                                ? c.notePlaceholderMaybe
                                : c.notePlaceholderNo
                          }
                          maxLength={LIMITS.note}
                        />
                      </Field>

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

                      <div className="grid gap-3">
                        <button type="submit" className="btn btn--solid w-full" disabled={sending}>
                          <span className={sending ? 'dots' : undefined}>{sending ? c.sending : c.submit}</span>
                          <span className="arrow" aria-hidden="true">
                            →
                          </span>
                        </button>
                        <p className="t-ui muted text-[0.8125rem]">{c.privacy}</p>
                      </div>
                    </div>
                  </m.div>
                )}
              </AnimatePresence>
            </m.form>
          )}
        </AnimatePresence>
      </div>
    </LazyMotion>
  )
}

function Success({ done, onEdit }: { done: Done; onEdit: () => void }) {
  const { copy, event, venue, rsvp } = invitation
  const c = copy.rsvp
  const { record } = done
  const who = firstName(record.name)
  const kind = record.attendance
  const title =
    kind === 'yes'
      ? fill(record.guestCount > 1 ? c.successYesTitleGroup : c.successYesTitle, { name: who, count: record.guestCount })
      : kind === 'maybe'
        ? fill(c.successMaybeTitle, { name: who })
        : fill(c.successNoTitle, { name: who })
  const body =
    kind === 'yes'
      ? c.successYesBody
      : kind === 'maybe'
        ? fill(c.successMaybeBody, { deadline: dayMonth(rsvp.deadline) })
        : c.successNoBody
  return (
    <div className="border-y border-[var(--rule)] py-8">
      <m.div
        className="w-4 text-[var(--accent)]"
        initial={{ opacity: 0, y: -14, scaleY: 0.6 }}
        animate={{ opacity: 1, y: 0, scaleY: 1 }}
        transition={{ duration: 1, ease: EASE, delay: 0.15 }}
        style={{ transformOrigin: '50% 0%' }}
      >
        <CengelMark className="w-full" />
      </m.div>
      {done.status === 'updated' && <p className="t-label muted mt-5">{c.updated}</p>}
      <m.p
        className="t-display mt-5 text-[clamp(2.1rem,8.4vw,3.4rem)]"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.3 }}
      >
        {title}
      </m.p>
      <m.p
        className="t-lead muted mt-4"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1.1, ease: EASE, delay: 0.45 }}
      >
        {body}
      </m.p>
      {kind !== 'no' && (
        <m.p
          className="t-ui mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.7 }}
        >
          <span className="muted">
            {longDate(event.start)} · {clock(event.start)} · {venue.name}
          </span>
          <br />
          <a href="/nisan.ics" className="link">
            {copy.date.calendar}
          </a>
        </m.p>
      )}
      <button type="button" className="link t-ui mt-7 inline-block" onClick={onEdit}>
        {c.change}
      </button>
    </div>
  )
}

const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.25 } },
}

function Field({
  id,
  label,
  hint,
  error,
  children,
}: {
  id: string
  label: string
  hint?: string
  error?: string
  children: ReactNode
}) {
  return (
    <div className="field" data-invalid={Boolean(error)}>
      <label htmlFor={id} className="field__label t-label">
        <span>{label}</span>
        {hint && <span className="normal-case tracking-normal">{hint}</span>}
      </label>
      {children}
      {error && (
        <p id={`${id}-err`} className="field__error">
          {error}
        </p>
      )}
    </div>
  )
}

