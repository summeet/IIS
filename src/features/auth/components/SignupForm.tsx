import { useState } from 'react'
import { registerUser } from '../api'

type SignupFormProps = {
  onSignupSuccess: () => void
  onBackToLogin: () => void
}

function SignupForm({ onSignupSuccess, onBackToLogin }: SignupFormProps) {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (!username || !email || !password) {
      setError('Please fill in all fields.')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await registerUser({ username, email, password })
      onSignupSuccess()
    } catch (submitError) {
      const message =
        submitError instanceof Error
          ? submitError.message
          : 'Unable to sign up. Please try again.'
      setError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="sport-panel login-panel">
      <div>
        <h1 className="login-form-title">Sign up</h1>
        <p className="login-form-subtitle">
          Create your account to upload athlete videos and view detailed
          performance metrics.
        </p>
      </div>
      <form className="form" onSubmit={handleSubmit}>
        <label className="field">
          <span>Username</span>
          <input
            type="text"
            placeholder="Choose a username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
          />
        </label>
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
              placeholder="Create a strong password"
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
          {isSubmitting ? 'Creating account…' : 'Sign up'}
        </button>
        <button
          type="button"
          className="ghost-button login-secondary-link"
          onClick={onBackToLogin}
        >
          Already have an account? Log in
        </button>
      </form>
    </div>
  )
}

export default SignupForm

