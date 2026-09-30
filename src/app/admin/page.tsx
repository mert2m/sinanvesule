import type { Metadata } from 'next'
import { cookies } from 'next/headers'
import { invitation } from '@/content/invitation'
import { Monogram } from '@/components/marks'
import { ADMIN_COOKIE, adminConfigured, verifySessionToken } from '@/lib/server/admin-session'
import { backendMode, callBackend } from '@/lib/server/backend'
import { siteUrl } from '@/lib/site'
import type { AdminSummary } from '@/lib/types'
import { prettyPhone } from '@/lib/validation'
import { LoginForm, LogoutButton } from './auth'
import { QrStudio } from './QrStudio'

export const maxDuration = 30

export const metadata: Metadata = {
  title: 'Yönetim · Sinan & Şule',
  robots: { index: false, follow: false },
}

const dateFmt = new Intl.DateTimeFormat('tr-TR', {
  timeZone: 'Europe/Istanbul',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})
const when = (iso: string) => {
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : dateFmt.format(d)
}

export default async function AdminPage() {
  const jar = await cookies()
  const signedIn = verifySessionToken(jar.get(ADMIN_COOKIE)?.value)

  return (
    <div className="min-h-svh bg-[var(--color-paper)] px-[var(--gutter)] pt-[max(1.5rem,env(safe-area-inset-top))] pb-16">
      <div className="mx-auto max-w-[68rem]">
        <header className="flex items-center justify-between gap-6 border-b border-[var(--rule)] pb-5">
          <div className="flex items-center gap-4">
            <Monogram className="h-12 w-auto" />
            <div>
              <p className="t-label muted">Yönetim</p>
              <p className="t-display text-[1.75rem]">{invitation.couple.together}</p>
            </div>
          </div>
          {signedIn ? <LogoutButton /> : null}
        </header>

        {!adminConfigured() ? (
          <Notice title="Şifre tanımlı değil">
            Vercel’de <code>ADMIN_PASSWORD</code> ortam değişkenini (en az 6 karakter) ekleyip yeniden dağıtın.
          </Notice>
        ) : !signedIn ? (
          <LoginForm />
        ) : (
          <Dashboard />
        )}
      </div>
    </div>
  )
}

async function Dashboard() {
  let data: AdminSummary | null = null
  let failed = false
  try {
    data = await callBackend('admin.summary', {})
  } catch (error) {
    console.error('[admin] özet alınamadı', error)
    failed = true
  }
  const mode = backendMode()
  const sheetUrl = process.env.SHEET_URL

  return (
    <div className="grid gap-14 pt-8">
      {mode !== 'apps-script' ? (
        <Notice title={mode === 'mock' ? 'Deneme modu' : 'Veri kaynağı bağlı değil'}>
          {mode === 'mock'
            ? 'APPS_SCRIPT_URL tanımlı olmadığı için yerel, geçici bir deneme deposu kullanılıyor. Sunucu yeniden başlayınca kayıtlar silinir.'
            : 'APPS_SCRIPT_URL ve APPS_SCRIPT_SECRET ortam değişkenlerini ekleyin (README’deki adımlar).'}
        </Notice>
      ) : null}

      {failed || !data ? (
        <Notice title="Veriler alınamadı">
          Apps Script’e ulaşılamadı. Dağıtım erişiminin “Herkes” olduğundan ve gizli anahtarların eşleştiğinden emin olun.
        </Notice>
      ) : (
        <>
          <section aria-label="Özet" className="grid grid-cols-2 gap-px bg-[var(--rule)] md:grid-cols-4">
            <Stat label="Toplam misafir" value={data.stats.guests} accent />
            <Stat label="Katılacak yanıt" value={data.stats.attending} />
            <Stat label="Katılamayacak" value={data.stats.declined} />
            <Stat label="Toplam yanıt" value={data.stats.responses} />
          </section>

          <section aria-labelledby="yanitlar" className="grid gap-5">
            <div className="flex flex-wrap items-baseline justify-between gap-3">
              <h2 id="yanitlar" className="t-display text-[2rem]">
                Yanıtlar
              </h2>
              <p className="t-ui muted text-[0.875rem]">
                Son güncelleme {when(data.generatedAt)}
                {sheetUrl ? (
                  <>
                    {' · '}
                    <a className="link" href={sheetUrl} target="_blank" rel="noopener noreferrer">
                      Google Sheet’i aç ↗
                    </a>
                  </>
                ) : null}
              </p>
            </div>
            {data.rsvps.length === 0 ? (
              <p className="t-body muted">Henüz yanıt yok.</p>
            ) : (
              <ul className="border-b border-[var(--rule)]">
                {data.rsvps.map((r) => (
                  <li key={r.id} className="grid gap-1 border-t border-[var(--rule)] py-4 md:grid-cols-[1.3fr_1fr_0.6fr_1.6fr] md:items-baseline md:gap-6">
                    <div>
                      <p className="t-ui text-[1.0625rem] font-medium">{r.name}</p>
                      <p className="t-ui muted text-[0.8125rem]">{when(r.updatedAt || r.createdAt)}</p>
                    </div>
                    <p className="t-ui text-[0.9375rem]">
                      {r.phone ? (
                        <a className="link" href={`tel:${r.phone}`}>
                          {prettyPhone(r.phone)}
                        </a>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </p>
                    <p className="t-label">
                      {r.attendance === 'yes' ? (
                        <span className="text-[var(--accent)]">Geliyor · {r.guestCount}</span>
                      ) : (
                        <span className="muted">Gelemiyor</span>
                      )}
                    </p>
                    <p className="t-body muted text-[1rem] leading-[1.45]">{r.note || ''}</p>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="notlar-admin" className="grid gap-5">
            <h2 id="notlar-admin" className="t-display text-[2rem]">
              Notlar <span className="muted">({data.stats.notes})</span>
            </h2>
            {data.notes.length === 0 ? (
              <p className="t-body muted">Henüz not yok.</p>
            ) : (
              <ul className="grid gap-px bg-[var(--rule)] md:grid-cols-2">
                {data.notes.map((n) => (
                  <li key={n.id} className="bg-[var(--color-paper)] p-5">
                    <p className="note__text text-[1.125rem]">“{n.message}”</p>
                    <p className="t-label muted mt-3 flex flex-wrap gap-x-3 gap-y-1">
                      <span>— {n.name || 'İsimsiz'}</span>
                      <span>{when(n.createdAt)}</span>
                      <span className={n.visibility === 'private' ? 'text-[var(--accent)]' : ''}>
                        {n.visibility === 'public' ? 'Herkese açık' : n.visibility === 'anonymous' ? 'İsimsiz paylaşıldı' : 'Yalnızca siz'}
                      </span>
                      {!n.approved ? <span className="text-[var(--accent)]">Onay bekliyor</span> : null}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <p className="t-ui muted text-[0.875rem]">
              Bir notu sitede gizlemek için Google Sheet’te GUESTBOOK sayfasındaki <code>approved</code> kutusunun işaretini
              kaldırın.
            </p>
          </section>
        </>
      )}

      <section aria-labelledby="qr" className="grid gap-5 border-t border-[var(--rule)] pt-10">
        <div>
          <h2 id="qr" className="t-display text-[2rem]">
            Baskı için QR kod
          </h2>
          <p className="t-body muted mt-2 max-w-[44ch]">
            Basılı davetiyeye koymak için. Ortada Ş monogramı var; yüksek hata düzeltme seviyesiyle üretildiği için okunur.
          </p>
        </div>
        <QrStudio defaultUrl={siteUrl().href} />
      </section>
    </div>
  )
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="bg-[var(--color-paper)] px-4 py-5">
      <p className={`t-titling text-[3.75rem] leading-[0.9] ${accent ? 'text-[var(--accent)]' : ''}`}>{value}</p>
      <p className="t-label muted mt-2">{label}</p>
    </div>
  )
}

function Notice({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-8 border-l-2 border-[var(--accent)] bg-[var(--color-paper-2)] px-5 py-4">
      <p className="t-ui font-medium">{title}</p>
      <p className="t-ui muted mt-1 text-[0.9375rem]">{children}</p>
    </div>
  )
}
