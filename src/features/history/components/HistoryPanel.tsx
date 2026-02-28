import type { UploadResult } from '../../upload/types'

type HistoryPanelProps = {
  history: UploadResult[]
  onSelectReport: (report: UploadResult) => void
}

function formatDate(iso: string) {
  try {
    const d = new Date(iso)
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

function HistoryPanel({ history, onSelectReport }: HistoryPanelProps) {
  return (
    <div className="history-panel">
      <h2 className="history-panel-title">History</h2>
      <p className="history-panel-subtitle">
        Recently analyzed videos.
      </p>
      {history.length === 0 ? (
        <p className="history-empty">No analyses yet.</p>
      ) : (
        <ul className="history-list">
          {history.map((report) => (
            <li key={report.report._id} className="history-item">
              <div className="history-text">
                <span className="history-file metric-file-name">
                  {report.fileName}
                </span>
                <span className="history-meta">
                  {formatDate(report.report.created_at)}
                </span>
              </div>
              <button
                type="button"
                className="history-preview-button"
                onClick={() => onSelectReport(report)}
              >
                View
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default HistoryPanel

