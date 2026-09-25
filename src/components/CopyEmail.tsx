'use client'

import { toast } from './Toast'

/** Email address link that copies the address (with a toast) instead of opening a mail app.
 *  If copying isn't allowed, it falls back to the normal mailto behaviour. */
export function CopyEmail({ email, className, children }: { email: string; className?: string; children?: React.ReactNode }) {
  return (
    <a
      href={`mailto:${email}`}
      className={className}
      onClick={async (e) => {
        e.preventDefault()
        try {
          await navigator.clipboard.writeText(email)
          toast(`Email copiado: ${email}`)
        } catch {
          window.location.href = `mailto:${email}`
        }
      }}
    >
      {children ?? email}
    </a>
  )
}
