import { daysUntil } from './format'

export type Priority = 'low' | 'medium' | 'high'

export interface PriorityItem {
  key: string
  kind: 'task' | 'deadline'
  title: string
  dueDate: string | null
  priority: Priority
}

const WEIGHT: Record<Priority, number> = { low: 0, medium: 1, high: 3 }

/**
 * Plus le score est bas, plus l'élément est urgent.
 * Score = jours restants − 2 × poids de priorité.
 * Un élément en retard a des jours négatifs et passe donc devant ;
 * sans date limite, il passe après les éléments datés.
 */
export function urgencyScore(item: PriorityItem, today: Date = new Date()): number {
  const days = item.dueDate ? daysUntil(item.dueDate, today) : 999
  return days - 2 * WEIGHT[item.priority]
}

export function sortByUrgency(items: PriorityItem[], today: Date = new Date()): PriorityItem[] {
  return [...items].sort((a, b) => urgencyScore(a, today) - urgencyScore(b, today))
}
