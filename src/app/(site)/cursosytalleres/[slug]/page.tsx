import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from '@phosphor-icons/react/ssr'
import { Photo } from '@/components/Photo'
import { ButtonLink, container, display, Rich } from '@/components/ui'
import { describe, formatDay, getCourse } from '@/lib/content'

export async function generateMetadata({ params }: PageProps<'/cursosytalleres/[slug]'>): Promise<Metadata> {
  const course = await getCourse((await params).slug)
  if (!course) return {}
  const groups = course.groups?.map((g) => [g.schedule, g.teacher && `con ${g.teacher}`].filter(Boolean).join(' ')).join('; ')
  return {
    title: course.title,
    description: describe(course.description) ?? describe(`${course.title} en Tadrón Teatro, Palermo. ${groups ?? ''}.`),
    alternates: { canonical: `/cursosytalleres/${course.slug}` },
  }
}

export default async function Curso({ params }: PageProps<'/cursosytalleres/[slug]'>) {
  const course = await getCourse((await params).slug)
  if (!course) notFound()

  const hasMain = !!(course.image || course.description?.length)

  return (
    <article className={`${container} pt-24 pb-16 md:pt-32 md:pb-28`}>
      <Link href="/cursosytalleres" className="inline-flex min-h-12 items-center gap-2 text-lg text-mist transition-colors hover:text-paper">
        <ArrowLeft size={20} aria-hidden />
        Volver a cursos y talleres
      </Link>

      <h1 className={`${display} rise mt-8 max-w-4xl text-display-1`}>{course.title}</h1>

      <div className="mt-10 grid gap-10 md:mt-14 md:gap-12 md:grid-cols-12 md:gap-16">
        {hasMain && (
          <div className="md:col-span-7">
            {course.image && (
              <div className="fade-in relative aspect-[4/3]">
                <Photo image={course.image} fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className="mt-12">
              <Rich value={course.description} />
            </div>
          </div>
        )}

        <aside className={hasMain ? 'md:col-span-5' : 'md:col-span-8'}>
          <div className="bg-ink-2 p-8 md:sticky md:top-28 md:p-10">
            <h2 className="text-base text-mist">{course.groups && course.groups.length > 1 ? 'Grupos' : 'Día y horario'}</h2>
            <ul className="mt-4 grid gap-5">
              {course.groups?.map((g) => (
                <li key={g._key}>
                  <p className="text-2xl">{g.schedule}</p>
                  {g.teacher && <p className="mt-1 text-lg text-mist">Con {g.teacher}</p>}
                </li>
              ))}
            </ul>
            {course.startDate && (
              <p className="mt-8 text-lg">
                <span className="text-mist">Empieza el </span>
                {formatDay(course.startDate)}
              </p>
            )}
            {course.enrollUrl && (
              <div className="mt-10">
                <ButtonLink href={course.enrollUrl}>Inscribirme</ButtonLink>
              </div>
            )}
          </div>
        </aside>
      </div>
    </article>
  )
}
