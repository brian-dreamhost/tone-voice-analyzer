import { getDimensionLabel } from '../utils/voiceAnalysis.js'

const DIMENSIONS = [
  { key: 'formality', label: 'Formality', leftLabel: 'Casual', rightLabel: 'Formal' },
  { key: 'avgSentenceLength', label: 'Sentence Length', leftLabel: 'Short', rightLabel: 'Long', max: 30 },
  { key: 'vocabularyComplexity', label: 'Vocabulary Level', leftLabel: 'Simple', rightLabel: 'Complex' },
  { key: 'activeRatio', label: 'Voice', leftLabel: 'Passive', rightLabel: 'Active' },
  { key: 'questionFrequency', label: 'Question Usage', leftLabel: 'None', rightLabel: 'Frequent' },
  { key: 'pronounUsage', label: 'Perspective', leftLabel: 'We/Brand', rightLabel: 'They/Third' },
  { key: 'powerWordDensity', label: 'Power Words', leftLabel: 'Minimal', rightLabel: 'Heavy', max: 10 },
  { key: 'emphasisRate', label: 'Emphasis', leftLabel: 'Understated', rightLabel: 'Emphatic', max: 10 },
  { key: 'sentenceVariety', label: 'Sentence Variety', leftLabel: 'Uniform', rightLabel: 'Varied' },
]

export default function VoiceProfileCard({ profile }) {
  if (!profile) return null

  const createdDate = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Unknown'

  return (
    <div className="card-gradient border border-metal/20 rounded-2xl p-5 sm:p-6">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-prince">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          </svg>
          Your Voice Profile
        </h3>
        <div className="text-xs text-galactic">
          {profile.sampleCount} sample{profile.sampleCount !== 1 ? 's' : ''} &middot; {createdDate}
        </div>
      </div>

      <div className="space-y-4">
        {DIMENSIONS.map(dim => {
          const value = profile[dim.key]
          const max = dim.max || 100
          const percentage = Math.min(100, (value / max) * 100)
          const contextLabel = getDimensionLabel(dim.key, value)

          return (
            <div key={dim.key}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium text-cloudy">{dim.label}</span>
                <span className="text-xs text-prince font-medium">{contextLabel}</span>
              </div>
              <div className="relative">
                <div className="w-full h-2 bg-metal/30 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-prince transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between mt-0.5">
                  <span className="text-[10px] text-galactic">{dim.leftLabel}</span>
                  <span className="text-[10px] text-galactic">{dim.rightLabel}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
