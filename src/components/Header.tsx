import type { AuthUser } from '../contexts/AuthContext'
import logo from '../assets/logo.png'

function getInitials(user: AuthUser): string {
  const name = user?.name ?? user?.username ?? ''
  if (name) {
    const parts = name.trim().split(/\s+/)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase().slice(0, 2)
    }
    return name.slice(0, 2).toUpperCase()
  }
  const email = user?.email ?? ''
  if (email) return email.slice(0, 2).toUpperCase()
  return '?'
}

type HeaderProps = {
  pageTitle: string
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onLogoClick?: () => void
  fullWidthContent?: boolean
  user?: AuthUser | null
  children: React.ReactNode
}

function Header({
  pageTitle,
  theme,
  onToggleTheme,
  onLogoClick,
  fullWidthContent = false,
  user,
  children,
}: HeaderProps) {
  const displayName =
    user?.name ?? user?.username ?? user?.email ?? 'Profile'

  return (
    <div className="app-dashboard">
      <header className="app-navbar">
        <div className="app-navbar-left">
          <button
            type="button"
            className="app-logo-button"
            onClick={onLogoClick}
            title="Back to start"
          >
            <img
              src={logo}
              alt="Inspire Institute of Sport"
              className="app-logo"
            />
          </button>
          <span className="app-brand">Inspire Institute of Sport</span>
          {/* <span className="app-page-title">{pageTitle}</span> */}
        </div>
        <div className="app-navbar-actions">
          {user && (
            <div className="app-navbar-profile" title={user.email ?? displayName}>
              <span className="app-navbar-profile-avatar" aria-hidden>
                {getInitials(user)}
              </span>
              <span className="app-navbar-profile-name">{displayName}</span>
            </div>
          )}
        </div>
      </header>
      <main className="app-content">
        <div
          className={
            fullWidthContent
              ? 'app-content-inner app-content-inner--full'
              : 'app-content-inner'
          }
        >
          {children}
        </div>
      </main>
    </div>
  )
}

export default Header
