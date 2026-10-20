import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

/** Page ouverte depuis le lien reçu par e-mail : Supabase connecte l'utilisateur, il choisit son nouveau mot de passe. */
export default function NewPassword() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setBusy(true)
    const { error } = await supabase.auth.updateUser({ password })
    setBusy(false)
    if (error) {
      setError('Impossible de changer le mot de passe. Le lien a peut-être expiré : demande-en un nouveau.')
      return
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6 shadow-card">
        <h1 className="font-display text-xl font-semibold">Nouveau mot de passe</h1>
        {loading ? (
          <p role="status" className="mt-4 text-sm text-muted">Vérification du lien…</p>
        ) : !user ? (
          <div className="mt-4 text-sm text-muted">
            <p>Ce lien n’est plus valide.</p>
            <Link to="/connexion" className="mt-3 inline-block font-medium text-brand-700">Retour à la connexion</Link>
          </div>
        ) : (
          <form onSubmit={onSubmit} noValidate>
            {error && (
              <p role="alert" className="mt-4 rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">{error}</p>
            )}
            <label htmlFor="np" className="mt-5 block text-sm font-medium">
              Nouveau mot de passe
              <input
                id="np"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-600"
              />
            </label>
            <button
              type="submit"
              disabled={busy}
              className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-canvas hover:bg-brand-800 disabled:opacity-60"
            >
              {busy ? 'Un instant…' : 'Enregistrer'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
