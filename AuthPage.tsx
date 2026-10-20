import { useState, type FormEvent } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { supabase, isSupabaseConfigured } from '../lib/supabase'
import { useAuth } from '../auth/AuthContext'

type Mode = 'login' | 'signup' | 'forgot'

const TITLES: Record<Mode, string> = {
  login: 'Content de te revoir',
  signup: 'Crée ton compte',
  forgot: 'Mot de passe oublié',
}

/** Traduit les erreurs Supabase les plus courantes en messages clairs. */
function friendlyError(message: string): string {
  const m = message.toLowerCase()
  if (m.includes('invalid login credentials')) return 'E-mail ou mot de passe incorrect.'
  if (m.includes('email not confirmed')) return 'Confirme ton adresse e-mail avant de te connecter (vérifie ta boîte de réception).'
  if (m.includes('already registered')) return 'Un compte existe déjà avec cette adresse e-mail.'
  if (m.includes('rate limit') || m.includes('too many')) return 'Trop de tentatives. Réessaie dans quelques minutes.'
  if (m.includes('password should be')) return 'Le mot de passe est trop faible : utilise au moins 8 caractères.'
  if (m.includes('failed to fetch') || m.includes('network')) return 'Connexion impossible. Vérifie ta connexion internet.'
  return 'Une erreur est survenue. Réessaie dans un instant.'
}

export default function AuthPage() {
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = (location.state as { from?: string } | null)?.from ?? '/'

  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [info, setInfo] = useState<string | null>(null)

  if (!loading && user) return <Navigate to={from} replace />

  const switchMode = (next: Mode) => {
    setMode(next)
    setError(null)
    setInfo(null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setInfo(null)

    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Saisis une adresse e-mail valide.')
      return
    }
    if (mode !== 'forgot' && password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    setBusy(true)
    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
        if (error) throw error
        navigate(from, { replace: true })
      } else if (mode === 'signup') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: { emailRedirectTo: window.location.origin },
        })
        if (error) throw error
        if (!data.session) {
          setInfo('Compte créé. Ouvre l’e-mail que nous t’avons envoyé pour confirmer ton adresse, puis connecte-toi.')
          setMode('login')
          setPassword('')
        }
      } else {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: `${window.location.origin}/nouveau-mot-de-passe`,
        })
        if (error) throw error
        setInfo('Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d’être envoyé.')
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : String(err)))
    } finally {
      setBusy(false)
    }
  }

  const input =
    'mt-1.5 w-full rounded-xl border border-line bg-surface px-3.5 py-2.5 text-sm outline-none focus:border-brand-600'

  return (
    <div className="grid min-h-dvh place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <p className="font-display text-2xl font-semibold tracking-wide">PILOTE</p>
          <p className="mt-1 text-sm text-muted">Ta vie, mieux organisée.</p>
        </div>

        <form onSubmit={onSubmit} noValidate className="rounded-2xl border border-line bg-surface p-6 shadow-card">
          <h1 className="font-display text-xl font-semibold">{TITLES[mode]}</h1>

          {!isSupabaseConfigured && (
            <p role="alert" className="mt-4 rounded-xl bg-warn-bg px-3 py-2 text-sm text-warn">
              Supabase n’est pas configuré : le fichier .env.local est absent ou incomplet.
            </p>
          )}
          {error && (
            <p role="alert" className="mt-4 rounded-xl bg-danger-bg px-3 py-2 text-sm text-danger">
              {error}
            </p>
          )}
          {info && (
            <p role="status" className="mt-4 rounded-xl bg-brand-50 px-3 py-2 text-sm text-brand-800">
              {info}
            </p>
          )}

          <label htmlFor="email" className="mt-5 block text-sm font-medium">
            Adresse e-mail
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>

          {mode !== 'forgot' && (
            <label htmlFor="password" className="mt-4 block text-sm font-medium">
              Mot de passe
              <input
                id="password"
                type="password"
                autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={input}
              />
              {mode === 'signup' && <span className="mt-1 block text-xs font-normal text-muted">8 caractères minimum.</span>}
            </label>
          )}

          <button
            type="submit"
            disabled={busy || !isSupabaseConfigured}
            className="mt-6 w-full rounded-xl bg-brand-700 px-4 py-2.5 text-sm font-medium text-canvas transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {busy
              ? 'Un instant…'
              : mode === 'login'
                ? 'Se connecter'
                : mode === 'signup'
                  ? 'Créer mon compte'
                  : 'Envoyer le lien'}
          </button>

          <div className="mt-5 flex flex-col items-center gap-2 text-sm text-muted">
            {mode === 'login' && (
              <>
                <button type="button" onClick={() => switchMode('forgot')} className="hover:text-ink">
                  Mot de passe oublié ?
                </button>
                <button type="button" onClick={() => switchMode('signup')} className="font-medium text-brand-700 hover:text-brand-900">
                  Pas encore de compte ? Crée-le
                </button>
              </>
            )}
            {mode !== 'login' && (
              <button type="button" onClick={() => switchMode('login')} className="font-medium text-brand-700 hover:text-brand-900">
                Retour à la connexion
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
