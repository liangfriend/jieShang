import { computed, onUnmounted, ref, shallowRef } from 'vue'
import { usePlayStore } from '@renderer/store/play.store'
import {
  ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_DEFAULT_ROUNDS,
  ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MAX_ROUNDS,
  ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MIN_ROUNDS,
  ABSOLUTE_PITCH_NOTE_DURATION_SEC,
  ABSOLUTE_PITCH_RESULT_GREEN,
  ABSOLUTE_PITCH_RESULT_RED,
  ABSOLUTE_PITCH_ROUND_PAUSE_MS,
  collectMidiCandidates,
  midiToPitchClass,
  pickRandomMidi,
  resolveAbsolutePitchClasses,
  summarizeAbsolutePitchResults,
  type AbsolutePitchRoundResult,
  type AbsolutePitchScaleMode,
  type AbsolutePitchSoundRange,
  type OctavePianoKeyState,
  type OctavePianoLabelMode,
  type PitchClass
} from '@renderer/constant/absolutePitchTest'

export type AbsolutePitchPhase = 'setup' | 'question' | 'result' | 'final'

export function useAbsolutePitchTest() {
  const playStore = usePlayStore()

  const phase = ref<AbsolutePitchPhase>('setup')
  const scaleMode = ref<AbsolutePitchScaleMode>('chromatic')
  const soundRange = ref<AbsolutePitchSoundRange>('standard')
  const totalRounds = ref(ABSOLUTE_PITCH_DEFAULT_ROUNDS)
  const countdownSec = ref(ABSOLUTE_PITCH_DEFAULT_COUNTDOWN_SEC)
  const labelMode = ref<OctavePianoLabelMode>('noteName')

  const currentRound = ref(0)
  const targetMidi = ref(60)
  const targetPitchClass = ref<PitchClass>(0)
  const countdownLeft = ref(0)
  const ringStatus = ref<'idle' | 'correct' | 'wrong'>('idle')
  const selectedPitchClass = ref<PitchClass | null>(null)
  const lastRoundResult = shallowRef<AbsolutePitchRoundResult | null>(null)
  const roundResults = shallowRef<AbsolutePitchRoundResult[]>([])
  const pianoKeyStates = shallowRef<OctavePianoKeyState[]>([])

  let sessionToken = 0
  let countdownTimerId = 0
  let pauseTimerId = 0
  let roundStartedAt = 0
  let lastPlayedMidi: number | undefined

  const progressText = computed(() => `${currentRound.value} / ${totalRounds.value}`)
  const summary = computed(() => summarizeAbsolutePitchResults(roundResults.value))
  const pianoDisabled = computed(() => phase.value !== 'question')

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
    selectedPitchClass.value = null
    lastRoundResult.value = null
    roundResults.value = []
    pianoKeyStates.value = []
    lastPlayedMidi = undefined
  }

  function setScaleMode(value: AbsolutePitchScaleMode) {
    scaleMode.value = value
  }

  function setSoundRange(value: AbsolutePitchSoundRange) {
    soundRange.value = value
  }

  function setLabelMode(value: OctavePianoLabelMode) {
    labelMode.value = value
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

  async function playTarget(midi = targetMidi.value) {
    try {
      await playStore.triggerNote(midi, {
        duration: ABSOLUTE_PITCH_NOTE_DURATION_SEC,
        id: `absolute-pitch-${midi}-${Date.now()}`
      })
    } catch {
      // 播放失败不阻断答题
    }
  }

  function buildResultKeyStates(correctNum: number, wrongNum: number | null) {
    const states: OctavePianoKeyState[] = [
      { num: correctNum, border: ABSOLUTE_PITCH_RESULT_GREEN, color: ABSOLUTE_PITCH_RESULT_GREEN }
    ]
    if (wrongNum != null && wrongNum !== correctNum) {
      states.push({
        num: wrongNum,
        border: ABSOLUTE_PITCH_RESULT_RED,
        color: ABSOLUTE_PITCH_RESULT_RED
      })
    }
    return states
  }

  function finishRound(options: {
    selected: PitchClass | null
    timedOut: boolean
  }) {
    if (phase.value !== 'question') return
    const token = sessionToken
    clearTimers()

    const selected = options.selected
    const correct = selected != null && selected === targetPitchClass.value
    const responseMs = options.timedOut ? null : Math.max(0, performance.now() - roundStartedAt)
    const result: AbsolutePitchRoundResult = {
      roundIndex: currentRound.value,
      targetMidi: targetMidi.value,
      targetPitchClass: targetPitchClass.value,
      selectedPitchClass: selected,
      correct,
      timedOut: options.timedOut,
      responseMs
    }

    selectedPitchClass.value = selected
    lastRoundResult.value = result
    roundResults.value = [...roundResults.value, result]
    ringStatus.value = correct ? 'correct' : 'wrong'
    pianoKeyStates.value = buildResultKeyStates(
      targetPitchClass.value,
      options.timedOut || correct ? null : selected
    )
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

    const pitchClasses = resolveAbsolutePitchClasses(scaleMode.value)
    const candidates = collectMidiCandidates(soundRange.value, pitchClasses)
    const midi = pickRandomMidi(candidates, lastPlayedMidi)
    lastPlayedMidi = midi

    currentRound.value += 1
    targetMidi.value = midi
    targetPitchClass.value = midiToPitchClass(midi)
    selectedPitchClass.value = null
    lastRoundResult.value = null
    pianoKeyStates.value = []
    ringStatus.value = 'idle'
    countdownLeft.value = countdownSec.value
    roundStartedAt = performance.now()
    phase.value = 'question'

    void playTarget(midi)

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
    void playTarget()
  }

  function selectPitch(num: number) {
    if (phase.value !== 'question') return
    finishRound({ selected: midiToPitchClass(num), timedOut: false })
  }

  async function startTest() {
    invalidate()
    resetSessionState()
    const token = sessionToken
    try {
      await playStore.waitReady()
      await playStore.ensureCollectionToneColorInitialized()
    } catch {
      // 音色初始化失败时仍尝试用内置 piano 开测
    }
    if (!isActive(token)) return
    void startQuestion(token)
  }

  function playAgain() {
    startTest()
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
    scaleMode,
    soundRange,
    totalRounds,
    countdownSec,
    labelMode,
    currentRound,
    targetMidi,
    targetPitchClass,
    countdownLeft,
    ringStatus,
    selectedPitchClass,
    lastRoundResult,
    roundResults,
    pianoKeyStates,
    progressText,
    summary,
    pianoDisabled,
    setScaleMode,
    setSoundRange,
    setLabelMode,
    setTotalRounds,
    setCountdownSec,
    startTest,
    replaySound,
    selectPitch,
    playAgain,
    backToSetup
  }
}
