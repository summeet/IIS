import { useState, useEffect, useCallback } from 'react'
import { ArrowLeft, Plus, Trash2, Loader2, X } from 'lucide-react'
import type { SportKey } from '../../sports/components/SportSelection'
import SportSelection from '../../sports/components/SportSelection'
import {
  getMatricesBySport,
  createMatrix,
  updateMatrix,
  deleteMatrix,
  type MatrixDoc,
  type MatrixRecord,
} from '../api/matrices'
import { useToast } from '../../../contexts/ToastContext'

function getSportLabel(sport: SportKey): string {
  const labels: Record<SportKey, string> = {
    boxing: 'Boxing',
    judo: 'Judo',
    swimming: 'Swimming',
    trackField: 'Track & Field',
    wrestling: 'Wrestling',
    winterSports: 'Winter Sports',
  }
  return labels[sport] ?? sport
}

function MetricsConfiguration() {
  const toast = useToast()
  const [sport, setSport] = useState<SportKey | null>(null)
  const [matrixDoc, setMatrixDoc] = useState<MatrixDoc | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAdding, setIsAdding] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [newKey, setNewKey] = useState('')
  const [newDescription, setNewDescription] = useState('')

  const loadMatrices = useCallback(async () => {
    if (!sport) return
    if(!loading) setLoading(true)
    setError(null)
    try {
      const data = await getMatricesBySport(sport)
      if (data == null) {
        setMatrixDoc(null)
      } else if (Array.isArray(data)) {
        const doc = data.find((d) => d.sport === sport) ?? data[0] ?? null
        setMatrixDoc(doc)
      } else {
        setMatrixDoc(data as MatrixDoc)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load metrics')
      setMatrixDoc(null)
    } finally {
      setLoading(false)
    }
  }, [sport])

  useEffect(() => {
    loadMatrices()
  }, [loadMatrices])

  const matrixEntries = matrixDoc?.matrix
    ? Object.entries(matrixDoc.matrix)
    : []

  const handleAdd = async () => {
    if (!sport || !newKey.trim()) {
      toast.error('Enter a metric key')
      return
    }
    setLoading(true)
    try {
      const description = newDescription.trim()
      if (matrixDoc) {
        await updateMatrix(matrixDoc._id, {
          sport,
          matrix: { ...matrixDoc.matrix, [newKey.trim()]: description },
        })
      } else {
        await createMatrix({
          sport,
          matrix: { [newKey.trim()]: description },
        })
      }
      toast.success('Metric added')
      setNewKey('')
      setNewDescription('')
      setIsAdding(false)
      loadMatrices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to add metric')
      setLoading(false)
    }
  }

  const handleDelete = async (key: string) => {
    if (!matrixDoc || !sport) return
    setDeletingId(key)
    try {
      const updated: MatrixRecord = { ...matrixDoc.matrix }
      delete updated[key]
      if (Object.keys(updated).length === 0) {
        await deleteMatrix(matrixDoc._id)
      } else {
        await updateMatrix(matrixDoc._id, { sport, matrix: updated })
      }
      toast.success('Metric deleted')
      loadMatrices()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete metric')
    } finally {
      setDeletingId(null)
    }
  }

  if (sport === null) {
    return <SportSelection onSelect={setSport} isFrom="Metrics configuration"/>
  }

  return (
    <div className="app-page metric-configuration-page bg-white py-10">
      <div className="metric-configuration-content !max-w-full">
        <header className="metric-configuration-header">
          <div className="metric-configuration-header-row">
            <button
              type="button"
              className="metric-selection-back-link"
              onClick={() => {
                setSport(null)
              }}
            >
              <ArrowLeft size={18} strokeWidth={2} aria-hidden />
              <span>Back</span>
            </button>
            {!loading && !error && (
              <button
                type="button"
                className="secondary-button metrics-config-add-btn !mt-0"
                onClick={() => setIsAdding(true)}
                disabled={loading}
              >
                <Plus size={18} strokeWidth={2} aria-hidden />
                Add metric
              </button>
            )}
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Metrics configuration
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Manage metrics for {getSportLabel(sport)}
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Add or remove performance metrics for this sport.
          </p>
        </header>

        {loading ? (
          <ul className="metric-configuration-list metric-configuration-list--skeleton" aria-busy="true" aria-label="Loading metrics">
            {[1, 2, 3, 4].map((i) => (
              <li key={i} className="metric-configuration-item metric-configuration-skeleton-item">
                <div className="metric-configuration-skeleton-line metric-configuration-skeleton-key" />
                <div className="metric-configuration-skeleton-actions">
                  <span className="metric-configuration-skeleton-line metric-configuration-skeleton-btn" />
                </div>
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="metric-configuration-error" role="alert">
            {error}
          </div>
        ) : (
          <div className="metric-configuration-body">
            {isAdding && (
              <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
                onClick={() => {
                  if (!loading) {
                    setIsAdding(false)
                    setNewKey('')
                    setNewDescription('')
                  }
                }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="add-metric-modal-title"
              >
                <div
                  className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="mb-5 flex items-center justify-between">
                    <h3
                      id="add-metric-modal-title"
                      className="text-lg font-semibold text-slate-900"
                    >
                      Add metric
                    </h3>
                    <button
                      type="button"
                      className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      onClick={() => {
                        if (!loading) {
                          setIsAdding(false)
                          setNewKey('')
                          setNewDescription('')
                        }
                      }}
                      aria-label="Close"
                    >
                      <X size={20} strokeWidth={2} />
                    </button>
                  </div>
                  <div className="mb-4">
                    <input
                      type="text"
                      placeholder="Metric key (e.g. punchSpeed)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="mb-5">
                    <input
                      type="text"
                      placeholder="Description (optional)"
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-slate-50 px-3 py-2.5 text-slate-900 placeholder:text-slate-500 focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      className="secondary-button mt-0 flex-1 justify-center"
                      onClick={() => {
                        setIsAdding(false)
                        setNewKey('')
                        setNewDescription('')
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="primary-button mt-0 flex-1 justify-center"
                      onClick={handleAdd}
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="inline-flex items-center justify-center gap-2">
                          <Loader2 size={16} strokeWidth={2} className="animate-spin" aria-hidden />
                          Adding…
                        </span>
                      ) : (
                        'Add'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            <ul className="metric-configuration-list">
              {matrixEntries.length === 0 && !isAdding ? (
                <li className="metric-configuration-empty">
                  No metrics yet. Add one above.
                </li>
              ) : (
                matrixEntries.map(([key]) => (
                  <li key={key} className="metric-configuration-item">
                    <>
                      <div className="metric-configuration-item-text">
                        <span className="metric-config-key">{key}</span>
                        {/* <span className="metric-config-desc">{desc || '—'}</span> */}
                      </div>
                      <div className="metric-configuration-item-actions">
                        <button
                          type="button"
                          className="metric-config-icon-btn metric-config-icon-btn--danger"
                          onClick={() => handleDelete(key)}
                          disabled={deletingId === key}
                          aria-label={`Delete ${key}`}
                        >
                          {deletingId === key ? (
                            <Loader2 size={16} strokeWidth={2} className="animate-spin" />
                          ) : (
                            <Trash2 size={16} strokeWidth={2} />
                          )}
                        </button>
                      </div>
                    </>
                  </li>
                ))
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}

export default MetricsConfiguration
