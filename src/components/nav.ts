// URLs kept from the previous site so bookmarks and search results keep working.
export const programNav = [
  { href: '/espectaculos', label: 'Cartelera' },
  { href: '/cursosytalleres', label: 'Cursos y talleres' },
]

export const theatreNav = [
  { href: '/tadron-es-teatro', label: 'Tadrón es teatro' },
  { href: '/nuestro-espacio', label: 'Nuestro espacio' },
  { href: '/programa-tu-espectaculo', label: 'Programá tu espectáculo' },
  { href: '/ciclo-teatro-justicia', label: 'Ciclo Teatro x la Justicia' },
  { href: '/gaston-breyer', label: 'Gastón Breyer' },
]

export const contactNav = { href: '/contacto', label: 'Contacto' }

/** Web links open in a new tab. Email (mailto:) and phone links must not: the browser hands them
 * to the visitor's mail/phone app, which opens a new message ready to send. */
export const newTabProps = (href: string) => (/^https?:/.test(href) ? { target: '_blank', rel: 'noopener noreferrer' } : {})

export const mapsHref = (address: string) =>
  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`
