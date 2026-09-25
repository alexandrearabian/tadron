import type { Metadata } from 'next'
import { EnvelopeSimple, MapPin, Phone } from '@phosphor-icons/react/ssr'
import { mapsHref } from '@/components/nav'
import { ButtonLink, container, PageTitle } from '@/components/ui'
import { getSettings, telHref } from '@/lib/content'

export const metadata: Metadata = { title: 'Contacto' }

export default async function Contacto() {
  const { address, phone, email, mapEmbedUrl } = await getSettings()
  const items = [
    address && { Icon: MapPin, label: 'Dirección', value: address, href: mapsHref(address) },
    phone && { Icon: Phone, label: 'Teléfono', value: phone, href: telHref(phone) },
    email && { Icon: EnvelopeSimple, label: 'Email', value: email, href: `mailto:${email}` },
  ].filter((i) => !!i)

  return (
    <>
      <PageTitle title="Contacto" intro="Escribinos, llamanos o vení a conocer la sala." />

      <div className={`${container} grid gap-14 pb-24 md:grid-cols-12 md:pb-32`}>
        <div className="md:col-span-5">
          <ul className="grid gap-10">
            {items.map(({ Icon, label, value, href }) => (
              <li key={label} className="reveal flex gap-5">
                <span className="grid size-14 shrink-0 place-items-center rounded-full bg-ink-3 text-ember">
                  <Icon size={26} aria-hidden />
                </span>
                <div>
                  <p className="text-base text-mist">{label}</p>
                  <a
                    href={href}
                    {...(href.startsWith('http') && { target: '_blank', rel: 'noopener noreferrer' })}
                    className="mt-1 block text-2xl break-words underline decoration-paper/25 underline-offset-8 transition-colors hover:text-ember hover:decoration-ember"
                  >
                    {value}
                  </a>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-12 max-w-[42ch] text-lg leading-relaxed text-mist">
            Para reservar entradas usá el botón «Reservar entradas» de cada obra en la cartelera.
          </p>
          {address && (
            <div className="mt-10">
              <ButtonLink href={mapsHref(address)} variant="outline">
                Cómo llegar
              </ButtonLink>
            </div>
          )}
        </div>

        {mapEmbedUrl && (
          <div className="reveal relative aspect-[4/3] md:col-span-7">
            <iframe
              src={mapEmbedUrl}
              title={`Mapa: ${address ?? 'Tadrón Teatro'}`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 size-full grayscale-[0.6] transition duration-500 hover:grayscale-0"
            />
          </div>
        )}
      </div>
    </>
  )
}
