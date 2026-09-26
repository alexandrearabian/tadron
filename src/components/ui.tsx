import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import { PortableText, type PortableTextBlock, type PortableTextComponents } from 'next-sanity'
import { CopyEmail } from './CopyEmail'
import { ButtonLink } from './ButtonLink'
import { newTabProps } from './nav'

export { ButtonLink }

export const container = 'mx-auto w-full max-w-7xl px-5 md:px-8'
export const display = 'font-display font-semibold tracking-tight'

const richComponents: PortableTextComponents = {
  marks: {
    link: ({ value, children }) =>
      value?.href?.startsWith('mailto:') ? (
        <CopyEmail email={value.href.slice(7).split('?')[0]}>{children}</CopyEmail>
      ) : (
        <a href={value?.href} {...newTabProps(value?.href ?? '')}>
          {children}
        </a>
      ),
  },
}

export function Rich({ value }: { value?: PortableTextBlock[] | null }) {
  if (!value?.length) return null
  return (
    <div className="prose-stage">
      <PortableText value={value} components={richComponents} />
    </div>
  )
}

/** Title block for listing pages (Cartelera, Cursos, Contacto). */
export function PageTitle({ title, intro }: { title: string; intro: string }) {
  return (
    <header className={`${container} pt-28 pb-10 md:pt-40 md:pb-16`}>
      <h1 className={`${display} rise text-display-1`}>{title}</h1>
      <p className="rise mt-5 max-w-[48ch] text-lg text-mist md:text-xl" style={{ '--d': 1 } as React.CSSProperties}>
        {intro}
      </p>
    </header>
  )
}

export function TicketAction({ url, soldOut }: { url?: string | null; soldOut?: boolean | null }) {
  if (soldOut) return <span className="stamp">Agotado</span>
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
