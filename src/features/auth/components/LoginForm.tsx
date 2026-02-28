import { useState } from 'react'
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
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to log in. Please check your credentials and try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sport-panel login-panel">
      <div>
        <h1 className="login-form-title">Log In</h1>
        <p className="login-form-subtitle">
          Sign in to upload athlete videos and view detailed performance
          metrics.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Email</span>
          <input
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </label>
        <label className="field">
          <span>Password</span>
          <div className="password-field">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((prev) => !prev)}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        {error && <div className="error">{error}</div>}
        <button
          type="submit"
          className="primary-button login-primary-button"
          disabled={isSubmitting}
        >
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </button>
        {onSwitchToSignup && (
          <button
            type="button"
            className="ghost-button login-secondary-link"
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

