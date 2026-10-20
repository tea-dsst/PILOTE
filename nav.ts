import {
  CalendarClock,
  FileText,
  LayoutDashboard,
  ListChecks,
  PiggyBank,
  Repeat,
  Settings,
  Wallet,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  to: string
  label: string
  description: string
  icon: LucideIcon
  /** Affiché directement dans la barre du bas sur mobile et tablette. */
  primary?: boolean
}

export const NAV_ITEMS: NavItem[] = [
  {
    to: '/',
    label: 'Tableau de bord',
    description: 'Ta vue d’ensemble : argent, échéances et priorités.',
    icon: LayoutDashboard,
    primary: true,
  },
  {
    to: '/budget',
    label: 'Budget',
    description: 'Suis tes revenus et tes dépenses, fixe des limites par catégorie.',
    icon: Wallet,
    primary: true,
  },
  {
    to: '/echeances',
    label: 'Échéances',
    description: 'Assurances, factures, renouvellements : ne rate plus aucune date.',
    icon: CalendarClock,
    primary: true,
  },
  {
    to: '/contrats',
    label: 'Contrats',
    description: 'Centralise tes contrats et abonnements, avec leur coût mensuel et annuel.',
    icon: Repeat,
  },
  {
    to: '/documents',
    label: 'Documents',
    description: 'Classe tes documents administratifs dans un espace privé.',
    icon: FileText,
  },
  {
    to: '/epargne',
    label: 'Épargne',
    description: 'Crée des objectifs et suis ta progression.',
    icon: PiggyBank,
  },
  {
    to: '/taches',
    label: 'Tâches',
    description: 'Tes démarches à faire, triées par date limite et priorité.',
    icon: ListChecks,
    primary: true,
  },
  {
    to: '/parametres',
    label: 'Paramètres',
    description: 'Profil, préférences et gestion de ton compte.',
    icon: Settings,
  },
]
