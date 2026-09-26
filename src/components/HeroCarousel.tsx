'use client'

import { useState } from 'react'
import { CaretLeft, CaretRight, Pause, Play } from '@phosphor-icons/react'
import { Photo } from './Photo'

type Img = { url: string; alt: string }
export type Slide = { id: string; title: string; image: Img; poster: Img; content: React.ReactNode }

const roundButton =
  'grid size-12 place-items-center rounded-full ring-1 ring-paper/30 ring-inset transition duration-300 ease-stage hover:bg-paper/10 hover:ring-paper/60 active:scale-[0.96]'

/**
 * Home hero: one slide per bookable show. Autoplay is the active timer bar's CSS animation
 * (.hero-progress, 4.5s): when it ends we advance. It only stops while someone presses and holds
 * (mouse button or finger) or with the pause button; with reduced motion there is no autoplay at all.
 */
export function HeroCarousel({ slides }: { slides: Slide[] }) {
  const [index, setIndex] = useState(0)
  const [loaded, setLoaded] = useState(() => new Set([0, 1 % slides.length])) // current + next image only
  const [paused, setPaused] = useState(false)
  const [held, setHeld] = useState(false) // mouse button or finger held down on it
  const [touchX, setTouchX] = useState<number | null>(null)
  const many = slides.length > 1
  const stopped = paused || held
  const slide = slides[index]

  const go = (i: number) => {
    const next = (i + slides.length) % slides.length
    setIndex(next)
    setLoaded((s) => new Set(s).add(next).add((next + 1) % slides.length))
  }

  return (
    <section
      aria-roledescription="carrusel"
      aria-label="Obras en cartel"
      className="relative isolate flex min-h-[100dvh] items-end overflow-hidden"
      onPointerDown={() => setHeld(true)}
      onPointerUp={() => setHeld(false)}
      onPointerCancel={() => setHeld(false)}
      onPointerLeave={() => setHeld(false)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = touchX === null ? 0 : e.changedTouches[0].clientX - touchX
        if (many && Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1))
        setTouchX(null)
      }}
    >
      {slides.map(
        (s, i) =>
          loaded.has(i) && (
            <div
              key={s.id}
              aria-hidden={i !== index}
              className={`absolute inset-0 -z-20 overflow-hidden transition-opacity duration-1000 ease-stage ${i === index ? 'opacity-100' : 'opacity-0'}`}
            >
              <Photo
                image={s.image}
                fill
                priority={i === 0}
                sizes="100vw"
                className={`object-cover ${i === index ? 'hero-drift' : ''}`}
              />
            </div>
          ),
      )}
      <div aria-hidden className="spotlight absolute inset-0 -z-10" />

      <div className="mx-auto w-full max-w-7xl px-5 pt-28 pb-8 md:px-8 md:pt-32 md:pb-14">
        <div aria-live={stopped ? 'polite' : 'off'} className="grid items-end gap-12 lg:grid-cols-12">
          {/* keyed by slide so the text and poster replay their entrance */}
          <div
            key={slide.id}
            role="group"
            aria-roledescription="obra"
            aria-label={`${index + 1} de ${slides.length}: ${slide.title}`}
            className="lg:col-span-8"
          >
            {slide.content}
          </div>
          <div key={`poster-${slide.id}`} className="rise hidden lg:col-span-3 lg:col-start-10 lg:block" style={{ '--d': 2 } as React.CSSProperties}>
            <div className="relative aspect-[2/3] shadow-[0_30px_80px_-20px_rgb(15_13_13/0.9)] ring-1 ring-paper/15">
              <Photo image={slide.poster} fill sizes="25vw" className="object-cover" />
            </div>
          </div>
        </div>

        {many && (
          <div className="mt-10 flex items-center gap-4 md:mt-16 md:gap-6">
            <div className="flex flex-1 gap-1.5">
              {slides.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Ver ${s.title}`}
                  aria-current={i === index}
                  className="group relative h-12 max-w-16 flex-1"
                >
                  <span className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 overflow-hidden rounded-full bg-paper/25 transition-colors group-hover:bg-paper/45">
                    {i === index && (
                      <span
                        className="hero-progress absolute inset-0 origin-left bg-crimson"
                        style={{ animationPlayState: stopped ? 'paused' : 'running' }}
                        onAnimationEnd={() => go(index + 1)}
                      />
                    )}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                aria-label={paused ? 'Reanudar el carrusel' : 'Pausar el carrusel'}
                className={`${roundButton} motion-reduce:hidden`}
              >
                {paused ? <Play size={20} weight="fill" aria-hidden /> : <Pause size={20} weight="fill" aria-hidden />}
              </button>
              <button type="button" onClick={() => go(index - 1)} aria-label="Obra anterior" className={roundButton}>
                <CaretLeft size={22} aria-hidden />
              </button>
              <button type="button" onClick={() => go(index + 1)} aria-label="Obra siguiente" className={roundButton}>
                <CaretRight size={22} aria-hidden />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
