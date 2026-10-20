/**
 * DONNÉES DE DÉMONSTRATION — fictives, uniquement pour l'étape 2 (interface).
 * Elles seront remplacées par les vraies données Supabase à l'étape 3.
 * Les dates sont calculées par rapport à aujourd'hui pour que la démo reste crédible.
 */
import { toISODate } from '../lib/format'
import type { Priority } from '../lib/priority'

const today = new Date()

function inDays(n: number): string {
  return toISODate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + n))
}

function inMonths(n: number): string {
  return toISODate(new Date(today.getFullYear(), today.getMonth() + n, today.getDate()))
}

/** Un jour du mois courant, sans jamais dépasser aujourd'hui. */
function dayOfThisMonth(day: number): string {
  return toISODate(new Date(today.getFullYear(), today.getMonth(), Math.min(day, today.getDate())))
}

export const DEMO_USER = { name: 'Camille', balance: 1243.6, monthlyBudget: 1400 }

export const CATEGORIES: Record<string, { name: string; color: string }> = {
  housing: { name: 'Logement', color: '#2F5D4B' },
  food: { name: 'Alimentation', color: '#7FA38F' },
  transport: { name: 'Transport', color: '#C08A4B' },
  car: { name: 'Voiture', color: '#8C6F56' },
  health: { name: 'Santé', color: '#B4655A' },
  subscriptions: { name: 'Abonnements', color: '#5B7F95' },
  leisure: { name: 'Loisirs', color: '#A68BB0' },
  shopping: { name: 'Shopping', color: '#D1A24C' },
  insurance: { name: 'Assurances', color: '#4F7A6B' },
  studies: { name: 'Études', color: '#6C84B0' },
  salary: { name: 'Salaire', color: '#2F5D4B' },
}

export interface DemoTransaction {
  id: string
  kind: 'income' | 'expense'
  amount: number
  date: string
  description: string
  categoryId: keyof typeof CATEGORIES
}

export const DEMO_TRANSACTIONS: DemoTransaction[] = [
  { id: 't1', kind: 'income', amount: 1850, date: dayOfThisMonth(1), description: 'Salaire', categoryId: 'salary' },
  { id: 't2', kind: 'expense', amount: 620, date: dayOfThisMonth(1), description: 'Loyer', categoryId: 'housing' },
  { id: 't3', kind: 'expense', amount: 90.8, date: dayOfThisMonth(2), description: 'Abonnement transports', categoryId: 'transport' },
  { id: 't4', kind: 'expense', amount: 84.3, date: dayOfThisMonth(3), description: 'Courses', categoryId: 'food' },
  { id: 't5', kind: 'expense', amount: 38.4, date: dayOfThisMonth(4), description: 'Assurance auto', categoryId: 'insurance' },
  { id: 't6', kind: 'expense', amount: 13.49, date: dayOfThisMonth(5), description: 'Streaming vidéo', categoryId: 'subscriptions' },
  { id: 't7', kind: 'expense', amount: 10.99, date: dayOfThisMonth(5), description: 'Streaming musique', categoryId: 'subscriptions' },
  { id: 't8', kind: 'expense', amount: 36, date: dayOfThisMonth(7), description: 'Restaurant', categoryId: 'leisure' },
  { id: 't9', kind: 'expense', amount: 54, date: dayOfThisMonth(8), description: 'Carburant', categoryId: 'car' },
  { id: 't10', kind: 'expense', amount: 62.15, date: dayOfThisMonth(10), description: 'Courses', categoryId: 'food' },
  { id: 't11', kind: 'expense', amount: 18.6, date: dayOfThisMonth(11), description: 'Pharmacie', categoryId: 'health' },
  { id: 't12', kind: 'expense', amount: 59.9, date: dayOfThisMonth(13), description: 'Vêtements', categoryId: 'shopping' },
  { id: 't13', kind: 'expense', amount: 29, date: dayOfThisMonth(14), description: 'Cours en ligne', categoryId: 'studies' },
  { id: 't14', kind: 'expense', amount: 47.8, date: dayOfThisMonth(16), description: 'Courses', categoryId: 'food' },
  { id: 't15', kind: 'expense', amount: 24, date: dayOfThisMonth(17), description: 'Cinéma', categoryId: 'leisure' },
]

export type DemoStatus = 'todo' | 'in_progress' | 'done'

export interface DemoDeadline {
  id: string
  title: string
  dueDate: string
  amount: number | null
  priority: Priority
  status: DemoStatus
  categoryLabel: string
}

export const DEMO_DEADLINES: DemoDeadline[] = [
  { id: 'd1', title: 'Assurance habitation', dueDate: inDays(-2), amount: 186, priority: 'high', status: 'todo', categoryLabel: 'Assurances' },
  { id: 'd2', title: 'Facture d’électricité', dueDate: inDays(3), amount: 62.4, priority: 'medium', status: 'todo', categoryLabel: 'Logement' },
  { id: 'd3', title: 'Contrôle technique', dueDate: inDays(6), amount: 78, priority: 'high', status: 'in_progress', categoryLabel: 'Voiture' },
  { id: 'd4', title: 'Renouvellement de la mutuelle', dueDate: inDays(14), amount: null, priority: 'medium', status: 'todo', categoryLabel: 'Santé' },
  { id: 'd5', title: 'Préavis de résiliation de la box', dueDate: inDays(21), amount: null, priority: 'low', status: 'todo', categoryLabel: 'Abonnements' },
]

export interface DemoTask {
  id: string
  title: string
  dueDate: string | null
  priority: Priority
  done: boolean
}

export const DEMO_TASKS: DemoTask[] = [
  { id: 'k1', title: 'Mettre à jour mon RIB chez l’employeur', dueDate: inDays(-1), priority: 'high', done: false },
  { id: 'k2', title: 'Envoyer l’attestation de loyer à l’assurance', dueDate: inDays(1), priority: 'high', done: false },
  { id: 'k3', title: 'Prendre rendez-vous pour le contrôle technique', dueDate: inDays(2), priority: 'medium', done: false },
  { id: 'k4', title: 'Comparer les offres d’électricité', dueDate: inDays(9), priority: 'low', done: false },
  { id: 'k5', title: 'Scanner le dernier avis d’imposition', dueDate: null, priority: 'low', done: false },
]

export interface DemoGoal {
  id: string
  name: string
  target: number
  saved: number
  targetDate: string | null
}

export const DEMO_GOALS: DemoGoal[] = [
  { id: 'g1', name: 'Voyage au Japon', target: 3200, saved: 1450, targetDate: inMonths(8) },
  { id: 'g2', name: 'Permis de conduire', target: 1800, saved: 600, targetDate: inMonths(5) },
  { id: 'g3', name: 'Fonds d’urgence', target: 3000, saved: 1800, targetDate: null },
]
