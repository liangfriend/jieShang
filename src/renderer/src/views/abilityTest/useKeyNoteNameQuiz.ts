import { computed, onUnmounted, ref, shallowRef } from 'vue'
import {
  ABSOLUTE_PITCH_DEFAULT_ROUNDS,
  ABSOLUTE_PITCH_MAX_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MAX_ROUNDS,
  ABSOLUTE_PITCH_MIN_COUNTDOWN_SEC,
  ABSOLUTE_PITCH_MIN_ROUNDS,
  ABSOLUTE_PITCH_ROUND_PAUSE_MS,
  KEY_NOTE_DEFAULT_COUNTDOWN_SEC,
  summarizeAbsolutePitchResults,
  type AbsolutePitchScaleMode,
  type KeyNoteOptionLabelMode,
  type OctavePianoKeyState,
  type PitchClass
} from '@renderer/constant/absolutePitchTest'
import {
  buildKeyNoteChoices,
  buildKeyNoteQuestionKeyStates,
  buildKeyNoteResultKeyStates,
  nextKeyNoteTarget,
  type KeyNoteChoice
} from '@renderer/constant/keyNoteNameQuiz'

export type KeyNotePhase = 'setup' | 'question' | 'result' | 'final'

export type KeyNoteRoundResult = {
  roundIndex: number
  targetPitchClass: PitchClass
  selectedPitchClass: PitchClass | null
  correct: boolean
  timedOut: boolean
  responseMs: number | null
}

export function useKeyNoteNameQuiz() {
  const phase = ref<KeyNotePhase>('setup')
  const scaleMode = ref<AbsolutePitchScaleMode>('diatonic')
  const labelMode = ref<KeyNoteOptionLabelMode>('noteName')
  const totalRounds = ref(ABSOLUTE_PITCH_DEFAULT_ROUNDS)
  const countdownSec = ref(KEY_NOTE_DEFAULT_COUNTDOWN_SEC)

  const currentRound = ref(0)
  const targetPitchClass = ref<PitchClass>(0)
  const countdownLeft = ref(0)
  const ringStatus = ref<'idle' | 'correct' | 'wrong'>('idle')
  const choices = shallowRef<KeyNoteChoice[]>([])
  const selectedPitchClass = ref<PitchClass | null>(null)
  const lastRoundResult = shallowRef<KeyNoteRoundResult | null>(null)
  const roundResults = shallowRef<KeyNoteRoundResult[]>([])
  const pianoKeyStates = shallowRef<OctavePianoKeyState[]>([])

  let sessionToken = 0
  let countdownTimerId = 0
  let pauseTimerId = 0
  let roundStartedAt = 0
  let lastTarget: PitchClass | undefined

  const progressText = computed(() => `${currentRound.value} / ${totalRounds.value}`)
  const summary = computed(() => summarizeAbsolutePitchResults(roundResults.value))

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
    choices.value = []
    selectedPitchClass.value = null
    lastRoundResult.value = null
    roundResults.value = []
    pianoKeyStates.value = []
    lastTarget = undefined
  }

  function setScaleMode(value: AbsolutePitchScaleMode) {
    scaleMode.value = value
  }

  function setLabelMode(value: KeyNoteOptionLabelMode) {
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

  function finishRound(options: { selected: PitchClass | null; timedOut: boolean }) {
    if (phase.value !== 'question') return
    const token = sessionToken
    clearTimers()

    const selected = options.selected
    const correct = selected != null && selected === targetPitchClass.value
    const result: KeyNoteRoundResult = {
      roundIndex: currentRound.value,
      targetPitchClass: targetPitchClass.value,
      selectedPitchClass: selected,
      correct,
      timedOut: options.timedOut,
      responseMs: options.timedOut ? null : Math.max(0, performance.now() - roundStartedAt)
    }

    selectedPitchClass.value = selected
    lastRoundResult.value = result
    roundResults.value = [...roundResults.value, result]
    ringStatus.value = correct ? 'correct' : 'wrong'
    pianoKeyStates.value = buildKeyNoteResultKeyStates(
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
      startQuestion(token)
    }, ABSOLUTE_PITCH_ROUND_PAUSE_MS)
  }

  function startQuestion(token: number) {
    if (!isActive(token)) return
    const target = nextKeyNoteTarget(scaleMode.value, lastTarget)
    lastTarget = target

    currentRound.value += 1
    targetPitchClass.value = target
    selectedPitchClass.value = null
    lastRoundResult.value = null
    choices.value = buildKeyNoteChoices(target, scaleMode.value, labelMode.value)
    pianoKeyStates.value = buildKeyNoteQuestionKeyStates(target)
    ringStatus.value = 'idle'
    countdownLeft.value = countdownSec.value
    roundStartedAt = performance.now()
    phase.value = 'question'

    countdownTimerId = window.setInterval(() => {
      if (!isActive(token)) return
      countdownLeft.value -= 1
      if (countdownLeft.value > 0) return
      window.clearInterval(countdownTimerId)
      countdownTimerId = 0
      finishRound({ selected: null, timedOut: true })
    }, 1000)
  }

  function selectChoice(pitchClass: PitchClass) {
    if (phase.value !== 'question') return
    finishRound({ selected: pitchClass, timedOut: false })
  }

  function startTest() {
    invalidate()
    resetSessionState()
    startQuestion(sessionToken)
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
    labelMode,
    totalRounds,
    countdownSec,
    currentRound,
    targetPitchClass,
    countdownLeft,
    ringStatus,
    choices,
    selectedPitchClass,
    lastRoundResult,
    roundResults,
    pianoKeyStates,
    progressText,
    summary,
    setScaleMode,
    setLabelMode,
    setTotalRounds,
    setCountdownSec,
    startTest,
    selectChoice,
    playAgain,
    backToSetup
  }
}
