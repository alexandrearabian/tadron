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
        <header className="relative isolate flex min-h-[60dvh] md:min-h-[72dvh] items-end overflow-hidden">
          <Photo image={page.heroImage} fill priority sizes="100vw" className="fade-in -z-20 object-cover" />
          <div aria-hidden className="spotlight absolute inset-0 -z-10" />
          <div className={`${container} pt-28 pb-10 md:pb-16`}>
            <h1 className={`${display} rise max-w-5xl text-display-1`}>{page.title}</h1>
          </div>
        </header>
      ) : (
        <header className={`${container} pt-28 pb-4 md:pt-40`}>
          <h1 className={`${display} rise max-w-5xl text-display-1`}>{page.title}</h1>
        </header>
      )}
      <div className="pb-12">
        <Sections sections={page.sections} />
      </div>
    </>
  )
}
