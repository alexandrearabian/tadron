import Link from 'next/link'
import { ArrowRight } from '@phosphor-icons/react/ssr'
import { Photo } from '@/components/Photo'
import { HeroCarousel, type Slide } from '@/components/HeroCarousel'
import { Sections } from '@/components/Sections'
import { ButtonLink, container, display, TextLink, TicketAction } from '@/components/ui'
import { courseDays, dateParts, formatDay, formatTime, getCourses, getHome, getProductions, onStage, upcoming } from '@/lib/content'
import type { Production } from '@/lib/content'

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

  return (
    <>
      {slides.length > 0 && <HeroCarousel slides={slides} />}

      <section aria-labelledby="agenda" className={`${container} py-24 md:py-32`}>
        <div className="mb-12 flex flex-wrap items-end justify-between gap-6">
          <h2 id="agenda" className={`${display} text-5xl leading-none md:text-7xl`}>
            Próximas funciones
          </h2>
          <TextLink href="/espectaculos">Ver toda la cartelera</TextLink>
        </div>

        {agenda.length === 0 ? (
          <p className="max-w-[50ch] border-t border-paper/10 pt-8 text-xl text-mist">
            Por ahora no hay funciones programadas. Muy pronto anunciamos los próximos estrenos.
          </p>
        ) : (
          <ol className="divide-y divide-paper/10 border-t border-paper/10">
            {agenda.slice(0, 6).map(({ production, dateTime, soldOut }) => {
              const { day, month, weekday } = dateParts(dateTime)
              return (
                <li
                  key={production.slug + dateTime}
                  className="reveal grid grid-cols-[4.5rem_1fr] items-center gap-x-5 gap-y-4 py-7 md:grid-cols-[6rem_1fr_auto] md:gap-x-10"
                >
                  <time
                    dateTime={dateTime}
                    className="relative isolate grid aspect-[3/4] place-content-center overflow-hidden bg-ink-2 text-center leading-none"
                  >
                    {/* the show's poster, from its tiny preview: blurred, darkened so the date stays readable */}
                    {production.poster.lqip && (
                      <span
                        aria-hidden
                        className="absolute inset-0 -z-10 scale-125 bg-cover bg-center blur-sm brightness-[0.35] saturate-150"
                        style={{ backgroundImage: `url(${production.poster.lqip})` }}
                      />
                    )}
                    <span className="block text-sm text-paper/85 capitalize">{weekday}</span>
                    <span className={`${display} my-1 block text-5xl tabular-nums md:text-6xl`}>{day}</span>
                    <span className="block text-sm text-paper/85">{month}</span>
                  </time>
                  <div>
                    <Link href={`/espectaculos/${production.slug}`} className={`${display} text-3xl leading-tight transition-colors hover:text-ember md:text-4xl`}>
                      {production.title}
                    </Link>
                    <p className="mt-1 text-lg text-mist first-letter:uppercase">
                      {formatDay(dateTime)}, {formatTime(dateTime)}
                    </p>
                  </div>
                  <div className="col-start-2 md:col-start-auto">
                    <TicketAction url={production.ticketUrl} soldOut={soldOut} />
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </section>

      {productions.length > 1 && (
        <section aria-labelledby="en-cartel" className="bg-ink-2 py-24 md:py-32">
          <div className={container}>
            <h2 id="en-cartel" className={`${display} mb-12 text-5xl leading-none md:text-7xl`}>
              En cartel
            </h2>
          </div>
          {/* Swipeable row on phones, grid on larger screens */}
          <ul className="mx-auto flex w-full max-w-7xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4 md:grid md:grid-cols-4 md:gap-8 md:overflow-visible md:px-8">
            {productions.map((p) => (
              <li key={p.slug} className="reveal w-[70%] shrink-0 snap-start sm:w-[42%] md:w-auto">
                <Link href={`/espectaculos/${p.slug}`} className="group block">
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <Photo
                      image={p.poster}
                      fill
                      sizes="(min-width: 768px) 25vw, 70vw"
                      className="object-cover transition duration-700 ease-stage group-hover:scale-[1.03]"
                    />
                  </div>
                  <h3 className={`${display} mt-5 text-2xl leading-tight transition-colors group-hover:text-ember md:text-3xl`}>{p.title}</h3>
                  {p.announcement ? (
                    <p className="mt-1 text-base text-ember">{p.announcement}</p>
                  ) : (
                    p.author && <p className="mt-1 text-base text-mist">{p.author}</p>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <Sections sections={home.sections} />

      {courses.length > 0 && (
        <section aria-labelledby="cursos" className={`${container} grid gap-12 py-24 md:grid-cols-12 md:py-32`}>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-32">
              <h2 id="cursos" className={`${display} text-5xl leading-none md:text-7xl`}>
                Cursos y talleres
              </h2>
              <p className="mt-6 max-w-[40ch] text-xl leading-relaxed text-mist">
                Clases de actuación, dramaturgia y escenografía para adultos y adolescentes. Con o sin experiencia.
              </p>
              <div className="mt-10">
                <ButtonLink href="/cursosytalleres" variant="outline">
                  Ver cursos y talleres
                </ButtonLink>
              </div>
            </div>
          </div>
          <ul className="grid gap-4 md:col-span-7">
            {courses.map((c) => (
              <li key={c.slug} className="reveal">
                <Link
                  href={`/cursosytalleres/${c.slug}`}
                  className="group grid grid-cols-[6rem_1fr] items-center gap-5 bg-ink-2 p-3 pr-6 transition-colors hover:bg-ink-3 sm:grid-cols-[9rem_1fr_auto]"
                >
                  <div className="relative aspect-square overflow-hidden">
                    {c.image && <Photo image={{ ...c.image, alt: '' }} fill sizes="9rem" className="object-cover" />}
                  </div>
                  <div>
                    <h3 className={`${display} text-2xl leading-tight md:text-3xl`}>{c.title}</h3>
                    <p className="mt-1 text-base text-mist">{courseDays(c)}</p>
                  </div>
                  <ArrowRight
                    size={24}
                    aria-hidden
                    className="hidden text-mist transition duration-300 ease-stage group-hover:translate-x-1 group-hover:text-ember sm:block"
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
  return (
    <>
      {next && (
        <p className="rise mb-6 text-lg text-paper/85 md:text-xl">
          Próxima función: {formatDay(next)}, {formatTime(next)}
        </p>
      )}
      <h1 className={`${display} rise text-6xl leading-[0.95] md:text-8xl`} style={{ '--d': 1 } as React.CSSProperties}>
        {production.title}
      </h1>
      <p className="rise mt-6 max-w-[45ch] text-xl text-paper/85" style={{ '--d': 2 } as React.CSSProperties}>
        {[production.author && `De ${production.author}`, production.director && `Dirección de ${production.director}`]
          .filter(Boolean)
          .join('. ')}
      </p>
      <div className="rise mt-10 flex flex-wrap gap-4" style={{ '--d': 3 } as React.CSSProperties}>
        {production.ticketUrl && <ButtonLink href={production.ticketUrl}>Reservar entradas</ButtonLink>}
        <ButtonLink href={`/espectaculos/${production.slug}`} variant="outline">
          Ver la obra
        </ButtonLink>
      </div>
    </>
  )
}
