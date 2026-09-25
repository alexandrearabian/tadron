import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import { Photo } from '@/components/Photo'
import { container, display, Rich, TicketAction } from '@/components/ui'
import { formatDay, formatTime, getProduction, upcoming } from '@/lib/content'

export async function generateMetadata({ params }: PageProps<'/espectaculos/[slug]'>): Promise<Metadata> {
  const production = await getProduction((await params).slug)
  return { title: production?.title }
}

export default async function Obra({ params }: PageProps<'/espectaculos/[slug]'>) {
  const production = await getProduction((await params).slug)
  if (!production) notFound()
  const dates = upcoming([production])
  const credits = production.credits?.filter((c) => c.role && c.name) ?? []

  return (
    <article className={`${container} pt-28 pb-24 md:pt-32 md:pb-32`}>
      <Link href="/espectaculos" className="inline-flex min-h-12 items-center gap-2 text-lg text-mist transition-colors hover:text-paper">
        <ArrowLeft size={20} aria-hidden />
        Volver a la cartelera
      </Link>

      <div className="mt-8 grid gap-12 md:grid-cols-12 md:gap-16">
        <div className="md:col-span-5">
          <div className="fade-in relative aspect-[2/3] md:sticky md:top-28">
            <Photo image={production.poster} fill priority sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
          </div>
        </div>

        <div className="md:col-span-7">
          <h1 className={`${display} rise text-5xl leading-[0.98] md:text-7xl`}>{production.title}</h1>
          <p className="rise mt-5 text-xl text-mist" style={{ '--d': 1 } as React.CSSProperties}>
            {[production.author && `De ${production.author}`, production.director && `Dirección de ${production.director}`]
              .filter(Boolean)
              .join('. ')}
          </p>
          {production.announcement && <p className="mt-4 text-xl text-ember">{production.announcement}</p>}

          <div className="mt-12">
            <Rich value={production.synopsis} />
          </div>

          <section aria-labelledby="funciones" className="mt-16">
            <h2 id="funciones" className={`${display} mb-6 text-4xl`}>
              Funciones
            </h2>
            {dates.length === 0 ? (
              <div className="grid justify-items-start gap-6">
                <p className="text-lg text-mist">Todavía no publicamos las fechas de las funciones.</p>
                <TicketAction url={production.ticketUrl} />
              </div>
            ) : (
              <ul className="divide-y divide-paper/10 border-y border-paper/10">
                {dates.map((d) => (
                  <li key={d.dateTime} className="flex flex-wrap items-center justify-between gap-4 py-5">
                    <time dateTime={d.dateTime} className="text-xl">
                      <span className="inline-block first-letter:uppercase">{formatDay(d.dateTime)}</span>
                      <span className="text-mist">, {formatTime(d.dateTime)}</span>
                    </time>
                    <TicketAction url={production.ticketUrl} soldOut={d.soldOut} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {credits.length > 0 && (
            <section aria-labelledby="ficha" className="mt-16">
              <h2 id="ficha" className={`${display} mb-6 text-4xl`}>
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
        <section aria-label="Fotos" className="mt-24 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
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
