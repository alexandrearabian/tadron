/**
 * Current programme, typed from the flyers (CURSOS&TALLERES.pdf, SEPTIEMBRE en TADRON Teatro.pdf),
 * written to Sanity as DRAFTS.
 *
 *   npx tsx scripts/import-program.mts --images <folder> [--dry-run]
 *
 * <folder> holds <slug>.jpg (poster) and optionally <slug>-foto.jpg, <slug>-foto-2.jpg… (gallery; the first is the home hero).
 * --only <slug,slug> re-imports just those shows (courses are skipped), leaving other drafts untouched.
 * Fixed ids + createOrReplace, so re-running overwrites unpublished Studio edits to these drafts.
 */
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from 'next-sanity'

for (const f of ['.env.local', '.env']) if (existsSync(f)) process.loadEnvFile(f)
const DRY = process.argv.includes('--dry-run')

const EMAIL = 'tadronteatro@hotmail.com'
const enroll = (title: string) => `mailto:${EMAIL}?subject=${encodeURIComponent(`Inscripción: ${title}`)}`

const courses = [
  {
    slug: 'escuela-de-impro',
    title: 'Escuela de Impro',
    groups: [
      { schedule: 'Lunes de 19:30 a 21:30 h', teacher: 'Diego Zeta' },
      { schedule: 'Martes de 19 a 21 h', teacher: 'Charly Arzulian' },
      { schedule: 'Miércoles de 18 a 20 h', teacher: 'Charly Arzulian' },
      { schedule: 'Jueves de 18:30 a 20:30 h', teacher: 'Charly Arzulian' },
      { schedule: 'Viernes de 18:30 a 20:30 h', teacher: 'Diego Zeta' },
    ],
  },
  {
    slug: 'proyecto-teatral-anual',
    title: 'Proyecto Teatral Anual',
    groups: [{ schedule: 'Miércoles de 20 a 22 h', teacher: 'Gabriela Villalonga' }],
  },
]

// Weekly day: 0 = domingo … 6 = sábado. No "until" = runs until someone sets "Última función" in the Studio.
const shows: {
  slug: string
  title: string
  author?: string
  director?: string
  ticket?: string
  weekly?: { day: number; time: string; until?: string }
  dates?: string[]
  announcement?: string
  synopsis?: string
  credits?: [string, string][]
  alt: string
  photos?: string[] // alt texts, in gallery order
}[] = [
  {
    slug: 'galimatias-de-un-conventillo',
    title: 'Galimatías de un conventillo',
    author: 'Ramiro Calero',
    director: 'Ramiro Calero',
    ticket: 'obra102793-galimatias-de-un-conventillo',
    weekly: { day: 4, time: '21:00' },
    credits: [
      ['Libro y dirección', 'Ramiro Calero'],
      ['Elenco', 'María Cristina Brugnoni, María Cánepa, Antonella Macri, María Paula Pertierra, Lala Piscicelli, Viviana Parrino, Soledad Vázquez'],
      ['Asistencia de dirección', 'Sofía Vaccarezza'],
    ],
    alt: 'Afiche de Galimatías de un conventillo: primeros planos de ojos en blanco y negro',
  },
  {
    slug: 'el-tiempo-todo-entero',
    title: 'El tiempo todo entero',
    author: 'Romina Paula',
    director: 'Mariangeles Campos',
    ticket: 'obra102537-el-tiempo-todo-entero',
    weekly: { day: 5, time: '22:00' },
    alt: 'Dos intérpretes de El tiempo todo entero frente a un fondo rojo',
    photos: ['Los tres intérpretes de El tiempo todo entero, de pie frente a un fondo rojo'],
  },
  {
    slug: 'simone-weil-la-virgen-roja',
    title: 'Simone Weil, la virgen roja',
    author: 'Inés Pelicori, sobre textos de Simone Weil',
    ticket: 'obra101958-simone-weil-la-virgen-roja',
    dates: ['2026-09-12T15:30:00-03:00', '2026-09-26T15:30:00-03:00'],
    credits: [
      ['Dramaturgia', 'Inés Pelicori, sobre textos de Simone Weil'],
      ['Música original y en vivo', 'Santiago Chotsourian'],
    ],
    alt: 'Una actriz con un texto en la mano, sentada junto al pianista',
    photos: ['Un pianista y una actriz sentados junto a un piano, en Simone Weil, la virgen roja'],
  },
  {
    slug: 'circo-transatlantico',
    title: 'Circo transatlántico',
    author: 'Alejandro Radawski',
    director: 'Alejandro Radawski',
    ticket: 'obra99627-circo-transatlantico',
    weekly: { day: 6, time: '18:00' },
    alt: 'Una intérprete con saco escocés sonriendo sobre un fondo azul, en Circo transatlántico',
    photos: ['Dos intérpretes con sacos escoceses sobre un fondo azul, en Circo transatlántico'],
  },
  {
    slug: 'la-juana-no-es-nombre-es-identidad',
    title: 'La Juana, no es nombre, es identidad',
    author: 'Javier Delgado',
    director: 'Javier Delgado y Andrés Montorfano',
    ticket: 'obra102362-la-juana-no-es-nombre-es-identidad',
    weekly: { day: 6, time: '21:00', until: '2026-10-31' }, // poster: "Sep. y oct."
    alt: 'Afiche de La Juana: una figura con una banda roja sobre un fondo dorado',
  },
  {
    slug: 'la-casa-es-verde',
    title: 'La casa es verde',
    author: 'Alanis Burstein',
    director: 'Magdalena Sofía',
    ticket: 'obra101826-la-casa-es-verde-elenco-verde',
    weekly: { day: 0, time: '15:00' },
    alt: 'Dos actrices de La casa es verde en camisones de colores pastel',
    photos: [
      'Cinco actrices en camisones de colores pastel, en La casa es verde',
      'Retratos de las cinco actrices de La casa es verde sobre fondos de colores',
    ],
  },
  {
    slug: 'dr-korczak-ultima-decision',
    title: 'Dr. Korczak, última decisión',
    author: 'Leonor Vila',
    director: 'Leonor Vila',
    ticket: 'obra102585-doctor-korczak-la-ultima-decision',
    weekly: { day: 0, time: '18:00' },
    alt: 'Dos intérpretes de Dr. Korczak, última decisión, uno con gorra de uniforme',
    photos: ['Tres intérpretes de Dr. Korczak, última decisión, uno con gorra de uniforme'],
  },
  {
    slug: 'par-elisa-tiempo-de-despedida',
    title: 'Par’Elisa, tiempo de despedida',
    author: 'Jorge Palant',
    director: 'Enrique Dacal',
    ticket: 'obra101939-parelisa-tiempo-de-despedida',
    weekly: { day: 0, time: '20:00' },
    alt: 'Escena de Par’Elisa: tres intérpretes en el piso, junto a una lámpara',
    photos: [
      'Los tres intérpretes de Par’Elisa sentados en un sillón, tomados de las manos',
      'Retrato de los tres intérpretes de Par’Elisa sobre fondo negro',
      'Escena de Par’Elisa: tres intérpretes alrededor de una mesa con mantel rojo',
      'Los tres intérpretes de Par’Elisa sentados en un sillón gris',
    ],
  },
  {
    slug: 'andamio',
    title: 'Andamio',
    announcement: 'Estreno en octubre',
    alt: 'Un actor en musculosa sentado en un banco de madera, en Andamio',
    photos: ['Un actor en musculosa sobre el escenario, en Andamio'],
  },
  {
    slug: 'eleonora',
    title: 'Eleonora',
    announcement: 'Estreno en noviembre',
    alt: 'Afiche de Eleonora: un cuervo con las alas abiertas',
  },
  {
    slug: 'sueno-blanco-alegato-liturgico-de-un-esclavo',
    title: 'Sueño blanco, alegato litúrgico de un esclavo',
    author: 'Francisco Mendieta',
    announcement: 'Estreno en noviembre',
    synopsis: 'Obra inédita seleccionada para el 20° Ciclo Teatro x la Justicia (2026).',
    alt: 'Afiche de Sueño blanco: una figura con el cuerpo pintado de negro y falda de hojas',
  },
]

const onlyArg = process.argv.indexOf('--only')
const only = onlyArg > 0 ? process.argv[onlyArg + 1].split(',') : undefined
const imagesArg = process.argv.indexOf('--images')
const imagesDir = imagesArg > 0 ? process.argv[imagesArg + 1] : undefined
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-09-01',
  useCdn: false,
})

async function image(file: string, alt: string, key?: string) {
  const path = imagesDir && join(imagesDir, file)
  if (!path || !existsSync(path)) return undefined
  const ref = DRY ? `dry:${file}` : (await sanity.assets.upload('image', readFileSync(path), { filename: file }))._id
  return { _type: 'image', ...(key && { _key: key }), asset: { _type: 'reference', _ref: ref }, alt, _file: file }
}

const showDocs = []
for (const s of shows.filter((s) => !only || only.includes(s.slug))) {
  const gallery = []
  for (const [i, alt] of (s.photos ?? []).entries()) gallery.push(await image(`${s.slug}-foto${i ? `-${i + 1}` : ''}.jpg`, alt, `foto${i}`))
  showDocs.push({
    _id: `drafts.production-${s.slug}`,
    _type: 'production',
    title: s.title,
    slug: { _type: 'slug', current: s.slug },
    author: s.author,
    director: s.director,
    poster: await image(`${s.slug}.jpg`, s.alt),
    gallery: gallery.filter(Boolean).length ? gallery.filter(Boolean) : undefined,
    ticketUrl: s.ticket && `https://www.alternativateatral.com/${s.ticket}`,
    announcement: s.announcement,
    weekly: s.weekly,
    performances: s.dates?.map((d, i) => ({ _type: 'performance', _key: `d${i}`, dateTime: new Date(d).toISOString(), soldOut: false })),
    synopsis: s.synopsis && [
      { _type: 'block', _key: 'p0', style: 'normal', markDefs: [], children: [{ _type: 'span', _key: 's0', text: s.synopsis, marks: [] }] },
    ],
    credits: s.credits?.map(([role, name], i) => ({ _type: 'credit', _key: `c${i}`, role, name })),
  })
}

const DAYS = ['domingos', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábados']
for (const d of showDocs) {
  const w = d.weekly
  const when = w ? `${DAYS[w.day]} ${w.time}${w.until ? ` hasta ${w.until}` : ''}` : d.performances?.map((p) => p.dateTime).join(', ') ?? d.announcement
  console.log(`\n■ ${d._id}\n  ${d.title} | ${[d.author, d.director].filter(Boolean).join(' / ')}\n  ${when}`)
  console.log(`  afiche: ${d.poster?._file ?? 'FALTA'}${d.gallery ? ` | fotos: ${d.gallery.map((g) => g?._file).join(', ')}` : ''} | entradas: ${d.ticketUrl ?? 'FALTA'}`)
}

const docs = (only ? [] : courses).map((c) => ({
  _id: `drafts.course-${c.slug}`,
  _type: 'course',
  title: c.title,
  slug: { _type: 'slug', current: c.slug },
  groups: c.groups.map((g, i) => ({ _type: 'group', _key: `g${i}`, ...g })),
  enrollUrl: enroll(c.title),
}))

for (const d of docs) {
  console.log(`\n■ ${d._id}\n  ${d.title}  (inscripción: ${d.enrollUrl})`)
  d.groups.forEach((g) => console.log(`  · ${g.schedule}, ${g.teacher}`))
}

if (DRY) {
  console.log('\n# DRY RUN: nothing written')
} else {
  const all = [...showDocs, ...docs]
  const tx = sanity.transaction()
  // JSON round-trip drops undefined fields and the _file debug labels
  all.forEach((d) => tx.createOrReplace(JSON.parse(JSON.stringify(d, (k, v) => (k === '_file' ? undefined : v)))))
  await tx.commit()
  console.log(`\n${all.length} drafts written. Review and publish in /studio.`)
}
