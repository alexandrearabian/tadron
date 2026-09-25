import { Footer } from '@/components/Footer'
import { Header } from '@/components/Header'
import { Toaster } from '@/components/Toast'
import { getSettings } from '@/lib/content'

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
