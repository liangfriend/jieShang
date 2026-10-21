import type { MusicScore } from '@deciphony/renderer'
import {
  buildFlattenStaffRows,
  collectHighlightIdsAtTime,
  createNotePassMap,
  hasTimedFlattenSlots,
  resetNotePassMap,
  type FlattenStaffRow,
  type NotePassMap
} from '@deciphony/extensions/dr-time-offset'
import { createPlayLyricResolver } from '@deciphony/extensions/dr-play'
import { lyricKey } from '@deciphony/extensions/dr-lyrics'
import { clearPlayLyrics, setPlayLyrics } from './playLyricsHighlight'

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
  /** 已同步时间、带歌词的字，按时间升序 */
  let lyricTimeline: { time: number; key: string }[] = []
  /** undefined：还没同步过；null：还没到第一个字 */
  let lastLyricTime: number | null | undefined

  function rebuildLyricTimeline(rows: FlattenStaffRow[]) {
    const resolve = createPlayLyricResolver(deps.getMusicScore())
    lyricTimeline = []
    lastLyricTime = undefined
    for (const row of rows) {
      for (const slot of row.slots) {
        if (slot.time == null || !Number.isFinite(slot.time)) continue
        const lyric = resolve(slot.slotId, slot.passIndex)
        if (lyric) lyricTimeline.push({ time: slot.time, key: lyricKey(lyric.slotId, lyric.verse) })
      }
    }
    lyricTimeline.sort((a, b) => a.time - b.time)
  }

  function rebuildRows(): FlattenStaffRow[] {
    const prop = deps.getTimeProp().trim()
    if (!prop) {
      cachedRows = []
      cachedProp = ''
      lyricTimeline = []
      return cachedRows
    }
    cachedProp = prop
    cachedRows = buildFlattenStaffRows(deps.getMusicScore(), prop)
    rebuildLyricTimeline(cachedRows)
    return cachedRows
  }

  /** 当前字：最近一个已开始的带词时刻上的全部字，亮到下一个字开始 */
  function syncLyricsAtTime(currentSec: number) {
    let time: number | null = null
    for (const it of lyricTimeline) {
      if (it.time > currentSec) break
      time = it.time
    }
    if (time === lastLyricTime) return
    lastLyricTime = time
    if (time == null) {
      clearPlayLyrics()
      return
    }
    setPlayLyrics(lyricTimeline.filter((it) => it.time === time).map((it) => it.key))
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

  function syncAtTime(currentSec: number): string[] {
    const rows = ensureRows()
    const ids = collectHighlightIdsAtTime(rows, currentSec, notePassMap)
    applyHighlightIds(ids)
    syncLyricsAtTime(currentSec)
    return ids
  }

  /** 当前 timeProp 下是否已有谱音同步时间（未同步时高亮会空，避免「全亮」误导） */
  function hasTimedSlots(): boolean {
    return hasTimedFlattenSlots(ensureRows())
  }

  /** 停止 / 自然结束：清高亮，遍次 map 置 0（反复再播从第一遍起） */
  function reset() {
    applyHighlightIds([])
    resetNotePassMap(notePassMap)
    cachedRows = null
    cachedProp = ''
    lyricTimeline = []
    lastLyricTime = undefined
    clearPlayLyrics()
  }

  /** 即将开始播放前刷新展平行（谱面或 timeProp 可能已变） */
  function prepare() {
    rebuildRows()
  }

  return {
    syncAtTime,
    reset,
    prepare,
    hasTimedSlots,
    notePassMap
  }
}
