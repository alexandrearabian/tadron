'use client'

import Link from 'next/link'
import { useState } from 'react'
import { ButtonLink } from './ButtonLink'
import { Photo } from './Photo'

type Img = { url: string; alt: string; lqip?: string | null }
export type AgendaPerformance = {
  id: string
  clock: string // "21:00"
  when: string // "sábado 26 de septiembre, 21:00 h"
  title: string
  byline: string
  slug: string
  poster: Img
  ticketUrl?: string | null
  soldOut: boolean
}
export type AgendaDay = { key: string; label: string; day: string; month: string; performances: AgendaPerformance[] }

/**
 * "Esta semana en Tadrón": pick a day (ticket stubs), pick a performance, one booking button.
 * Starts on the first day that has performances.
 */
export function WeekAgenda({ days }: { days: AgendaDay[] }) {
  const first = Math.max(0, days.findIndex((d) => d.performances.length))
  const [dayIndex, setDayIndex] = useState(first)
  const [picked, setPicked] = useState(days[first]?.performances[0]?.id)
  const day = days[dayIndex]
  const performance = day.performances.find((p) => p.id === picked) ?? day.performances[0]

  const pickDay = (i: number) => {
    setDayIndex(i)
    setPicked(days[i].performances[0]?.id)
  }

  return (
    <div>
      {/* Swipeable row on phones, seven columns from tablet up */}
      <div role="tablist" aria-label="Días de la semana" className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-7 md:gap-3 md:overflow-visible md:px-0">
        {days.map((d, i) => {
          const selected = i === dayIndex
          const count = d.performances.length
          return (
            <button
              key={d.key}
              type="button"
              role="tab"
              aria-selected={selected}
              aria-controls="agenda-dia"
              onClick={() => pickDay(i)}
              className={`stub grid w-[4.75rem] shrink-0 snap-start place-items-center px-2 pt-3 pb-2.5 text-center leading-none transition-colors duration-300 ease-stage md:w-auto ${
                selected ? 'bg-crimson text-paper' : count ? 'bg-ink-3 hover:bg-[#2c2424]' : 'bg-ink-2 text-mist'
              }`}
            >
              <span className="text-xs font-medium tracking-[0.15em] uppercase">{d.label}</span>
              <span className="font-brand my-1.5 text-4xl font-bold tabular-nums">{d.day}</span>
              <span className="text-xs tracking-[0.15em] uppercase">{d.month}</span>
              <span className={`mt-2 w-full border-t border-dashed pt-2 text-xs ${selected ? 'border-paper/40' : 'border-paper/20'}`}>
                {count ? `${count} ${count === 1 ? 'función' : 'funciones'}` : 'Sin funciones'}
              </span>
            </button>
          )
        })}
      </div>

      <div id="agenda-dia" role="tabpanel" aria-label={day.label} className="mt-8">
        {!performance ? (
          <p className="max-w-[50ch] text-lg text-mist">No hay funciones este día. Elegí otro día o mirá la cartelera completa.</p>
        ) : (
          <div className="grid gap-6 lg:grid-cols-12 lg:gap-10">
            <ul role="radiogroup" aria-label="Funciones del día" className="grid content-start gap-3 lg:col-span-7">
              {day.performances.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    role="radio"
                    aria-checked={p.id === performance.id}
                    onClick={() => setPicked(p.id)}
                    className="grid w-full grid-cols-[3.5rem_1fr_auto] items-center gap-4 bg-ink-2 p-3 pr-5 text-left ring-1 ring-transparent ring-inset transition duration-300 ease-stage hover:bg-ink-3 aria-checked:bg-ink-3 aria-checked:ring-crimson sm:grid-cols-[4rem_1fr_auto]"
                  >
                    <span className="relative aspect-[2/3] overflow-hidden bg-ink-3">
                      <Photo image={{ ...p.poster, alt: '' }} fill sizes="4rem" className="object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="block font-display text-2xl leading-tight font-semibold">{p.title}</span>
                      {p.byline && <span className="mt-0.5 block truncate text-base text-mist">{p.byline}</span>}
                    </span>
                    <span className="font-brand text-2xl font-bold tabular-nums">{p.clock}</span>
                  </button>
                </li>
              ))}
            </ul>

            {/* The one booking button, for the performance picked on the left */}
            <aside aria-live="polite" className="self-start bg-ink-2 p-6 md:p-8 lg:sticky lg:top-28 lg:col-span-5">
              <p className="text-base text-mist">Función elegida</p>
              <p className="mt-2 font-display text-display-3 font-semibold">{performance.title}</p>
              <p className="mt-2 text-lg first-letter:uppercase">{performance.when}</p>
              <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-4">
                {performance.soldOut ? (
                  <span className="stamp">Agotado</span>
                ) : (
                  performance.ticketUrl && <ButtonLink href={performance.ticketUrl}>Reservar entradas</ButtonLink>
                )}
                <Link href={`/espectaculos/${performance.slug}`} className="text-lg underline decoration-paper/30 underline-offset-8 hover:text-ember">
                  Ver la obra
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
