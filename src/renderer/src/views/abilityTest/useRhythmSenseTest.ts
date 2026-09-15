import { computed, onUnmounted, ref, shallowRef } from 'vue'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { usePlayStore } from '@renderer/store/play.store'
import {
  RHYTHM_SENSE_COUNTDOWN_SECONDS,
  RHYTHM_SENSE_COUNTDOWN_STEP_MS,
  RHYTHM_SENSE_DEFAULT_BEATS,
  RHYTHM_SENSE_DEFAULT_ROUNDS,
  RHYTHM_SENSE_MAX_ROUNDS,
  RHYTHM_SENSE_MIN_ROUNDS,
  RHYTHM_SENSE_ROUND_PAUSE_MS,
  averageRhythmDeviationMs,
  findBestRhythmRound,
  pickRandomRhythmBpm,
  scoreRhythmTapIntervals,
  type RhythmSenseBeatCount,
  type RhythmSensePhase,
  type RhythmSenseRoundResult
} from '@renderer/constant/rhythmSenseTest'

const TAP_CLICK_MIDI = 76
const TAP_CLICK_DURATION_SEC = 0.08

export function useRhythmSenseTest() {
  const metronomeStore = useMetronomeStore()
  const playStore = usePlayStore()

  const phase = ref<RhythmSensePhase>('setup')
  const beats = ref<RhythmSenseBeatCount>(RHYTHM_SENSE_DEFAULT_BEATS)
  const totalRounds = ref(RHYTHM_SENSE_DEFAULT_ROUNDS)
  const currentRound = ref(0)
  const countdownLabel = ref('')
  const currentBpm = ref(0)
  const tapCount = ref(0)
  const ringPulse = ref(0)
  const lastRoundResult = shallowRef<RhythmSenseRoundResult | null>(null)
  const roundResults = shallowRef<RhythmSenseRoundResult[]>([])

  const tapTimesMs: number[] = []
  let sessionToken = 0
  let countdownTimerId = 0
  let pauseTimerId = 0

  const progressText = computed(() => `${currentRound.value} / ${totalRounds.value}`)
  const finalAvgDeviationMs = computed(() => averageRhythmDeviationMs(roundResults.value))
  const bestRound = computed(() => findBestRhythmRound(roundResults.value))

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

  function resetSessionState() {
    clearTimers()
    metronomeStore.stop()
    tapTimesMs.length = 0
    tapCount.value = 0
    ringPulse.value = 0
    currentRound.value = 0
    currentBpm.value = 0
    countdownLabel.value = ''
    lastRoundResult.value = null
    roundResults.value = []
  }

  function invalidate() {
    sessionToken += 1
    clearTimers()
    metronomeStore.stop()
  }

  function setBeats(value: RhythmSenseBeatCount) {
    beats.value = value
  }

  function setTotalRounds(value: number) {
    const next = Math.round(value)
    totalRounds.value = Math.min(
      RHYTHM_SENSE_MAX_ROUNDS,
      Math.max(RHYTHM_SENSE_MIN_ROUNDS, next)
    )
  }

  async function playTapClick() {
    try {
      await playStore.triggerNote(TAP_CLICK_MIDI, {
        duration: TAP_CLICK_DURATION_SEC,
        id: `rhythm-tap-${Date.now()}`
      })
    } catch {
      // 点击反馈失败时不阻断敲击计分
    }
  }

  function startCountdown() {
    const token = ++sessionToken
    clearTimers()
    metronomeStore.stop()
    lastRoundResult.value = null
    roundResults.value = []
    currentRound.value = 0
    phase.value = 'countdown'

    let step = 0
    countdownLabel.value = String(RHYTHM_SENSE_COUNTDOWN_SECONDS[0])
    countdownTimerId = window.setInterval(() => {
      if (!isActive(token)) return
      step += 1
      if (step >= RHYTHM_SENSE_COUNTDOWN_SECONDS.length) {
        window.clearInterval(countdownTimerId)
        countdownTimerId = 0
        countdownLabel.value = ''
        void startListenRound(token)
        return
      }
      countdownLabel.value = String(RHYTHM_SENSE_COUNTDOWN_SECONDS[step])
    }, RHYTHM_SENSE_COUNTDOWN_STEP_MS)
  }

  async function startListenRound(token: number) {
    if (!isActive(token)) return
    currentRound.value += 1
    tapTimesMs.length = 0
    tapCount.value = 0
    lastRoundResult.value = null
    currentBpm.value = pickRandomRhythmBpm()
    phase.value = 'listen'

    try {
      const beatMs = 60_000 / currentBpm.value
      const listenBudgetMs = beatMs * beats.value + 1000
      await Promise.race([
        metronomeStore.playBeats(beats.value, currentBpm.value),
        new Promise<void>((resolve) => {
          window.setTimeout(resolve, listenBudgetMs)
        })
      ])
    } catch {
      // 听拍中断时不进入敲击
      return
    }
    metronomeStore.stop()
    if (!isActive(token)) return
    phase.value = 'tap'
  }

  async function handleTap() {
    if (phase.value !== 'tap') return
    const token = sessionToken
    const now = performance.now()
    if (tapTimesMs.length >= beats.value) return

    tapTimesMs.push(now)
    tapCount.value = tapTimesMs.length
    ringPulse.value += 1
    void playTapClick()

    if (tapTimesMs.length < beats.value) return

    const result: RhythmSenseRoundResult = {
      roundIndex: currentRound.value,
      bpm: currentBpm.value,
      avgDeviationMs: scoreRhythmTapIntervals(tapTimesMs, currentBpm.value),
      tapCount: tapTimesMs.length
    }
    lastRoundResult.value = result
    roundResults.value = [...roundResults.value, result]
    phase.value = 'roundResult'

    pauseTimerId = window.setTimeout(() => {
      if (!isActive(token)) return
      if (currentRound.value >= totalRounds.value) {
        phase.value = 'final'
        return
      }
      void startListenRound(token)
    }, RHYTHM_SENSE_ROUND_PAUSE_MS)
  }

  async function startTest() {
    invalidate()
    try {
      await Promise.all([
        metronomeStore.waitReady(),
        playStore.waitReady().then(() => playStore.ensureCollectionToneColorInitialized())
      ])
    } catch {
      // 初始化失败时仍进入倒计时；敲击反馈可回退内置 piano
    }
    startCountdown()
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
    beats,
    totalRounds,
    currentRound,
    countdownLabel,
    currentBpm,
    tapCount,
    ringPulse,
    lastRoundResult,
    roundResults,
    progressText,
    finalAvgDeviationMs,
    bestRound,
    setBeats,
    setTotalRounds,
    startTest,
    handleTap,
    playAgain,
    backToSetup
  }
}
