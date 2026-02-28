import { useDashboard } from '../contexts/DashboardContext'
import SportSelection from '../features/sports/components/SportSelection'
import MetricSelection from '../features/metrics/components/MetricSelection'
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
    theme,
  } = useDashboard()

  if (sport === null) {
    return <SportSelection onSelect={setSport} />
  }
  if (metricKey === null) {
    return (
      <MetricSelection
        sport={sport}
        onSelectMetric={setMetricKey}
        theme={theme}
      />
    )
  }
  if (view === 'upload') {
    return <VideoUpload onAnalyzed={handleAnalyzed} />
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
