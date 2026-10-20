import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { Card, CardHeader } from '../ui/Card'
import { ProgressBar } from '../ui/ProgressBar'
import { formatEUR, round2 } from '../../lib/format'
import { estimateMonthlySavings } from '../../lib/finance'
import type { DemoGoal } from '../../data/demo'

function estimateText(goal: DemoGoal): string {
  const est = estimateMonthlySavings(goal.target, goal.saved, goal.targetDate)
  switch (est.kind) {
    case 'reached':
      return 'Objectif atteint 🎉'
    case 'no-date':
      return 'Pas de date cible'
    case 'date-passed':
      return `Date dépassée · reste ${formatEUR(est.remaining)}`
    case 'monthly':
      return `≈ ${formatEUR(est.amount)} / mois pendant ${est.months} mois`
  }
}

export function SavingsOverview({ goals }: { goals: DemoGoal[] }) {
  return (
    <Card className="animate-rise">
      <CardHeader
        title="Objectifs d’épargne"
        subtitle="Où tu en es"
        action={
          <Link
            to="/epargne"
            className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 hover:text-brand-900"
          >
            Tout voir <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        }
      />
      {goals.length === 0 ? (
        <p className="px-6 py-10 text-center text-sm text-muted">
          Aucun objectif pour l’instant. Crée-en un pour suivre ta progression.
        </p>
      ) : (
        <ul className="mt-4 grid gap-5 px-5 pb-6 sm:px-6">
          {goals.map((g) => {
            const pct = g.target > 0 ? Math.min(100, Math.round((g.saved / g.target) * 100)) : 0
            return (
              <li key={g.id}>
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-medium">{g.name}</p>
                  <p className="text-sm tabular-nums text-muted">{pct} %</p>
                </div>
                <div className="mt-2">
                  <ProgressBar value={g.saved} max={g.target} label={`Progression : ${g.name}`} />
                </div>
                <p className="mt-1.5 flex flex-wrap justify-between gap-x-3 text-xs text-muted">
                  <span className="tabular-nums">
                    {formatEUR(g.saved)} sur {formatEUR(g.target)} · reste{' '}
                    {formatEUR(Math.max(0, round2(g.target - g.saved)))}
                  </span>
                  <span>{estimateText(g)}</span>
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </Card>
  )
}
