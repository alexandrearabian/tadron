import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { Photo } from '@/components/Photo'
import { Sections } from '@/components/Sections'
import { container, display } from '@/components/ui'
import { getPage } from '@/lib/content'

// Content pages edited in Sanity ("Páginas"): tadron-es-teatro, nuestro-espacio, gaston-breyer...
async function load(params: PageProps<'/[slug]'>['params']) {
  return getPage((await params).slug)
}

export async function generateMetadata({ params }: PageProps<'/[slug]'>): Promise<Metadata> {
  return { title: (await load(params))?.title }
}

export default async function ContentPage({ params }: PageProps<'/[slug]'>) {
  const page = await load(params)
  if (!page) notFound()

  return (
    <>
      {page.heroImage ? (
        <header className="relative isolate flex min-h-[72dvh] items-end overflow-hidden">
          <Photo image={page.heroImage} fill priority sizes="100vw" className="fade-in -z-20 object-cover" />
          <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/45 to-ink/25" />
          <div className={`${container} pt-32 pb-14 md:pb-20`}>
            <h1 className={`${display} rise max-w-5xl text-6xl leading-[0.95] md:text-8xl`}>{page.title}</h1>
          </div>
        </header>
      ) : (
        <header className={`${container} pt-36 pb-6 md:pt-44`}>
          <h1 className={`${display} rise max-w-5xl text-6xl leading-[0.95] md:text-8xl`}>{page.title}</h1>
        </header>
      )}
      <div className="pb-12">
        <Sections sections={page.sections} />
      </div>
    </>
  )
}
