// schema.org data, so search engines know this is a theatre (Google Maps / local results)
// and list each performance as an event (Google's event listings).
import { byline, SITE_URL, upcoming, type Production, type Settings } from './content'

const THEATRE_ID = `${SITE_URL}/#teatro`

function address(settings: Settings) {
  return {
    '@type': 'PostalAddress',
    streetAddress: settings.address?.split(',')[0] ?? 'Cnel. Niceto Vega 4802',
    addressLocality: 'Ciudad Autónoma de Buenos Aires',
    addressCountry: 'AR',
  }
}

export function theatre(settings: Settings, image?: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'PerformingArtsTheater',
    '@id': THEATRE_ID,
    name: 'Tadrón Teatro',
    url: SITE_URL,
    logo: `${SITE_URL}/android-chrome-512x512.png`,
    ...(image && { image }),
    ...(settings.description && { description: settings.description }),
    ...(settings.phone && { telephone: settings.phone }),
    ...(settings.email && { email: settings.email }),
    address: address(settings),
    sameAs: [settings.instagram, settings.facebook, settings.youtube].filter(Boolean),
  }
}

/** One TheaterEvent per upcoming performance of a show. */
export function showEvents(p: Production, settings: Settings) {
  return upcoming([p])
    .slice(0, 12)
    .map((d) => ({
      '@context': 'https://schema.org',
      '@type': 'TheaterEvent',
      name: p.title,
      startDate: d.dateTime,
      url: `${SITE_URL}/espectaculos/${p.slug}`,
      image: [p.poster.url],
      ...(byline(p) && { description: byline(p) }),
      eventStatus: 'https://schema.org/EventScheduled',
      eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
      location: { '@type': 'PerformingArtsTheater', '@id': THEATRE_ID, name: 'Tadrón Teatro', address: address(settings) },
      organizer: { '@type': 'Organization', name: 'Tadrón Teatro', url: SITE_URL },
      ...(p.director && { director: { '@type': 'Person', name: p.director } }),
      ...(p.ticketUrl && {
        offers: {
          '@type': 'Offer',
          url: p.ticketUrl,
          availability: d.soldOut ? 'https://schema.org/SoldOut' : 'https://schema.org/InStock',
        },
      }),
    }))
}
