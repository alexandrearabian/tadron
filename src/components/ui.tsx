import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/ssr'
import { PortableText, type PortableTextBlock } from 'next-sanity'

export const container = 'mx-auto w-full max-w-7xl px-5 md:px-8'
export const display = 'font-display font-medium tracking-tight'

type ButtonProps = { href: string; children: React.ReactNode; variant?: 'primary' | 'outline' }

/** Pill button. External links (tickets, mail, phone) get the diagonal arrow and open safely. */
export function ButtonLink({ href, children, variant = 'primary' }: ButtonProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href)
  const newTab = href.startsWith('http')
  const Icon = newTab ? ArrowUpRight : ArrowRight
  const className = `group inline-flex min-h-13 items-center gap-3 whitespace-nowrap rounded-full py-2 pr-2 pl-6 text-base font-medium transition duration-300 ease-stage active:scale-[0.98] ${
    variant === 'primary'
      ? 'bg-crimson text-paper hover:bg-crimson-deep'
      : 'text-paper ring-1 ring-paper/30 ring-inset hover:bg-paper/5 hover:ring-paper/60'
  }`
  const inner = (
    <>
      {children}
      {newTab && <span className="sr-only"> (se abre en otra pestaña)</span>}
      <span className="grid size-9 place-items-center rounded-full bg-paper/12 transition duration-300 ease-stage group-hover:translate-x-0.5">
        <Icon size={18} weight="bold" aria-hidden />
      </span>
    </>
  )
  return external ? (
    <a href={href} className={className} {...(newTab && { target: '_blank', rel: 'noopener noreferrer' })}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}

export function Rich({ value }: { value?: PortableTextBlock[] | null }) {
  if (!value?.length) return null
  return (
    <div className="prose-stage">
      <PortableText value={value} />
    </div>
  )
}

/** Title block for listing pages (Cartelera, Cursos, Contacto). */
export function PageTitle({ title, intro }: { title: string; intro: string }) {
  return (
    <header className={`${container} pt-36 pb-14 md:pt-44 md:pb-20`}>
      <h1 className={`${display} rise text-6xl md:text-8xl leading-[0.95]`}>{title}</h1>
      <p className="rise mt-6 max-w-[48ch] text-xl text-mist" style={{ '--d': 1 } as React.CSSProperties}>
        {intro}
      </p>
    </header>
  )
}

export function TicketAction({ url, soldOut }: { url?: string | null; soldOut?: boolean | null }) {
  if (soldOut)
    return <span className="inline-flex min-h-13 items-center rounded-full px-6 text-base text-mist ring-1 ring-paper/15 ring-inset">Agotado</span>
  return url ? <ButtonLink href={url}>Reservar entradas</ButtonLink> : null
}

export function TextLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group inline-flex items-center gap-2 text-lg text-paper underline decoration-crimson decoration-2 underline-offset-8 hover:text-ember">
      {children}
      <ArrowRight size={20} aria-hidden className="transition-transform duration-300 ease-stage group-hover:translate-x-1" />
    </Link>
  )
}
