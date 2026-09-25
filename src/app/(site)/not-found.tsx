import { ButtonLink, container, display } from '@/components/ui'

export default function NotFound() {
  return (
    <section className={`${container} pt-40 pb-32 md:pt-52`}>
      <h1 className={`${display} max-w-3xl text-6xl leading-[0.95] md:text-8xl`}>No encontramos esta página</h1>
      <p className="mt-6 max-w-[45ch] text-xl text-mist">Puede que la dirección haya cambiado. Estos enlaces te llevan a lo más buscado.</p>
      <div className="mt-10 flex flex-wrap gap-4">
        <ButtonLink href="/espectaculos">Ver la cartelera</ButtonLink>
        <ButtonLink href="/" variant="outline">
          Ir al inicio
        </ButtonLink>
      </div>
    </section>
  )
}
