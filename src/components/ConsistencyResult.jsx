import { getDimensionLabel } from '../utils/voiceAnalysis.js'

function ScoreGauge({ score }) {
  const circumference = 2 * Math.PI * 45
  const dashoffset = circumference - (score / 100) * circumference

  let color = 'text-coral'
  let label = 'Off-Brand'
  if (score >= 80) {
    color = 'text-turtle'
    label = 'On-Brand'
  } else if (score >= 60) {
    color = 'text-tangerine'
    label = 'Mostly Consistent'
  } else if (score >= 40) {
    color = 'text-tangerine'
    label = 'Somewhat Off'
  }

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-32 h-32">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor"
            strokeWidth="6"
            className="text-metal/30"
          />
          <circle
            cx="50" cy="50" r="45"
            fill="none" stroke="currentColor"
            strokeWidth="6"
            className={color}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-white">{score}</span>
          <span className="text-xs text-galactic">/100</span>
        </div>
      </div>
      <span className={`text-sm font-medium mt-2 ${color}`}>{label}</span>
    </div>
  )
}

function StatusBadge({ status }) {
  const styles = {
    match: 'bg-turtle/10 text-turtle border-turtle/30',
    partial: 'bg-tangerine/10 text-tangerine border-tangerine/30',
    mismatch: 'bg-coral/10 text-coral border-coral/30',
  }

  const labels = {
    match: 'Match',
    partial: 'Partial',
    mismatch: 'Mismatch',
  }

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${styles[status]}`}>
      {labels[status]}
    </span>
  )
}

export default function ConsistencyResult({ result }) {
  if (!result) return null

  const { overallScore, breakdown } = result

  return (
    <div className="card-gradient border border-metal/20 rounded-2xl p-5 sm:p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-center gap-6">
        <ScoreGauge score={overallScore} />
        <div className="flex-1 text-center sm:text-left">
          <h3 className="text-lg font-bold text-white mb-1">Voice Consistency Score</h3>
          <p className="text-sm text-cloudy">
            {overallScore >= 80
              ? 'This copy closely matches your established voice profile. The tone and style are consistent.'
              : overallScore >= 60
              ? 'This copy mostly aligns with your voice, but a few dimensions are off. See details below.'
              : overallScore >= 40
              ? 'This copy deviates from your established voice in several areas. Review the mismatched dimensions.'
              : 'This copy doesn\'t match your voice profile. Consider revising to align with your brand voice.'}
          </p>
        </div>
      </div>

      {/* Per-dimension breakdown table */}
      <div>
        <h4 className="text-sm font-semibold text-white mb-3 uppercase tracking-wide">Dimension Breakdown</h4>
        <div className="space-y-3">
          {breakdown.map(dim => (
            <div key={dim.key} className={`rounded-xl border p-3 ${
              dim.status === 'match' ? 'border-metal/20' :
              dim.status === 'partial' ? 'border-tangerine/20 bg-tangerine/[0.03]' :
              'border-coral/20 bg-coral/[0.03]'
            }`}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-white">{dim.label}</span>
                <StatusBadge status={dim.status} />
              </div>
              <div className="flex items-center gap-4 text-xs text-galactic">
                <span>
                  Profile: <span className="text-cloudy font-medium">{getDimensionLabel(dim.key, dim.profileValue)}</span>
                </span>
                <span className="text-metal">vs</span>
                <span>
                  Current: <span className="text-cloudy font-medium">{getDimensionLabel(dim.key, dim.currentValue)}</span>
                </span>
              </div>
              {dim.tip && (
                <p className="text-xs text-cloudy mt-2 leading-snug border-t border-metal/15 pt-2">
                  {dim.tip}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
