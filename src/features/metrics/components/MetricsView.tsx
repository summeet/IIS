import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
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

function FighterStats({
  label,
  data,
}: {
  label: string
  data: FighterData | null | undefined
}) {
  if (!data) {
    return null
  }
  const corner: FighterCorner = data.corner ?? {
    corner_name: null,
    trunk_color_detected: null,
    confidence_score: null,
  }
  const cornerLabel = [corner.corner_name, corner.trunk_color_detected]
    .filter(Boolean)
    .join(' · ') || '—'
  return (
    <div className="fighter-card">
      <h3 className="fighter-card-title">{label}</h3>
      <p className="fighter-corner">{cornerLabel}</p>
      <dl className="fighter-stats">
        <div>
          <dt>Total punches</dt>
          <dd>{fmt(data.total_punches)}</dd>
        </div>
        <div>
          <dt>Landed</dt>
          <dd>{fmt(data.landed)}</dd>
        </div>
        <div>
          <dt>Accuracy</dt>
          <dd>{fmt(data.accuracy, '%')}</dd>
        </div>
        <div>
          <dt>Jabs</dt>
          <dd>{fmt(data.jabs)}</dd>
        </div>
        <div>
          <dt>Hooks</dt>
          <dd>{fmt(data.hooks)}</dd>
        </div>
        <div>
          <dt>Ring control</dt>
          <dd>{fmt(data.ring_control, '%')}</dd>
        </div>
        <div>
          <dt>Distance covered</dt>
          <dd>{fmt(data.distance_covered, 'm')}</dd>
        </div>
        <div>
          <dt>Blocks</dt>
          <dd>{fmt(data.blocks)}</dd>
        </div>
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
  const { response: analysis, fileName } = metrics
  const hasFighters =
    analysis?.fighter_A != null && analysis?.fighter_B != null

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
                <FighterStats label="Fighter A" data={analysis?.fighter_A} />
                <FighterStats label="Fighter B" data={analysis?.fighter_B} />
              </div>
            ) : (
              <p className="metrics-no-video">
                No analysis data available for this report.
              </p>
            )}
          </section>
        </div>
        <div className="metrics-view-actions">
          {onBackToList ? (
            < >
            </>
          ) : (
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

