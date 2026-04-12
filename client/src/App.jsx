import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import MyWalletPage from './pages/MyWalletPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  const { user } = useAuth()

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={!user ? <LoginPage /> : <Navigate to="/dashboard" replace />}
        />
        <Route
          path="/dashboard"
          element={user ? <DashboardPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/wallet"
          element={user ? <MyWalletPage /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/settings"
          element={user ? <SettingsPage /> : <Navigate to="/login" replace />}
        />
        <Route path="/" element={<Navigate to={user ? '/dashboard' : '/login'} replace />} />
      </Routes>
    </Router>
  )
}
