/**
 * Publish every draft at once (the "one click" alternative to publishing each document in /studio).
 *
 *   npx tsx scripts/publish-drafts.mts [--dry-run]
 *
 * The API skips the Studio's validation, so drafts missing what the site needs are left unpublished and listed.
 */
import { createClient } from 'next-sanity'

process.loadEnvFile('.env.local')
const DRY = process.argv.includes('--dry-run')
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  token: process.env.SANITY_API_TOKEN,
  apiVersion: '2026-09-01',
  useCdn: false,
  perspective: 'raw',
})

type Doc = { _id: string; _type: string; title?: string; slug?: { current?: string }; poster?: { asset?: unknown } }

/** Why a draft can't go live, mirroring the schema's required fields. */
function problems(d: Doc) {
  const out: string[] = []
  if (['production', 'course', 'page'].includes(d._type) && (!d.title || !d.slug?.current)) out.push('falta título o slug')
  if (d._type === 'production' && !d.poster?.asset) out.push('falta afiche')
  JSON.stringify(d, (_, v) => {
    if (v?.asset?._ref?.startsWith('image-') && !v.alt && d._type !== 'siteSettings') out.push('imagen sin texto alternativo')
    return v
  })
  return [...new Set(out)]
}

const drafts = await sanity.fetch<Doc[]>(`*[_id in path("drafts.**")]`)
const ready = drafts.filter((d) => !problems(d).length)

for (const d of drafts) {
  const p = problems(d)
  console.log(`${p.length ? '✗' : '✓'} ${d._type.padEnd(11)} ${d.title ?? d._id}${p.length ? `  (${p.join(', ')})` : ''}`)
}

if (DRY || !ready.length) {
  console.log(`\n${ready.length} of ${drafts.length} drafts ready${DRY ? ' (dry run, nothing published)' : ''}`)
} else {
  const tx = sanity.transaction()
  for (const { _id, ...doc } of ready) {
    tx.createOrReplace({ ...doc, _id: _id.replace(/^drafts\./, '') } as Doc)
    tx.delete(_id)
  }
  await tx.commit()
  console.log(`\nPublished ${ready.length} of ${drafts.length} drafts.`)
}
