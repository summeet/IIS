import { useState } from 'react'
import { Eye, Loader2, Trash2 } from 'lucide-react'
import type { UploadResult } from '../../upload/types'
import MetricsView from '../../metrics/components/MetricsView'

type HistoryPageProps = {
  history: UploadResult[]
  historyLoading?: boolean
  viewingReport: UploadResult | null
  onSelectReport: (report: UploadResult) => void
  onBackToList: () => void
  onDeleteReport?: (reportId: string) => void | Promise<void>
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

function HistoryPage({ history, historyLoading = false, viewingReport, onSelectReport, onBackToList, onDeleteReport }: HistoryPageProps) {
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set())

  const handleDelete = async (reportId: string) => {
    if (!onDeleteReport) return
    setDeletingIds((prev) => new Set(prev).add(reportId))
    try {
      await Promise.resolve(onDeleteReport(reportId))
    } finally {
      setDeletingIds((prev) => {
        const next = new Set(prev)
        next.delete(reportId)
        return next
      })
    }
  }

  if (viewingReport) {
    return (
      <MetricsView
        metrics={viewingReport}
        file={null}
        onBackToList={onBackToList}
      />
    )
  }

  return (
    <div className="app-page history-page bg-white py-10">
      <div className="history-page-content">
        <header className="history-page-header">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            History
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Past video analyses
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            View and open past video analyses from Home.
          </p>
        </header>
        {historyLoading ? (
          <div className="history-page-loader">
            <Loader2 size={32} strokeWidth={2} className="history-page-loader-icon" aria-hidden />
            <span className="history-page-loader-text">Loading history…</span>
          </div>
        ) : history.length === 0 ? (
          <p className="history-page-empty">
            No analyses yet. Upload a video from Home to get started.
          </p>
        ) : (
          <ul className="history-page-list">
            {history.map((report) => (
                <li key={report.report._id} className="history-page-item">
                  <div className="history-page-item-text">
                    <span className="history-page-file metric-file-name">
                      {report.fileName}
                    </span>
                    <span className="history-page-meta">
                      {formatDate(report.report.created_at)}
                      {report.report.sport && ` · ${report.report.sport}`}
                    </span>
                  </div>
                  <div className="history-page-item-actions">
                    <button
                      type="button"
                      className="history-page-view-btn"
                      onClick={() => onSelectReport(report)}
                      aria-label={`View ${report.fileName}`}
                    >
                      <Eye size={18} strokeWidth={2} aria-hidden />
                    </button>
                    {onDeleteReport && (
                      <button
                        type="button"
                        className="history-page-delete-btn"
                        onClick={() => handleDelete(report.report._id)}
                        disabled={deletingIds.has(report.report._id)}
                        aria-label={`Delete ${report.fileName}`}
                      >
                        {deletingIds.has(report.report._id) ? (
                          <Loader2 size={18} strokeWidth={2} className="animate-spin" aria-hidden />
                        ) : (
                          <Trash2 size={18} strokeWidth={2} aria-hidden />
                        )}
                      </button>
                    )}
                  </div>
                </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default HistoryPage
