import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchMe } from './features/auth/authSlice'
import AppLayout from './components/layout/AppLayout'
import ProtectedRoute from './components/ui/ProtectedRoute'
import LoginPage from './features/auth/LoginPage'
import LogInteractionPage from './features/interaction/LogInteractionPage'
import HCPPage from './features/hcps/HCPPage'

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    if (localStorage.getItem('access_token')) dispatch(fetchMe())
  }, [dispatch])

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={
        <ProtectedRoute>
          <AppLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/log-interaction" replace />} />
        <Route path="log-interaction" element={<LogInteractionPage />} />
        <Route path="hcps" element={<HCPPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}