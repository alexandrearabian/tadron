import type { MetadataRoute } from 'next'
import { getCourses, getPageSlugs, getProductions, SITE_URL } from '@/lib/content'

// Every public page, including each show, course and content page from Sanity
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [productions, courses, pages] = await Promise.all([getProductions(), getCourses(), getPageSlugs()])
  const paths = [
    '',
    '/espectaculos',
    '/cursosytalleres',
    '/contacto',
    ...pages.map((slug) => `/${slug}`),
    ...productions.map((p) => `/espectaculos/${p.slug}`),
    ...courses.map((c) => `/cursosytalleres/${c.slug}`),
  ]
  return paths.map((path) => ({ url: SITE_URL + path }))
}
