import { ButtonLink, container, display } from '@/components/ui'

export default function NotFound() {
  return (
    <section className={`${container} pt-32 pb-24 md:pt-48`}>
      <h1 className={`${display} max-w-3xl text-display-1`}>No encontramos esta página</h1>
      <p className="mt-6 max-w-[45ch] text-lg text-mist md:text-xl">Puede que la dirección haya cambiado. Estos enlaces te llevan a lo más buscado.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ButtonLink href="/espectaculos">Ver la cartelera</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Ir al inicio
        </ButtonLink>
      </div>
    </section>
  )
}
