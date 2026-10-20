import { Link } from 'react-router-dom'
import { ArrowRight, CalendarClock } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card, CardHeader } from '../ui/Card'
import { daysUntil, formatEUR, formatShortDate } from '../../lib/format'
import type { DemoDeadline } from '../../data/demo'

function dueLabel(days: number): { text: string; tone: 'danger' | 'warn' | 'neutral' } {
  if (days < 0) return { text: `En retard de ${-days} j`, tone: 'danger' }
  if (days === 0) return { text: 'Aujourd’hui', tone: 'warn' }
  if (days === 1) return { text: 'Demain', tone: 'warn' }
  if (days <= 7) return { text: `Dans ${days} j`, tone: 'warn' }
  return { text: `Dans ${days} j`, tone: 'neutral' }
}

export function UpcomingDeadlines({ items }: { items: DemoDeadline[] }) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Prochaines échéances"
        subtitle="Les retards apparaissent en premier"
        action={
          <Link
            to="/echeances"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted">
          Aucune échéance à venir. Profite-en !
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line px-5 pb-3 sm:px-6">
          {items.map((d) => {
            const due = dueLabel(daysUntil(d.dueDate))
            return (
              <li key={d.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-700"
                >
                  <CalendarClock className="size-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{d.title}</p>
                  <p className="text-xs text-muted">
                    {formatShortDate(d.dueDate)} · {d.categoryLabel}
                    {d.amount !== null && ` · ${formatEUR(d.amount)}`}
                  </p>
                </div>
                <Badge tone={due.tone}>{due.text}</Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
