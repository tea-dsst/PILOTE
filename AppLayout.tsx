import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation } from 'react-router-dom'
import { Ellipsis, X } from 'lucide-react'
import { NAV_ITEMS } from '../../lib/nav'
import { useAuth } from '../../auth/AuthContext'

function Logo() {
  return (
    <div className="flex items-center gap-2.5">
      <span
        aria-hidden="true"
        className="grid size-9 place-items-center rounded-xl bg-brand-700 text-canvas"
      >
        <svg viewBox="0 0 32 32" className="size-5" fill="currentColor">
          <path d="M16 5 25 26 16 21.2 7 26 16 5Z" />
        </svg>
      </span>
      <span className="font-display text-xl font-semibold tracking-wide">PILOTE</span>
    </div>
  )
}

const desktopLink = ({ isActive }: { isActive: boolean }) =>
  `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
    isActive ? 'bg-brand-50 text-brand-800' : 'text-muted hover:bg-canvas hover:text-ink'
  }`

const mobileLink = ({ isActive }: { isActive: boolean }) =>
  `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium transition-colors ${
    isActive ? 'text-brand-800' : 'text-muted'
  }`

export default function AppLayout() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()
  const { user, signOut } = useAuth()

  useEffect(() => {
    setMoreOpen(false)
  }, [pathname])

  useEffect(() => {
    if (!moreOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMoreOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [moreOpen])

  const primary = NAV_ITEMS.filter((item) => item.primary)
  const secondary = NAV_ITEMS.filter((item) => !item.primary)

  return (
    <div className="min-h-dvh">
      {/* Barre latérale (ordinateur) */}
      <aside className="fixed inset-y-0 left-0 z-20 hidden w-64 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
        <div className="px-2">
          <Logo />
          <p className="mt-2 text-xs text-muted">Ta vie, mieux organisée.</p>
        </div>
        <nav aria-label="Navigation principale" className="mt-8 flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={desktopLink}>
              <Icon className="size-[18px]" aria-hidden="true" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="rounded-xl border border-line bg-canvas p-3 text-xs text-muted">
          <p className="truncate font-medium text-ink">{user?.email}</p>
          <p className="mt-1">Les données du tableau de bord sont encore fictives.</p>
          <button type="button" onClick={signOut} className="mt-2 font-medium text-brand-700 hover:text-brand-900">
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* En-tête (mobile et tablette) */}
      <header className="sticky top-0 z-20 border-b border-line bg-canvas/90 px-4 py-3 backdrop-blur lg:hidden">
        <Logo />
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-8 lg:pb-12 lg:pt-10">
          <Outlet />
        </div>
      </main>

      {/* Navigation du bas (mobile et tablette) */}
      <nav
        aria-label="Navigation mobile"
        className="fixed inset-x-0 bottom-0 z-30 flex gap-1 border-t border-line bg-surface/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1 backdrop-blur lg:hidden"
      >
        {primary.map(({ to, label, icon: Icon }) => (
          <NavLink key={to} to={to} end={to === '/'} className={mobileLink}>
            <Icon className="size-5" aria-hidden="true" />
            <span className="truncate">{to === '/' ? 'Accueil' : label}</span>
          </NavLink>
        ))}
        <button
          type="button"
          onClick={() => setMoreOpen(true)}
          aria-haspopup="dialog"
          aria-expanded={moreOpen}
          className="flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-1 py-2 text-[11px] font-medium text-muted"
        >
          <Ellipsis className="size-5" aria-hidden="true" />
          Plus
        </button>
      </nav>

      {moreOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Fermer le menu"
            onClick={() => setMoreOpen(false)}
            className="absolute inset-0 bg-ink/30"
          />
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Autres sections"
            className="absolute inset-x-0 bottom-0 rounded-t-3xl bg-surface p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-card"
          >
            <div className="mb-2 flex items-center justify-between px-2">
              <h2 className="font-display text-lg font-semibold">Plus</h2>
              <button
                type="button"
                onClick={() => setMoreOpen(false)}
                aria-label="Fermer"
                className="grid size-9 place-items-center rounded-full text-muted hover:bg-canvas"
              >
                <X className="size-5" aria-hidden="true" />
              </button>
            </div>
            <ul>
              {secondary.map(({ to, label, icon: Icon }) => (
                <li key={to}>
                  <NavLink to={to} className={desktopLink}>
                    <Icon className="size-[18px]" aria-hidden="true" />
                    {label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
