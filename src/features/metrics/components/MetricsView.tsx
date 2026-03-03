import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { normalizeFighterPair } from '../../upload/api'
import type { FighterCorner, FighterData, UploadResult } from '../../upload/types'

type MetricsViewProps = {
  metrics: UploadResult
  file: File | null
  onUploadAnother?: () => void
  onStartAgain?: () => void
  onBackToList?: () => void
}

function fmt(value: string | number | null | undefined, suffix = ''): string {
  if (value == null || value === '') return '—'
  return `${value}${suffix}`
}

/** Convert API key to display label (e.g. total_punches → Total punches) */
function keyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

function FighterStats({
  label,
  data,
}: {
  label: string
  data: FighterData | null | undefined
}) {
  if (!data || typeof data !== 'object') {
    return null
  }
  const corner = data.corner && typeof data.corner === 'object' ? data.corner as FighterCorner : null
  const cornerLabel = corner
    ? [corner.corner_name, corner.trunk_color_detected].filter(Boolean).join(' · ') || '—'
    : null

  /** Display name: use data.name or data.label if present, else the passed label (e.g. Fighter A) */
  const displayName =
    (typeof data.name === 'string' && data.name.trim() !== '' ? data.name : null) ??
    (typeof data.label === 'string' && data.label.trim() !== '' ? data.label : null) ??
    label

  /** Dynamic stat entries: all keys except corner, name, label; only primitive values */
  const statEntries = Object.entries(data).filter(
    ([key, value]) =>
      key !== 'corner' && key !== 'name' && key !== 'label' &&
      (value === null || value === undefined || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean')
  )

  return (
    <div className="fighter-card">
      <h3 className="fighter-card-title">{displayName}</h3>
      {cornerLabel != null && cornerLabel !== '—' && (
        <p className="fighter-corner">{cornerLabel}</p>
      )}
      <dl className="fighter-stats">
        {statEntries.map(([key, value]) => (
          <div key={key}>
            <dt>{keyToLabel(key)}</dt>
            <dd>{fmt(value as string | number | null | undefined)}</dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

function MetricsView({
  metrics,
  file,
  onUploadAnother,
  onStartAgain,
  onBackToList,
}: MetricsViewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const { response: rawResponse, fileName } = metrics

  /** Normalize response so we handle both API shapes: array [{ fighter_A }, { fighter_B }] or object { fighter_A, fighter_B } */
  const analysis = useMemo(() => {
    const pair = normalizeFighterPair(rawResponse)
    return {
      fighter_A: pair.fighter_A,
      fighter_B: pair.fighter_B,
    }
  }, [rawResponse])

  const hasFighters =
    analysis.fighter_A != null && analysis.fighter_B != null

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null)
      return
    }

    const url = URL.createObjectURL(file)
    setPreviewUrl(url)

    return () => {
      URL.revokeObjectURL(url)
    }
  }, [file])

  return (
    <div className="app-page metrics-view-page bg-white py-10">
      <div className="metrics-view-content">
        <header className="metrics-view-header">
          {onBackToList && (
            <button
              type="button"
              className="metrics-view-back-link"
              onClick={onBackToList}
            >
              <ArrowLeft size={18} strokeWidth={2} aria-hidden />
              <span>Back to list</span>
            </button>
          )}
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Video metrics
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            Session performance summary
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Analysis results for your uploaded video.
          </p>
        </header>

        <div className="metrics-detail-layout">
          <section className="metrics-video-section">
            <h3 className="metrics-section-title">Video</h3>
            {previewUrl ? (
              <div className="metrics-video-wrapper">
                <video className="metrics-video" src={previewUrl} controls />
              </div>
            ) : (
              <p className="metrics-no-video">No video preview</p>
            )}
            <p className="metric-file-name">{fileName}</p>
          </section>
          <section className="metrics-details-section">
            <h3 className="metrics-section-title">Performance analysis</h3>
            {hasFighters ? (
              <div className="metrics-fighters">
                <FighterStats label="Fighter A" data={analysis.fighter_A} />
                <FighterStats label="Fighter B" data={analysis.fighter_B} />
              </div>
            ) : (
              <p className="metrics-no-video">
                No analysis data available for this report.
              </p>
            )}
          </section>
        </div>
        <div className="metrics-view-actions">
          {onBackToList ? null : (
            <>
              <button
                type="button"
                className="secondary-button metrics-upload-another"
                onClick={onUploadAnother ?? (() => {})}
              >
                Upload another video
              </button>
              {onStartAgain && (
                <button
                  type="button"
                  className="secondary-button metrics-start-again"
                  onClick={onStartAgain}
                >
                  Start again
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default MetricsView

