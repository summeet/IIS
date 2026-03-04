import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, Play } from 'lucide-react'
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

/** Convert API key to display label (e.g. total_punches → Total Punches; "Punch speed" unchanged) */
function keyToLabel(key: string): string {
  return key
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
}

/** Parse "0:01 - 0:02" or "00:00 - 00:15" to seconds (start time); returns NaN if invalid */
function parseTimeRangeToSeconds(range: string): number {
  const part = range.split('-')[0]?.trim() ?? ''
  const parts = part.split(':').map((n) => parseInt(n, 10))
  if (parts.length === 2 && !Number.isNaN(parts[0]) && !Number.isNaN(parts[1])) {
    return parts[0] * 60 + parts[1]
  }
  return NaN
}

/** Metric label: "Combination success_player_A" or "player_A_Combination_success" → "Combination success" */
function getMetricLabelFromTimestampKey(key: string): string {
  if (key.endsWith('_player_A') || key.endsWith('_player_B')) {
    return keyToLabel(key.slice(0, -9))
  }
  if (key.startsWith('player_A_')) return keyToLabel(key.slice(9))
  if (key.startsWith('player_B_')) return keyToLabel(key.slice(9))
  return keyToLabel(key)
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

  /** Display name: identification (e.g. "Vishvanath (Blue Attire)"), name, label, or fallback */
  const displayName =
    (typeof data.identification === 'string' && data.identification.trim() !== '' ? data.identification : null) ??
    (typeof data.name === 'string' && data.name.trim() !== '' ? data.name : null) ??
    (typeof data.label === 'string' && data.label.trim() !== '' ? data.label : null) ??
    label

  /** Dynamic stat entries: all keys except corner, name, label, identification; only primitive values */
  const statEntries = Object.entries(data).filter(
    ([key, value]) =>
      key !== 'corner' && key !== 'name' && key !== 'label' && key !== 'identification' &&
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
  const videoRef = useRef<HTMLVideoElement>(null)
  const { response: rawResponse, report, fileName } = metrics

  /** Normalize response; prefer report.performance (has player_A/B from API) then fall back to response */
  const analysis = useMemo(() => {
    const fromResponse = normalizeFighterPair(rawResponse)
    const perf = report?.performance
    return {
      fighter_A: perf?.fighter_A ?? fromResponse.fighter_A ?? null,
      fighter_B: perf?.fighter_B ?? fromResponse.fighter_B ?? null,
    }
  }, [rawResponse, report?.performance])

  const hasFighters =
    (analysis.fighter_A != null && Object.keys(analysis.fighter_A).length > 0) ||
    (analysis.fighter_B != null && Object.keys(analysis.fighter_B).length > 0)

  const timestampData = report?.performance?.timestamp

  const handleTimestampClick = (range: string) => {
    const seconds = parseTimeRangeToSeconds(range)
    if (!Number.isNaN(seconds) && videoRef.current) {
      videoRef.current.currentTime = seconds
      videoRef.current.play().catch(() => {})
    }
  }

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
                <video ref={videoRef} className="metrics-video" src={previewUrl} controls />
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
                <FighterStats label="Player A" data={analysis.fighter_A ?? {}} />
                <FighterStats label="Player B" data={analysis.fighter_B ?? {}} />
              </div>
            ) : (
              <p className="metrics-no-video">
                No analysis data available for this report.
              </p>
            )}
            {timestampData && Object.keys(timestampData).length > 0 ? (
              <div className="metrics-timestamps">
                <h3 className="metrics-section-title">Timestamp</h3>
                <p className="metrics-timestamps-desc">Click a time to seek the video and play from that moment.</p>
                <div className="metrics-timestamp-buttons-grid">
                  {Object.entries(timestampData).flatMap(([key, ranges]) => {
                    if (!Array.isArray(ranges) || ranges.length === 0) return []
                    const metricLabel = getMetricLabelFromTimestampKey(key)
                    const playerLabel = key.endsWith('_player_A') || key.startsWith('player_A_') ? 'Player A' : key.endsWith('_player_B') || key.startsWith('player_B_') ? 'Player B' : ''
                    const label = playerLabel ? `${playerLabel} · ${metricLabel}` : metricLabel
                    return ranges.map((range) => (
                      <button
                        key={`${key}-${range}`}
                        type="button"
                        className="metrics-timestamp-btn"
                        onClick={() => handleTimestampClick(range)}
                        title={`Play from ${range}`}
                      >
                        <span className="metrics-timestamp-btn-label">{label}</span>
                        <span className="metrics-timestamp-btn-time">
                          <Play size={14} strokeWidth={2} aria-hidden />
                          {range}
                        </span>
                      </button>
                    ))
                  })}
                </div>
              </div>
            ) : null}
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

