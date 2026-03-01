import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { loginUser, persistAuthTokens } from '../api'

type LoginFormProps = {
  onLogin: () => void
  onSwitchToSignup?: () => void
}

function LoginForm({ onLogin, onSwitchToSignup }: LoginFormProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!email || !password) {
      setError('Please enter both email and password.')
      return
    }

    setError(null)
    setIsSubmitting(true)
    try {
      const data = await loginUser({ email, password })
      persistAuthTokens(data)
      onLogin()
    } catch (submitError: unknown) {
      let message = 'Unable to log in. Please check your credentials and try again.'
      if (submitError && typeof submitError === 'object' && 'response' in submitError) {
        const res = (submitError as { response?: { data?: { detail?: string } } }).response
        if (typeof res?.data?.detail === 'string') {
          message = res.data.detail
        }
      } else if (submitError instanceof Error) {
        message = submitError.message
      }
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-[420px] rounded-3xl border border-slate-200 bg-white px-4 py-6 shadow-[0_4px_24px_rgba(0,0,0,0.08)] sm:px-7 sm:py-8">
      <div>
        <h1 className="m-0 text-2xl tracking-tight text-slate-900 sm:text-[1.95rem]">
          Log In
        </h1>
        <p className="mt-2.5 mb-0 text-sm text-slate-600 sm:text-[0.95rem]">
          Sign in to upload athlete videos and view detailed performance
          metrics.
        </p>
      </div>
      <form className="mt-1.5 flex flex-col gap-[0.9rem]" onSubmit={handleSubmit}>
        <label className="flex flex-col gap-1.5 text-left text-[0.9rem]">
          <span className="mb-0.5 block text-sm font-semibold text-slate-700">Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-[0.9rem] border border-slate-300 bg-slate-50 px-3 py-2 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-left text-[0.9rem]">
          <span className="mb-0.5 block text-sm font-semibold text-slate-700">Password</span>
          <div className="relative flex items-center">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-[0.9rem] border border-slate-300 bg-slate-50 py-2 pl-3 pr-12 text-slate-900 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
            <button
              type="button"
              className="absolute right-2.5 flex items-center justify-center rounded p-1 text-gray-500 hover:text-gray-900"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? (
                <EyeOff size={18} strokeWidth={2} aria-hidden />
              ) : (
                <Eye size={18} strokeWidth={2} aria-hidden />
              )}
            </button>
          </div>
        </label>
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-[0.85rem] text-red-700">
            {error}
          </div>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-full border-none bg-[#1f4d5e] px-5 py-2.5 font-medium text-slate-50 shadow-[0_10px_22px_rgba(15,23,42,0.35)] transition-[background-color,color,box-shadow,transform] hover:-translate-y-px hover:bg-[#163847] hover:shadow-[0_16px_32px_rgba(15,23,42,0.45)] disabled:cursor-default disabled:opacity-65 disabled:shadow-none disabled:transform-none"
        >
          {isSubmitting ? (
            <>
              <Loader2
                size={18}
                strokeWidth={2.5}
                className="shrink-0 animate-spin"
                aria-hidden
              />
              Logging in…
            </>
          ) : (
            'Log in'
          )}
        </button>
        {onSwitchToSignup && (
          <button
            type="button"
            className="mt-3 flex w-full items-center justify-center rounded-full border border-slate-300 bg-slate-100 px-4 py-2.5 text-[0.85rem] font-medium text-slate-600 transition-colors hover:border-sky-600 hover:bg-sky-600 hover:text-white"
            onClick={onSwitchToSignup}
          >
            Don&apos;t have an account? Sign up
          </button>
        )}
      </form>
    </div>
  )
}

export default LoginForm
