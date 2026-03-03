import { useDashboard } from '../contexts/DashboardContext'
import SportSelection from '../features/sports/components/SportSelection'
import VideoUpload from '../features/upload/components/VideoUpload'
import MetricsView from '../features/metrics/components/MetricsView'

export default function DashboardHome() {
  const {
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
    handleAnalyzed,
  } = useDashboard()

  if (sport === null) {
    return <SportSelection onSelect={setSport} isFrom="Video analysis"/>
  }
  if (view === 'upload') {
    return (
      <VideoUpload
        onAnalyzed={handleAnalyzed}
        onBack={() => setSport(null)}
        sport={sport ?? undefined}
        metricKey={metricKey ?? undefined}
      />
    )
  }
  if (metrics) {
    return (
      <MetricsView
        metrics={metrics}
        file={selectedFile}
        onUploadAnother={() => setView('upload')}
        onStartAgain={() => {
          setSport(null)
          setMetricKey(null)
          setView('upload')
          setMetrics(null)
          setSelectedFile(null)
        }}
      />
    )
  }
  return null
}
