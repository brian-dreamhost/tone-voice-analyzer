import { useState, useEffect, useCallback } from 'react'
import { buildProfile, checkConsistency } from './utils/voiceAnalysis.js'
import VoiceProfileCard from './components/VoiceProfileCard.jsx'
import ConsistencyResult from './components/ConsistencyResult.jsx'

const STORAGE_KEY = 'tva-voice-profile'
const SAMPLES_KEY = 'tva-samples'

export default function App() {
  const [tab, setTab] = useState('build')
  const [samples, setSamples] = useState(['', '', ''])
  const [profile, setProfile] = useState(null)
  const [checkText, setCheckText] = useState('')
  const [result, setResult] = useState(null)

  // Load profile from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) setProfile(JSON.parse(saved))
      const savedSamples = localStorage.getItem(SAMPLES_KEY)
      if (savedSamples) setSamples(JSON.parse(savedSamples))
    } catch {
      // ignore parse errors
    }
  }, [])

  const handleSampleChange = useCallback((index, value) => {
    setSamples(prev => {
      const updated = [...prev]
      updated[index] = value
      return updated
    })
  }, [])

  const handleGenerateProfile = useCallback(() => {
    const filledSamples = samples.filter(s => s.trim().length > 0)
    if (filledSamples.length < 2) return

    const newProfile = buildProfile(filledSamples)
    if (newProfile) {
      setProfile(newProfile)
      localStorage.setItem(STORAGE_KEY, JSON.stringify(newProfile))
      localStorage.setItem(SAMPLES_KEY, JSON.stringify(samples))
      setTab('check')
      setResult(null)
    }
  }, [samples])

  const handleCheckConsistency = useCallback(() => {
    if (!checkText.trim() || !profile) return
    const checkResult = checkConsistency(checkText, profile)
    setResult(checkResult)
  }, [checkText, profile])

  const handleReset = useCallback(() => {
    setSamples(['', '', ''])
    setProfile(null)
    setCheckText('')
    setResult(null)
    localStorage.removeItem(STORAGE_KEY)
    localStorage.removeItem(SAMPLES_KEY)
    setTab('build')
  }, [])

  const filledCount = samples.filter(s => s.trim().length > 0).length
  const canGenerate = filledCount >= 2

  return (
    <div className="min-h-screen bg-abyss bg-glow bg-grid">
      <div className="relative z-10 max-w-6xl mx-auto px-4 py-8 sm:py-12 animate-fadeIn">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-galactic">
          <a href="https://seo-tools-tau.vercel.app/" className="text-azure hover:text-white transition-colors">Free Tools</a>
          <span className="mx-2 text-metal">/</span>
          <a href="https://seo-tools-tau.vercel.app/copywriting/" className="text-azure hover:text-white transition-colors">Copywriting Tools</a>
          <span className="mx-2 text-metal">/</span>
          <span className="text-cloudy">Tone & Voice Analyzer</span>
        </nav>

        {/* Header */}
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="border border-turtle text-turtle rounded-full px-4 py-1.5 text-xs font-medium uppercase tracking-wide">
              Free Tool
            </span>
          </div>
          <h1 className="text-4xl sm:text-[2.7rem] font-bold text-white mb-3">
            Tone & Voice Consistency Analyzer
          </h1>
          <p className="text-cloudy text-lg max-w-2xl">
            Build a voice profile from your best copy, then check new content to make sure it sounds like you. Your profile is saved locally and persists across visits.
          </p>
        </header>

        {/* Tabs */}
        <div className="flex gap-1 mb-8">
          <button
            onClick={() => setTab('build')}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss ${
              tab === 'build'
                ? 'bg-azure text-white'
                : 'text-cloudy hover:text-white border border-metal/30 hover:border-metal/50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              </svg>
              Build Profile
            </span>
          </button>
          <button
            onClick={() => profile && setTab('check')}
            disabled={!profile}
            className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-colors focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss ${
              tab === 'check'
                ? 'bg-azure text-white'
                : profile
                  ? 'text-cloudy hover:text-white border border-metal/30 hover:border-metal/50'
                  : 'text-galactic border border-metal/20 cursor-not-allowed opacity-50'
            }`}
          >
            <span className="flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
              Check Copy
              {!profile && <span className="text-xs opacity-75">(build profile first)</span>}
            </span>
          </button>
        </div>

        {/* Build Profile Tab */}
        {tab === 'build' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="card-gradient border border-metal/20 rounded-2xl p-5 sm:p-6">
              <h2 className="text-lg font-bold text-white mb-2">Paste 2-3 Samples of Your Best Copy</h2>
              <p className="text-sm text-galactic mb-6">
                Use copy that represents how you want your brand to sound — landing pages, emails, social posts, or product descriptions that you're proud of. The more samples, the more accurate your profile.
              </p>

              <div className="space-y-4">
                {samples.map((sample, index) => (
                  <div key={index}>
                    <label htmlFor={`sample-${index}`} className="flex items-center gap-2 mb-1.5">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-prince/20 text-prince text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="text-sm font-medium text-cloudy">
                        Sample {index + 1}
                        {index === 2 && <span className="text-galactic font-normal ml-1">(optional)</span>}
                      </span>
                      {sample.trim() && (
                        <span className="text-xs text-galactic ml-auto">
                          {sample.trim().split(/\s+/).length} words
                        </span>
                      )}
                    </label>
                    <textarea
                      id={`sample-${index}`}
                      value={sample}
                      onChange={(e) => handleSampleChange(index, e.target.value)}
                      placeholder={
                        index === 0 ? 'Paste your first copy sample here...'
                        : index === 1 ? 'Paste a second sample with a similar voice...'
                        : 'Optional: a third sample for even better accuracy...'
                      }
                      rows={5}
                      className="w-full bg-midnight/80 border border-metal/30 rounded-xl px-4 py-3 text-white text-[15px] placeholder:text-galactic focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss resize-y transition-colors"
                    />
                  </div>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-3 mt-6">
                <button
                  onClick={handleGenerateProfile}
                  disabled={!canGenerate}
                  className="bg-azure text-white font-semibold rounded-lg px-6 py-3 hover:bg-azure-hover focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
                  </svg>
                  Generate Voice Profile
                </button>
                {!canGenerate && (
                  <span className="text-xs text-galactic">
                    Fill in at least 2 samples to generate a profile
                  </span>
                )}
              </div>
            </div>

            {/* Show existing profile if one exists */}
            {profile && <VoiceProfileCard profile={profile} />}
          </div>
        )}

        {/* Check Copy Tab */}
        {tab === 'check' && profile && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Input */}
              <div className="lg:col-span-7 space-y-6">
                <div className="card-gradient border border-metal/20 rounded-2xl p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-white mb-2">Paste New Copy to Check</h2>
                  <p className="text-sm text-galactic mb-4">
                    Enter copy you want to verify against your voice profile. The analyzer will compare it dimension-by-dimension and highlight inconsistencies.
                  </p>
                  <textarea
                    value={checkText}
                    onChange={(e) => setCheckText(e.target.value)}
                    placeholder="Paste the copy you want to check for voice consistency..."
                    rows={8}
                    className="w-full bg-midnight/80 border border-metal/30 rounded-xl px-4 py-3 text-white text-[15px] placeholder:text-galactic focus:outline-none focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss resize-y transition-colors"
                  />
                  <div className="flex flex-wrap items-center gap-3 mt-4">
                    <button
                      onClick={handleCheckConsistency}
                      disabled={!checkText.trim()}
                      className="bg-azure text-white font-semibold rounded-lg px-6 py-3 hover:bg-azure-hover focus:ring-2 focus:ring-azure focus:ring-offset-2 focus:ring-offset-abyss transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      Check Consistency
                    </button>
                    {checkText.trim() && (
                      <span className="text-xs text-galactic">
                        {checkText.trim().split(/\s+/).length} words
                      </span>
                    )}
                  </div>
                </div>

                {/* Consistency Result */}
                {result && <ConsistencyResult result={result} />}
              </div>

              {/* Right: Profile */}
              <div className="lg:col-span-5">
                <div className="lg:sticky lg:top-6">
                  <VoiceProfileCard profile={profile} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Reset Profile */}
        {profile && (
          <div className="mt-8 text-center">
            <button
              onClick={handleReset}
              className="text-sm text-galactic hover:text-coral transition-colors flex items-center gap-1.5 mx-auto"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
              </svg>
              Reset Voice Profile
            </button>
          </div>
        )}

        {/* How It Works */}
        <section className="mt-16">
          <h2 className="text-xl font-bold text-white mb-6">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
            <div className="card-gradient border border-metal/20 rounded-2xl p-5 lg:p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-prince/10 text-prince font-bold text-lg mb-3">1</div>
              <h3 className="text-white font-semibold mb-2">Build Your Profile</h3>
              <p className="text-galactic text-sm">Paste 2-3 samples of your best copy. The analyzer extracts 9 voice dimensions — formality, sentence patterns, vocabulary, and more.</p>
            </div>
            <div className="card-gradient border border-metal/20 rounded-2xl p-5 lg:p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-prince/10 text-prince font-bold text-lg mb-3">2</div>
              <h3 className="text-white font-semibold mb-2">Check New Copy</h3>
              <p className="text-galactic text-sm">Paste any new content — blog post, email, social caption — and the analyzer compares it against your established voice profile.</p>
            </div>
            <div className="card-gradient border border-metal/20 rounded-2xl p-5 lg:p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-prince/10 text-prince font-bold text-lg mb-3">3</div>
              <h3 className="text-white font-semibold mb-2">Get Actionable Feedback</h3>
              <p className="text-galactic text-sm">See a consistency score with per-dimension breakdowns and specific tips to bring off-brand copy back in line with your voice.</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-metal/30 mt-16 py-8 text-center text-sm text-galactic">
          Free marketing tools by{' '}
          <a href="https://www.dreamhost.com" target="_blank" rel="noopener noreferrer" className="text-azure hover:text-white transition-colors">
            DreamHost
          </a>
        </footer>
      </div>
    </div>
  )
}
