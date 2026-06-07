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
  /** 虚拟钢琴按键提示（暂未实现） */
  const pianoKeyHint = ref(false)
  /** 难度 */
  const difficulty = ref<PracticeDifficulty>(DEFAULT_DIFFICULTY)

  const highlightPolicy = computed(() => DIFFICULTY_POLICY[difficulty.value])

  return {
    showNoteResult,
    coverWaterfall,
    scoreVolume,
    metronomeVolume,
    bpm,
    metronomeDuringPlay,
    pianoKeyHint,
    difficulty,
    highlightPolicy
  }
})
