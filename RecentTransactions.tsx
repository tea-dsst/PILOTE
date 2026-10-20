import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowRight, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { formatEUR, formatShortDate } from '../../lib/format'
import { CATEGORIES, type DemoTransaction } from '../../data/demo'

export function RecentTransactions({ items }: { items: DemoTransaction[] }) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Dernières transactions"
        action={
          <Link
            to="/budget"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      {items.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted">Aucune transaction pour le moment.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line px-5 pb-3 sm:px-6">
          {items.map((t) => {
            const income = t.kind === 'income'
            return (
              <li key={t.id} className="flex items-center gap-3 py-3">
                <span
                  aria-hidden="true"
                  className={`grid size-9 shrink-0 place-items-center rounded-full ${
                    income ? 'bg-brand-50 text-brand-700' : 'bg-canvas text-muted'
                  }`}
                >
                  {income ? <ArrowDownLeft className="size-4" /> : <ArrowUpRight className="size-4" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{t.description}</p>
                  <p className="text-xs text-muted">
                    {formatShortDate(t.date)} · {CATEGORIES[t.categoryId].name}
                  </p>
                </div>
                <p className={`text-sm font-medium tabular-nums ${income ? 'text-brand-700' : ''}`}>
                  {income ? '+' : '−'}
                  {formatEUR(t.amount)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
