import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import { Card, CardHeader } from '../ui/Card'
import { formatEUR } from '../../lib/format'

export interface SpendingSlice {
  id: string
  name: string
  color: string
  value: number
}

export function SpendingChart({ slices, total }: { slices: SpendingSlice[]; total: number }) {
  return (
    <Card className="animate-rise">
      <CardHeader title="Dépenses du mois" subtitle="Répartition par catégorie" />
      {slices.length === 0 ? (
        <p className="px-6 py-12 text-center text-sm text-muted">
          Aucune dépense ce mois-ci. Ajoute ta première transaction pour voir la répartition.
        </p>
      ) : (
        <div className="grid items-center gap-4 p-5 sm:grid-cols-[220px_1fr] sm:p-6">
          <div
            className="relative mx-auto size-[200px]"
            role="img"
            aria-label={`Dépenses du mois : ${formatEUR(total)} au total, réparties en ${slices.length} catégories`}
          >
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={66}
                  outerRadius={96}
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {slices.map((s) => (
                    <Cell key={s.id} fill={s.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xs text-muted">Total</p>
                <p className="font-display text-xl font-semibold tabular-nums">{formatEUR(total)}</p>
              </div>
            </div>
          </div>
          <ul className="grid gap-2 text-sm">
            {slices.map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3">
                <span className="flex min-w-0 items-center gap-2">
                  <span
                    aria-hidden="true"
                    className="size-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: s.color }}
                  />
                  <span className="truncate">{s.name}</span>
                </span>
                <span className="tabular-nums text-muted">
                  {formatEUR(s.value)} · {Math.round((s.value / total) * 100)} %
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}
