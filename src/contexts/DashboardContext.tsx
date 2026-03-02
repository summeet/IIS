import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import type { SportKey } from '../features/sports/components/SportSelection'
import type {
  UploadResult,
  UploadVideoResponse,
} from '../features/upload/types'
import {
  deleteReports,
  getUserHistory,
  mapHistoryReportToUploadResult,
} from '../features/history/api'
import { useToast } from './ToastContext'

export type View = 'upload' | 'metrics'

type DashboardContextValue = {
  sport: SportKey | null
  setSport: (sport: SportKey | null) => void
  metricKey: string | null
  setMetricKey: (key: string | null) => void
  view: View
  setView: (view: View) => void
  metrics: UploadResult | null
  setMetrics: (m: UploadResult | null) => void
  selectedFile: File | null
  setSelectedFile: (f: File | null) => void
  history: UploadResult[]
  historyLoading: boolean
  historyViewingReport: UploadResult | null
  setHistoryViewingReport: (report: UploadResult | null) => void
  theme: 'dark' | 'light'
  handleAnalyzed: (result: UploadVideoResponse, file: File) => void
  handleSelectFromHistory: (item: UploadResult) => void
  handleDeleteReport: (reportId: string) => Promise<void>
}

const DashboardContext = createContext<DashboardContextValue | null>(null)

export function useDashboard() {
  const ctx = useContext(DashboardContext)
  if (!ctx) {
    throw new Error('useDashboard must be used within DashboardProvider')
  }
  return ctx
}

function getPageTitle(
  pathname: string,
  sport: SportKey | null,
  metricKey: string | null,
  _view: View,
  hasMetrics: boolean,
): string {
  if (pathname === '/history') return 'History'
  if (sport === null) return 'Select sport'
  if (metricKey === null) return 'Performance metric'
  if (hasMetrics) return 'Video metrics'
  return 'Upload video'
}

type DashboardProviderProps = {
  theme: 'dark' | 'light'
  children: React.ReactNode
  renderLayout: (props: {
    pageTitle: string
    onLogoClick: () => void
    onHistoryClick: () => void
    children: React.ReactNode
  }) => React.ReactNode
}

export function DashboardProvider({
  theme,
  children,
  renderLayout,
}: DashboardProviderProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const toast = useToast()
  const [sport, setSport] = useState<SportKey | null>(null)
  const [metricKey, setMetricKey] = useState<string | null>(null)
  const [view, setView] = useState<View>('upload')
  const [metrics, setMetrics] = useState<UploadResult | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [history, setHistory] = useState<UploadResult[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)
  const [historyViewingReport, setHistoryViewingReport] = useState<UploadResult | null>(null)
  const prevPathnameRef = useRef(location.pathname)

  // Reset dashboard flow state when navigating back to Home from another tab (e.g. History)
  useEffect(() => {
    const prev = prevPathnameRef.current
    prevPathnameRef.current = location.pathname
    if (prev !== '/dashboard' && location.pathname === '/dashboard') {
      setSport(null)
      setMetricKey(null)
      setView('upload')
      setMetrics(null)
      setSelectedFile(null)
    }
    if (location.pathname !== '/history') {
      setHistoryViewingReport(null)
    }
  }, [location.pathname])

  const loadHistory = useCallback(() => {
    setHistoryLoading(true)
    getUserHistory()
      .then((list) => {
        const mapped = list.map(mapHistoryReportToUploadResult)
        setHistory(mapped)
      })
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false))
  }, [])

  useEffect(() => {
    loadHistory()
  }, [loadHistory])

  // Refetch history when user opens the History page (e.g. token was not ready on first load)
  useEffect(() => {
    if (location.pathname === '/history') {
      loadHistory()
    }
  }, [location.pathname, loadHistory])

  const handleAnalyzed = useCallback(
    (result: UploadVideoResponse, file: File) => {
      const uploadResult: UploadResult = { ...result, fileName: file.name }
      setMetrics(uploadResult)
      setSelectedFile(file)
      setView('metrics')
      loadHistory()
    },
    [loadHistory],
  )

  const handleSelectFromHistory = useCallback((item: UploadResult) => {
    setHistoryViewingReport(item)
    if (location.pathname !== '/history') {
      navigate('/history')
    }
  }, [navigate, location.pathname])

  const handleDeleteReport = useCallback(
    async (reportId: string) => {
      try {
        await deleteReports([reportId])
        setHistory((prev) => prev.filter((r) => r.report._id !== reportId))
        setHistoryViewingReport((prev) => (prev?.report._id === reportId ? null : prev))
        toast.success('Report deleted')
      } catch {
        toast.error('Failed to delete report')
      }
    },
    [toast],
  )

  const onLogoClick = useCallback(() => {
    setSport(null)
    setMetricKey(null)
    setView('upload')
    setMetrics(null)
    navigate('/dashboard')
  }, [navigate])

  const onHistoryClick = useCallback(() => {
    setHistoryViewingReport(null)
    navigate('/history')
  }, [navigate])

  const pageTitle = getPageTitle(
    location.pathname,
    sport,
    metricKey,
    view,
    !!metrics,
  )

  const value: DashboardContextValue = {
    sport,
    setSport,
    metricKey,
    setMetricKey,
    view,
    setView,
    metrics,
    setMetrics,
    selectedFile,
    setSelectedFile,
    history,
    historyLoading,
    historyViewingReport,
    setHistoryViewingReport,
    theme,
    handleAnalyzed,
    handleSelectFromHistory,
    handleDeleteReport,
  }

  return (
    <DashboardContext.Provider value={value}>
      {renderLayout({
        pageTitle,
        onLogoClick,
        onHistoryClick,
        children,
      })}
    </DashboardContext.Provider>
  )
}
