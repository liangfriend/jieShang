import { computed, onMounted, onUnmounted, reactive, ref, shallowRef, watch } from 'vue'
import { useMidiStore } from '@renderer/store/midi.store'
import { usePlayStore } from '@renderer/store/play.store'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import {
  pianoHoldTriggerOptions,
  pianoOneShotTriggerOptions,
  pianoReleaseOptions
} from '@renderer/utils/pianoEnvelope'
import {
  NOTE_PRACTICE_COUNT_MAX,
  NOTE_PRACTICE_COUNT_MIN,
  buildNotePracticeBlock,
  listNotePracticeMidis,
  loadNotePracticeSettings,
  normalizeNotePracticeSettings,
  saveNotePracticeSettings,
  type NotePracticeBlock
} from '@renderer/views/abilityTest/notePractice'

export type NotePracticePhase = 'setup' | 'running' | 'final'

export type NotePracticeFeedback = 'idle' | 'wrong'

/** 出题时最多尝试几个 midi，避免极端设置下个别音写不出来时卡住 */
const BUILD_ATTEMPTS = 24

const TARGET_SOUND_SECONDS = 0.8

export function useNotePractice() {
  const midiStore = useMidiStore()
  const playStore = usePlayStore()
  const gameSettings = useGameSettingsStore()

  const settings = reactive(loadNotePracticeSettings())
  watch(settings, () => saveNotePracticeSettings(normalizeNotePracticeSettings(settings)), {
    deep: true
  })

  const candidateMidis = computed(() => listNotePracticeMidis(settings))

  const phase = ref<NotePracticePhase>('setup')
  const current = shallowRef<NotePracticeBlock | null>(null)
  const feedback = ref<NotePracticeFeedback>('idle')
  /** 每次反馈自增，用作反馈层 key 以重播动画 */
  const feedbackSeq = ref(0)
  const completed = ref(0)
  const wrongPresses = ref(0)
  const firstTryCorrect = ref(0)
  const streak = ref(0)
  const bestStreak = ref(0)
  const elapsedMs = ref(0)
  let totalResponseMs = 0

  let blockSeq = 0
  let currentMissed = false
  let shownAt = 0
  let startedAt = 0
  let lastMidi: number | null = null
  let clockTimerId = 0
  /** 本局冻结的设置，开局后修改设置不影响出题 */
  let runSettings = normalizeNotePracticeSettings(settings)
  let runCandidates: number[] = []

  const progressText = computed(() => {
    const index = phase.value === 'running' ? completed.value + 1 : completed.value
    return `${index} / ${runSettings.infinite ? '∞' : runSettings.count}`
  })

  const summary = computed(() => ({
    completed: completed.value,
    wrongPresses: wrongPresses.value,
    accuracyPercent: completed.value > 0 ? (firstTryCorrect.value / completed.value) * 100 : 0,
    avgResponseMs: completed.value > 0 ? totalResponseMs / completed.value : null,
    bestStreak: bestStreak.value,
    elapsedMs: elapsedMs.value
  }))

  /** 虚拟钢琴显示到候选音域所在的完整八度 */
  const pianoRange = computed(() => {
    const list = phase.value === 'running' ? runCandidates : candidateMidis.value
    const lo = list[0] ?? runSettings.midiMin
    const hi = list[list.length - 1] ?? runSettings.midiMax
    return { min: Math.floor(lo / 12) * 12, max: Math.ceil((hi + 1) / 12) * 12 - 1 }
  })

  function setCount(value: number) {
    settings.count = Math.min(
      NOTE_PRACTICE_COUNT_MAX,
      Math.max(NOTE_PRACTICE_COUNT_MIN, Math.round(Number.isFinite(value) ? value : NOTE_PRACTICE_COUNT_MIN))
    )
  }

  function setMidiRange(range: [number, number]) {
    settings.midiMin = Math.min(range[0], range[1])
    settings.midiMax = Math.max(range[0], range[1])
  }

  function clearTimers() {
    if (clockTimerId) {
      window.clearInterval(clockTimerId)
      clockTimerId = 0
    }
  }

  function flash(kind: NotePracticeFeedback) {
    feedback.value = kind
    feedbackSeq.value += 1
  }

  function pickMidi(): number | null {
    const pool =
      runCandidates.length > 1 && lastMidi != null
        ? runCandidates.filter((midi) => midi !== lastMidi)
        : runCandidates
    if (pool.length === 0) return null
    return pool[Math.floor(Math.random() * pool.length)] ?? null
  }

  function showNextBlock(): boolean {
    for (let i = 0; i < BUILD_ATTEMPTS; i++) {
      const midi = pickMidi()
      if (midi == null) return false
      const block = buildNotePracticeBlock(`note-practice-${++blockSeq}`, midi, runSettings)
      if (!block) continue
      current.value = block
      lastMidi = block.midi
      currentMissed = false
      shownAt = performance.now()
      feedback.value = 'idle'
      if (runSettings.playTargetSound) {
        void playStore.triggerNote(
          block.midi,
          pianoOneShotTriggerOptions(TARGET_SOUND_SECONDS, {
            id: `note-practice-target-${block.id}`,
            volume: gameSettings.noteBlockSoundVolume
          })
        )
      }
      return true
    }
    return false
  }

  function finish() {
    if (phase.value !== 'running') return
    clearTimers()
    elapsedMs.value = performance.now() - startedAt
    current.value = null
    phase.value = 'final'
  }

  function onCorrect() {
    const responseMs = Math.max(0, performance.now() - shownAt)
    totalResponseMs += responseMs
    completed.value += 1
    if (currentMissed) {
      streak.value = 0
    } else {
      firstTryCorrect.value += 1
      streak.value += 1
      bestStreak.value = Math.max(bestStreak.value, streak.value)
    }
    if (!runSettings.infinite && completed.value >= runSettings.count) {
      finish()
      return
    }
    if (!showNextBlock()) finish()
  }

  function onWrong() {
    wrongPresses.value += 1
    currentMissed = true
    streak.value = 0
    flash('wrong')
  }

  function handleNoteOn(midi: number) {
    const keySound = phase.value === 'running' ? runSettings.keySound : settings.keySound
    if (keySound) {
      void playStore.triggerNote(midi, pianoHoldTriggerOptions({ id: `note-practice-key-${midi}` }))
    }
    if (phase.value !== 'running' || !current.value) return
    if (midi === current.value.midi) onCorrect()
    else onWrong()
  }

  function handleNoteOff(midi: number) {
    playStore.releaseNote(midi, pianoReleaseOptions())
  }

  function handleMidiMessage(event: MIDIMessageEvent) {
    const data = event.data
    if (!data || data.length < 2) return
    const command = data[0]! & 0xf0
    const note = data[1]!
    const velocity = data.length > 2 ? data[2]! : 0
    if (command === 0x90 && velocity > 0) handleNoteOn(note)
    else if (command === 0x80 || (command === 0x90 && velocity === 0)) handleNoteOff(note)
  }

  function resetRun() {
    clearTimers()
    current.value = null
    feedback.value = 'idle'
    completed.value = 0
    wrongPresses.value = 0
    firstTryCorrect.value = 0
    streak.value = 0
    bestStreak.value = 0
    elapsedMs.value = 0
    totalResponseMs = 0
    lastMidi = null
    currentMissed = false
  }

  function start(): boolean {
    resetRun()
    runSettings = normalizeNotePracticeSettings(settings)
    runCandidates = listNotePracticeMidis(runSettings)
    if (runCandidates.length === 0) return false
    phase.value = 'running'
    startedAt = performance.now()
    clockTimerId = window.setInterval(() => {
      elapsedMs.value = performance.now() - startedAt
    }, 200)
    if (!showNextBlock()) {
      finish()
      return false
    }
    return true
  }

  function backToSetup() {
    resetRun()
    phase.value = 'setup'
  }

  onMounted(async () => {
    midiStore.addMessageListener(handleMidiMessage)
    await midiStore.init().catch(() => undefined)
    await playStore.waitReady()
    await playStore.resetCollectionToneColorToDefault()
  })

  onUnmounted(() => {
    midiStore.removeMessageListener(handleMidiMessage)
    clearTimers()
  })

  return {
    settings,
    candidateMidis,
    phase,
    current,
    feedback,
    feedbackSeq,
    completed,
    wrongPresses,
    elapsedMs,
    progressText,
    summary,
    pianoRange,
    setCount,
    setMidiRange,
    start,
    finish,
    backToSetup
  }
}
