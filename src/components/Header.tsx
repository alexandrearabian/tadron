'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useRef } from 'react'
import { contactNav, programNav, theatreNav } from './nav'

// Same size and spot in the bar and inside the menu, so opening swaps them seamlessly.
// Inside the open menu the three lines turn into an × (globals.css, .burger-line).
const iconButton =
  'grid size-12 place-items-center rounded-full ring-1 ring-paper/25 ring-inset transition-[background-color,box-shadow] duration-300 ease-stage hover:bg-paper/5 hover:ring-paper/60'

function MenuIcon() {
  return (
    <span aria-hidden className="relative block h-3.5 w-6">
      <span className="burger-line absolute inset-x-0 top-0 h-0.5 rounded-full bg-current" />
      <span className="burger-line absolute inset-x-0 top-1.5 h-0.5 rounded-full bg-current" />
      <span className="burger-line absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-current" />
    </span>
  )
}

function Wordmark({ onClick }: { onClick?: () => void }) {
  return (
    <Link href="/" onClick={onClick} className="font-display text-[1.75rem] leading-none font-semibold tracking-tight">
      Tadrón <em className="font-medium text-ember">Teatro</em>
    </Link>
  )
}

// Native <dialog> gives focus trapping, Esc to close and inert background for free.
export function Header({ address, phone }: { address?: string | null; phone?: string | null }) {
  const pathname = usePathname()
  const menu = useRef<HTMLDialogElement>(null)
  // Play the fade-out (globals.css, .menu[data-closing]) before actually closing
  const close = async () => {
    const dialog = menu.current
    if (!dialog?.open || 'closing' in dialog.dataset) return
    dialog.dataset.closing = ''
    const mine = document.getAnimations().filter((a) => {
      const target = (a.effect as KeyframeEffect | null)?.target
      return target && (target === dialog || dialog.contains(target))
    })
    await Promise.allSettled(mine.map((a) => a.finished))
    dialog.close()
    delete dialog.dataset.closing
  }
  const current = (href: string) => (pathname === href || pathname.startsWith(`${href}/`) ? 'page' : undefined)

  // Bar links from tablet width up (Contacto once there's room); the full list lives in the menu
  const desktopLinks = [theatreNav[0], ...programNav, contactNav]
  const menuGroups = [
    { title: 'Programación', links: [...programNav, contactNav] },
    { title: 'El teatro', links: theatreNav },
  ]

  return (
    <header className="fixed inset-x-0 top-0 z-30 border-b border-paper/8 bg-ink/75 backdrop-blur-md">
      <div className="mx-auto flex h-18 w-full max-w-7xl items-center justify-between px-5 md:px-8">
        <Wordmark />

        <nav aria-label="Principal" className="flex items-center gap-2">
          <ul className="mr-3 hidden items-center gap-5 md:flex lg:mr-4 lg:gap-7 xl:gap-9">
            {desktopLinks.map(({ href, label }) => (
              <li key={href} className={href === contactNav.href ? 'hidden min-[900px]:block' : undefined}>
                <Link
                  href={href}
                  aria-current={current(href)}
                  className="whitespace-nowrap text-base text-mist lg:text-[1.0625rem] underline-offset-8 transition-colors hover:text-paper aria-[current=page]:text-paper aria-[current=page]:underline aria-[current=page]:decoration-crimson aria-[current=page]:decoration-2"
                >
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <button type="button" aria-haspopup="dialog" aria-label="Abrir menú" onClick={() => menu.current?.showModal()} className={iconButton}>
            <MenuIcon />
          </button>
        </nav>
      </div>

      <dialog
        ref={menu}
        aria-label="Menú"
        onCancel={(e) => {
          e.preventDefault() // Esc: animate out like the Cerrar button
          close()
        }}
        className="menu m-0 h-dvh max-h-none w-full max-w-none bg-ink p-0 text-paper backdrop:bg-transparent"
      >
        <div className="mx-auto flex min-h-full w-full max-w-7xl flex-col px-5 md:px-8">
          <div className="flex h-18 shrink-0 items-center justify-between">
            <Wordmark onClick={close} />
            <button type="button" aria-label="Cerrar menú" onClick={close} className={iconButton}>
              <MenuIcon />
            </button>
          </div>

          <nav aria-label="Todas las secciones" className="grid flex-1 content-center gap-12 py-12 md:grid-cols-2 md:gap-16">
            {menuGroups.map((group) => (
              <div key={group.title}>
                <p className="mb-5 text-base text-mist">{group.title}</p>
                <ul className="grid gap-3">
                  {group.links.map(({ href, label }) => (
                    <li key={href}>
                      <Link
                        href={href}
                        onClick={close}
                        aria-current={current(href)}
                        className="font-display text-4xl leading-tight font-medium transition-colors hover:text-ember aria-[current=page]:text-ember md:text-5xl"
                      >
                        {label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>

          {(address || phone) && (
            <p className="shrink-0 border-t border-paper/10 py-6 text-lg text-mist">
              {address}
              {address && phone && <br className="md:hidden" />}
              {phone && <span className="md:ml-6">Tel. {phone}</span>}
            </p>
          )}
        </div>
      </dialog>
    </header>
  )
}
