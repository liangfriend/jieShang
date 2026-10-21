import { getMeasureSlots, isMeasureNoteVoices, MusicScoreTypeEnum } from '@deciphony/renderer'
import type {
  Measure,
  MeasureNoteSlot,
  MeasureNoteVoices,
  MusicScore,
  SlotData
} from '@deciphony/renderer'
import { newId } from '@deciphony/extensions/dr-edit/score-builder'
import { toRaw } from 'vue'
import { isMeasureAddMode } from './standardStaff/renderEditSymbolAddAction'

type MeasureNotes = Measure['notes']

export type MeasureNoteClipboard = {
  notationType: MusicScoreTypeEnum
  notes: MeasureNotes
}

/** 编辑会话内的小节音符剪贴板（复制后跨小节粘贴） */
let measureNoteClipboard: MeasureNoteClipboard | null = null

export function hasMeasureNoteClipboard(notationType?: MusicScoreTypeEnum): boolean {
  if (!measureNoteClipboard) return false
  if (notationType != null && measureNoteClipboard.notationType !== notationType) return false
  return true
}

export function clearMeasureNoteClipboard() {
  measureNoteClipboard = null
}

function collectIds(value: unknown, ids: Set<string>) {
  if (Array.isArray(value)) {
    for (const item of value) collectIds(item, ids)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (typeof record.id === 'string') ids.add(record.id)
  for (const key of Object.keys(record)) collectIds(record[key], ids)
}

function regenerateIds(value: unknown) {
  if (Array.isArray(value)) {
    for (const item of value) regenerateIds(item)
    return
  }
  if (!value || typeof value !== 'object') return
  const record = value as Record<string, unknown>
  if (typeof record.id === 'string') record.id = newId()
  for (const key of Object.keys(record)) regenerateIds(record[key])
}

/** 删除锚定在本小节音符上的双音 / 双 slot 附属（连音线、踏板等） */
function purgeAffiliatedForMeasureNotes(musicScore: MusicScore, measure: Measure) {
  const ids = new Set<string>()
  collectIds(getMeasureSlots(measure), ids)
  if (!ids.size) return
  musicScore.affiliatedSymbols = musicScore.affiliatedSymbols.filter(
    (sym) => !ids.has(sym.startId) && !ids.has(sym.endId)
  )
}

function cloneSlots(slots: MeasureNoteSlot[]): MeasureNoteSlot[] {
  const next = JSON.parse(JSON.stringify(toRaw(slots))) as MeasureNoteSlot[]
  for (const slot of next) slot.lyrics = []
  regenerateIds(next)
  return next
}

function cloneMeasureNotes(notes: MeasureNotes): MeasureNotes {
  if (isMeasureNoteVoices(notes)) {
    return { up: cloneSlots(notes.up ?? []), down: cloneSlots(notes.down ?? []) }
  }
  return cloneSlots(notes)
}

/** 从右键 payload / 当前选中解析目标小节（优先命中的小节） */
export function resolveContextMenuMeasureSlot(
  payloadSlot: SlotData | null,
  selected: SlotData | null
): (SlotData & { measure: Measure }) | null {
  if (payloadSlot && isMeasureAddMode(payloadSlot)) {
    return payloadSlot as SlotData & { measure: Measure }
  }
  if (selected && isMeasureAddMode(selected)) {
    return selected as SlotData & { measure: Measure }
  }
  return null
}

/** 复制小节内音符（不含歌词）到剪贴板 */
export function copyMeasureNotes(measure: Measure, notationType: MusicScoreTypeEnum): boolean {
  measureNoteClipboard = {
    notationType,
    notes: cloneMeasureNotes(measure.notes)
  }
  return true
}

function replaceSlots(target: MeasureNoteSlot[], next: MeasureNoteSlot[]) {
  // 原地替换，便于 Vue 深监听收录撤销历史
  target.splice(0, target.length, ...next)
}

/** 将剪贴板音符粘贴到目标小节（替换原有音符；id 全新） */
export function pasteMeasureNotes(musicScore: MusicScore, measure: Measure): boolean {
  if (!measureNoteClipboard) return false
  if (measureNoteClipboard.notationType !== musicScore.type) return false
  writeMeasureNotes(musicScore, measure, measureNoteClipboard.notes)
  return true
}

/** 把 source 的音符复制到 target（替换原有音符；id 全新），不经过剪贴板 */
export function duplicateMeasureNotes(musicScore: MusicScore, source: Measure, target: Measure): boolean {
  if (source.id === target.id) return false
  writeMeasureNotes(musicScore, target, source.notes)
  return true
}

function writeMeasureNotes(musicScore: MusicScore, measure: Measure, notes: MeasureNotes) {
  purgeAffiliatedForMeasureNotes(musicScore, measure)
  const next = cloneMeasureNotes(notes)
  const current = measure.notes
  if (isMeasureNoteVoices(next) && isMeasureNoteVoices(current)) {
    current.up ??= []
    current.down ??= []
    replaceSlots(current.up, next.up)
    replaceSlots(current.down, next.down)
  } else if (!isMeasureNoteVoices(next) && !isMeasureNoteVoices(current)) {
    replaceSlots(current, next)
  } else {
    measure.notes = next as MeasureNoteSlot[] | MeasureNoteVoices
  }
}

/** 清空小节内音符（同时删除锚定在这些音符上的跨音符附属） */
export function clearMeasureNotes(musicScore: MusicScore, measure: Measure): boolean {
  purgeAffiliatedForMeasureNotes(musicScore, measure)
  const current = measure.notes
  if (isMeasureNoteVoices(current)) {
    current.up?.splice(0, current.up.length)
    current.down?.splice(0, current.down.length)
  } else {
    current.splice(0, current.length)
  }
  return true
}
