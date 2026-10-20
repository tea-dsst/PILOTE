export type ProgressTone = 'brand' | 'warn' | 'danger'

const FILL: Record<ProgressTone, string> = {
  brand: 'bg-brand-600',
  warn: 'bg-warn',
  danger: 'bg-danger',
}

export function ProgressBar({
  value,
  max,
  label,
  tone = 'brand',
}: {
  value: number
  max: number
  label: string
  tone?: ProgressTone
}) {
  const pct = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      className="h-2 w-full overflow-hidden rounded-full bg-brand-100"
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ${FILL[tone]}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
