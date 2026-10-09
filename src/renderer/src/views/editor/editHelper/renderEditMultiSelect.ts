/**
 * 框选多音符：命中检测 + 批量升降半音 / 时值倍增减半 / 附点 / 符干方向 / 删除。
 * 升降半音借 shiftScoreBySemitones（整谱克隆平移），只把选中音符的音高字段拷回原谱。
 * 休止符也可框选：参与时值与删除，不参与升降半音。
 */
import type {
  Chronaxie,
  Measure,
  MusicScore,
  NoteNumber,
  NoteRest,
  NoteSymbol,
  NotesInfo,
  NotesNumberInfo,
  SlotData,
  VDom
} from '@deciphony/renderer'
import { getMeasureSlots, slotSymbol } from '@deciphony/renderer'
import { shiftScoreBySemitones } from '@renderer/utils/scoreNotationTransfer'
import { deleteSelectedItem, isNumberRestSelected, isRestSelected } from './renderEditDelete'
import { slotDataFromVDom } from './renderEditSelection'
import { isNoteHeadSelected } from './standardStaff/renderEditNoteHeadDrag'
import { isNumberHeadSelected } from './numberNotation/renderEditNumberHeadDrag'
import {
  setNotesNumberInfoAugmentationDot,
  setNotesNumberInfoChronaxie
} from './numberNotation/renderEditNumberHeadProperties'
import {
  setNotesInfoAugmentationDot,
  setNotesInfoDirection
} from './standardStaff/renderEditNoteHeadProperties'
import { setNoteRestAugmentationDot } from './standardStaff/renderEditRestProperties'

type MultiSelectedBase = SlotData & {
  measure: Measure
  /** 渲染元素的 data-target-id，用于紫色高亮 */
  targetId: string
}

export type MultiSelectedNote = MultiSelectedBase & {
  kind: 'note'
  info: NotesInfo | NotesNumberInfo
  note: NoteSymbol | NoteNumber
}

/** 线谱休止符 self 为 NoteRest；简谱休止符 self 为 NoteNumber */
export type MultiSelectedRest = MultiSelectedBase & {
  kind: 'rest'
  self: NoteRest | NoteNumber
}

export type MultiSelectedItem = MultiSelectedNote | MultiSelectedRest

export type SvgRect = { x: number; y: number; w: number; h: number }

export const MULTI_SELECT_TAGS = ['noteHead', 'noteNumber', 'rest'] as const

const MAX_CHRONAXIE = 256
const MIN_CHRONAXIE = 2

function intersects(a: SvgRect, b: SvgRect) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
}

function itemFromVDom(musicScore: MusicScore, vdom: VDom): MultiSelectedItem | null {
  if (vdom.tag === 'rest') {
    const slot = vdom.targetId ? slotDataFromVDom(musicScore, vdom) : null
    if (!slot || !(isRestSelected(slot) || isNumberRestSelected(slot))) return null
    return { ...slot, kind: 'rest', targetId: vdom.targetId! } as MultiSelectedRest
  }
  const slot = vdom.slotData ?? slotDataFromVDom(musicScore, vdom)
  if (!slot || !(isNoteHeadSelected(slot) || isNumberHeadSelected(slot))) return null
  return { ...slot, kind: 'note', targetId: slot.info.id } as MultiSelectedNote
}

/** 矩形（SVG 坐标）内的线谱音符头 / 简谱数字 / 休止符，按 targetId 去重 */
export function collectNotesInRect(
  musicScore: MusicScore,
  vDomList: VDom[],
  rect: SvgRect
): MultiSelectedItem[] {
  const seen = new Set<string>()
  const out: MultiSelectedItem[] = []
  for (const vdom of vDomList) {
    if (!(MULTI_SELECT_TAGS as readonly string[]).includes(vdom.tag)) continue
    if (!intersects(rect, { x: vdom.x, y: vdom.y, w: vdom.w, h: vdom.h })) continue
    const item = itemFromVDom(musicScore, vdom)
    if (!item || seen.has(item.targetId)) continue
    seen.add(item.targetId)
    out.push(item)
  }
  return out
}

type PitchInfo = (NotesInfo | NotesNumberInfo) & { id: string }

function indexPitchInfos(score: MusicScore): Map<string, PitchInfo> {
  const map = new Map<string, PitchInfo>()
  for (const grandStaff of score.grandStaffs) {
    for (const staff of grandStaff.staves) {
      for (const measure of staff.measures) {
        for (const measureSlot of getMeasureSlots(measure)) {
          const body = slotSymbol(measureSlot) as Partial<NoteSymbol>
          if (!Array.isArray(body.notesInfo)) continue
          for (const info of [
            ...body.notesInfo,
            ...(body.graceNotes ?? []),
            ...(body.graceNotesAfter ?? [])
          ]) {
            map.set(info.id, info as PitchInfo)
          }
        }
      }
    }
  }
  return map
}

function copyPitch(target: PitchInfo, source: PitchInfo) {
  if ('syllable' in target && 'syllable' in source) {
    target.syllable = source.syllable
    target.octaveDot = source.octaveDot
  } else if ('region' in target && 'region' in source) {
    target.region = source.region
  }
  if (!source.accidental) {
    delete target.accidental
  } else if (target.accidental) {
    target.accidental.type = source.accidental.type
  } else {
    target.accidental = JSON.parse(JSON.stringify(source.accidental))
  }
}

/** 选中音符整体平移 semitones 个半音（正升负降），休止符跳过；返回实际改动数 */
export function shiftMultiSelectedBySemitones(
  musicScore: MusicScore,
  items: MultiSelectedItem[],
  semitones: number
): number {
  const steps = Math.trunc(semitones)
  const notes = items.filter((item): item is MultiSelectedNote => item.kind === 'note')
  if (!steps || !notes.length) return 0
  const shifted = indexPitchInfos(shiftScoreBySemitones(musicScore, steps))
  let changed = 0
  for (const { info } of notes) {
    const source = shifted.get(info.id)
    if (!source) continue
    copyPitch(info as PitchInfo, source)
    changed++
  }
  return changed
}

function isNoteNumberBody(self: NoteRest | NoteNumber): self is NoteNumber {
  return Array.isArray((self as Partial<NoteNumber>).notesInfo)
}

/** 时值 ×2（factor=2）或 ÷2（factor=0.5）；已到上下限的音符 / 休止符跳过。返回实际改动数 */
export function scaleMultiSelectedChronaxie(items: MultiSelectedItem[], factor: 2 | 0.5): number {
  const doneNotes = new Set<NoteNumber>()
  const scaled = (current: unknown) => {
    if (typeof current !== 'number') return null
    const next = current * factor
    return next > MAX_CHRONAXIE || next < MIN_CHRONAXIE ? null : (next as Chronaxie)
  }
  let changed = 0
  for (const item of items) {
    if (item.kind === 'rest') {
      const rest = item.self
      if (isNoteNumberBody(rest)) {
        const info = rest.notesInfo[0]
        const next = info && scaled(info.chronaxie)
        if (!next || doneNotes.has(rest)) continue
        doneNotes.add(rest)
        setNotesNumberInfoChronaxie(info, next, rest)
      } else {
        const next = scaled(rest.chronaxie)
        if (!next) continue
        rest.chronaxie = next
      }
      changed++
      continue
    }
    const next = scaled(item.info.chronaxie)
    if (!next) continue
    if (isNumberHeadSelected(item)) {
      // 简谱同 slot 各层共用时值，整列改一次
      if (doneNotes.has(item.note as NoteNumber)) continue
      doneNotes.add(item.note as NoteNumber)
      setNotesNumberInfoChronaxie(item.info as NotesNumberInfo, next, item.note as NoteNumber)
    } else {
      item.info.chronaxie = next
    }
    changed++
  }
  return changed
}

export type DotCount = 0 | 1 | 2 | 3

/** 附点挂在哪些对象上：简谱一列各层共用时值，整列一起改 */
function dotHolders(item: MultiSelectedItem): { augmentationDot?: { count: DotCount } }[] {
  if (item.kind === 'rest') {
    return isNoteNumberBody(item.self) ? item.self.notesInfo : [item.self]
  }
  return isNumberHeadSelected(item) ? (item.note as NoteNumber).notesInfo : [item.info]
}

/** 选中项附点数一致时返回该值，不一致或为空返回 null */
export function multiSelectedDotCount(items: MultiSelectedItem[]): DotCount | null {
  let value: DotCount | null = null
  for (const item of items) {
    for (const holder of dotHolders(item)) {
      const count = holder.augmentationDot?.count ?? 0
      if (value === null) value = count
      else if (value !== count) return null
    }
  }
  return value
}

/** 选中音符 / 休止符统一设为 count 个附点（0 = 去掉）；返回实际改动数 */
export function setMultiSelectedDot(items: MultiSelectedItem[], count: DotCount): number {
  let changed = 0
  for (const item of items) {
    const holders = dotHolders(item)
    if (holders.every((holder) => (holder.augmentationDot?.count ?? 0) === count)) continue
    if (item.kind === 'rest' && !isNoteNumberBody(item.self)) {
      setNoteRestAugmentationDot(item.self, count)
    } else if (item.kind === 'note' && !isNumberHeadSelected(item)) {
      setNotesInfoAugmentationDot(item.info as NotesInfo, count)
    } else {
      for (const info of holders as NotesNumberInfo[]) setNotesNumberInfoAugmentationDot(info, count)
    }
    changed++
  }
  return changed
}

export type StemDirection = 'up' | 'down'

/** 线谱音符（简谱数字无符干） */
function stemHolders(items: MultiSelectedItem[]): NotesInfo[] {
  return items
    .filter((item): item is MultiSelectedNote => item.kind === 'note' && !isNumberHeadSelected(item))
    .map((item) => item.info as NotesInfo)
}

export function multiSelectedHasStem(items: MultiSelectedItem[]): boolean {
  return stemHolders(items).length > 0
}

/** 选中线谱音符符干方向一致时返回该值，不一致或为空返回 null */
export function multiSelectedStemDirection(items: MultiSelectedItem[]): StemDirection | null {
  let value: StemDirection | null = null
  for (const info of stemHolders(items)) {
    const direction = info.direction
    if (value === null) value = direction
    else if (value !== direction) return null
  }
  return value
}

/** 选中线谱音符统一设为同一符干方向；返回实际改动数 */
export function setMultiSelectedStemDirection(
  items: MultiSelectedItem[],
  direction: StemDirection
): number {
  let changed = 0
  for (const info of stemHolders(items)) {
    if (info.direction === direction) continue
    setNotesInfoDirection(info, direction)
    changed++
  }
  return changed
}

/** 逐个删除选中音符 / 休止符；返回删除数 */
export function deleteMultiSelected(musicScore: MusicScore, items: MultiSelectedItem[]): number {
  let removed = 0
  for (const item of items) {
    if (deleteSelectedItem(musicScore, item)) removed++
  }
  return removed
}
