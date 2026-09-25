import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/Toast'
import type { Metadata } from 'next'
import { getHome, getSettings, shareImage } from '@/lib/content'

// Link previews (WhatsApp, Facebook…): "Imagen para redes sociales" from Ajustes del sitio,
// or the first photo on the home page if that's empty. Show pages set their own image.
export async function generateMetadata(): Promise<Metadata> {
  const [settings, home] = await Promise.all([getSettings(), getHome()])
  const homePhoto = home.sections?.flatMap((s) => (s._type === 'textWithImage' && s.image ? [s.image.url] : []))[0]
  const image = settings.ogImage ?? homePhoto
  return {
    ...(settings.description && { description: settings.description }),
    openGraph: { siteName: 'Tadrón Teatro', locale: 'es_AR', type: 'website', ...(image && { images: [shareImage(image)] }) },
  }
}

// Public site chrome. /studio sits outside this group so Sanity Studio stays full-screen.
export default async function SiteLayout({ children }: LayoutProps<'/'>) {
  const settings = await getSettings()
  return (
    <>
      <a
        href="#contenido"
        className="sr-only z-50 rounded-full bg-paper px-5 py-3 text-ink focus:not-sr-only focus:fixed focus:top-4 focus:left-4"
      >
        Saltar al contenido
      </a>
      <Header address={settings.address} phone={settings.phone} />
      <main id="contenido" className="flex-1">
        {children}
      </main>
      <Footer settings={settings} />
      <Toaster />
      <div aria-hidden className="grain" />
    </>
  )
}
