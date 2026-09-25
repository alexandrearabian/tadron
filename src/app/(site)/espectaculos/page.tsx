import type { Metadata } from 'next'
import Link from 'next/link'
import { Photo } from '@/components/Photo'
import { ButtonLink, container, display, PageTitle } from '@/components/ui'
import { formatDay, formatTime, getProductions, onStage, upcoming } from '@/lib/content'

export const metadata: Metadata = { title: 'Cartelera' }

export default async function Cartelera() {
  const productions = onStage(await getProductions())

  return (
    <>
      <PageTitle title="Cartelera" intro="Todas las obras en cartel y sus próximas funciones." />

      {productions.length === 0 ? (
        <p className={`${container} pb-32 text-xl text-mist`}>Por ahora no hay obras en cartel. Muy pronto anunciamos los próximos estrenos.</p>
      ) : (
        <div className={`${container} pb-24 md:pb-32`}>
          {productions.map((p) => {
            const dates = upcoming([p])
            return (
              <article key={p.slug} className="reveal grid gap-8 border-t border-paper/10 py-12 md:grid-cols-12 md:gap-12 md:py-16">
                <Link href={`/espectaculos/${p.slug}`} className="group relative block aspect-[2/3] overflow-hidden md:col-span-4 lg:col-span-3">
                  <Photo
                    image={p.poster}
                    fill
                    sizes="(min-width: 768px) 30vw, 100vw"
                    className="object-cover transition duration-700 ease-stage group-hover:scale-[1.03]"
                  />
                </Link>
                <div className="md:col-span-8 lg:col-span-8 lg:col-start-5">
                  <h2 className={`${display} text-4xl leading-[1.05] md:text-6xl`}>
                    <Link href={`/espectaculos/${p.slug}`} className="transition-colors hover:text-ember">
                      {p.title}
                    </Link>
                  </h2>
                  <p className="mt-4 text-xl text-mist">
                    {[p.author && `De ${p.author}`, p.director && `Dirección de ${p.director}`].filter(Boolean).join('. ')}
                  </p>

                  {p.announcement && <p className="mt-6 text-xl text-ember">{p.announcement}</p>}

                  <h3 className="mt-10 mb-4 text-lg font-medium">Próximas funciones</h3>
                  {dates.length === 0 ? (
                    <p className="text-lg text-mist">Sin funciones programadas por ahora.</p>
                  ) : (
                    <ul className="flex flex-wrap gap-3">
                      {dates.slice(0, 4).map((d) => (
                        <li
                          key={d.dateTime}
                          className={`rounded-full px-5 py-2.5 text-base ring-1 ring-inset ${d.soldOut ? 'text-mist ring-paper/10' : 'ring-paper/25'}`}
                        >
                          <span className="inline-block first-letter:uppercase">{formatDay(d.dateTime)}</span>, {formatTime(d.dateTime)}
                          {d.soldOut && <span className="ml-2 text-ember">Agotado</span>}
                        </li>
                      ))}
                    </ul>
                  )}

                  <div className="mt-10 flex flex-wrap gap-4">
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
