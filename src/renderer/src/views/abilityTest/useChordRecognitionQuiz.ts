import { computed, onUnmounted, ref, shallowRef } from 'vue'
import { usePlayStore } from '@renderer/store/play.store'
import {
  ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_DEFAULT_ROUNDS,
  ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MAX_ROUNDS,
  ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MIN_ROUNDS,
  ABSOLUTE_PITCH_ROUND_PAUSE_MS,
  summarizeAbsolutePitchResults,
  type AbsolutePitchSoundRange,
  type OctavePianoKeyState
} from '@renderer/constant/absolutePitchTest'
import {
  buildChordChoices,
  buildChordQuestionKeyStates,
  buildChordResultKeyStates,
  CHORD_DEFAULT_QUALITIES,
  CHORD_NOTE_DURATION_SEC,
  pickRandomChordSpec,
  type ChordChoice,
  type ChordQuality,
  type ChordSpec
} from '@renderer/constant/chordRecognitionQuiz'

export type ChordQuizPhase = 'setup' | 'question' | 'result' | 'final'

export type ChordRoundResult = {
  roundIndex: number
  chordId: string
  quality: ChordQuality
  selectedId: string | null
  correct: boolean
  timedOut: boolean
  responseMs: number | null
}

export function useChordRecognitionQuiz() {
  const playStore = usePlayStore()

  const phase = ref<ChordQuizPhase>('setup')
  const enabledQualities = ref<ChordQuality[]>([...CHORD_DEFAULT_QUALITIES])
  const soundRange = ref<AbsolutePitchSoundRange>('standard')
  const showPiano = ref(true)
  const totalRounds = ref(ABSOLUTE_PITCH_DEFAULT_ROUNDS)
  const countdownSec = ref(ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC)

  const currentRound = ref(0)
  const currentChord = shallowRef<ChordSpec | null>(null)
  const countdownLeft = ref(0)
  const ringStatus = ref<'idle' | 'correct' | 'wrong'>('idle')
  const choices = shallowRef<ChordChoice[]>([])
  const selectedId = ref<string | null>(null)
  const lastRoundResult = shallowRef<ChordRoundResult | null>(null)
  const roundResults = shallowRef<ChordRoundResult[]>([])
  const pianoKeyStates = shallowRef<OctavePianoKeyState[]>([])

  let sessionToken = 0
  let countdownTimerId = 0
  let pauseTimerId = 0
  let roundStartedAt = 0
  let lastChordId: string | undefined

  const progressText = computed(() => `${currentRound.value} / ${totalRounds.value}`)
  const summary = computed(() => summarizeAbsolutePitchResults(roundResults.value))
  const qualitySummary = computed(() => {
    const map = new Map<ChordQuality, { total: number; correct: number }>()
    for (const item of roundResults.value) {
      const prev = map.get(item.quality) ?? { total: 0, correct: 0 }
      prev.total += 1
      if (item.correct) prev.correct += 1
      map.set(item.quality, prev)
    }
    return (['major', 'minor', 'dom7', 'maj7', 'min7'] as ChordQuality[])
      .map((quality) => {
        const stats = map.get(quality)
        if (!stats) return null
        return {
          quality,
          total: stats.total,
          correct: stats.correct,
          accuracyPercent: stats.total ? (stats.correct / stats.total) * 100 : 0
        }
      })
      .filter((item): item is NonNullable<typeof item> => item != null)
  })

  function isActive(token: number) {
    return token === sessionToken
  }

  function clearTimers() {
    if (countdownTimerId) {
      window.clearInterval(countdownTimerId)
      countdownTimerId = 0
    }
    if (pauseTimerId) {
      window.clearTimeout(pauseTimerId)
      pauseTimerId = 0
    }
  }

  function invalidate() {
    sessionToken += 1
    clearTimers()
  }

  function resetSessionState() {
    clearTimers()
    currentRound.value = 0
    countdownLeft.value = 0
    ringStatus.value = 'idle'
    currentChord.value = null
    choices.value = []
    selectedId.value = null
    lastRoundResult.value = null
    roundResults.value = []
    pianoKeyStates.value = []
    lastChordId = undefined
  }

  function toggleQuality(quality: ChordQuality) {
    const set = new Set(enabledQualities.value)
    if (set.has(quality)) {
      if (set.size <= 1) return
      set.delete(quality)
    } else {
      set.add(quality)
    }
    enabledQualities.value = (['major', 'minor', 'dom7', 'maj7', 'min7'] as ChordQuality[]).filter(
      (q) => set.has(q)
    )
  }

  function setSoundRange(value: AbsolutePitchSoundRange) {
    soundRange.value = value
  }

  function setShowPiano(value: boolean) {
    showPiano.value = value
  }

  function setTotalRounds(value: number) {
    totalRounds.value = Math.min(
      ABSOLUTE_PITCH_MAX_ROUNDS,
      Math.max(ABSOLUTE_PITCH_MIN_ROUNDS, Math.round(value))
    )
  }

  function setCountdownSec(value: number) {
    countdownSec.value = Math.min(
      ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
      Math.max(ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC, Math.round(value))
    )
  }

  async function playChord(spec: ChordSpec | null = currentChord.value) {
    if (!spec) return
    try {
      const stamp = Date.now()
      await Promise.all(
        spec.midis.map((midi, index) =>
          playStore.triggerNote(midi, {
            duration: CHORD_NOTE_DURATION_SEC,
            id: `chord-${spec.id}-${midi}-${stamp}-${index}`
          })
        )
      )
    } catch {
      // 播放失败不阻断
    }
  }

  function finishRound(options: { selected: string | null; timedOut: boolean }) {
    if (phase.value !== 'question' || !currentChord.value) return
    const token = sessionToken
    clearTimers()

    const chord = currentChord.value
    const selected = options.selected
    const correct = selected != null && selected === chord.id
    const result: ChordRoundResult = {
      roundIndex: currentRound.value,
      chordId: chord.id,
      quality: chord.quality,
      selectedId: selected,
      correct,
      timedOut: options.timedOut,
      responseMs: options.timedOut ? null : Math.max(0, performance.now() - roundStartedAt)
    }

    selectedId.value = selected
    lastRoundResult.value = result
    roundResults.value = [...roundResults.value, result]
    ringStatus.value = correct ? 'correct' : 'wrong'
    pianoKeyStates.value = buildChordResultKeyStates(chord.midis)
    phase.value = 'result'

    pauseTimerId = window.setTimeout(() => {
      if (!isActive(token)) return
      if (currentRound.value >= totalRounds.value) {
        phase.value = 'final'
        return
      }
      void startQuestion(token)
    }, ABSOLUTE_PITCH_ROUND_PAUSE_MS)
  }

  async function startQuestion(token: number) {
    if (!isActive(token)) return
    const chord = pickRandomChordSpec(enabledQualities.value, soundRange.value, lastChordId)
    lastChordId = chord.id

    currentRound.value += 1
    currentChord.value = chord
    selectedId.value = null
    lastRoundResult.value = null
    choices.value = buildChordChoices(chord, enabledQualities.value)
    pianoKeyStates.value = buildChordQuestionKeyStates(chord.midis)
    ringStatus.value = 'idle'
    countdownLeft.value = countdownSec.value
    roundStartedAt = performance.now()
    phase.value = 'question'

    void playChord(chord)

    countdownTimerId = window.setInterval(() => {
      if (!isActive(token)) return
      countdownLeft.value -= 1
      if (countdownLeft.value > 0) return
      window.clearInterval(countdownTimerId)
      countdownTimerId = 0
      finishRound({ selected: null, timedOut: true })
    }, 1000)
  }

  function replaySound() {
    if (phase.value !== 'question') return
    void playChord()
  }

  function selectChoice(id: string) {
    if (phase.value !== 'question') return
    finishRound({ selected: id, timedOut: false })
  }

  async function startTest() {
    invalidate()
    resetSessionState()
    const token = sessionToken
    try {
      await playStore.waitReady()
      await playStore.ensureCollectionToneColorInitialized()
    } catch {
      // 回退内置 piano
    }
    if (!isActive(token)) return
    void startQuestion(token)
  }

  function playAgain() {
    void startTest()
  }

  function backToSetup() {
    invalidate()
    resetSessionState()
    phase.value = 'setup'
  }

  onUnmounted(() => {
    invalidate()
  })

  return {
    phase,
    enabledQualities,
    soundRange,
    showPiano,
    totalRounds,
    countdownSec,
    currentRound,
    currentChord,
    countdownLeft,
    ringStatus,
    choices,
    selectedId,
    lastRoundResult,
    roundResults,
    pianoKeyStates,
    progressText,
    summary,
    qualitySummary,
    toggleQuality,
    setSoundRange,
    setShowPiano,
    setTotalRounds,
    setCountdownSec,
    startTest,
    replaySound,
    selectChoice,
    playAgain,
    backToSetup
  }
}
