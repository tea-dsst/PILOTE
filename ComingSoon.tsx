import { Hammer } from 'lucide-react'
import { Card, PageHeader } from '../components/ui/Card'

export default function ComingSoon({
  title,
  description,
  notBuilt = true,
}: {
  title: string
  description: string
  notBuilt?: boolean
}) {
  return (
    <div className="animate-rise">
      <PageHeader title={title} subtitle={description} />
      <Card className="flex flex-col items-center px-6 py-16 text-center">
        <span className="grid size-12 place-items-center rounded-2xl bg-brand-50 text-brand-700">
          <Hammer className="size-6" aria-hidden="true" />
        </span>
        <h2 className="mt-4 font-display text-xl font-semibold">
          {notBuilt ? 'Ce module n’est pas encore construit' : 'Rien à voir ici'}
        </h2>
        <p className="mt-2 max-w-md text-sm text-muted">
          {notBuilt
            ? 'Il sera développé à l’étape 4, une fois la base de données branchée. Rien ne peut encore être enregistré sur cette page.'
            : 'Utilise le menu pour revenir à une page existante.'}
        </p>
      </Card>
    </div>
  )
}
