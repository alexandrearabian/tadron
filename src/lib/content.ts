import { defineQuery, toPlainText, type PortableTextBlock } from 'next-sanity'
import { client } from '@/sanity/lib/client'

/** The site's official address (www; the bare domain redirects here). Used for canonical URLs, sitemap, structured data. */
export const SITE_URL = 'https://www.tadronteatro.com.ar'

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
  ogImage?: string | null
  facade?: Img | null
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
  address, phone, email, instagram, facebook, youtube, mapEmbedUrl, description, "ogImage": ogImage.asset->url, "facade": facade${IMG}
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

export async function getPageSlugs(): Promise<string[]> {
  return fetchSanity<string[]>(defineQuery(`*[_type == "page" && defined(slug.current)].slug.current`))
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
  const parts = new Intl.DateTimeFormat('es-AR', { weekday: 'short', day: 'numeric', month: 'short', timeZone: iso.length === 10 ? 'UTC' : TZ })
    .formatToParts(new Date(iso))
  const get = (type: string) => parts.find((p) => p.type === type)?.value.replace('.', '') ?? ''
  return { day: get('day'), month: get('month'), weekday: get('weekday') }
}

/** Search-result description: plain text, cut at a word, about 155 characters. */
export function describe(text?: string | PortableTextBlock[] | null, max = 155) {
  const plain = (typeof text === 'string' ? text : text ? toPlainText(text) : '').replace(/\s+/g, ' ').trim()
  if (plain.length <= max) return plain || undefined
  return plain.slice(0, plain.lastIndexOf(' ', max - 1)).replace(/[,.;:]$/, '') + '…'
}

/** "De Leonor Vila. Dirección de Leonor Vila" */
export const byline = (p: Pick<Production, 'author' | 'director'>) =>
  [p.author && `De ${p.author}`, p.director && `Dirección de ${p.director}`].filter(Boolean).join('. ')

/** "21:00" (no " h"), for compact spots like ticket stubs */
export const formatClock = (iso: string) => formatTime(iso).replace(' h', '')

/** Buenos Aires calendar day of an ISO date-time: "2026-09-26" */
export const dayKey = (iso: string | number) => new Intl.DateTimeFormat('en-CA', { timeZone: TZ }).format(new Date(iso))

/** The next n calendar days in Buenos Aires, starting today: ["2026-09-26", …] */
export function nextDays(n: number, now = Date.now()) {
  const start = Date.parse(`${dayKey(now)}T00:00:00Z`)
  return Array.from({ length: n }, (_, i) => new Date(start + i * 86_400_000).toISOString().slice(0, 10))
}

/** Label for a show's state: its "Aviso" (e.g. "Estreno en noviembre"), or "Últimas funciones"
 * when its run ends within two weeks. Sold-out nights are marked on each date instead. */
export function stampFor(p: Production, now = Date.now()) {
  if (p.announcement) return p.announcement
  const end = p.weekly?.day != null ? p.weekly.until : p.performances?.map((d) => d.dateTime).sort().at(-1)
  if (!end) return null
  const left = new Date(end.length === 10 ? `${end}T23:59:59-03:00` : end).getTime() - now
  return left > 0 && left < 14 * 86_400_000 ? 'Últimas funciones' : null
}

/** "Lunes, miércoles" from each group's "Lunes de 19 a 21 h" */
export const courseDays = (c: Course) => [...new Set(c.groups?.map((g) => g.schedule.split(' ')[0]))].join(', ')

/** Share-preview (Open Graph) version of a Sanity image: 1200×630 JPEG, cropped around the busiest area. */
export const shareImage = (url: string) => `${url}?w=1200&h=630&fit=crop&crop=entropy&fm=jpg`

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`
