import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { PLAY_DEFAULT_BPM } from '@renderer/constant/play'

/** 新手模式设置 */
export const useBeginnerSettingsStore = defineStore('beginnerSettings', () => {
  /** 是否遮盖 midi 块区域 */
  const coverMidiBox = ref(false)
  /** 节拍器音量 0~1 */
  const metronomeVolume = ref(0.8)
  /** BPM（影响预备拍与循环节拍器） */
  const bpm = ref(PLAY_DEFAULT_BPM)
  /** 练习过程是否开启节拍器 */
  const metronomeDuringPlay = ref(false)
  /** 单谱表是否参与（false=跳过并半透明） */
  const staffEnabled = ref<boolean[]>([])

  function initStaffEnabled(count: number) {
    if (count <= 0) {
      staffEnabled.value = []
      return
    }
    if (staffEnabled.value.length === count) return
    staffEnabled.value = Array.from({ length: count }, () => true)
  }

  const disabledStaffIndexes = computed(() =>
    staffEnabled.value.reduce<number[]>((acc, enabled, index) => {
      if (!enabled) acc.push(index)
      return acc
    }, [])
  )

  return {
    coverMidiBox,
    metronomeVolume,
    bpm,
    metronomeDuringPlay,
    staffEnabled,
    initStaffEnabled,
    disabledStaffIndexes
  }
})
