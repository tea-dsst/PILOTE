const eur = new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' })

/** 1234.5 → « 1 234,50 € » */
export function formatEUR(amount: number): string {
  return eur.format(amount)
}

/** Arrondit au centime pour éviter les dérives de calcul flottant. */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100
}

export function sumAmounts(values: number[]): number {
  return round2(values.reduce((total, v) => total + v, 0))
}

/** « 2026-10-19 » → Date locale (évite le décalage UTC de new Date('2026-10-19')). */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function toISODate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

const shortDate = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' })
const longDate = new Intl.DateTimeFormat('fr-FR', {
  weekday: 'long',
  day: 'numeric',
  month: 'long',
})

/** « 2026-10-19 » → « 19 oct. » */
export function formatShortDate(iso: string): string {
  return shortDate.format(parseISODate(iso))
}

/** Date du jour en toutes lettres : « lundi 19 octobre ». */
export function formatLongDate(date: Date): string {
  return longDate.format(date)
}

/** Nombre de jours entre aujourd'hui et la date donnée (négatif si dépassée). */
export function daysUntil(iso: string, today: Date = new Date()): number {
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const target = parseISODate(iso)
  return Math.round((target.getTime() - start.getTime()) / 86_400_000)
}

export function greeting(date: Date = new Date()): string {
  const hour = date.getHours()
  if (hour < 5) return 'Bonsoir'
  if (hour < 18) return 'Bonjour'
  return 'Bonsoir'
}
