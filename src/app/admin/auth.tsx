'use client'

import { useRouter } from 'next/navigation'
import { useState, type FormEvent } from 'react'

export function LoginForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function submit(e: FormEvent) {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ password }),
      })
      if (res.ok) {
        router.refresh()
        return
      }
      setError(res.status === 429 ? 'Çok fazla deneme. Biraz sonra tekrar deneyin.' : 'Şifre yanlış.')
    } catch {
      setError('Bağlantı kurulamadı.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} className="mt-14 grid max-w-sm gap-6">
      <div className="field" data-invalid={Boolean(error)}>
        <label htmlFor="admin-password" className="field__label t-label">
          Şifre
        </label>
        <input
          id="admin-password"
          type="password"
          className="input"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
        />
        {error ? (
          <p className="field__error" role="alert">
            {error}
          </p>
        ) : null}
      </div>
      <button type="submit" className="btn btn--solid" disabled={busy || !password}>
        <span>{busy ? 'Kontrol ediliyor' : 'Giriş'}</span>
        <span className="arrow" aria-hidden="true">
          →
        </span>
      </button>
    </form>
  )
}

export function LogoutButton() {
  const router = useRouter()
  return (
    <button
      type="button"
      className="t-label muted py-2"
      onClick={async () => {
        await fetch('/api/admin/logout', { method: 'POST' })
        router.refresh()
      }}
    >
      Çıkış
    </button>
  )
}
