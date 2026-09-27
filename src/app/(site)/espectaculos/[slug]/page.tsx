import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import { Photo } from '@/components/Photo'
import { ButtonLink, container, display, Rich } from '@/components/ui'
import { ViewTransition } from 'react'
import { DateStub } from '@/components/stubs'
import { JsonLd } from '@/components/JsonLd'
import { byline, describe, formatClock, getProduction, getSettings, shareImage, stampFor, upcoming } from '@/lib/content'
import { showEvents } from '@/lib/schema'

export async function generateMetadata({ params }: PageProps<'/espectaculos/[slug]'>): Promise<Metadata> {
  const production = await getProduction((await params).slug)
  if (!production) return {}
  const credits = byline(production)
  return {
    title: production.title,
    description: describe(production.synopsis) ?? (credits ? `${production.title}. ${credits}. En Tadrón Teatro, Palermo.` : undefined),
    alternates: { canonical: `/espectaculos/${production.slug}` },
    openGraph: {
      siteName: 'Tadrón Teatro',
      title: production.title,
      images: [shareImage((production.gallery?.[0] ?? production.poster).url)],
    },
  }
}

export default async function Obra({ params }: PageProps<'/espectaculos/[slug]'>) {
  const [production, settings] = await Promise.all([getProduction((await params).slug), getSettings()])
  if (!production) notFound()
  const events = showEvents(production, settings)
  const dates = upcoming([production])
  const credits = production.credits?.filter((c) => c.role && c.name) ?? []
  const stamp = stampFor(production)
  const bookable = production.ticketUrl && (!dates.length || dates.some((d) => !d.soldOut))

  return (
    <article className={`${container} pt-24 pb-16 md:pt-32 md:pb-28`}>
      {events.length > 0 && <JsonLd data={events} />}
      <Link href="/espectaculos" className="inline-flex min-h-12 items-center gap-2 text-lg text-mist transition-colors hover:text-paper">
        <ArrowLeft size={20} aria-hidden />
        Volver a la cartelera
      </Link>

      <div className="mt-6 grid gap-10 md:mt-8 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <ViewTransition name={`poster-${production.slug}`} share="morph" default="none">
            <div className="relative mx-auto aspect-[2/3] max-w-sm md:sticky md:top-28 md:max-w-none">
              <Photo image={production.poster} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
            </div>
          </ViewTransition>
        </div>

        <div className="md:col-span-7">
          {stamp && <span className="stamp mb-5">{stamp}</span>}
          <h1 className={`${display} rise text-display-1`}>{production.title}</h1>
          <p className="rise mt-4 text-lg text-mist md:text-xl" style={{ '--d': 1 } as React.CSSProperties}>
            {byline(production)}
          </p>

          <div className="mt-10">
            <Rich value={production.synopsis} />
          </div>

          <section aria-labelledby="funciones" className="mt-14">
            <h2 id="funciones" className={`${display} mb-5 text-display-3`}>
              Funciones
            </h2>
            {dates.length === 0 ? (
              <p className="text-lg text-mist">Todavía no publicamos las fechas de las funciones.</p>
            ) : (
              <ul className="flex flex-wrap gap-2.5">
                {dates.map((d) => (
                  <li key={d.dateTime}>
                    <time dateTime={d.dateTime}>
                      <DateStub iso={d.dateTime} time={formatClock(d.dateTime)} soldOut={d.soldOut} />
                    </time>
                  </li>
                ))}
              </ul>
            )}
            {bookable && (
              <div className="mt-8">
                <ButtonLink href={production.ticketUrl!}>Reservar entradas</ButtonLink>
              </div>
            )}
          </section>

          {credits.length > 0 && (
            <section aria-labelledby="ficha" className="mt-14">
              <h2 id="ficha" className={`${display} mb-5 text-display-3`}>
                Ficha técnica
              </h2>
              <dl className="grid gap-x-10 gap-y-5 sm:grid-cols-2">
                {credits.map((c, i) => (
                  <div key={i}>
                    <dt className="text-base text-mist">{c.role}</dt>
                    <dd className="mt-1 text-lg">{c.name}</dd>
                  </div>
                ))}
              </dl>
            </section>
          )}
        </div>
      </div>

      {!!production.gallery?.length && (
        <section aria-label="Fotos" className="mt-16 grid md:mt-24 grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {production.gallery.map((image) => (
            <div key={image.url} className="reveal relative aspect-[3/2]">
              <Photo image={image} fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover" />
            </div>
          ))}
        </section>
      )}
    </article>
  )
}
