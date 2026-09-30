import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { invitation } from '@/content/invitation'
import { Hero } from '@/components/Hero'
import { Opening } from '@/components/Opening'
import {
  Closing,
  DateSection,
  InvitationSection,
  NotesSection,
  ProgramSection,
  RsvpSection,
  VenueSection,
} from '@/components/sections'
import { FloatingRsvp } from '@/components/client/FloatingRsvp'
import { MusicToggle } from '@/components/client/MusicToggle'
import { RevealObserver } from '@/components/client/RevealObserver'

/**
 * Sayfa derleme sırasında statik üretilir (müzik dosyasının varlığı da o anda
 * okunur); ziyaretçi başına sunucu çalışmaz.
 */
export default function Home() {
  const hasMusic = Boolean(invitation.music.src) && existsSync(join(process.cwd(), 'public', invitation.music.src))

  return (
    <>
      <Opening />
      <main id="main" suppressHydrationWarning>
        <Hero />
        <InvitationSection />
        <DateSection />
        <VenueSection />
        <ProgramSection />
        <RsvpSection />
        <NotesSection />
        <Closing />
      </main>
      <FloatingRsvp />
      {hasMusic ? <MusicToggle /> : null}
      <RevealObserver />
    </>
  )
}
