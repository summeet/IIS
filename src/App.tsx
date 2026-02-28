import { useCallback, useEffect, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import './App.css'
import Login from './features/auth/components/Login'
import Register from './features/auth/components/Register'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ToastProvider } from './contexts/ToastContext'
import { ProtectedRoute } from './components/ProtectedRoute'
import {
  DashboardLayout,
  HistoryPageWithContext,
} from './components/DashboardLayout'
import DashboardHome from './components/DashboardHome'

function AppRoutes() {
  const location = useLocation()
  const { isAuthenticated, logout, isLoggingOut } = useAuth()
  const [theme, setTheme] = useState<'dark' | 'light'>('light')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('theme')
      if (stored === 'light' || stored === 'dark') {
        setTheme(stored)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme)
    }
  }, [theme])

  const toggleTheme = useCallback(() => {
    setTheme((previous) => (previous === 'dark' ? 'light' : 'dark'))
  }, [])

  const handleLogout = useCallback(async () => {
    await logout()
    setTheme('light')
  }, [logout])

  const isAuthenticatedRoute =
    location.pathname === '/dashboard' || location.pathname === '/history'

  return (
    <div
      className={`app-shell theme-${theme}${
        !isAuthenticatedRoute || !isAuthenticated
          ? ' app-shell-login'
          : ' app-shell-sport'
      }`}
    >
      <main
        className={`app-main${
          !isAuthenticatedRoute || !isAuthenticated
            ? ' app-main-login'
            : ' app-main-sport'
        }`}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Navigate
                to={isAuthenticated ? '/dashboard' : '/login'}
                replace
              />
            }
          />
          <Route
            path="/login"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Login />
              )
            }
          />
          <Route
            path="/register"
            element={
              isAuthenticated ? (
                <Navigate to="/dashboard" replace />
              ) : (
                <Register />
              )
            }
          />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout
                  theme={theme}
                  onToggleTheme={toggleTheme}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardHome />} />
            <Route path="history" element={<HistoryPageWithContext />} />
          </Route>
        </Routes>
      </main>
    </div>
  )
}

function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </ToastProvider>
  )
}

export default App
