# PILOTE — Architecture (étape 1)

*Ta vie, mieux organisée.*

Ce document décrit les choix techniques de PILOTE, l'organisation du code, le modèle de données et la sécurité. Il sert de référence pour les étapes suivantes.

## 1. Besoin en une phrase

PILOTE permet à un particulier français de répondre à « Qu'est-ce que je dois gérer aujourd'hui, ce mois-ci et dans les prochains mois ? » en regroupant budget, échéances, contrats, documents, épargne et tâches dans un seul espace.

## 2. Périmètre de la version 1

**Inclus** : comptes utilisateurs, budget saisi manuellement, échéances, contrats et abonnements, documents (stockage privé), objectifs d'épargne, tâches, recherche globale, interface responsive en français.

**Exclu volontairement** : connexion bancaire, notifications réelles (e-mail ou push), résiliation automatique de contrats, import de fichiers bancaires (envisageable plus tard).

## 3. Stack

| Besoin | Choix | Remarque |
|---|---|---|
| Interface | React 19 + TypeScript | Typage strict pour limiter les bugs |
| Build | Vite | Démarrage rapide, déploiement simple |
| Style | Tailwind CSS v4 | Design tokens définis dans `src/index.css` |
| Icônes | lucide-react | Jeu d'icônes cohérent |
| Graphiques | Recharts | Se met à jour automatiquement avec les données |
| Navigation | React Router | Routes par module |
| Backend | Supabase | Auth, PostgreSQL, stockage privé |
| Hébergement | Netlify ou Vercel | Site statique, aucune clé secrète côté client |

Aucun changement de stack par rapport à ta demande n'est proposé.

## 4. Arborescence

```
pilote/
├── docs/ARCHITECTURE.md          ← ce document
├── supabase/migrations/          ← migrations SQL versionnées
│   └── 20261019000001_initial_schema.sql
├── src/
│   ├── main.tsx                  ← point d'entrée
│   ├── App.tsx                   ← routes
│   ├── index.css                 ← design tokens + styles de base
│   ├── components/
│   │   ├── layout/               ← barre latérale, navigation mobile, en-tête
│   │   ├── ui/                   ← composants réutilisables (Card, Badge, ProgressBar…)
│   │   └── dashboard/            ← blocs du tableau de bord
│   ├── pages/                    ← une page par module
│   ├── lib/                      ← formats FR, calculs financiers purs
│   └── data/                     ← données de démonstration (étape 2 uniquement)
└── .env.example                  ← variables à renseigner (étape 3)
```

Les calculs (épargne mensuelle nécessaire, coût annuel d'un contrat, totaux du mois) vivent dans `src/lib/` sous forme de fonctions pures, faciles à tester.

## 5. Pages

1. **Tableau de bord** : accueil, solde, revenus/dépenses, graphique, échéances, priorités, épargne.
2. **Budget** : transactions, catégories, limites, comparaison mensuelle.
3. **Échéances** : liste, retards signalés, récurrence.
4. **Contrats et abonnements** : coût mensuel et annuel estimés, prochains renouvellements.
5. **Documents** : import, classement, expiration.
6. **Épargne** : objectifs et progression.
7. **Tâches** : filtres aujourd'hui / semaine / retard / terminées.
8. **Paramètres** : profil, préférences, suppression du compte.

Chaque page aura ses états de chargement, d'erreur et vide, et une confirmation pour les actions destructrices.

## 6. Modèle de données

Détaillé dans `supabase/migrations/20261019000001_initial_schema.sql`.

- `profiles` : un profil par utilisateur (nom, solde saisi, budget mensuel global).
- `categories` : catégories par défaut créées à l'inscription, plus celles de l'utilisateur.
- `transactions` : revenu ou dépense, montant strictement positif, date, catégorie.
- `budgets` : limite mensuelle par catégorie.
- `contracts` : prix, fréquence (mensuelle, trimestrielle, annuelle), dates de renouvellement et de résiliation.
- `deadlines` : statut, priorité, récurrence, lien facultatif vers un contrat.
- `documents` : métadonnées ; le fichier est dans le bucket privé `documents`.
- `savings_goals` : montant cible, montant épargné, date cible facultative.
- `tasks` : liens facultatifs vers contrat, document, échéance.

Points de conception :

- Les montants sont en `numeric(12,2)`, jamais en nombre flottant.
- Les statuts, priorités et fréquences sont limités par des contraintes `CHECK`.
- Les liens entre tables utilisent des clés étrangères composites `(id, user_id)` : il est impossible de rattacher, par exemple, une tâche à un contrat appartenant à quelqu'un d'autre.
- Supprimer un utilisateur supprime ses données (`ON DELETE CASCADE`). Supprimer un contrat ou une catégorie détache les éléments liés au lieu de les effacer.

## 7. Sécurité

- **RLS activée sur toutes les tables** : chaque politique compare `user_id` à `auth.uid()`. Changer un identifiant dans une requête ne donne accès à rien.
- **Rôle `anon`** : aucun droit sur les tables.
- **Stockage** : bucket `documents` privé, 10 Mo maximum, types limités (PDF, JPEG, PNG, WebP, HEIC), fichiers rangés dans `<user_id>/…` avec des politiques sur ce préfixe. L'accès se fait par URL signée de courte durée.
- **Clés** : seule la clé publique (anon/publishable) est utilisée dans le navigateur. La clé `service_role` ne doit jamais apparaître dans le code client.
- **Suppression du compte** : elle nécessite un droit privilégié, donc une fonction serveur (Supabase Edge Function). Elle sera réalisée à l'étape 3 ; d'ici là, le bouton ne sera pas présenté comme fonctionnel.

**Limites à connaître** : cette configuration protège l'isolation entre utilisateurs, mais elle ne constitue pas une certification de sécurité ni une garantie de conformité RGPD. Avant toute mise en production publique, il faudra une politique de confidentialité, des mentions légales et une revue du traitement des données financières. Les données ne sont pas chiffrées de bout en bout : l'hébergeur peut techniquement y accéder.

## 8. Services à configurer (par toi)

| Service | Quand | Pourquoi |
|---|---|---|
| Compte Supabase + projet | Étape 3 | Auth, base, stockage |
| Compte Netlify ou Vercel | Étape 5 | Mise en ligne |
| Compte GitHub (facultatif) | Étape 5 | Déploiement automatique |
| Service d'e-mail (SMTP) | Avant la production | Supabase limite fortement l'envoi par défaut ; utile pour la réinitialisation du mot de passe |

## 9. Feuille de route

1. **Conception** : ce document et la migration SQL (faits, non encore testés sur une vraie base).
2. **Interface** : design system et tableau de bord avec données de démonstration.
3. **Backend** : projet Supabase, migration appliquée, authentification, branchement des pages.
4. **Fonctionnalités** : modules un par un, avec recherche et filtres.
5. **Tests et déploiement** : tests d'autorisation entre deux comptes, mise en ligne.
