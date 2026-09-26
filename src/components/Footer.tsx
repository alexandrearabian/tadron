import Link from 'next/link'
import { FacebookLogo, InstagramLogo, YoutubeLogo } from '@phosphor-icons/react/ssr'
import type { Settings } from '@/lib/content'
import { telHref } from '@/lib/content'
import { CopyEmail } from './CopyEmail'
import { container } from './ui'
import { contactNav, mapsHref, programNav, theatreNav } from './nav'

export function Footer({ settings }: { settings: Settings }) {
  const { address, phone, email } = settings
  const socials = [
    { href: settings.instagram, label: 'Instagram', Icon: InstagramLogo },
    { href: settings.facebook, label: 'Facebook', Icon: FacebookLogo },
    { href: settings.youtube, label: 'YouTube', Icon: YoutubeLogo },
  ].filter((s) => s.href)
  const link = 'transition-colors hover:text-paper'

  return (
    <footer className="mt-auto bg-ink-2">
      {/* The red bar from Tadrón's flyers; the years count themselves from 1996 */}
      <p className="font-brand bg-crimson px-5 py-3 text-center text-lg font-bold tracking-wide text-paper uppercase md:text-xl">
        {new Date().getFullYear() - 1996} años haciendo Tadrón
      </p>
      <div className={`${container} grid gap-12 py-14 md:grid-cols-12 md:gap-14 md:py-20`}>
        <div className="md:col-span-5">
          {/* The flyer lockup: TADRÓN / significa / TEATRO */}
          <p className="font-brand inline-grid justify-items-center leading-none" aria-label="Tadrón significa teatro">
            <span aria-hidden className="text-6xl font-bold tracking-wide">TADRÓN</span>
            <span aria-hidden className="my-1 w-full bg-crimson py-0.5 text-center text-sm tracking-[0.3em] uppercase">significa</span>
            <span aria-hidden className="text-5xl tracking-[0.12em]">TEATRO</span>
          </p>
          <address className="mt-8 grid gap-2 text-lg not-italic text-mist">
            {address && (
              <a href={mapsHref(address)} target="_blank" rel="noopener noreferrer" className={link}>
                {address}
              </a>
            )}
            {phone && (
              <a href={telHref(phone)} className={link}>
                Tel. {phone}
              </a>
            )}
            {email && (
              <CopyEmail email={email} className={`text-left [overflow-wrap:anywhere] ${link}`} />
            )}
          </address>
        </div>

        <nav aria-label="Pie de página" className="grid grid-cols-1 gap-10 sm:grid-cols-2 md:col-span-4">
          <ul className="grid content-start gap-3 text-lg text-mist">
            {[...programNav, contactNav].map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <ul className="grid content-start gap-3 text-lg text-mist">
            {theatreNav.map(({ href, label }) => (
              <li key={href}>
                <Link href={href} className={link}>
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {socials.length > 0 && (
          <ul className="grid content-start gap-3 text-lg text-mist md:col-span-3">
            {socials.map(({ href, label, Icon }) => (
              <li key={label}>
                <a href={href!} target="_blank" rel="noopener noreferrer" className={`inline-flex items-center gap-3 ${link}`}>
                  <Icon size={24} aria-hidden />
                  {label}
                </a>
              </li>
            ))}
          </ul>
        )}
      </div>
      <div className={`${container} border-t border-paper/10 py-6 text-base text-mist`}>
        © {new Date().getFullYear()} Tadrón Teatro
      </div>
    </footer>
  )
}
