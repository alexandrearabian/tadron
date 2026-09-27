import type { Metadata } from 'next'
import Link from 'next/link'
import { CalendarBlank, Clock } from '@phosphor-icons/react/ssr'
import { Photo } from '@/components/Photo'
import { container, display, PageTitle, TextLink } from '@/components/ui'
import { formatDay, getCourses } from '@/lib/content'

export const metadata: Metadata = {
  title: 'Cursos y talleres',
  description: 'Cursos de teatro en Tadrón, Palermo: escuela de improvisación y proyecto teatral anual. Días, horarios, docentes e inscripción.',
  alternates: { canonical: '/cursosytalleres' },
}

export default async function Cursos() {
  const courses = await getCourses()

  return (
    <>
      <PageTitle
        title="Cursos y talleres"
        intro="Escuela de improvisación y un proyecto teatral anual, con distintos días y horarios. Con o sin experiencia."
      />

      {courses.length === 0 ? (
        <p className={`${container} pb-32 text-xl text-mist`}>Estamos armando los cursos del próximo cuatrimestre. Escribinos para recibir novedades.</p>
      ) : (
        <ul className={`${container} grid gap-x-12 gap-y-14 pb-16 md:grid-cols-2 md:gap-y-20 md:pb-28`}>
          {courses.map((c, i) => (
            // Every second card drops down on desktop for a staggered, editorial rhythm
            <li key={c.slug} className={`reveal ${i % 2 ? 'md:mt-28' : ''}`}>
              <Link href={`/cursosytalleres/${c.slug}`} className="group block">
                <div className="relative aspect-[4/3] overflow-hidden bg-ink-2">
                  {c.image && (
                    <Photo
                      image={c.image}
                      fill
                      sizes="(min-width: 768px) 45vw, 100vw"
                      className="object-cover transition duration-700 ease-stage group-hover:scale-[1.03]"
                    />
                  )}
                </div>
                <h2 className={`${display} mt-7 text-display-2 transition-colors group-hover:text-ember`}>{c.title}</h2>
              </Link>
              <ul className="mt-5 grid gap-2 text-lg text-mist">
                {c.groups?.map((g) => (
                  <li key={g._key} className="flex items-start gap-3">
                    <Clock size={22} aria-hidden className="mt-1 shrink-0" />
                    <span>
                      {g.schedule}
                      {g.teacher && <span className="block text-base">Con {g.teacher}</span>}
                    </span>
                  </li>
                ))}
                {c.startDate && (
                  <li className="flex items-center gap-3">
                    <CalendarBlank size={22} aria-hidden /> Empieza el {formatDay(c.startDate)}
                  </li>
                )}
              </ul>
              <div className="mt-7">
                <TextLink href={`/cursosytalleres/${c.slug}`}>Ver el curso</TextLink>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
