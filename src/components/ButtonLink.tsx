import Link from 'next/link'
import { ArrowRight, ArrowUpRight } from '@phosphor-icons/react/ssr'
import { newTabProps } from './nav'

type ButtonProps = { href: string; children: React.ReactNode; variant?: 'primary' | 'outline' }

/** Pill button. External links (tickets, mail, phone) get the diagonal arrow and open safely. */
export function ButtonLink({ href, children, variant = 'primary' }: ButtonProps) {
  const external = /^(https?:|mailto:|tel:)/.test(href)
  const newTab = 'target' in newTabProps(href)
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
    <a href={href} className={className} {...newTabProps(href)}>
      {inner}
    </a>
  ) : (
    <Link href={href} className={className}>
      {inner}
    </Link>
  )
}

