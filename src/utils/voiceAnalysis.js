// ============================================================
// Tone & Voice Consistency Analyzer — Analysis Engine
// All analysis is purely client-side.
// ============================================================

// ---- Power words (from CRO) ----
const POWER_WORDS = new Set([
  'free', 'proven', 'secret', 'instant', 'guaranteed', 'exclusive',
  'now', 'easy', 'discover', 'save', 'new', 'you', 'because',
  'results', 'simple', 'fast', 'limited', 'bonus', 'premium',
  'essential', 'powerful', 'amazing', 'unlock', 'boost', 'transform',
  'ultimate', 'effortless', 'remarkable', 'revolutionary', 'unbeatable',
])

// ---- Formal / informal markers ----
const FORMAL_MARKERS = [
  'therefore', 'however', 'moreover', 'furthermore', 'consequently',
  'nevertheless', 'henceforth', 'accordingly', 'whereas', 'thus',
  'hereby', 'notwithstanding', 'pursuant', 'facilitate', 'utilize',
  'implement', 'endeavor', 'subsequent', 'prior', 'aforementioned',
]

const INFORMAL_MARKERS = [
  'hey', 'yeah', 'gonna', 'wanna', 'gotta', 'kinda', 'sorta',
  'awesome', 'cool', 'super', 'totally', 'literally', 'basically',
  'stuff', 'thing', 'things', 'ok', 'okay', 'btw', 'tbh', 'ngl',
  'lol', 'omg', 'wow', 'yep', 'nope', 'yikes',
]

// ---- Emphasis markers ----
const EMPHASIS_PATTERNS = [
  /[A-Z]{2,}/g,        // ALL CAPS words
  /!{2,}/g,            // Multiple exclamation marks
  /\*\*[^*]+\*\*/g,    // Bold markdown
  /_{2}[^_]+_{2}/g,    // Bold markdown (underscores)
]

// ---- Passive voice pattern ----
const PASSIVE_PATTERN = /\b(is|are|was|were|been|being|be|am|has been|have been|had been|will be|would be|could be|should be|might be|must be)\s+(\w+ly\s+)?(\w+(?:ed|en|wn|nt|ght))\b/gi

// ---- Syllable counting ----
function countSyllables(word) {
  word = word.toLowerCase().replace(/[^a-z]/g, '')
  if (word.length <= 2) return 1

  const vowelGroups = word.match(/[aeiouy]+/g)
  let count = vowelGroups ? vowelGroups.length : 1

  if (word.endsWith('e') && !word.endsWith('le') && count > 1) {
    count--
  }

  if (word.endsWith('ed') && count > 1 && !word.endsWith('ted') && !word.endsWith('ded')) {
    count--
  }

  return Math.max(1, count)
}

// ---- Text helpers ----
function getWords(text) {
  return text.match(/[a-zA-Z'-]+/g) || []
}

function getSentences(text) {
  const raw = text.match(/[^.!?]*[.!?]+[\s]?|[^.!?]+$/g) || []
  return raw.map(s => s.trim()).filter(s => s.length > 0)
}

// ============================================================
// analyzeVoice(text) — Measures 9 voice dimensions
// ============================================================
export function analyzeVoice(text) {
  if (!text || !text.trim()) return null

  const words = getWords(text)
  const sentences = getSentences(text)
  const wordCount = words.length
  const sentenceCount = Math.max(1, sentences.length)
  const lowerWords = words.map(w => w.toLowerCase())

  // 1. Formality (0-100, higher = more formal)
  const formalCount = lowerWords.filter(w => FORMAL_MARKERS.includes(w)).length
  const informalCount = lowerWords.filter(w => INFORMAL_MARKERS.includes(w)).length
  const formalTotal = formalCount + informalCount
  const formality = formalTotal > 0
    ? Math.round((formalCount / formalTotal) * 100)
    : 50 // neutral default

  // 2. Average sentence length (words per sentence)
  const avgSentenceLength = Math.round((wordCount / sentenceCount) * 10) / 10

  // 3. Vocabulary complexity (avg syllables per word, normalized to 0-100)
  const totalSyllables = words.reduce((sum, w) => sum + countSyllables(w), 0)
  const avgSyllables = wordCount > 0 ? totalSyllables / wordCount : 0
  // Normalize: 1.0 syllables = 0 complexity, 3.0+ = 100
  const vocabularyComplexity = Math.round(Math.min(100, Math.max(0, (avgSyllables - 1.0) / 2.0 * 100)))

  // 4. Active/Passive ratio (0-100, higher = more active voice)
  const passiveMatches = text.match(PASSIVE_PATTERN) || []
  const passiveCount = passiveMatches.length
  const activeRatio = sentenceCount > 0
    ? Math.round(Math.max(0, Math.min(100, (1 - passiveCount / sentenceCount) * 100)))
    : 100

  // 5. Question frequency (percentage of sentences that are questions)
  const questionCount = sentences.filter(s => s.trim().endsWith('?')).length
  const questionFrequency = Math.round((questionCount / sentenceCount) * 100)

  // 6. Pronoun usage — 1st, 2nd, 3rd person ratios
  const firstPerson = lowerWords.filter(w => ['i', 'me', 'my', 'mine', 'we', 'us', 'our', 'ours'].includes(w)).length
  const secondPerson = lowerWords.filter(w => ['you', 'your', 'yours', 'yourself'].includes(w)).length
  const thirdPerson = lowerWords.filter(w => ['he', 'she', 'it', 'they', 'them', 'his', 'her', 'its', 'their', 'theirs'].includes(w)).length
  const pronounTotal = firstPerson + secondPerson + thirdPerson
  // Encode as score: 0 = all 1st person, 50 = all 2nd person, 100 = all 3rd person
  // Weighted approach: closer to 2nd person = audience-focused
  let pronounUsage = 50 // default balanced
  if (pronounTotal > 0) {
    pronounUsage = Math.round(
      (firstPerson * 0 + secondPerson * 50 + thirdPerson * 100) / pronounTotal
    )
  }

  // 7. Power word density (percentage of words that are power words)
  const powerWordCount = lowerWords.filter(w => POWER_WORDS.has(w)).length
  const powerWordDensity = wordCount > 0
    ? Math.round((powerWordCount / wordCount) * 1000) / 10
    : 0

  // 8. Emphasis markers (count per 100 words)
  let emphasisCount = 0
  for (const pattern of EMPHASIS_PATTERNS) {
    const matches = text.match(pattern) || []
    emphasisCount += matches.length
  }
  // Also count exclamation marks (single)
  emphasisCount += (text.match(/!/g) || []).length
  const emphasisRate = wordCount > 0
    ? Math.round((emphasisCount / wordCount) * 1000) / 10
    : 0

  // 9. Sentence variety (coefficient of variation in sentence length)
  const sentLengths = sentences.map(s => getWords(s).length)
  const avgLen = sentLengths.reduce((a, b) => a + b, 0) / sentLengths.length
  const variance = sentLengths.reduce((sum, len) => sum + Math.pow(len - avgLen, 2), 0) / sentLengths.length
  const stdDev = Math.sqrt(variance)
  const sentenceVariety = avgLen > 0 ? Math.round(Math.min(100, (stdDev / avgLen) * 100)) : 0

  return {
    formality,
    avgSentenceLength,
    vocabularyComplexity,
    activeRatio,
    questionFrequency,
    pronounUsage,
    powerWordDensity,
    emphasisRate,
    sentenceVariety,
    wordCount,
    sentenceCount,
  }
}

// ============================================================
// buildProfile(samples[]) — Averages multiple analyzeVoice results
// ============================================================
export function buildProfile(samples) {
  const analyses = samples
    .map(s => analyzeVoice(s))
    .filter(Boolean)

  if (analyses.length === 0) return null

  const dimensions = [
    'formality', 'avgSentenceLength', 'vocabularyComplexity',
    'activeRatio', 'questionFrequency', 'pronounUsage',
    'powerWordDensity', 'emphasisRate', 'sentenceVariety',
  ]

  const profile = {}
  for (const dim of dimensions) {
    const values = analyses.map(a => a[dim])
    profile[dim] = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
  }

  profile.sampleCount = analyses.length
  profile.createdAt = new Date().toISOString()
  profile.totalWords = analyses.reduce((sum, a) => sum + a.wordCount, 0)

  return profile
}

// ============================================================
// checkConsistency(newText, profile) — Compares new copy against profile
// ============================================================
export function checkConsistency(newText, profile) {
  const current = analyzeVoice(newText)
  if (!current || !profile) return null

  const dimensions = [
    { key: 'formality', label: 'Formality', weight: 1.5, tolerance: 20 },
    { key: 'avgSentenceLength', label: 'Sentence Length', weight: 1.0, tolerance: 5 },
    { key: 'vocabularyComplexity', label: 'Vocabulary Level', weight: 1.2, tolerance: 15 },
    { key: 'activeRatio', label: 'Active Voice', weight: 1.0, tolerance: 15 },
    { key: 'questionFrequency', label: 'Question Usage', weight: 0.8, tolerance: 10 },
    { key: 'pronounUsage', label: 'Person/Perspective', weight: 1.3, tolerance: 15 },
    { key: 'powerWordDensity', label: 'Power Words', weight: 0.8, tolerance: 2 },
    { key: 'emphasisRate', label: 'Emphasis', weight: 0.7, tolerance: 3 },
    { key: 'sentenceVariety', label: 'Sentence Variety', weight: 0.7, tolerance: 15 },
  ]

  let totalWeightedScore = 0
  let totalWeight = 0
  const breakdown = []

  for (const dim of dimensions) {
    const profileValue = profile[dim.key]
    const currentValue = current[dim.key]
    const diff = Math.abs(profileValue - currentValue)

    // Score: 100 if within tolerance, linearly decreasing beyond
    const rawScore = diff <= dim.tolerance
      ? 100
      : Math.max(0, 100 - ((diff - dim.tolerance) / dim.tolerance) * 100)

    const score = Math.round(rawScore)

    let status = 'match'
    if (score < 50) status = 'mismatch'
    else if (score < 80) status = 'partial'

    // Generate actionable tip for mismatched dimensions
    let tip = null
    if (status !== 'match') {
      tip = getTip(dim.key, profileValue, currentValue)
    }

    totalWeightedScore += score * dim.weight
    totalWeight += dim.weight

    breakdown.push({
      key: dim.key,
      label: dim.label,
      profileValue,
      currentValue,
      score,
      status,
      tip,
    })
  }

  const overallScore = Math.round(totalWeightedScore / totalWeight)

  return {
    overallScore,
    breakdown,
    current,
  }
}

// ---- Dimension labels for display ----
export function getDimensionLabel(key, value) {
  switch (key) {
    case 'formality':
      if (value < 25) return 'Very Casual'
      if (value < 45) return 'Casual'
      if (value < 55) return 'Balanced'
      if (value < 75) return 'Professional'
      return 'Very Formal'
    case 'avgSentenceLength':
      if (value < 10) return 'Very Short'
      if (value < 15) return 'Short'
      if (value < 20) return 'Moderate'
      if (value < 25) return 'Long'
      return 'Very Long'
    case 'vocabularyComplexity':
      if (value < 20) return 'Simple'
      if (value < 40) return 'Accessible'
      if (value < 60) return 'Moderate'
      if (value < 80) return 'Advanced'
      return 'Expert'
    case 'activeRatio':
      if (value < 50) return 'Mostly Passive'
      if (value < 70) return 'Mixed'
      if (value < 90) return 'Mostly Active'
      return 'Very Active'
    case 'questionFrequency':
      if (value === 0) return 'No Questions'
      if (value < 10) return 'Rare'
      if (value < 25) return 'Occasional'
      if (value < 50) return 'Frequent'
      return 'Very Frequent'
    case 'pronounUsage':
      if (value < 20) return 'We-focused'
      if (value < 40) return 'Brand-centric'
      if (value < 60) return 'You-focused'
      if (value < 80) return 'Reader-centric'
      return 'Third Person'
    case 'powerWordDensity':
      if (value < 1) return 'Minimal'
      if (value < 3) return 'Moderate'
      if (value < 5) return 'Strong'
      return 'Very High'
    case 'emphasisRate':
      if (value < 1) return 'Understated'
      if (value < 3) return 'Moderate'
      if (value < 6) return 'Energetic'
      return 'Very Emphatic'
    case 'sentenceVariety':
      if (value < 20) return 'Uniform'
      if (value < 40) return 'Somewhat Varied'
      if (value < 60) return 'Varied'
      return 'Very Varied'
    default:
      return String(value)
  }
}

// ---- Tips for mismatched dimensions ----
function getTip(key, profileValue, currentValue) {
  const higher = currentValue > profileValue

  switch (key) {
    case 'formality':
      return higher
        ? 'This copy is more formal than your usual voice. Try using shorter, more conversational words.'
        : 'This copy is more casual than your usual voice. Consider using more polished language.'
    case 'avgSentenceLength':
      return higher
        ? `Your sentences average ${currentValue} words — longer than your typical ${profileValue}. Break up longer sentences.`
        : `Your sentences average ${currentValue} words — shorter than your typical ${profileValue}. Consider adding detail to key sentences.`
    case 'vocabularyComplexity':
      return higher
        ? 'You\'re using more complex vocabulary than usual. Swap multi-syllable words for simpler alternatives.'
        : 'Your vocabulary is simpler than usual. If the topic calls for it, use more precise terminology.'
    case 'activeRatio':
      return higher
        ? 'Great — even more active voice than usual. Keep it up.'
        : 'More passive voice than your typical copy. Rewrite "was done by" patterns to "[subject] did."'
    case 'questionFrequency':
      return higher
        ? 'More questions than usual. Make sure they\'re rhetorical and purposeful, not filler.'
        : 'Fewer questions than usual. Adding a question can engage readers and break up statements.'
    case 'pronounUsage':
      return higher
        ? 'Less "you"-focused than usual. Shift some sentences to address the reader directly.'
        : 'More "you"-focused than usual. Consider balancing with brand perspective ("we").'
    case 'powerWordDensity':
      return higher
        ? 'More power words than usual. Make sure they feel natural, not forced.'
        : 'Fewer persuasive power words than usual. Consider adding words like "proven," "free," or "instant."'
    case 'emphasisRate':
      return higher
        ? 'More emphasis markers (caps, exclamation marks) than usual. Tone it down to match your established voice.'
        : 'Less emphasis than usual. Add strategic bold text or exclamation for key points.'
    case 'sentenceVariety':
      return higher
        ? 'More sentence length variation than usual. This can be good — just make sure it reads smoothly.'
        : 'Sentences are more uniform than usual. Mix short punchy sentences with longer explanatory ones.'
    default:
      return null
  }
}
