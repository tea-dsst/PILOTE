import { Route, Routes } from 'react-router-dom'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard'
import ComingSoon from './pages/ComingSoon'
import { NAV_ITEMS } from './lib/nav'
import RequireAuth from './auth/RequireAuth'
import AuthPage from './pages/AuthPage'
import NewPassword from './pages/NewPassword'

export default function App() {
  return (
    <Routes>
      <Route path="/connexion" element={<AuthPage />} />
      <Route path="/nouveau-mot-de-passe" element={<NewPassword />} />
      <Route element={<RequireAuth />}>
      <Route element={<AppLayout />}>
        <Route index element={<Dashboard />} />
        {NAV_ITEMS.filter((item) => item.to !== '/').map((item) => (
          <Route
            key={item.to}
            path={item.to}
            element={<ComingSoon title={item.label} description={item.description} />}
          />
        ))}
        <Route
          path="*"
          element={
            <ComingSoon
              title="Page introuvable"
              description="Cette adresse ne correspond à aucune page de PILOTE."
              notBuilt={false}
            />
          }
        />
      </Route>
      </Route>
    </Routes>
  )
}
