import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from './AuthContext'

export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="grid min-h-dvh place-items-center text-sm text-muted" role="status">
        Chargement…
      </div>
    )
  }
  if (!user) return <Navigate to="/connexion" replace state={{ from: location.pathname }} />
  return <Outlet />
}
