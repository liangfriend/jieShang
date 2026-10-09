import { ref } from 'vue'
import { usePlayStore } from '@renderer/store/play.store'

export type SimEnvelope = {
  attack: number
  decay: number
  peakVolume: number
  release: number
}

/**
 * 模拟乐器按住发声：按下 hold 触发，松开 release。
 * triggerNote 为异步，若音还没真正触发就已松开，触发完成后立即补一次释放，避免挂音。
 */
export function useSimHeldNotes(getEnvelope: () => SimEnvelope | null) {
  const playStore = usePlayStore()
  const held = ref<Set<number>>(new Set())

  function releaseOptions() {
    const env = getEnvelope()
    return env ? { release: env.release } : { immediate: true }
  }

  async function press(midi: number) {
    if (held.value.has(midi)) return
    held.value = new Set(held.value).add(midi)
    const env = getEnvelope()
    await playStore.triggerNote(midi, {
      holdUntilRelease: true,
      ...(env ? { attack: env.attack, decay: env.decay, peakVolume: env.peakVolume } : {})
    })
    if (!held.value.has(midi)) playStore.releaseNote(midi, releaseOptions())
  }

  function release(midi: number) {
    if (!held.value.has(midi)) return
    const next = new Set(held.value)
    next.delete(midi)
    held.value = next
    playStore.releaseNote(midi, releaseOptions())
  }

  function releaseAll() {
    held.value = new Set()
    playStore.releaseAllHeldNotes()
  }

  return { held, press, release, releaseAll }
}
