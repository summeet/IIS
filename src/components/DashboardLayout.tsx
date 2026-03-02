import { Outlet } from 'react-router-dom'
import Header from './Header'
import SidebarLayout from './SidebarLayout'
import { DashboardProvider } from '../contexts/DashboardContext'
import HistoryPage from '../features/history/components/HistoryPage'
import { useDashboard } from '../contexts/DashboardContext'
import { useAuth } from '../contexts/AuthContext'

type DashboardLayoutProps = {
  theme: 'dark' | 'light'
  onToggleTheme: () => void
  onLogout: () => void
  isLoggingOut: boolean
}

export function HistoryPageWithContext() {
  const {
    history,
    historyLoading,
    historyViewingReport,
    setHistoryViewingReport,
    handleSelectFromHistory,
    handleDeleteReport,
  } = useDashboard()
  return (
    <HistoryPage
      history={history}
      historyLoading={historyLoading}
      viewingReport={historyViewingReport}
      onSelectReport={handleSelectFromHistory}
      onBackToList={() => setHistoryViewingReport(null)}
      onDeleteReport={handleDeleteReport}
    />
  )
}

export function DashboardLayout({
  theme,
  onToggleTheme,
  onLogout,
  isLoggingOut,
}: DashboardLayoutProps) {
  const { user } = useAuth()
  return (
    <DashboardProvider
      theme={theme}
      renderLayout={({ pageTitle, onLogoClick, children }) => (
        <Header
          pageTitle={pageTitle}
          theme={theme}
          onToggleTheme={onToggleTheme}
          fullWidthContent
          onLogoClick={onLogoClick}
          user={user}
        >
          <SidebarLayout
            onLogout={onLogout}
            isLoggingOut={isLoggingOut}
          >
            {children}
          </SidebarLayout>
        </Header>
      )}
    >
      <Outlet />
    </DashboardProvider>
  )
}
