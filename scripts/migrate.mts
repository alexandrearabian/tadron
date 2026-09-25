/**
 * One-off migration: old Firebase site (Firestore + Storage) -> Sanity drafts.
 *
 *   GOOGLE_APPLICATION_CREDENTIALS=/path/to/firebase-key.json npx tsx scripts/migrate.mts [--images <folder>] [--dry-run]
 *
 * Reads Firebase only. Writes every document as a DRAFT with a fixed id (createOrReplace),
 * so it can be re-run. Re-running overwrites unpublished Studio edits to those drafts.
 * Images come from Firebase Storage or, failing that, the --images folder; any not found are left empty and listed.
 */
import { applicationDefault, initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { createClient } from 'next-sanity'
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import { basename, join } from 'node:path'

// Print only messages: raw Google errors include request headers with access tokens.
const fail = (e: unknown) => (console.error(`Error: ${(e as Error)?.message ?? e}`), process.exit(1))
process.on('uncaughtException', fail).on('unhandledRejection', fail)

process.loadEnvFile('.env.local')
const DRY = process.argv.includes('--dry-run')
const EMAIL = 'tadronteatro@hotmail.com'

initializeApp({ credential: applicationDefault(), storageBucket: 'tadron-web.appspot.com' })
const db = getFirestore()
const bucket = getStorage().bucket()
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-09-01',
  useCdn: false,
})

// ---------- text ----------

// Old texts: paragraph breaks were typed as runs of spaces, brand spelled 4 ways, a few typos.
const FIXES: [RegExp, string][] = [
  [/TADRON TEATRO|TADRON Teatro|Tadron Teatro/g, 'Tadrón Teatro'],
  [/TADRON|Tadron/g, 'Tadrón'],
  [/significa TEATRO/g, 'significa teatro'],
  [/\bPemio\b/g, 'Premio'],
  [/\bAsociacion\b/g, 'Asociación'],
  [/\bcreacion\b/g, 'creación'],
  [/\bedicion\b/g, 'edición'],
  [/\bmas de\b/g, 'más de'],
  [/\bMencion\b/g, 'Mención'],
  [/ésta esquina/g, 'esta esquina'],
  [/\.\.\.¡/g, '... ¡'],
]
const fixesUsed = new Set<string>()
const clean = (s = '') =>
  FIXES.reduce((t, [re, to]) => t.replace(re, (m) => (fixesUsed.add(`${m} -> ${to}`), to)), s.replace(/\s+/g, ' ').trim())
const paras = (s = '') => s.split(/(?<=[.!?:])(?:\s*\n\s*|\s{5,})/).map(clean).filter(Boolean)
const unquote = (s: string) => s.replace(/^[“"]+|[“”"]+$/g, '').trim()

type Span = string | { text: string; href: string }
const block = (key: string, ...parts: Span[]) => {
  const markDefs = parts.flatMap((p, i) => (typeof p === 'string' ? [] : [{ _type: 'link', _key: `${key}l${i}`, href: p.href }]))
  const children = parts.map((p, i) =>
    typeof p === 'string'
      ? { _type: 'span', _key: `${key}s${i}`, text: p, marks: [] }
      : { _type: 'span', _key: `${key}s${i}`, text: p.text, marks: [`${key}l${i}`] },
  )
  return { _type: 'block', _key: key, style: 'normal', markDefs, children }
}
const blocks = (texts: string[]) => texts.map((t, i) => block(`p${i}`, t))
const withEmail = (key: string, lead: string) => block(key, `${clean(lead).replace(/:$/, '')} `, { text: EMAIL, href: `mailto:${EMAIL}` }, '.')

const slugify = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

// ---------- images ----------

// Storage downloads fail while the Firebase project has billing off. With --images <folder>,
// files are matched by content (Storage still returns each file's MD5), whatever their local name.
const imagesArg = process.argv.indexOf('--images')
const imagesDir = imagesArg > 0 ? process.argv[imagesArg + 1] : undefined
const localByMd5 = new Map(
  imagesDir
    ? readdirSync(imagesDir)
        .filter((f) => !f.startsWith('.'))
        .map((f) => [createHash('md5').update(readFileSync(join(imagesDir, f))).digest('base64'), join(imagesDir, f)] as const)
    : [],
)

// Written after looking at each photo. Keyed by Storage path.
const ALT: Record<string, string> = {
  'posters/TadronPaginaPrincipal.jpg': 'Fachada de Tadrón Teatro de noche, en la esquina de Niceto Vega y Armenia',
  'posters/Publico-aplaude.jpg': 'Público aplaudiendo al final de una función',
  'tadron/foto-sala1-1.jpg': 'Máscara de teatro de bronce sobre una columna',
  'tadron/Sillas.jpg': 'La sala vacía, con las butacas en gradas y luz sobre el escenario',
  'breyer/breyer_01.jpg': 'Primer plano del rostro de Gastón Breyer',
  'breyer/gaston_breyer.jpg': 'Retrato de Gastón Breyer',
  'breyer/breyer01.jpg': 'Dibujo escenográfico de Gastón Breyer, con líneas de fuga y un globo terráqueo',
  'breyer/GB-004-WEB.jpg': 'Cuaderno abierto con un boceto escenográfico en tinta',
  'justicia/Teatro-Justicia.jpg': 'Logo del Ciclo Teatro x la Justicia',
  'programa/Sala-luces.jpg': 'La sala con las gradas iluminadas con luces de colores',
  'espacio/Foto-Nuestro-Espacio.jpg': 'Maniquíes con pelucas y vestuario en la vidriera del teatro',
  'espacio/tadron_WP_03.jpg': 'Pared con afiches y programas de obras anteriores',
  'espacio/tadron_WP_04.jpg': 'Dos máscaras teatrales sobre una mesa roja en el hall',
  'espacio/tadron_WP_05.jpg': 'Vidriera de noche con maniquíes y vestuario de época',
  'espacio/tadron_WP_06.jpg': 'Maniquíes con carteles que dicen «Esperando la función»',
}

// Per-file metadata is also blocked without billing, but listing the bucket works.
let md5ByPath: Promise<Map<string, string>> | undefined
const storageMd5 = () =>
  (md5ByPath ??= bucket.getFiles().then(([files]) => new Map(files.map((f) => [f.name, String(f.metadata.md5Hash)]))))

const storagePath = (url: string) => decodeURIComponent(new URL(url).pathname.split('/o/')[1])
const uploads = new Map<string, { id: string; from: string } | null>() // storage path -> Sanity asset (null = unavailable)
const missing: string[] = []

async function fetchImage(path: string): Promise<{ data: Buffer; from: string }> {
  try {
    const [data] = await bucket.file(path).download(DRY ? { start: 0, end: 0 } : {})
    return { data, from: 'Storage' }
  } catch (e) {
    if (!imagesDir) throw e
    const local = localByMd5.get((await storageMd5()).get(path) ?? '')
    if (!local) throw new Error('not downloadable from Storage and not in the --images folder')
    return { data: readFileSync(local), from: basename(local) }
  }
}

async function image(url: string | undefined, fallbackAlt: string) {
  if (!url) return undefined
  const path = storagePath(url)
  if (!uploads.has(path)) {
    try {
      const { data, from } = await fetchImage(path)
      const id = DRY ? `dry:${path}` : (await sanity.assets.upload('image', data, { filename: path.split('/').pop() }))._id
      uploads.set(path, { id, from })
    } catch (e) {
      uploads.set(path, null)
      missing.push(`${path} (${(e as Error).message.slice(0, 80)})`)
    }
  }
  const up = uploads.get(path)
  return up
    ? { _type: 'image', _key: slugify(path), asset: { _type: 'reference', _ref: up.id }, alt: ALT[path] ?? fallbackAlt, _path: `${path} <- ${up.from}` }
    : undefined
}

// ---------- read Firebase ----------

async function one(name: string) {
  const snap = await db.collection(name).limit(1).get()
  return (snap.docs[0]?.data() ?? {}) as Record<string, string>
}
const [tadron, breyer, justicia, programa, espacio, principal, premios] = await Promise.all(
  ['tadron', 'breyer', 'justicia', 'programa', 'espacio', 'principal', 'premios'].map(one),
)
const showsSnap = await db.collection('cartelera').get()

// ---------- build Sanity documents ----------

const docs: Record<string, unknown>[] = []
const page = async (slug: string, title: string, hero: string | undefined, sections: unknown[]) =>
  docs.push({
    _id: `drafts.page-${slug}`,
    _type: 'page',
    title,
    slug: { _type: 'slug', current: slug },
    heroImage: await image(hero, title),
    sections: sections.filter(Boolean),
  })
const textImage = async (key: string, opts: { heading?: string; body: unknown[]; img?: string; alt: string; left?: boolean }) => ({
  _type: 'textWithImage',
  _key: key,
  heading: opts.heading,
  body: opts.body,
  image: await image(opts.img, opts.alt),
  imagePosition: opts.left ? 'left' : 'right',
})
const list = (key: string, heading: string, intro: string | undefined, items: { title: string; detail?: string }[]) => ({
  _type: 'itemList',
  _key: key,
  heading,
  intro,
  items: items.map((it, i) => ({ _type: 'item', _key: `${key}${i}`, ...it })),
})

// Shows. "description" only held a schedule ("JUEVES 22HS."), so it's reported, not migrated.
const schedules: string[] = []
for (const snap of showsSnap.docs) {
  const d = snap.data() as Record<string, string>
  const title = clean(d.title)
  if (d.description) schedules.push(`${title}: "${clean(d.description)}"`)
  docs.push({
    _id: `drafts.production-${snap.id}`,
    _type: 'production',
    title,
    slug: { _type: 'slug', current: slugify(title) },
    author: clean(d.author) || undefined,
    poster: await image(d.posterUrl, `Afiche de ${title}`),
    ticketUrl: d.bookingUrl || d.reserva || undefined,
  })
}

// Theatre awards: the Legislatura recognition (premios) plus the two Justicia awards (header2/3 + text4/5).
const justiciaAwards = [
  { title: 'Mención Especial Luisa Vehil', detail: '2016, a Tadrón Teatro por los 10 años del Ciclo Teatro x la Justicia' },
  { title: 'Premio Teatro del Mundo (UBA)', detail: '2007-2008, por el Ciclo Teatro x la Justicia' },
]
const tadronParas = paras(tadron.text1)
docs.push({
  _id: 'drafts.homePage',
  _type: 'homePage',
  sections: [
    await textImage('intro', {
      heading: 'Tadrón es teatro',
      body: [block('p0', tadronParas[0]), block('p1', { text: 'Conocé nuestra historia', href: '/tadron-es-teatro' })],
      img: principal.imgURL,
      alt: 'Tadrón Teatro',
    }),
    list('premios', clean(premios.header1), undefined, [
      { title: 'Legislatura de la Ciudad Autónoma de Buenos Aires', detail: 'Reconocimiento por su labor cultural y la defensa de los Derechos Humanos' },
      ...justiciaAwards,
    ]),
  ],
})

await page('tadron-es-teatro', 'Tadrón es teatro', tadron.imgURL, [
  await textImage('historia', { body: blocks(tadronParas), img: tadron.img1, alt: 'Tadrón es teatro' }),
  { _type: 'callout', _key: 'lema', text: clean(tadron.callout) },
  await textImage('casa', { body: blocks(paras(tadron.text2)), img: tadron.img2, alt: 'Tadrón es teatro', left: true }),
])

// Breyer: text1 = bio + sala + awards prose (the awards repeat in text2), so awards become a list.
const [breyerAwardsIntro, breyerAwards] = clean(breyer.text2).split(/entre otros:\s*/)
const [quote, quoteAuthor] = breyer.callout.split(/\s{5,}/).map((s) => unquote(s.trim())).filter(Boolean)
await page('gaston-breyer', 'Gastón Breyer', breyer.imgURL, [
  await textImage('bio', { body: blocks(paras(breyer.text1).slice(0, 2)), img: breyer.img1, alt: 'Gastón Breyer' }),
  { _type: 'callout', _key: 'cita', text: clean(quote), attribution: clean(quoteAuthor) },
  await textImage('obra', {
    body: blocks([breyerAwardsIntro.trim().replace(/ Obtuvo premios y distinciones,?$/, '')]),
    img: breyer.img2,
    alt: 'Gastón Breyer',
    left: true,
  }),
  list(
    'premios',
    'Premios y distinciones',
    undefined,
    breyerAwards.replace(/\.$/, '').split(/;\s*/).map((a) => {
      const name = a.trim().replace(/^el\s+/, '')
      const m = name.match(/^(.*),\s*([\d-]+)$/)
      return m ? { title: m[1], detail: m[2] } : { title: name }
    }),
  ),
  await textImage('legado', {
    heading: clean(breyer.header2),
    body: [...blocks(paras(breyer.text3)), withEmail('mail', breyer.text4)],
    img: breyer.img3,
    alt: 'Gastón Breyer',
  }),
])

// Justicia: text2 repeats the callout, so it's dropped.
const [juryIntro, juryNames] = clean(justicia.text6).split(/:\s*/)
await page('ciclo-teatro-justicia', 'Ciclo Teatro x la Justicia', justicia.imgURL, [
  await textImage('ciclo', { body: blocks(paras(justicia.text1)), img: justicia.img1, alt: 'Ciclo Teatro x la Justicia' }),
  { _type: 'callout', _key: 'lema', text: clean(justicia.callout) },
  list('reconocimientos', 'Reconocimientos', clean(justicia.text3), justiciaAwards),
  list('jurado', 'Jurado', `${juryIntro}:`, juryNames.replace(/\.$/, '').split(/,\s*/).map((title) => ({ title }))),
])

await page('programa-tu-espectaculo', 'Programá tu espectáculo', programa.imgURL, [
  await textImage('sala', { body: blocks(paras(programa.text1)), img: programa.img1, alt: 'Programá tu espectáculo' }),
  await textImage('visita', {
    body: [...blocks(paras(programa.text2).slice(0, -1)), withEmail('mail', paras(programa.text2).at(-1)!)],
    alt: 'Programá tu espectáculo',
  }),
])

// Espacio: img1 == hero and img5 == img6 in the old data; one long paragraph split at the Breyer sentence.
const espacioText = clean(espacio.text1)
const splitAt = espacioText.indexOf('La Sala de Tadrón Teatro lleva el nombre')
const galleryUrls = [...new Map([espacio.img3, espacio.img4, espacio.img5, espacio.img6].map((u) => [storagePath(u), u])).values()]
await page('nuestro-espacio', 'Nuestro espacio', espacio.imgURL, [
  await textImage('historia', {
    body: blocks(splitAt > 0 ? [espacioText.slice(0, splitAt).trim(), espacioText.slice(splitAt)] : [espacioText]),
    img: espacio.img2,
    alt: 'Nuestro espacio',
    left: true,
  }),
  {
    _type: 'gallery',
    _key: 'fotos',
    images: (await Promise.all(galleryUrls.map((u) => image(u, 'Nuestro espacio')))).filter(Boolean),
  },
])

// ---------- output ----------

const strip = (v: unknown): unknown =>
  JSON.parse(JSON.stringify(v, (k, val) => (k === '_path' ? undefined : val)))

function describe(doc: Record<string, unknown>) {
  const img = (i?: { _path?: string }) => (i ? `[${i._path}]` : '[sin imagen]')
  const text = (b?: { children: { text: string }[] }[]) =>
    (b ?? []).map((x) => x.children.map((c) => c.text).join('')).join(' / ')
  const cut = (s = '', n = 110) => (s.length > n ? s.slice(0, n) + '…' : s)
  const lines = [`\n■ ${doc._id}  (${doc._type})`]
  for (const [k, v] of Object.entries(doc)) {
    if (['_id', '_type', 'sections'].includes(k) || v === undefined) continue
    lines.push(`  ${k}: ${typeof v === 'object' && v && 'asset' in v ? img(v as never) : cut(JSON.stringify((v as { current?: string }).current ?? v))}`)
  }
  for (const s of (doc.sections ?? []) as Record<string, never>[]) {
    const head = `  · ${s._type}${s.heading ? ` "${s.heading}"` : ''}`
    if (s._type === 'textWithImage') lines.push(`${head} ${img(s.image)} ${s.imagePosition}`, `      ${cut(text(s.body))}`)
    if (s._type === 'callout') lines.push(`${head}`, `      ${cut(s.text)}${s.attribution ? `  (${s.attribution})` : ''}`)
    if (s._type === 'itemList')
      lines.push(`${head}${s.intro ? ` (${cut(s.intro, 60)})` : ''}`, ...(s.items as { title: string; detail?: string }[]).map((i) => `      - ${i.title}${i.detail ? ` | ${i.detail}` : ''}`))
    if (s._type === 'gallery') lines.push(`${head} ${(s.images as { _path: string }[]).map((i) => `[${i._path}]`).join(' ')}`)
  }
  return lines.join('\n')
}

console.log(DRY ? '# DRY RUN: nothing is written\n' : '# Writing drafts to Sanity\n')
docs.forEach((d) => console.log(describe(d)))
console.log(`\n# ${docs.length} documents, ${[...uploads.values()].filter(Boolean).length} images ${DRY ? 'found' : 'uploaded'}`)
if (missing.length) console.log(`\n# Images NOT available (left empty):\n${missing.map((m) => `  - ${m}`).join('\n')}`)
if (schedules.length) console.log(`\n# Not migrated, add as performances in /studio:\n${schedules.map((s) => `  - ${s}`).join('\n')}`)
console.log(`\n# Text fixes applied:\n${[...fixesUsed].map((f) => `  - ${f}`).join('\n')}`)

if (!DRY) {
  const tx = sanity.transaction()
  docs.forEach((d) => tx.createOrReplace(strip(d) as { _id: string; _type: string }))
  await tx.commit()
  console.log('\nDone. Review and publish in /studio.')
}
