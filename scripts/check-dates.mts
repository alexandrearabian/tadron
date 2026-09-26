// Self-check for the Cartelera date logic:  npx tsx scripts/check-dates.mts
import { existsSync } from 'node:fs'
import assert from 'node:assert/strict'
for (const f of ['.env.local', '.env']) if (existsSync(f)) process.loadEnvFile(f)
const { onStage, upcoming } = await import('../src/lib/content')
type P = Parameters<typeof onStage>[0][number]

const now = Date.parse('2026-09-25T12:00:00-03:00') // a Friday
const show = (o: Partial<P>): P => ({ slug: 's', title: 't', poster: { url: '', alt: '' }, ...o })
const times = (p: P) => upcoming([p], now).map((x) => new Date(x.dateTime).toISOString())

// Weekly on Saturdays at 21:00 until 10 Oct -> 26 Sep, 3 Oct, 10 Oct
const juana = show({ weekly: { day: 6, time: '21:00', until: '2026-10-10' } })
assert.deepEqual(times(juana), ['2026-09-27T00:00:00.000Z', '2026-10-04T00:00:00.000Z', '2026-10-11T00:00:00.000Z'])

// A dated entry marks one weekly night as sold out instead of duplicating it
const soldOut = show({ ...juana, performances: [{ dateTime: '2026-09-27T00:00:00Z', soldOut: true }] })
assert.equal(upcoming([soldOut], now).length, 3)
assert.equal(upcoming([soldOut], now)[0].soldOut, true)

// Tonight's weekly show still counts; open-ended weekly shows never run dry
assert.equal(times(show({ weekly: { day: 5, time: '22:00' } }))[0], '2026-09-26T01:00:00.000Z')

// Cartelera: past-only shows leave, announced shows stay (last), soonest first
const past = show({ slug: 'past', performances: [{ dateTime: '2026-09-12T18:30:00Z' }] })
const announced = show({ slug: 'soon', announcement: 'Estreno en noviembre' })
const sunday = show({ slug: 'sun', weekly: { day: 0, time: '15:00' } })
assert.deepEqual(onStage([announced, past, sunday, { ...juana, slug: 'sat' }], now).map((p) => p.slug), ['sat', 'sun', 'soon'])

console.log('dates ok')
