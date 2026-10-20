import { useMemo, useState } from 'react'
import { Info, PiggyBank, TrendingDown, TrendingUp, Wallet } from 'lucide-react'
import { PageHeader, Card } from '../components/ui/Card'
import { ProgressBar } from '../components/ui/ProgressBar'
import { StatCard } from '../components/dashboard/StatCard'
import { SpendingChart, type SpendingSlice } from '../components/dashboard/SpendingChart'
import { UpcomingDeadlines } from '../components/dashboard/UpcomingDeadlines'
import { Priorities } from '../components/dashboard/Priorities'
import { SavingsOverview } from '../components/dashboard/SavingsOverview'
import { RecentTransactions } from '../components/dashboard/RecentTransactions'
import { formatEUR, formatLongDate, greeting, parseISODate, round2, sumAmounts } from '../lib/format'
import { sortByUrgency, type PriorityItem } from '../lib/priority'
import {
  CATEGORIES,
  DEMO_DEADLINES,
  DEMO_GOALS,
  DEMO_TASKS,
  DEMO_TRANSACTIONS,
  DEMO_USER,
} from '../data/demo'

export default function Dashboard() {
  const now = useMemo(() => new Date(), [])
  const [doneKeys, setDoneKeys] = useState<Set<string>>(new Set())

  const toggle = (key: string) =>
    setDoneKeys((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const { income, expenses, slices } = useMemo(() => {
    const month = DEMO_TRANSACTIONS.filter(
      (t) => parseISODate(t.date).getMonth() === now.getMonth(),
    )
    const income = sumAmounts(month.filter((t) => t.kind === 'income').map((t) => t.amount))
    const expenseList = month.filter((t) => t.kind === 'expense')
    const expenses = sumAmounts(expenseList.map((t) => t.amount))

    const byCategory = new Map<string, number>()
    for (const t of expenseList) {
      byCategory.set(t.categoryId, round2((byCategory.get(t.categoryId) ?? 0) + t.amount))
    }
    const slices: SpendingSlice[] = [...byCategory.entries()]
      .map(([id, value]) => ({ id, value, name: CATEGORIES[id].name, color: CATEGORIES[id].color }))
      .sort((a, b) => b.value - a.value)
    return { income, expenses, slices }
  }, [now])

  const totalSaved = sumAmounts(DEMO_GOALS.map((g) => g.saved))
  const totalTarget = sumAmounts(DEMO_GOALS.map((g) => g.target))
  const budgetLeft = round2(DEMO_USER.monthlyBudget - expenses)
  const overBudget = budgetLeft < 0

  const priorityItems = useMemo(() => {
    const items: PriorityItem[] = [
      ...DEMO_DEADLINES.filter((d) => d.status !== 'done').map((d) => ({
        key: `deadline-${d.id}`,
        kind: 'deadline' as const,
        title: d.title,
        dueDate: d.dueDate,
        priority: d.priority,
      })),
      ...DEMO_TASKS.map((t) => ({
        key: `task-${t.id}`,
        kind: 'task' as const,
        title: t.title,
        dueDate: t.dueDate,
        priority: t.priority,
      })),
    ]
    return sortByUrgency(items, now).slice(0, 6)
  }, [now])

  const deadlines = [...DEMO_DEADLINES]
    .filter((d) => d.status !== 'done')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
    .slice(0, 4)

  const recent = [...DEMO_TRANSACTIONS].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5)

  const date = formatLongDate(now)

  return (
    <div>
      <PageHeader
        title={`${greeting(now)} ${DEMO_USER.name}`}
        subtitle={`Nous sommes le ${date}. Voici ce qui compte aujourd’hui.`}
      />

      <div
        role="note"
        className="mb-6 flex items-start gap-2.5 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-muted"
      >
        <Info className="mt-0.5 size-4 shrink-0 text-brand-700" aria-hidden="true" />
        <p>
          <strong className="font-medium text-ink">Mode démonstration.</strong> Ces chiffres sont fictifs
          et rien n’est enregistré : cocher une priorité ne change que l’affichage, jusqu’à
          l’actualisation de la page.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          featured
          label="Solde disponible"
          value={formatEUR(DEMO_USER.balance)}
          hint="Saisi manuellement"
          icon={Wallet}
        />
        <StatCard label="Revenus du mois" value={formatEUR(income)} icon={TrendingUp} />
        <StatCard label="Dépenses du mois" value={formatEUR(expenses)} icon={TrendingDown} />
        <StatCard
          label="Épargné"
          value={formatEUR(totalSaved)}
          hint={`sur ${formatEUR(totalTarget)} d’objectifs`}
          icon={PiggyBank}
        />
      </div>

      <Card className="animate-rise mt-4 p-5 sm:p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-display text-lg font-semibold tracking-tight">Budget du mois</h2>
          <p className={`text-sm tabular-nums ${overBudget ? 'font-medium text-danger' : 'text-muted'}`}>
            {overBudget
              ? `Dépassé de ${formatEUR(-budgetLeft)}`
              : `Il te reste ${formatEUR(budgetLeft)}`}
          </p>
        </div>
        <div className="mt-3">
          <ProgressBar
            value={expenses}
            max={DEMO_USER.monthlyBudget}
            label="Part du budget mensuel dépensée"
            tone={overBudget ? 'danger' : expenses / DEMO_USER.monthlyBudget > 0.85 ? 'warn' : 'brand'}
          />
        </div>
        <p className="mt-2 text-xs tabular-nums text-muted">
          {formatEUR(expenses)} dépensés sur {formatEUR(DEMO_USER.monthlyBudget)}
        </p>
      </Card>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <SpendingChart slices={slices} total={expenses} />
        <Priorities items={priorityItems} doneKeys={doneKeys} onToggle={toggle} />
        <UpcomingDeadlines items={deadlines} />
        <SavingsOverview goals={DEMO_GOALS} />
      </div>

      <div className="mt-4">
        <RecentTransactions items={recent} />
      </div>
    </div>
  )
}
