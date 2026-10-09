import type { DrExtension, VDom } from '@deciphony/renderer'
import type { MusicScoreHighlightExpose } from '@deciphony/extensions/dr-play-highlight'
import type { Ref } from 'vue'
import { computed, nextTick, ref } from 'vue'

export type PlayRange = { startNoteId: string; endNoteId: string }

/** 可作为选段起止的音符部件，与 dr-play-highlight 的 NOTE_PART_TAGS 保持一致 */
const RANGE_NOTE_TAGS = new Set([
  'noteHead',
  'noteStem',
  'noteTail',
  'rest',
  'noteNumber',
  'addLine',
  'accidental',
  'tabNoteNumber',
  'arpeggio',
  'strumming',
  'longRest',
  'longRestNumber'
])

const START_CLASS = 'score-range-start'
const END_CLASS = 'score-range-end'

/**
 * 曲谱播放页选段：开启后点击音符，第 1 下设起点、第 2 下设终点、第 3 下重设起点（终点清空）。
 * 起止都选好时 getRange 返回区间，交给 dr-play 裁剪播放序列。
 */
export function usePlayRangeSelect(options: {
  musicScoreRef: Ref<MusicScoreHighlightExpose | null>
}) {
  const active = ref(false)
  const startNoteId = ref<string | null>(null)
  const endNoteId = ref<string | null>(null)
  const complete = computed(() => active.value && !!startNoteId.value && !!endNoteId.value)

  let vDomList: readonly VDom[] = []
  const marked = new Set<Element>()

  function clearMarks() {
    for (const el of marked) el.classList.remove(START_CLASS, END_CLASS)
    marked.clear()
  }

  function markNote(noteId: string | null, cls: string) {
    if (!noteId) return
    for (const node of vDomList) {
      if (node.targetId !== noteId || !RANGE_NOTE_TAGS.has(node.tag)) continue
      const el = options.musicScoreRef.value?.findElementByVDom(node)
      if (!el) continue
      el.classList.add(cls)
      marked.add(el)
    }
  }

  function applyMarks() {
    clearMarks()
    if (!active.value) return
    markNote(startNoteId.value, START_CLASS)
    markNote(endNoteId.value, END_CLASS)
  }

  function start() {
    active.value = true
    startNoteId.value = null
    endNoteId.value = null
    applyMarks()
  }

  function end() {
    active.value = false
    startNoteId.value = null
    endNoteId.value = null
    clearMarks()
  }

  function clear() {
    startNoteId.value = null
    endNoteId.value = null
    applyMarks()
  }

  function onNoteClick(noteId: string) {
    if (startNoteId.value && !endNoteId.value) {
      endNoteId.value = noteId
    } else {
      startNoteId.value = noteId
      endNoteId.value = null
    }
    applyMarks()
  }

  const extension: DrExtension = {
    name: 'score-play-range',
    on: {
      renderMusicScore(list) {
        vDomList = list
        // 事件在 vDom 更新后同步触发，DOM 尚未 patch
        void nextTick(applyMarks)
      },
      'dr-click'(event, node) {
        if (!active.value || !node.targetId || !RANGE_NOTE_TAGS.has(node.tag)) return
        event.stopPropagation()
        onNoteClick(node.targetId)
      }
    }
  }

  function getRange(): PlayRange | null {
    if (!complete.value) return null
    return { startNoteId: startNoteId.value!, endNoteId: endNoteId.value! }
  }

  return { active, startNoteId, endNoteId, complete, extension, start, end, clear, getRange }
}

export type PlayRangeSelect = ReturnType<typeof usePlayRangeSelect>
