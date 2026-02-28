import {
  createContext,
  useCallback,
  useContext,
  useState,
} from 'react'

export type ToastItem = {
  id: number
  message: string
  type: 'success' | 'error' | 'info'
}

type ToastContextValue = {
  toasts: ToastItem[]
  toast: (message: string, type?: ToastItem['type']) => void
  success: (message: string) => void
  error: (message: string) => void
  removeToast: (id: number) => void
}

const ToastContext = createContext<ToastContextValue | null>(null)

let nextId = 0
const TOAST_DURATION_MS = 4000

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within ToastProvider')
  }
  return ctx
}

type ToastProviderProps = {
  children: React.ReactNode
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message: string, type: ToastItem['type'] = 'success') => {
      const id = nextId++
      setToasts((prev) => [...prev, { id, message, type }])
      setTimeout(() => removeToast(id), TOAST_DURATION_MS)
    },
    [removeToast],
  )

  const success = useCallback((message: string) => toast(message, 'success'), [toast])
  const error = useCallback((message: string) => toast(message, 'error'), [toast])

  const value: ToastContextValue = {
    toasts,
    toast,
    success,
    error,
    removeToast,
  }

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  )
}

function ToastContainer() {
  const { toasts, removeToast } = useToast()
  if (toasts.length === 0) return null
  return (
    <div
      className="toast-container"
      role="region"
      aria-label="Notifications"
    >
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`toast toast--${t.type}`}
          role="alert"
        >
          <span className="toast-message">{t.message}</span>
          <button
            type="button"
            className="toast-dismiss"
            onClick={() => removeToast(t.id)}
            aria-label="Dismiss"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
