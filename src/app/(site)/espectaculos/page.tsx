import type { Metadata } from 'next'
import Link from 'next/link'
import { Photo } from '@/components/Photo'
import { ButtonLink, container, display, PageTitle } from '@/components/ui'
import { ViewTransition } from 'react'
import { DateStub } from '@/components/stubs'
import { byline, formatClock, getProductions, onStage, stampFor, upcoming } from '@/lib/content'

export const metadata: Metadata = { title: 'Cartelera' }

export default async function Cartelera() {
  const productions = onStage(await getProductions())

  return (
    <>
      <PageTitle title="Cartelera" intro="Todas las obras en cartel y sus próximas funciones." />

      {productions.length === 0 ? (
        <p className={`${container} pb-32 text-xl text-mist`}>Por ahora no hay obras en cartel. Muy pronto anunciamos los próximos estrenos.</p>
      ) : (
        <div className={`${container} pb-16 md:pb-28`}>
          {productions.map((p) => {
            const dates = upcoming([p])
            const stamp = stampFor(p)
            return (
              <article key={p.slug} className="reveal grid gap-6 border-t border-paper/10 py-10 sm:grid-cols-[12rem_1fr] sm:gap-8 md:grid-cols-12 md:gap-12 md:py-14">
                <Link href={`/espectaculos/${p.slug}`} className="group block w-40 sm:w-auto md:col-span-4 lg:col-span-3">
                  <ViewTransition name={`poster-${p.slug}`} share="morph" default="none">
                    <div className="relative aspect-[2/3] overflow-hidden">
                      <Photo
                        image={p.poster}
                        fill
                        sizes="(min-width: 768px) 30vw, 12rem"
                        className="object-cover transition duration-700 ease-stage group-hover:scale-[1.03]"
                      />
                    </div>
                  </ViewTransition>
                </Link>
                <div className="min-w-0 md:col-span-8 lg:col-span-8 lg:col-start-5">
                  {stamp && <span className="stamp mb-4">{stamp}</span>}
                  <h2 className={`${display} text-display-2`}>
                    <Link href={`/espectaculos/${p.slug}`} className="transition-colors hover:text-ember">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-3 text-lg text-mist md:text-xl">{byline(p)}</p>

                  {dates.length > 0 && (
                    <ul className="mt-8 flex flex-wrap gap-2.5" aria-label="Próximas funciones">
                      {dates.slice(0, 5).map((d) => (
                        <li key={d.dateTime}>
                          <time dateTime={d.dateTime}>
                            <DateStub iso={d.dateTime} time={formatClock(d.dateTime)} soldOut={d.soldOut} />
                          </time>
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-8 flex flex-wrap gap-3 md:gap-4">
                    {p.ticketUrl && (!dates.length || dates.some((d) => !d.soldOut)) && <ButtonLink href={p.ticketUrl}>Reservar entradas</ButtonLink>}
                    <ButtonLink href={`/espectaculos/${p.slug}`} variant="outline">
                      Ver la obra
                    </ButtonLink>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}
    </>
  )
}
