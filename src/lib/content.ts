import { defineQuery, type PortableTextBlock } from 'next-sanity'
import { client } from '@/sanity/lib/client'

export type Img = { url: string; alt: string; lqip?: string | null } // lqip: tiny blurred preview from Sanity

export type Performance = { dateTime: string; soldOut?: boolean | null }

export type Production = {
  slug: string
  title: string
  author?: string | null
  director?: string | null
  poster: Img
  synopsis?: PortableTextBlock[] | null
  ticketUrl?: string | null
  announcement?: string | null
  weekly?: { day?: number | null; time?: string | null; until?: string | null } | null
  performances?: Performance[] | null
  credits?: { role?: string | null; name?: string | null }[] | null
  gallery?: Img[] | null
}

export type Course = {
  slug: string
  title: string
  image?: Img | null
  description?: PortableTextBlock[] | null
  groups?: { _key: string; schedule: string; teacher?: string | null }[] | null
  startDate?: string | null
  enrollUrl?: string | null
}

export type Section = { _key: string } & (
  | {
      _type: 'textWithImage'
      heading?: string | null
      body?: PortableTextBlock[] | null
      image?: Img | null
      imagePosition?: 'left' | 'right' | null
    }
  | { _type: 'callout'; text?: string | null; attribution?: string | null }
  | {
      _type: 'itemList'
      heading?: string | null
      intro?: string | null
      items?: { _key: string; title: string; detail?: string | null }[] | null
    }
  | { _type: 'gallery'; images?: Img[] | null }
  | { _type: 'columns'; items?: { heading?: string | null; body?: string | null }[] | null }
)

export type Page = { slug: string; title: string; heroImage?: Img | null; sections?: Section[] | null }

export type Home = { sections?: Section[] | null }

export type Settings = {
  address?: string | null
  phone?: string | null
  email?: string | null
  instagram?: string | null
  facebook?: string | null
  youtube?: string | null
  mapEmbedUrl?: string | null
  description?: string | null
}

const IMG = `{ "url": asset->url, alt, "lqip": asset->metadata.lqip }`

const PRODUCTIONS_QUERY = defineQuery(`*[_type == "production" && defined(slug.current)] | order(title asc) {
  "slug": slug.current, title, author, director, "poster": poster${IMG}, synopsis, ticketUrl, announcement,
  weekly{ day, time, until }, performances[]{ dateTime, soldOut }, credits[]{ role, name }, "gallery": gallery[]${IMG}
}`)

const COURSES_QUERY = defineQuery(`*[_type == "course" && defined(slug.current)] | order(startDate asc) {
  "slug": slug.current, title, "image": image${IMG}, description, groups[]{ _key, schedule, teacher }, startDate, enrollUrl
}`)

const SECTIONS = `sections[]{ ..., "image": image${IMG}, "images": images[]{ _key, "url": asset->url, alt, "lqip": asset->metadata.lqip } }`

const PAGE_QUERY = defineQuery(`*[_type == "page" && slug.current == $slug][0] {
  "slug": slug.current, title, "heroImage": heroImage${IMG}, ${SECTIONS}
}`)

const HOME_QUERY = defineQuery(`*[_id == "homePage"][0] { ${SECTIONS} }`)

const SETTINGS_QUERY = defineQuery(`*[_id == "siteSettings"][0] {
  address, phone, email, instagram, facebook, youtube, mapEmbedUrl, description
}`)

// ponytail: time-based revalidation; switch to on-demand (Sanity webhook + revalidateTag) if 60s lag matters
const fetchSanity = <T>(query: string, params: Record<string, string> = {}): Promise<T> =>
  client.fetch<T>(query, params, { next: { revalidate: 60 } })

export async function getProductions(): Promise<Production[]> {
  return fetchSanity<Production[]>(PRODUCTIONS_QUERY)
}

export async function getProduction(slug: string) {
  return (await getProductions()).find((p) => p.slug === slug)
}

export async function getCourses(): Promise<Course[]> {
  return fetchSanity<Course[]>(COURSES_QUERY)
}

export async function getCourse(slug: string) {
  return (await getCourses()).find((c) => c.slug === slug)
}

export async function getPage(slug: string): Promise<Page | undefined> {
  return (await fetchSanity<Page | null>(PAGE_QUERY, { slug })) ?? undefined
}

export async function getHome(): Promise<Home> {
  return (await fetchSanity<Home | null>(HOME_QUERY)) ?? {}
}

export async function getSettings(): Promise<Settings> {
  return (await fetchSanity<Settings | null>(SETTINGS_QUERY)) ?? {}
}

/**
 * Shows for the Cartelera and home, soonest first. A show leaves the Cartelera by itself once it has
 * dates and none are left; shows announced without any dates yet stay listed.
 */
export function onStage(productions: Production[], now = Date.now()) {
  const next = (p: Production) => time(upcoming([p], now)[0]?.dateTime ?? '9999-12-31')
  return productions
    .filter((p) => upcoming([p], now).length > 0 || (!p.performances?.length && p.weekly?.day == null))
    .sort((a, b) => next(a) - next(b))
}

/** All future performances across productions (dated + weekly), soonest first. */
export function upcoming(productions: Production[], now = Date.now()) {
  return productions
    .flatMap((production) => {
      const dated = production.performances ?? []
      const weekly = weeklyDates(production, now)
        .filter((dt) => !dated.some((d) => time(d.dateTime) === time(dt))) // a dated entry (e.g. "Agotado") wins
        .map((dateTime) => ({ dateTime, soldOut: false }))
      return [...dated, ...weekly].map((performance) => ({ production, ...performance }))
    })
    .filter((p) => time(p.dateTime) > now)
    .sort((a, b) => time(a.dateTime) - time(b.dateTime))
}

const time = (iso: string) => new Date(iso).getTime()

// ponytail: open-ended weekly shows list the next 6 weeks; raise it if the agenda needs to look further ahead
const WEEKS_AHEAD = 6

/** Dates of a weekly show from today until its last performance (or WEEKS_AHEAD). */
function weeklyDates({ weekly }: Production, now: number) {
  if (weekly?.day == null || !weekly.time) return []
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(now) // YYYY-MM-DD in Buenos Aires
  const dates: string[] = []
  for (let i = 0; i < WEEKS_AHEAD * 7; i++) {
    const day = new Date(Date.parse(`${today}T00:00:00Z`) + i * 86_400_000)
    const iso = day.toISOString().slice(0, 10)
    if (weekly.until && iso > weekly.until) break
    // Argentina has no daylight saving time: always UTC-3
    if (day.getUTCDay() === weekly.day) dates.push(`${iso}T${weekly.time}:00-03:00`)
  }
  return dates
}

const TZ = 'America/Argentina/Buenos_Aires'

/** "sábado 3 de octubre". Date-only values ("2026-10-06") are read as UTC so the day doesn't shift. */
export const formatDay = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: iso.length === 10 ? 'UTC' : TZ,
  }).format(new Date(iso)).replace(',', '')

/** "20:30 h" */
export const formatTime = (iso: string) =>
  new Intl.DateTimeFormat('es-AR', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: TZ }).format(new Date(iso)) + ' h'

/** { day: "3", month: "oct", weekday: "sáb" } for compact date tiles */
export function dateParts(iso: string) {
  const parts = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: TZ })
    .formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value.replace('.', '') ?? ''
  return { day: get('day'), month: get('month'), weekday: get('weekday') }
}

/** "Lunes, miércoles" from each group's "Lunes de 19 a 21 h" */
export const courseDays = (c: Course) => [...new Set(c.groups?.map((g) => g.schedule.split(' ')[0]))].join(', ')

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
