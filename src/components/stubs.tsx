import { dateParts } from '@/lib/content'

/** A date as a theatre ticket stub (notched sides, see .stub in globals.css). */
export function DateStub({ iso, time, soldOut }: { iso: string; time?: string; soldOut?: boolean | null }) {
  const { day, month, weekday } = dateParts(iso)
  return (
    <span className={`stub grid w-[4.75rem] shrink-0 place-items-center bg-ink-3 px-2 pt-3 pb-2.5 text-center leading-none ${soldOut ? 'text-mist' : ''}`}>
      <span className="text-xs tracking-[0.15em] text-mist uppercase">{weekday}</span>
      <span className="font-brand my-1.5 text-4xl font-bold tabular-nums">{day}</span>
      <span className="text-xs tracking-[0.15em] text-mist uppercase">{month}</span>
      {time && <span className="mt-2 w-full border-t border-dashed border-paper/25 pt-2 text-sm font-medium">{time}</span>}
      {soldOut && <span className="mt-1.5 text-[0.7rem] font-semibold tracking-wider text-ember uppercase">Agotado</span>}
    </span>
  )
}
