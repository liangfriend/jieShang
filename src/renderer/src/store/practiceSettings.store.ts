import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import {
  DEFAULT_DIFFICULTY,
  DIFFICULTY_POLICY,
  type PracticeDifficulty
} from '@renderer/constant/practice'
import { PLAY_DEFAULT_BPM, PLAY_DEFAULT_VOLUME } from '@renderer/constant/play'

/** 练习模式设置（设置弹窗与练习页共享） */
export const usePracticeSettingsStore = defineStore('practiceSettings', () => {
  /** 是否实时显示音符结果（不同颜色） */
  const showNoteResult = ref(true)
  /** 是否遮盖瀑布流 */
  const coverWaterfall = ref(false)
  /** 曲谱音量 0~1 */
  const scoreVolume = ref(PLAY_DEFAULT_VOLUME)
  /** 节拍器音量 0~1 */
  const metronomeVolume = ref(0.8)
  /** BPM */
  const bpm = ref(PLAY_DEFAULT_BPM)
  /** 播放过程是否开启节拍器（默认关闭） */
  const metronomeDuringPlay = ref(false)
  /** 难度 */
  const difficulty = ref<PracticeDifficulty>(DEFAULT_DIFFICULTY)

  const highlightPolicy = computed(() => DIFFICULTY_POLICY[difficulty.value])

  /** 单谱表是否参与练习（true=参与，false=跳过并半透明） */
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
    showNoteResult,
    coverWaterfall,
    scoreVolume,
    metronomeVolume,
    bpm,
    metronomeDuringPlay,
    difficulty,
    highlightPolicy,
    staffEnabled,
    initStaffEnabled,
    disabledStaffIndexes
  }
})
