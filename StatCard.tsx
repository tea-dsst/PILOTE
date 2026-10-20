import type { LucideIcon } from 'lucide-react'
import { Card } from '../ui/Card'

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  featured = false,
}: {
  label: string
  value: string
  hint?: string
  icon: LucideIcon
  featured?: boolean
}) {
  return (
    <Card
      className={`animate-rise p-5 ${featured ? 'border-brand-800 bg-brand-800 text-canvas' : ''}`}
    >
      <div className="flex items-center justify-between">
        <p className={`text-sm font-medium ${featured ? 'text-brand-100' : 'text-muted'}`}>{label}</p>
        <span
          aria-hidden="true"
          className={`grid size-8 place-items-center rounded-lg ${
            featured ? 'bg-brand-700 text-canvas' : 'bg-brand-50 text-brand-700'
          }`}
        >
          <Icon className="size-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tracking-tight tabular-nums">{value}</p>
      {hint && <p className={`mt-1 text-xs ${featured ? 'text-brand-200' : 'text-muted'}`}>{hint}</p>}
    </Card>
  )
}
