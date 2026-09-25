'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'

const DURATION = 3000 // keep in sync with .toast-timer in globals.css

/** Show a short message at the bottom of the screen (rendered by <Toaster /> in the site layout). */
export const toast = (message: string) => window.dispatchEvent(new CustomEvent('toast', { detail: message }))

export function Toaster() {
  const [current, setCurrent] = useState<{ id: number; message: string } | null>(null)

  useEffect(() => {
    const show = (e: Event) => setCurrent({ id: Date.now(), message: (e as CustomEvent<string>).detail })
    window.addEventListener('toast', show)
    return () => window.removeEventListener('toast', show)
  }, [])

  useEffect(() => {
    if (!current) return
    const timer = setTimeout(() => setCurrent(null), DURATION)
    return () => clearTimeout(timer)
  }, [current])

  return (
    <div role="status" aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-6 z-50 flex justify-center px-5">
      {current && (
        // keyed so a second copy restarts the timer bar
        <div key={current.id} className="toast relative flex items-center gap-3 overflow-hidden rounded-full bg-ink-3 py-3 pr-6 pl-4 text-base shadow-[0_16px_40px_-12px_rgb(15_13_13/0.9)] ring-1 ring-paper/15">
          <CheckCircle size={22} weight="fill" aria-hidden className="shrink-0 text-ember" />
          {current.message}
          <span aria-hidden className="toast-timer absolute inset-x-0 bottom-0 h-0.5 origin-left bg-crimson" />
        </div>
      )}
    </div>
  )
}
