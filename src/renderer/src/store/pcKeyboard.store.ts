import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  PC_KEYBOARD_OCTAVE_MAX,
  PC_KEYBOARD_OCTAVE_MIN
} from '@renderer/utils/pcKeyboardPiano'

const PC_KEYBOARD_STORAGE_KEY = 'pcKeyboard.settings'

type PersistedPcKeyboardSettings = {
  letterOctave?: number
  numpadOctave?: number
}

function clampOctave(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 0
  return Math.min(PC_KEYBOARD_OCTAVE_MAX, Math.max(PC_KEYBOARD_OCTAVE_MIN, Math.round(value)))
}

function loadPersistedSettings(): PersistedPcKeyboardSettings {
  try {
    const raw = localStorage.getItem(PC_KEYBOARD_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedPcKeyboardSettings
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

/** 电脑键盘弹琴：字母侧 / 小键盘侧各自的八度偏移（0 = 以 C4 为基准） */
export const usePcKeyboardStore = defineStore('pcKeyboard', () => {
  const persisted = loadPersistedSettings()
  const letterOctave = ref(clampOctave(persisted.letterOctave))
  const numpadOctave = ref(clampOctave(persisted.numpadOctave))

  watch([letterOctave, numpadOctave], () => {
    localStorage.setItem(
      PC_KEYBOARD_STORAGE_KEY,
      JSON.stringify({
        letterOctave: letterOctave.value,
        numpadOctave: numpadOctave.value
      } satisfies PersistedPcKeyboardSettings)
    )
  })

  function setLetterOctave(value: number) {
    letterOctave.value = clampOctave(value)
  }

  function setNumpadOctave(value: number) {
    numpadOctave.value = clampOctave(value)
  }

  return { letterOctave, numpadOctave, setLetterOctave, setNumpadOctave }
})
