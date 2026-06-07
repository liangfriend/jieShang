import {
  AccidentalTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  NoteSymbolTypeEnum
} from 'deciphony-renderer'
import type { Chronaxie, Measure, MusicScore, SingleStaff, StaffSlot } from 'deciphony-renderer'
import { CHRONAXIES, createKeySignature, createNoteSymbol } from '@renderer/dr-extensions/dr-edit/score-builder'
import {
  changeMeasureNotesKeySignature,
  getKeySignatureAccidental,
  getNoteRegionAndAccidental,
  type AlteredAccidental
} from '@renderer/dr-extensions/scoreUtil'
import type { WhiteboardClef } from '@renderer/constant/whiteboard'

/** 一个四分音符（quarter）对应的 Unit256 时值 */
const QUARTER_UNIT256 = 64

/**
 * 在给定 BPM 下，某个 chronaxie（Unit256 时值）对应的真实秒数。
 * 以四分音符 = 60/bpm 秒为基准线性换算。
 */
function chronaxieToSeconds(chronaxie: number, bpm: number): number {
  return (chronaxie / QUARTER_UNIT256) * (60 / bpm)
}

/**
 * 根据按键按住的毫秒数与 BPM，就近选取最接近的音符时值（全音符…256 分音符）。
 */
export function resolveChronaxieFromHoldMs(holdMs: number, bpm: number): Chronaxie {
  const heldSec = Math.max(0, holdMs) / 1000
  let best: Chronaxie = CHRONAXIES[0]!
  let bestDiff = Infinity
  for (const chronaxie of CHRONAXIES) {
    const diff = Math.abs(heldSec - chronaxieToSeconds(chronaxie, bpm))
    if (diff < bestDiff) {
      bestDiff = diff
      best = chronaxie
    }
  }
  return best
}

/** 在复谱表里按谱号定位目标单谱表（模板里高/中/低音各一行） */
function findStaffByClef(score: MusicScore, clef: ClefTypeEnum): SingleStaff | null {
  for (const grandStaff of score.grandStaffs) {
    for (const staff of grandStaff.staves) {
      if (staff.measures[0]?.clef_f?.type === clef) return staff
    }
  }
  return null
}

/** 该单谱表当前生效的调号（写在首小节的 keySignature_f 上，其余小节继承） */
function staffKeySignature(staff: SingleStaff): KeySignatureTypeEnum {
  return staff.measures[0]?.keySignature_f?.type ?? KeySignatureTypeEnum.C
}

/**
 * 计算在该小节、该 region 处当前生效的变音（调号默认 + 小节内已出现的显式记号）。
 * 返回 null 表示当前为自然音。
 */
function effectiveAccidentalAt(
  measure: Measure,
  clef: ClefTypeEnum,
  keySignature: KeySignatureTypeEnum,
  region: number
): AlteredAccidental | null {
  let effective = getKeySignatureAccidental(clef, keySignature, region)
  for (const slot of measure.notes) {
    const s = slot as StaffSlot
    if (s.type !== NoteSymbolTypeEnum.Note) continue
    for (const ni of s.notesInfo) {
      if (ni.region !== region) continue
      const type = ni.accidental?.type
      if (type == null) continue
      effective = type === AccidentalTypeEnum.Natural ? null : (type as AlteredAccidental)
    }
  }
  return effective
}

/**
 * 比较「目标音想要的变音」与「该 region 当前已生效的变音」，得出本音符需要显式书写的记号。
 * - 相同：无需书写（返回 undefined）。
 * - 目标为自然音、但当前已被升/降（调号或前方记号）接管：书写还原号。
 * - 否则书写目标记号（升/降）。
 */
function resolveAccidentalToWrite(
  measure: Measure,
  clef: ClefTypeEnum,
  keySignature: KeySignatureTypeEnum,
  region: number,
  desired: AlteredAccidental | null
): AccidentalTypeEnum | undefined {
  const effective = effectiveAccidentalAt(measure, clef, keySignature, region)
  if (desired === effective) return undefined
  if (desired === null) return AccidentalTypeEnum.Natural
  return desired
}

export interface AddWhiteboardNoteParams {
  score: MusicScore
  clef: WhiteboardClef
  midi: number
  chronaxie: Chronaxie
}

/**
 * 把一个键盘音符按当前调号/变音规则添加到指定谱号的单谱表上。
 * 返回 true 表示成功写入。
 */
export function addNoteToWhiteboardScore(params: AddWhiteboardNoteParams): boolean {
  const { score, clef, midi, chronaxie } = params
  const staff = findStaffByClef(score, clef)
  const measure = staff?.measures[0]
  if (!staff || !measure) return false

  const keySignature = staffKeySignature(staff)
  const { region, accidental } = getNoteRegionAndAccidental(clef, midi, AccidentalTypeEnum.Sharp)
  const writeAccidental = resolveAccidentalToWrite(measure, clef, keySignature, region, accidental)

  const note = createNoteSymbol({
    region,
    chronaxie,
    ...(writeAccidental != null ? { accidental: writeAccidental } : {})
  })
  measure.notes.push(note)
  return true
}

/** 清空三个谱表首小节内的全部音符 */
export function clearAllWhiteboardNotes(score: MusicScore): void {
  for (const grandStaff of score.grandStaffs) {
    for (const staff of grandStaff.staves) {
      const first = staff.measures[0]
      if (first) first.notes = []
    }
  }
}

/**
 * 同步更改全部单谱表调号：先把每个小节内的音符做变调（保持实际音高不变），
 * 再把首小节的 keySignature_f 改为目标调号。
 */
export function applyWhiteboardKeySignature(
  score: MusicScore,
  target: KeySignatureTypeEnum
): void {
  for (const grandStaff of score.grandStaffs) {
    for (const staff of grandStaff.staves) {
      const first = staff.measures[0]
      if (!first) continue

      const current = staffKeySignature(staff)
      changeMeasureNotesKeySignature(first, current, target)
      if (target === KeySignatureTypeEnum.C) {
        first.keySignature_f = undefined
      } else {
        first.keySignature_f = createKeySignature(target)
      }
    }
  }
}
