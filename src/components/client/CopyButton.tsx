'use client'

import { useState } from 'react'

export function CopyButton({ text, label, done }: { text: string; label: string; done: string }) {
  const [copied, setCopied] = useState(false)

  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Eski tarayıcılar / uygulama içi tarayıcılar için yedek yol
      const area = document.createElement('textarea')
      area.value = text
      area.setAttribute('readonly', '')
      area.style.position = 'fixed'
      area.style.opacity = '0'
      document.body.appendChild(area)
      area.select()
      document.execCommand('copy')
      area.remove()
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  return (
    <button type="button" onClick={copy} className="link t-ui" aria-live="polite">
      {copied ? `${done} ✓` : label}
    </button>
  )
}
