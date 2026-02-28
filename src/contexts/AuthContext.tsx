import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react'
import { useNavigate } from 'react-router-dom'
import { logoutUser } from '../features/auth/api'

export type AuthUser = {
  _id?: string
  name?: string
  username?: string
  email?: string
  role?: string
}

type AuthContextValue = {
  isAuthenticated: boolean
  isLoggingOut: boolean
  user: AuthUser | null
  login: (userData?: AuthUser | null) => void
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return ctx
}

function getStoredUser(): AuthUser | null {
  if (typeof window === 'undefined') return null
  try {
    const raw =
      window.localStorage.getItem('authUser') ??
      window.sessionStorage.getItem('authUser')
    if (!raw) return null
    const parsed = JSON.parse(raw) as AuthUser
    return parsed
  } catch {
    return null
  }
}

type AuthProviderProps = {
  children: React.ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const navigate = useNavigate()
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [user, setUser] = useState<AuthUser | null>(null)

  useEffect(() => {
    const stored =
      typeof window !== 'undefined'
        ? window.sessionStorage.getItem('isAuthenticated')
        : null
    if (stored === 'true') {
      setIsAuthenticated(true)
      setUser(getStoredUser())
    }
  }, [])

  const login = useCallback((userData?: AuthUser | null) => {
    setIsAuthenticated(true)
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('isAuthenticated', 'true')
    }
    setUser(userData ?? getStoredUser())
    navigate('/dashboard')
  }, [navigate])

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await logoutUser()
    } catch {
      // Still clear local state if API fails
    } finally {
      setIsLoggingOut(false)
    }
    setIsAuthenticated(false)
    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem('isAuthenticated')
      window.sessionStorage.removeItem('accessToken')
      window.sessionStorage.removeItem('refreshToken')
      window.sessionStorage.removeItem('authUser')
      window.localStorage.removeItem('authUser')
      window.localStorage.removeItem('theme')
    }
    setUser(null)
    navigate('/login')
  }, [navigate])

  const value: AuthContextValue = {
    isAuthenticated,
    isLoggingOut,
    user,
    login,
    logout,
  }

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  )
}
