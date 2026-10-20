import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Card, CardHeader } from '../ui/Card'
import { daysUntil, formatShortDate } from '../../lib/format'
import type { PriorityItem } from '../../lib/priority'

const PRIORITY_LABEL = { high: 'Haute', medium: 'Moyenne', low: 'Basse' } as const

export function Priorities({
  items,
  doneKeys,
  onToggle,
}: {
  items: PriorityItem[]
  doneKeys: Set<string>
  onToggle: (key: string) => void
}) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Mes priorités"
        subtitle="Classées par date limite et importance"
        action={
          <Link
            to="/taches"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted">
          Tout est à jour. Rien d’urgent pour le moment.
        </p>
      ) : (
        <ul className="mt-3 divide-y divide-line px-5 pb-3 sm:px-6">
          {items.map((item) => {
            const done = doneKeys.has(item.key)
            const days = item.dueDate ? daysUntil(item.dueDate) : null
            const late = days !== null && days < 0 && !done
            return (
              <li key={item.key} className="flex items-center gap-3 py-3">
                <input
                  type="checkbox"
                  checked={done}
                  onChange={() => onToggle(item.key)}
                  aria-label={`Marquer « ${item.title} » comme terminé`}
                  className="size-5 shrink-0 cursor-pointer rounded-md border-line accent-brand-700"
                />
                <div className="min-w-0 flex-1">
                  <p className={`truncate text-sm font-medium ${done ? 'text-muted line-through' : ''}`}>
                    {item.title}
                  </p>
                  <p className={`text-xs ${late ? 'text-danger' : 'text-muted'}`}>
                    {item.kind === 'deadline' ? 'Échéance' : 'Tâche'}
                    {item.dueDate
                      ? ` · ${late ? 'en retard depuis le' : 'pour le'} ${formatShortDate(item.dueDate)}`
                      : ' · sans date limite'}
                  </p>
                </div>
                <Badge tone={item.priority === 'high' ? 'danger' : item.priority === 'medium' ? 'warn' : 'neutral'}>
                  {PRIORITY_LABEL[item.priority]}
                </Badge>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
