import { useNavigate } from 'react-router-dom'
import SignupForm from './SignupForm'
import logo from '../../../assets/logo.png'

export default function Register() {
  const navigate = useNavigate()

  return (
    <div className="login-hero">
      <div className="login-grid">
        <section className="login-hero-left">
          <div className="login-hero-left-inner">
            <img
              src={logo}
              alt="Inspire Institute of Sport"
              className="login-logo"
            />
            <p className="login-tagline">
              High performance athlete analytics
            </p>
            <h1 className="login-heading">
              Inspire Institute of Sport
            </h1>
            <p className="login-copy">
              Securely upload session footage, select a sport and metric, and
              review video-driven performance insights.
            </p>
            <div className="login-stats">
              <div className="login-stat">
                <span className="login-stat-number">500+</span>
                <span className="login-stat-label">Athletes</span>
              </div>
              <div className="login-stat">
                <span className="login-stat-number">6</span>
                <span className="login-stat-label">Sports</span>
              </div>
              <div className="login-stat">
                <span className="login-stat-number">24/7</span>
                <span className="login-stat-label">Video insights</span>
              </div>
            </div>
          </div>
        </section>
        <section className="login-hero-right">
          <SignupForm
            onSignupSuccess={() => navigate('/login')}
            onBackToLogin={() => navigate('/login')}
          />
        </section>
      </div>
    </div>
  )
}
