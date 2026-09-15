import type { MusicScore } from '@deciphony/renderer'
import {
  buildFlattenStaffRows,
  collectHighlightIdsAtTime,
  createNotePassMap,
  resetNotePassMap,
  type FlattenStaffRow,
  type NotePassMap
} from '@deciphony/extensions/dr-time-offset'

export type AudioTimeHighlightApi = {
  addNoteHighlight: (noteId: string) => void
  removeNoteHighlight: (noteId: string) => void
  clearHighlight: () => void
}

/**
 * 范唱/伴奏高亮：对照 deciphony-test `renderTimeOffsetTest`。
 * APlayer.onProgress → 对比展平后的 slot.data[timeProp] 时间 → 维护 notePassMap。
 */
export function createAudioTimeHighlight(deps: {
  getMusicScore: () => MusicScore
  getTimeProp: () => string
  highlight: AudioTimeHighlightApi
}) {
  const notePassMap: NotePassMap = createNotePassMap()
  let lastHighlightIds: string[] = []
  let cachedRows: FlattenStaffRow[] | null = null
  let cachedProp = ''

  function rebuildRows(): FlattenStaffRow[] {
    const prop = deps.getTimeProp().trim()
    if (!prop) {
      cachedRows = []
      cachedProp = ''
      return cachedRows
    }
    cachedProp = prop
    cachedRows = buildFlattenStaffRows(deps.getMusicScore(), prop)
    return cachedRows
  }

  function ensureRows(): FlattenStaffRow[] {
    const prop = deps.getTimeProp().trim()
    if (!cachedRows || prop !== cachedProp) return rebuildRows()
    return cachedRows
  }

  function applyHighlightIds(ids: string[]) {
    const prev = new Set(lastHighlightIds)
    const next = new Set(ids)
    for (const id of prev) {
      if (!next.has(id)) deps.highlight.removeNoteHighlight(id)
    }
    for (const id of next) {
      if (!prev.has(id)) deps.highlight.addNoteHighlight(id)
    }
    lastHighlightIds = ids
  }

  function syncAtTime(currentSec: number) {
    const rows = ensureRows()
    applyHighlightIds(collectHighlightIdsAtTime(rows, currentSec, notePassMap))
  }

  /** 停止 / 自然结束：清高亮，遍次 map 置 0（反复再播从第一遍起） */
  function reset() {
    applyHighlightIds([])
    resetNotePassMap(notePassMap)
    cachedRows = null
    cachedProp = ''
  }

  /** 即将开始播放前刷新展平行（谱面或 timeProp 可能已变） */
  function prepare() {
    rebuildRows()
  }

  return {
    syncAtTime,
    reset,
    prepare,
    notePassMap
  }
}
