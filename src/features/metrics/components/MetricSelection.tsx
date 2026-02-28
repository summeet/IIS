import type { SportKey } from '../../sports/components/SportSelection'

type MetricSelectionProps = {
  sport: SportKey
  onSelectMetric: (metricKey: string) => void
  theme: 'dark' | 'light'
}

const METRICS_BY_SPORT: Record<SportKey, { key: string; label: string }[]> = {
  boxing: [
    { key: 'punchSpeed', label: 'Punch speed' },
    { key: 'punchAccuracy', label: 'Punch accuracy' },
    { key: 'ringCoverage', label: 'Ring coverage' },
  ],
  judo: [
    { key: 'throwEfficiency', label: 'Throw efficiency' },
    { key: 'gripTime', label: 'Grip control time' },
    { key: 'transitionSpeed', label: 'Transition speed' },
  ],
  swimming: [
    { key: 'lapTime', label: 'Average lap time' },
    { key: 'strokeRate', label: 'Stroke rate' },
    { key: 'turnEfficiency', label: 'Turn efficiency' },
  ],
  trackField: [
    { key: 'splitTime', label: 'Split times' },
    { key: 'strideLength', label: 'Stride length' },
    { key: 'acceleration', label: 'Acceleration phases' },
  ],
  wrestling: [
    { key: 'takedownSuccess', label: 'Takedown success rate' },
    { key: 'controlTime', label: 'Control time' },
    { key: 'escapeSpeed', label: 'Escape speed' },
  ],
  winterSports: [
    { key: 'speed', label: 'Average speed' },
    { key: 'lineChoice', label: 'Line choice' },
    { key: 'transitionSmoothness', label: 'Turn / transition smoothness' },
  ],
}

function getSportLabel(sport: SportKey): string {
  switch (sport) {
    case 'boxing':
      return 'Boxing'
    case 'judo':
      return 'Judo'
    case 'swimming':
      return 'Swimming'
    case 'trackField':
      return 'Track & Field'
    case 'wrestling':
      return 'Wrestling'
    case 'winterSports':
      return 'Winter Sports'
    default:
      return 'Sport'
  }
}

function MetricSelection({
  sport,
  onSelectMetric,
  theme,
}: MetricSelectionProps) {
  const metrics = METRICS_BY_SPORT[sport]
  const isDark = theme === 'dark'

  return (
    <div className="app-page metric-selection-page bg-white py-10">
      <div className="metric-selection-content">
        <header className="metric-selection-header">
          <p className="text-[11px] font-semibold tracking-[0.25em] text-sky-200 uppercase">
            Performance metric
          </p>
          <h2 className="mt-1.5 text-2xl md:text-3xl font-semibold tracking-tight text-white">
            What do you want to analyse in{' '}
            <span className="text-sky-300">{getSportLabel(sport)}</span>?
          </h2>
          <p className="mt-1 text-sm text-slate-200/90 max-w-xl">
            Choose a focus metric for this discipline. We use it to tag your
            uploads and structure the performance reports.
          </p>
        </header>
        <div className="metric-selection-grid">
            {metrics.map((metric) => (
              <button
                key={metric.key}
                type="button"
                onClick={() => onSelectMetric(metric.key)}
                className={
                  isDark
                    ? 'group relative h-20 rounded-2xl overflow-hidden bg-slate-900/60 border border-slate-700/80 shadow-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-950 transition transform hover:-translate-y-0.5 hover:border-sky-400/80'
                    : 'group relative h-20 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-sky-400 focus-visible:ring-offset-slate-100 transition transform hover:-translate-y-0.5 hover:border-sky-400/80'
                }
              >
                <div
                  className={
                    isDark
                      ? 'absolute inset-0 bg-gradient-to-r from-sky-500/25 via-slate-900/40 to-slate-900/70 opacity-70 group-hover:opacity-90 transition-opacity'
                      : 'absolute inset-0 bg-gradient-to-r from-sky-50 via-sky-100 to-slate-50 opacity-90 group-hover:opacity-100 transition-opacity'
                  }
                />
                <div className="relative h-full flex items-center px-4">
                  <div
                    className={
                      isDark
                        ? 'mr-3 h-9 w-9 rounded-xl bg-sky-500/20 border border-sky-300/50 flex items-center justify-center text-xs font-semibold text-sky-100 uppercase tracking-[0.18em]'
                        : 'mr-3 h-9 w-9 rounded-xl bg-sky-100 border border-sky-300 flex items-center justify-center text-xs font-semibold text-sky-800 uppercase tracking-[0.18em]'
                    }
                  >
                    KPI
                  </div>
                  <div className="flex flex-col items-start">
                    <span
                      className={
                        isDark
                          ? 'text-white text-sm font-semibold drop-shadow-sm'
                          : 'text-slate-900 text-sm font-semibold'
                      }
                    >
                      {metric.label}
                    </span>
                    <span
                      className={
                        isDark
                          ? 'mt-0.5 text-[11px] text-slate-200/80'
                          : 'mt-0.5 text-[11px] text-slate-600'
                      }
                    >
                      Tap to use this as your key performance metric.
                    </span>
                  </div>
                </div>
              </button>
            ))}
        </div>
      </div>
    </div>
  )
}

export default MetricSelection

