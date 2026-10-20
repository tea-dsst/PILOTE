import { daysUntil, round2 } from './format'

export type SavingsEstimate =
  | { kind: 'reached' }
  | { kind: 'no-date' }
  | { kind: 'date-passed'; remaining: number }
  | { kind: 'monthly'; amount: number; months: number }

/**
 * Épargne mensuelle nécessaire pour atteindre un objectif à la date cible.
 *
 * Cas particuliers :
 * - objectif déjà atteint ou dépassé → rien à épargner ;
 * - pas de date cible → pas d'estimation ;
 * - date cible dépassée ou aujourd'hui → pas de calcul mensuel possible ;
 * - moins d'un mois restant → on compte un mois entier (pas de division par 0) ;
 * - le résultat est arrondi au centime supérieur pour ne pas rester en dessous.
 */
export function estimateMonthlySavings(
  target: number,
  saved: number,
  targetDate: string | null,
  today: Date = new Date(),
): SavingsEstimate {
  const remaining = round2(target - saved)
  if (remaining <= 0) return { kind: 'reached' }
  if (!targetDate) return { kind: 'no-date' }

  const days = daysUntil(targetDate, today)
  if (days <= 0) return { kind: 'date-passed', remaining }

  const months = Math.max(1, Math.ceil(days / 30.4375))
  return { kind: 'monthly', amount: Math.ceil((remaining * 100) / months) / 100, months }
}
