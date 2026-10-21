import { computed, onBeforeUnmount, onMounted, shallowRef } from 'vue'
import { useMidiStore } from '@renderer/store/midi.store'
import { usePcKeyboardStore } from '@renderer/store/pcKeyboard.store'
import { PC_KEY_NOTES, pcKeyMidi } from '@renderer/utils/pcKeyboardPiano'

const SHIFT_CODES = new Set(['ShiftLeft', 'ShiftRight'])

function isEditableTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)
}

/**
 * 用电脑键盘弹虚拟钢琴：按键转成虚拟 MIDI 消息，与接 MIDI 键盘的效果一致。
 * Shift 升半音；按住 Ctrl / Alt / Win 或焦点在输入框时不响应。
 */
export function usePcKeyboardPiano() {
  const midiStore = useMidiStore()
  const settings = usePcKeyboardStore()

  /** code → 按下时发出的 midi（抬起时按它松开，不受期间 Shift / 八度变化影响） */
  const pressed = new Map<string, number>()
  /** 多个按键可能对应同一 midi，最后一个抬起才松开 */
  const midiRefs = new Map<number, number>()

  const pressedCodes = shallowRef<ReadonlySet<string>>(new Set())
  const shiftCodes = shallowRef<ReadonlySet<string>>(new Set())

  const shiftHeld = computed(() => shiftCodes.value.size > 0)
  const activeCodes = computed<ReadonlySet<string>>(
    () => new Set([...pressedCodes.value, ...shiftCodes.value])
  )

  function syncPressedCodes() {
    pressedCodes.value = new Set(pressed.keys())
  }

  function release(code: string) {
    const midi = pressed.get(code)
    if (midi == null) return
    pressed.delete(code)
    const refs = (midiRefs.get(midi) ?? 1) - 1
    if (refs > 0) {
      midiRefs.set(midi, refs)
    } else {
      midiRefs.delete(midi)
      midiStore.dispatchVirtualNote(midi, false)
    }
    syncPressedCodes()
  }

  function releaseAll() {
    for (const code of [...pressed.keys()]) release(code)
    shiftCodes.value = new Set()
  }

  function onKeyDown(event: KeyboardEvent) {
    if (SHIFT_CODES.has(event.code)) {
      shiftCodes.value = new Set([...shiftCodes.value, event.code])
      return
    }
    const note = PC_KEY_NOTES.get(event.code)
    if (!note) return
    if (event.ctrlKey || event.altKey || event.metaKey || isEditableTarget(event.target)) return
    event.preventDefault()
    if (event.repeat || pressed.has(event.code)) return
    const sideOctave = note.side === 'letter' ? settings.letterOctave : settings.numpadOctave
    const midi = pcKeyMidi(note, sideOctave, event.shiftKey)
    if (midi == null) return
    pressed.set(event.code, midi)
    const refs = midiRefs.get(midi) ?? 0
    midiRefs.set(midi, refs + 1)
    if (refs === 0) midiStore.dispatchVirtualNote(midi, true)
    syncPressedCodes()
  }

  function onKeyUp(event: KeyboardEvent) {
    if (SHIFT_CODES.has(event.code)) {
      const next = new Set(shiftCodes.value)
      next.delete(event.code)
      shiftCodes.value = next
      return
    }
    release(event.code)
  }

  function onVisibilityChange() {
    if (document.hidden) releaseAll()
  }

  onMounted(() => {
    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    window.addEventListener('blur', releaseAll)
    document.addEventListener('visibilitychange', onVisibilityChange)
  })

  onBeforeUnmount(() => {
    window.removeEventListener('keydown', onKeyDown)
    window.removeEventListener('keyup', onKeyUp)
    window.removeEventListener('blur', releaseAll)
    document.removeEventListener('visibilitychange', onVisibilityChange)
    releaseAll()
  })

  return { activeCodes, shiftHeld }
}
