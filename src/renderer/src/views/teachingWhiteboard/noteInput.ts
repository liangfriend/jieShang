import {
  AccidentalTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  isNoteRest,
  isNoteSymbol
} from '@deciphony/renderer'
import type {
  Chronaxie,
  Measure,
  MeasureNoteSlot,
  MusicScore,
  SingleStaff
} from '@deciphony/renderer'
import {
  CHRONAXIES,
  appendNotesInfo,
  createKeySignature,
  createNoteRest,
  createNoteSymbol
} from '@deciphony/extensions/dr-edit/score-builder'
import {
  changeMeasureNotesKeySignature,
  getKeySignatureAccidental,
  getNoteMidi,
  getNoteRegionAndAccidental,
  type AlteredAccidental
} from '@deciphony/extensions/score-util'
import {
  WHITEBOARD_DOUBLE_TREBLE_MIN_MIDI,
  type WhiteboardClef
} from '@renderer/constant/whiteboard'

/** 双行模式按音高决定写到高音还是低音谱表 */
export function resolveDoubleStaffClef(midi: number): WhiteboardClef {
  return midi >= WHITEBOARD_DOUBLE_TREBLE_MIN_MIDI ? ClefTypeEnum.Treble : ClefTypeEnum.Bass
}

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

/** 在复谱表里按谱号定位目标单谱表（三行模式高/中/低音各一行，双行模式高/低音） */
function findStaffByClef(score: MusicScore, clef: ClefTypeEnum): SingleStaff | null {
  for (const grandStaff of score.grandStaffs) {
    for (const staff of grandStaff.staves) {
      if (staff.measures[0]?.clef_f?.type === clef) return staff
    }
  }
  return null
}

/** 白板只用单声部：多声部结构时取上声部（已发布的 renderer 未导出 getMeasureNoteList） */
function measureNoteList(measure: Measure): MeasureNoteSlot[] {
  const notes = measure.notes
  if (Array.isArray(notes)) return notes
  return (notes.up ??= [])
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
  for (const slot of measureNoteList(measure)) {
    const symbol = slot.symbol
    if (!isNoteSymbol(symbol)) continue
    for (const ni of symbol.notesInfo) {
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

const FLAT_KEY_SIGNATURES = new Set<KeySignatureTypeEnum>([
  KeySignatureTypeEnum.F,
  KeySignatureTypeEnum.B_flat,
  KeySignatureTypeEnum.E_flat,
  KeySignatureTypeEnum.A_flat,
  KeySignatureTypeEnum.D_flat,
  KeySignatureTypeEnum.G_flat,
  KeySignatureTypeEnum.C_flat
])

const ALTERATION_BY_OFFSET: Record<number, AlteredAccidental> = {
  [-2]: AccidentalTypeEnum.Double_flat,
  [-1]: AccidentalTypeEnum.Flat,
  1: AccidentalTypeEnum.Sharp,
  2: AccidentalTypeEnum.Double_sharp
}

/** 该 region 要发出 midi 所需的实际变音；null 为自然音 */
function alterationAt(clef: ClefTypeEnum, region: number, midi: number): AlteredAccidental | null {
  return ALTERATION_BY_OFFSET[midi - getNoteMidi(clef, region, null)] ?? null
}

export interface AddWhiteboardNoteParams {
  score: MusicScore
  clef: WhiteboardClef
  midi: number
  chronaxie: Chronaxie
  /** 符干方向；缺省按音高自动 */
  direction?: 'up' | 'down'
  /** 同一和弦已写入的 slot；仍在目标小节内且无同 region 符头时追加到该 slot */
  chordSlot?: MeasureNoteSlot | null
  /** 原位换成音符的 slot（双行模式里为对齐补的休止符） */
  replaceSlot?: MeasureNoteSlot | null
}

/**
 * 把一个键盘音符按当前调号/变音规则添加到指定谱号的单谱表上。
 * 返回写入的 slot（和弦追加时为 chordSlot），失败返回 null。
 */
export function addNoteToWhiteboardScore(params: AddWhiteboardNoteParams): MeasureNoteSlot | null {
  const { score, clef, midi, chronaxie, direction, chordSlot, replaceSlot } = params
  const staff = findStaffByClef(score, clef)
  const measure = staff?.measures[0]
  if (!staff || !measure) return null

  const keySignature = staffKeySignature(staff)
  // 传入实际调号：黑键在降号调拼成降号、升号调拼成升号
  const { region } = getNoteRegionAndAccidental(
    clef,
    midi,
    keySignature,
    FLAT_KEY_SIGNATURES.has(keySignature) ? AccidentalTypeEnum.Flat : AccidentalTypeEnum.Sharp
  )
  const desiredAccidental = alterationAt(clef, region, midi)
  const writeAccidental = resolveAccidentalToWrite(
    measure,
    clef,
    keySignature,
    region,
    desiredAccidental
  )

  const accidentalOption = writeAccidental != null ? { accidental: writeAccidental } : {}
  const notes = measureNoteList(measure)

  const chordSymbol = chordSlot?.symbol
  if (
    chordSlot &&
    chordSymbol &&
    isNoteSymbol(chordSymbol) &&
    notes.includes(chordSlot) &&
    !chordSymbol.notesInfo.some((ni) => ni.region === region)
  ) {
    appendNotesInfo(chordSymbol, region, accidentalOption)
    return chordSlot
  }

  const slot = createNoteSymbol({ region, chronaxie, direction, ...accidentalOption })
  const replaceIndex = replaceSlot ? notes.indexOf(replaceSlot) : -1
  if (replaceIndex >= 0) {
    notes.splice(replaceIndex, 1, slot)
    return notes[replaceIndex]!
  }
  notes.push(slot)
  // 取回数组中的项：score 为响应式时得到代理，后续追加和弦符头才能触发重绘
  return notes[notes.length - 1]!
}

/** 双行模式里同一和弦（几乎同时按下的键）已写入两个谱表的 slot */
export type DoubleStaffChordSlots = Partial<Record<WhiteboardClef, MeasureNoteSlot>>

/**
 * 双行模式：音符按音高写到高 / 低音谱表，高音谱表符干向上、低音谱表向下；
 * 另一行补同时值的休止符，两行按时间对齐。
 * 同一和弦跨两行时，把先前补的休止符原位换成音符。
 */
export function addNoteToDoubleStaffScore(params: {
  score: MusicScore
  midi: number
  chronaxie: Chronaxie
  chord: DoubleStaffChordSlots
}): void {
  const { score, midi, chord } = params
  const clef = resolveDoubleStaffClef(midi)
  const otherClef: WhiteboardClef = clef === ClefTypeEnum.Treble ? ClefTypeEnum.Bass : ClefTypeEnum.Treble
  const measure = findStaffByClef(score, clef)?.measures[0]
  const otherMeasure = findStaffByClef(score, otherClef)?.measures[0]
  if (!measure || !otherMeasure) return

  // 自动清空后旧和弦组里的 slot 已不在小节内
  const existing = chord[clef]
  const current = existing && measureNoteList(measure).includes(existing) ? existing : null
  const restSymbol = current && isNoteRest(current.symbol) ? current.symbol : null
  const fillerRest = restSymbol ? current : null
  // 换掉补位休止符时沿用它的时值，同一列两行时值一致
  const chronaxie = restSymbol ? (restSymbol.chronaxie as Chronaxie) : params.chronaxie

  const slot = addNoteToWhiteboardScore({
    score,
    clef,
    midi,
    chronaxie,
    direction: clef === ClefTypeEnum.Treble ? 'up' : 'down',
    chordSlot: fillerRest ? null : current,
    replaceSlot: fillerRest
  })
  if (!slot) return
  chord[clef] = slot
  if (current) return

  const otherNotes = measureNoteList(otherMeasure)
  otherNotes.push(createNoteRest({ chronaxie }))
  chord[otherClef] = otherNotes[otherNotes.length - 1]
}

/** 清空全部谱表首小节内的音符 */
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
export function applyWhiteboardKeySignature(score: MusicScore, target: KeySignatureTypeEnum): void {
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
