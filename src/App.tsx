import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import ProtectedRoute from './components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import TimerPage from './pages/TimerPage'
import RecordsPage from './pages/RecordsPage'
import HabitsPage from './pages/HabitsPage'
import SharePage from './pages/SharePage'
import LoginPage from './pages/LoginPage'

export default function App() {
  return (
    <Routes>
      {/* 公开页与登录页:无需登录 */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/share" element={<SharePage />} />

      {/* 需要登录的应用主体 */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Dashboard />} />
        <Route path="/timer" element={<TimerPage />} />
        <Route path="/records" element={<RecordsPage />} />
        <Route path="/habits" element={<HabitsPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
