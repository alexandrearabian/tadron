import type { Section } from '@/lib/content'
import { Photo } from './Photo'
import { container, display, Rich } from './ui'

/** Renders the "Secciones" array of a Sanity page. */
export function Sections({ sections }: { sections?: Section[] | null }) {
  return sections?.map((section) => {
    switch (section._type) {
      case 'textWithImage': {
        const imageLeft = section.imagePosition === 'left'
        return (
          <section key={section._key} className={`${container} grid items-center gap-10 py-20 md:grid-cols-12 md:gap-16 md:py-28`}>
            {section.image && (
              <div className={`reveal relative aspect-[4/5] md:col-span-6 ${imageLeft ? '' : 'md:order-last'}`}>
                <Photo image={section.image} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            )}
            <div className={section.image ? 'md:col-span-6 lg:col-span-5' : 'md:col-span-8'}>
              {section.heading && <h2 className={`${display} mb-8 text-4xl leading-[1.05] md:text-6xl`}>{section.heading}</h2>}
              <Rich value={section.body} />
            </div>
          </section>
        )
      }
      case 'callout':
        return (
          section.text && (
            <section key={section._key} className="mx-auto w-full max-w-5xl px-5 py-20 md:px-8 md:py-28">
              <div className="mb-10 h-px w-16 bg-crimson" />
              {section.attribution ? (
                <figure className="reveal">
                  <blockquote className={`${display} text-4xl leading-[1.12] md:text-6xl`}>“{section.text}”</blockquote>
                  <figcaption className="mt-8 text-xl text-mist">{section.attribution}</figcaption>
                </figure>
              ) : (
                <p className={`${display} reveal text-4xl leading-[1.12] md:text-6xl`}>{section.text}</p>
              )}
            </section>
          )
        )
      case 'itemList': {
        const items = section.items ?? []
        return (
          items.length > 0 && (
            <section key={section._key} className={`${container} grid gap-10 py-20 md:py-28 lg:grid-cols-12 lg:gap-16`}>
              <div className="lg:col-span-4">
                <div className="lg:sticky lg:top-32">
                  {section.heading && <h2 className={`${display} text-4xl leading-[1.05] md:text-5xl`}>{section.heading}</h2>}
                  {section.intro && <p className="mt-6 max-w-[40ch] text-lg leading-relaxed text-mist">{section.intro}</p>}
                </div>
              </div>
              <ul className="grid content-start gap-x-12 gap-y-8 sm:grid-cols-2 lg:col-span-8">
                {items.map((item) => (
                  <li key={item._key} className="reveal border-l-2 border-crimson pl-5">
                    <p className="text-xl leading-snug">{item.title}</p>
                    {item.detail && <p className="mt-1 text-base text-mist">{item.detail}</p>}
                  </li>
                ))}
              </ul>
            </section>
          )
        )
      }
      case 'gallery': {
        const images = section.images ?? []
        // A large lead image only when the count fills the 3-column grid without gaps
        const lead = images.length % 3 === 0
        return (
          images.length > 0 && (
            <section key={section._key} className={`${container} grid grid-cols-2 gap-3 py-20 md:grid-cols-3 md:gap-4 md:py-28`}>
              {images.map((image, i) => (
                <div
                  key={image.url}
                  className={`reveal relative aspect-[4/3] ${lead && i === 0 ? 'col-span-2 md:row-span-2 md:aspect-auto' : ''}`}
                >
                  <Photo image={image} fill sizes="(min-width: 768px) 33vw, 50vw" className="object-cover" />
                </div>
              ))}
            </section>
          )
        )
      }
      case 'columns': {
        const items = section.items ?? []
        return (
          items.length > 0 && (
            <section
              key={section._key}
              className={`${container} grid gap-12 py-20 md:py-28 ${items.length === 2 ? 'md:grid-cols-2' : 'md:grid-cols-3'}`}
            >
              {items.map((item, i) => (
                <div key={i} className="reveal border-t border-crimson pt-8">
                  {item.heading && <h3 className={`${display} text-3xl`}>{item.heading}</h3>}
                  {item.body && <p className="mt-4 max-w-[40ch] text-lg leading-relaxed text-mist">{item.body}</p>}
                </div>
              ))}
            </section>
          )
        )
      }
    }
  })
}
