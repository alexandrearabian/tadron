import Link from 'next/link'
import { ViewTransition } from 'react'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import { HeroCarousel, type Slide } from '@/components/HeroCarousel'
import { Photo } from '@/components/Photo'
import { Sections } from '@/components/Sections'
import { ButtonLink, container, display, TextLink } from '@/components/ui'
import { WeekAgenda, type AgendaDay } from '@/components/WeekAgenda'
import {
  byline,
  courseDays,
  dateParts,
  dayKey,
  formatClock,
  formatDay,
  formatTime,
  getCourses,
  getHome,
  getProductions,
  nextDays,
  onStage,
  stampFor,
  upcoming,
} from '@/lib/content'
import type { Production } from '@/lib/content'
import type { Metadata } from 'next'

export const metadata: Metadata = { alternates: { canonical: '/' } }

export default async function Home() {
  const [all, courses, home] = await Promise.all([getProductions(), getCourses(), getHome()])
  const productions = onStage(all)
  const agenda = upcoming(productions)

  // Hero: every show you can book right now; if none, the next one on stage
  const bookable = productions.filter((p) => p.ticketUrl && upcoming([p]).some((d) => !d.soldOut))
  const slides: Slide[] = (bookable.length ? bookable : productions.slice(0, 1)).map((p) => ({
    id: p.slug,
    title: p.title,
    image: p.gallery?.[0] ?? p.poster,
    poster: p.poster,
    content: <HeroText production={p} next={upcoming([p]).find((d) => !d.soldOut)?.dateTime} />,
  }))

  // "Esta semana en Tadrón": today and the next six days
  const week: AgendaDay[] = nextDays(7).map((key, i) => {
    const { day, month, weekday } = dateParts(key)
    return {
      key,
      label: i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : weekday,
      day,
      month,
      performances: agenda
        .filter((a) => dayKey(a.dateTime) === key)
        .map(({ production: p, dateTime, soldOut }) => ({
          id: p.slug + dateTime,
          clock: formatClock(dateTime),
          when: `${formatDay(dateTime)}, ${formatTime(dateTime)}`,
          title: p.title,
          byline: byline(p),
          slug: p.slug,
          poster: p.poster,
          ticketUrl: p.ticketUrl,
          soldOut: !!soldOut,
        })),
    }
  })

  return (
    <>
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      <section aria-labelledby="agenda" className={`${container} py-16 md:py-28`}>
        <div className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 md:mb-12">
          <h2 id="agenda" className={`${display} text-display-2`}>
            Esta semana en Tadrón
          </h2>
          <TextLink href="/espectaculos">Ver toda la cartelera</TextLink>
        </div>
        <WeekAgenda days={week} />
      </section>

      {productions.length > 1 && (
        <section aria-labelledby="en-cartel" className="bg-ink-2 py-16 md:py-28">
          <div className={container}>
            <h2 id="en-cartel" className={`${display} mb-8 text-display-2 md:mb-12`}>
              En cartel
            </h2>
          </div>
          {/* Swipeable row on phones, grid on larger screens */}
          <ul className="mx-auto flex w-full max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:px-8">
            {productions.map((p) => {
              const stamp = stampFor(p)
              return (
                <li key={p.slug} className="reveal w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
                  <Link href={`/espectaculos/${p.slug}`} className="group block">
                    {/* same name as the show page's poster, so it morphs into it */}
                    <ViewTransition name={`poster-${p.slug}`} share="morph" default="none">
                      <div className="relative aspect-[2/3] overflow-hidden">
                        <Photo
                          image={p.poster}
                          fill
                          sizes="(min-width: 768px) 25vw, 70vw"
                          className="object-cover transition duration-700 ease-stage group-hover:scale-[1.03]"
                        />
                      </div>
                    </ViewTransition>
                    {stamp && <span className="stamp mt-4">{stamp}</span>}
                    <h3 className={`${display} mt-4 text-display-3 transition-colors group-hover:text-ember`}>{p.title}</h3>
                    {p.author && <p className="mt-1 text-base text-mist">{p.author}</p>}
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <Sections sections={home.sections} />

      {courses.length > 0 && (
        <section aria-labelledby="cursos" className={`${container} grid gap-10 py-16 md:grid-cols-12 md:gap-12 md:py-28`}>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-32">
              <h2 id="cursos" className={`${display} text-display-2`}>
                Cursos y talleres
              </h2>
              <p className="mt-5 max-w-[40ch] text-lg leading-relaxed text-mist md:text-xl">
                Escuela de improvisación y un proyecto teatral anual. Con o sin experiencia.
              </p>
              <div className="mt-8">
                <ButtonLink href="/cursosytalleres" variant="outline">
                  Ver cursos y talleres
                </ButtonLink>
              </div>
            </div>
          </div>
          <ul className="grid gap-3 md:col-span-7">
            {courses.map((c) => (
              <li key={c.slug} className="reveal">
                <Link
                  href={`/cursosytalleres/${c.slug}`}
                  className="group flex items-center gap-5 bg-ink-2 p-3 pr-5 transition-colors hover:bg-ink-3 md:pr-6"
                >
                  {c.image && (
                    <div className="relative aspect-square w-20 shrink-0 overflow-hidden sm:w-32">
                      <Photo image={{ ...c.image, alt: '' }} fill sizes="8rem" className="object-cover" />
                    </div>
                  )}
                  <div className={`min-w-0 flex-1 ${c.image ? '' : 'py-3 pl-3'}`}>
                    <h3 className={`${display} text-display-3`}>{c.title}</h3>
                    <p className="mt-1 text-base text-mist">{courseDays(c)}</p>
                  </div>
                  <ArrowRight
                    size={24}
                    aria-hidden
                    className="shrink-0 text-mist transition duration-300 ease-stage group-hover:translate-x-1 group-hover:text-ember"
                  />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </>
  )
}

function HeroText({ production, next }: { production: Production; next?: string }) {
  const credits = byline(production)
  return (
    <>
      {next && (
        <p className="rise mb-5 text-lg text-paper/85 md:text-xl">
          Próxima función: {formatDay(next)}, {formatTime(next)}
        </p>
      )}
      <h1 className={`${display} rise text-display-1 uppercase`} style={{ '--d': 1 } as React.CSSProperties}>
        {production.title}
      </h1>
      {credits && (
        <p className="rise mt-5 max-w-[45ch] text-lg text-paper/85 md:text-xl" style={{ '--d': 2 } as React.CSSProperties}>
          {credits}
        </p>
      )}
      <div className="rise mt-8 flex flex-wrap gap-3 md:mt-10 md:gap-4" style={{ '--d': 3 } as React.CSSProperties}>
        {production.ticketUrl && <ButtonLink href={production.ticketUrl}>Reservar entradas</ButtonLink>}
        <ButtonLink href={`/espectaculos/${production.slug}`} variant="outline">
          Ver la obra
        </ButtonLink>
      </div>
    </>
  )
}
