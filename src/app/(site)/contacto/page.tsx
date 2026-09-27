import type { Metadata } from 'next'
import { Copy, EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react/ssr'
import { CopyEmail } from '@/components/CopyEmail'
import { Photo } from '@/components/Photo'
import { mapsHref, newTabProps } from '@/components/nav'
import { ButtonLink, container, PageTitle } from '@/components/ui'
import { getHome, getSettings, telHref } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Contacto',
  description: 'Dirección, teléfono y email de Tadrón Teatro, sala independiente en Palermo, Buenos Aires. Cómo llegar a la sala.',
  alternates: { canonical: '/contacto' },
}

const linkClass =
  'mt-1 block text-xl [overflow-wrap:anywhere] md:text-2xl underline decoration-paper/25 underline-offset-8 transition-colors hover:text-ember hover:decoration-ember'

export default async function Contacto() {
  const [settings, home] = await Promise.all([getSettings(), getHome()])
  const { address, phone, email, mapEmbedUrl } = settings
  // "Foto de la fachada" from Ajustes del sitio, else the home page's first photo (currently the façade)
  const facade = settings.facade ?? home.sections?.flatMap((s) => (s._type === 'textWithImage' && s.image ? [s.image] : []))[0]
  const items = [
    address && { Icon: MapPin, label: 'Dirección', value: address, href: mapsHref(address) },
    phone && { Icon: Phone, label: 'Teléfono', value: phone, href: telHref(phone) },
    email && { Icon: EnvelopeSimple, label: 'Email', value: email, href: `mailto:${email}` },
  ].filter((i) => !!i)

  return (
    <>
      <PageTitle title="Contacto" intro="Escribinos, llamanos o vení a conocer la sala." />

      <div className={`${container} grid gap-12 pb-16 md:grid-cols-12 md:gap-14 md:pb-28`}>
        <div className="min-w-0 md:col-span-5">
          <ul className="grid gap-8 md:gap-10">
            {items.map(({ Icon, label, value, href }) => (
              <li key={label} className="reveal flex gap-4 md:gap-5">
                <span className="grid size-12 shrink-0 place-items-center rounded-full bg-ink-3 text-ember md:size-14">
                  <Icon size={24} aria-hidden />
                </span>
                {/* min-w-0 lets long values (the email) wrap instead of widening the page */}
                <div className="min-w-0">
                  <p className="text-base text-mist">{label}</p>
                  {href.startsWith('mailto:') ? (
                    <CopyEmail email={value} className={linkClass}>
                      {value}
                      <Copy size={20} aria-hidden className="ml-2 inline-block align-[-0.1em] text-mist" />
                      <span className="sr-only"> (copiar)</span>
                    </CopyEmail>
                  ) : (
                    <a href={href} {...newTabProps(href)} className={linkClass}>
                      {value}
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-10 max-w-[42ch] text-lg leading-relaxed text-mist">
            Para reservar entradas usá el botón «Reservar entradas» de cada obra en la cartelera.
          </p>
        </div>

        {/* The building people will look for, with the way there */}
        {facade && (
          <figure className="reveal md:col-span-7">
            <div className="relative aspect-[4/3] overflow-hidden">
              <Photo image={facade} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
            {address && (
              <figcaption className="mt-5 flex flex-wrap items-center justify-between gap-4">
                <span className="text-lg text-mist">{address}</span>
                <ButtonLink href={mapsHref(address)}>Cómo llegar</ButtonLink>
              </figcaption>
            )}
          </figure>
        )}

        {mapEmbedUrl && (
          <div className="reveal relative aspect-[4/3] md:col-span-12 md:aspect-[21/9]">
            <iframe
              src={mapEmbedUrl}
              title={`Mapa: ${address ?? 'Tadrón Teatro'}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full"
            />
          </div>
        )}
      </div>
    </>
  )
}
