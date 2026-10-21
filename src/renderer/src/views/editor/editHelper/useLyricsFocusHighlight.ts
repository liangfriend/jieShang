import { nextTick, type Ref } from 'vue'
import type { MeasureNoteSlot } from '@deciphony/renderer'

const LYRICS_FOCUS_CLASS = 'dr-lyrics-focus-highlight'
const NOTE_TAGS = ['noteHead', 'noteNumber', 'rest', 'tabNoteNumber']

type LyricsCellEvent = { slot: MeasureNoteSlot; rowIndex: number }

/** 槽位内音符 / 休止符在 DOM 上的 data-target-id（槽、记谱体、各 notesInfo） */
function slotTargetIds(slot: MeasureNoteSlot): string[] {
  const ids = new Set<string>([slot.id])
  const symbol = slot.symbol as { id?: string; notesInfo?: { id: string }[] } | undefined
  if (symbol?.id) ids.add(symbol.id)
  for (const info of symbol?.notesInfo ?? []) ids.add(info.id)
  return [...ids]
}

/** 光标在歌词输入框时，绿色高亮该槽位的音符 */
export function useLyricsFocusHighlight(scoreRootRef: Ref<HTMLElement | null>) {
  let focusedSlot: MeasureNoteSlot | null = null
  let highlighted: Element[] = []

  function clear() {
    for (const el of highlighted) el.classList.remove(LYRICS_FOCUS_CLASS)
    highlighted = []
  }

  function apply() {
    clear()
    const root = scoreRootRef.value
    if (!root || !focusedSlot) return
    for (const id of slotTargetIds(focusedSlot)) {
      const escaped = CSS.escape(id)
      for (const tag of NOTE_TAGS) {
        root
          .querySelectorAll(`[data-target-id="${escaped}"][data-tag="${tag}"]`)
          .forEach((el) => {
            el.classList.add(LYRICS_FOCUS_CLASS)
            highlighted.push(el)
          })
      }
    }
  }

  function onLyricsCellFocus({ slot }: LyricsCellEvent) {
    focusedSlot = slot
    apply()
  }

  function onLyricsCellBlur({ slot }: LyricsCellEvent) {
    if (focusedSlot?.id !== slot.id) return
    focusedSlot = null
    clear()
  }

  /** 重渲染后音符 DOM 可能被替换，需重新挂类名 */
  function refreshLyricsFocusHighlight() {
    if (focusedSlot) void nextTick(apply)
  }

  return { onLyricsCellFocus, onLyricsCellBlur, refreshLyricsFocusHighlight }
}
