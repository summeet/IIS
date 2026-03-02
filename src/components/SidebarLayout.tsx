import { NavLink } from 'react-router-dom'

type SidebarLayoutProps = {
  children: React.ReactNode
  onLogout?: () => void
  isLoggingOut?: boolean
  onHomeClick?: () => void
  onHistoryClick?: () => void
}

function SidebarLayout({ children, onLogout, isLoggingOut = false, onHomeClick, onHistoryClick }: SidebarLayoutProps) {
  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <nav className="dashboard-sidebar-nav">
          <NavLink
            to="/dashboard"
            className={({ isActive }) =>
              `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
            }
            onClick={onHomeClick}
          >
            Home
          </NavLink>
          <NavLink
            to="/history"
            className={({ isActive }) =>
              `dashboard-nav-item${isActive ? ' dashboard-nav-item--active' : ''}`
            }
            onClick={onHistoryClick}
          >
            History
          </NavLink>
        </nav>
        {onLogout && (
          <div className="dashboard-sidebar-footer">
            <button
              type="button"
              className="dashboard-nav-item dashboard-nav-item--logout"
              onClick={onLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <>
                  <span className="app-nav-button-spinner" aria-hidden />
                  Logging out…
                </>
              ) : (
                'Log out'
              )}
            </button>
          </div>
        )}
      </aside>
      <div className="dashboard-main">{children}</div>
    </div>
  )
}

export default SidebarLayout
