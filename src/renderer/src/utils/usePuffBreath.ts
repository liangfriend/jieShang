import { onBeforeUnmount, ref } from 'vue'
import { PuffDetector, type PuffFrame } from '@deciphony/puff'

export type PuffBreathStatus = 'off' | 'starting' | 'on' | 'error'

/** 麦克风吹气检测：start 开麦，每帧回调 onFrame；卸载时自动释放 */
export function usePuffBreath(onFrame: (frame: PuffFrame) => void) {
  const status = ref<PuffBreathStatus>('off')
  const pressure = ref(0)
  const blowing = ref(false)
  let detector: PuffDetector | null = null
  /** start / stop 交错调用时丢弃过期的 start */
  let epoch = 0

  async function start() {
    const current = ++epoch
    stop(false)
    status.value = 'starting'
    const next = new PuffDetector()
    next.on('frame', (frame) => {
      pressure.value = frame.pressure
      blowing.value = frame.isBlowing
      onFrame(frame)
    })
    try {
      await next.start()
    } catch (error) {
      next.dispose()
      if (current === epoch) status.value = 'error'
      throw error
    }
    if (current !== epoch) {
      next.dispose()
      return
    }
    detector = next
    status.value = 'on'
  }

  function stop(bump = true) {
    if (bump) epoch++
    detector?.dispose()
    detector = null
    pressure.value = 0
    blowing.value = false
    status.value = 'off'
  }

  onBeforeUnmount(() => stop())

  return { status, pressure, blowing, start, stop }
}
