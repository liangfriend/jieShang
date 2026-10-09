import {
  PitchDetector,
  pitchDetectTuning,
  type PitchDetectResult
} from '@deciphony/pitch-detection'
import { onUnmounted, reactive, ref } from 'vue'

export function usePitchDetection() {
  const supported = ref(
    typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia
  )
  const active = ref(false)
  const error = ref('')
  const result = reactive<PitchDetectResult>({
    pitch: '',
    frequency: 0,
    midi: 0
  })
  const currentTime = ref(0)
  const silenceRmsThreshold = ref(pitchDetectTuning.silenceRmsThreshold)

  let detector: PitchDetector | null = null

  function ensureDetector(): PitchDetector {
    if (!detector) detector = new PitchDetector()
    return detector
  }

  function applySilenceThreshold(value: number) {
    const next = Math.min(0.2, Math.max(0.005, value))
    silenceRmsThreshold.value = next
    pitchDetectTuning.silenceRmsThreshold = next
  }

  async function start() {
    if (!supported.value || active.value) return
    error.value = ''
    try {
      const d = ensureDetector()
      await d.start((res, time) => {
        result.pitch = res.pitch
        result.frequency = res.frequency
        result.midi = res.midi
        currentTime.value = time
      })
      active.value = true
    } catch (e) {
      active.value = false
      error.value = e instanceof Error ? e.message : String(e)
      throw e
    }
  }

  function stop() {
    detector?.stop()
    active.value = false
    result.pitch = ''
    result.frequency = 0
    result.midi = 0
  }

  function dispose() {
    detector?.dispose()
    detector = null
    active.value = false
  }

  onUnmounted(() => {
    dispose()
  })

  return {
    supported,
    active,
    error,
    result,
    currentTime,
    silenceRmsThreshold,
    applySilenceThreshold,
    start,
    stop,
    dispose
  }
}
