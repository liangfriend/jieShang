/**
 * 简谱音符块 MusicScore 生成：一小节 = `1=X` 调号 + 拍号 + 一个四分数字音符（含八度点 / 升降号）。
 * 与 midiBrickBuilder（线谱）对应；唱名 / 八度 / 变音由 scoreUtil.getOctaveAndSyllable 按首调换算。
 * 简谱不存在重升 / 重降写法，因此 allowDoubleAccidentals 对简谱块无意义。
 */

import {
  AccidentalTypeEnum,
  KeySignatureTypeEnum,
  MusicScoreTypeEnum,
  TimeSignatureTypeEnum,
  type MusicScore
} from '@deciphony/renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createNoteNumber,
  createSingleStaff
} from '@deciphony/extensions/dr-edit/score-builder'
import { getOctaveAndSyllable } from '@deciphony/extensions/score-util'
import {
  MIDI_BRICK_CHRONAXIE,
  MIDI_BRICK_KEY_SIGNATURES,
  MIDI_BRICK_MIDI_MAX,
  MIDI_BRICK_MIDI_MIN
} from '@renderer/views/noteSlice/midiBrickBuilder'
import {
  NOTE_SLICE_BRICK_GRAND_STAFF_SPACING,
  NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING,
  NOTE_SLICE_JIANPU_BRICK_SCORE_HEIGHT,
  NOTE_SLICE_JIANPU_BRICK_SCORE_SPACE,
  NOTE_SLICE_JIANPU_BRICK_SCORE_WIDTH
} from '@renderer/views/noteSlice/noteSliceBrickLayout'

type JianpuSyllable = 1 | 2 | 3 | 4 | 5 | 6 | 7

/** 简谱八度点取值范围（渲染器约束） */
const JIANPU_OCTAVE_DOT_MIN = -5
const JIANPU_OCTAVE_DOT_MAX = 6

/** 变音优先写法：升号 / 降号各占一半，让玩家两种写法都练到 */
const JIANPU_ACCIDENTAL_PRIORITIES = [AccidentalTypeEnum.Sharp, AccidentalTypeEnum.Flat] as const

export type GenerateJianpuBrickOptions = {
  /** 候选调号，默认全部 15 种 */
  keySignatures?: readonly KeySignatureTypeEnum[]
  /** 是否允许升号 / 降号（即非本调自然音级的 midi），默认 true */
  allowSingleAccidentals?: boolean
  /** 随机源，默认 Math.random */
  random?: () => number
}

export type GeneratedJianpuBrick = {
  midi: number
  keySignature: KeySignatureTypeEnum
  syllable: JianpuSyllable
  octaveDot: number
  accidental: AccidentalTypeEnum | null
  score: MusicScore
}

function clampMidi(midi: number): number {
  return Math.min(MIDI_BRICK_MIDI_MAX, Math.max(MIDI_BRICK_MIDI_MIN, Math.round(midi)))
}

function clampOctaveDot(octave: number): number {
  return Math.min(JIANPU_OCTAVE_DOT_MAX, Math.max(JIANPU_OCTAVE_DOT_MIN, Math.round(octave)))
}

function pickRandom<T>(items: readonly T[], random: () => number): T {
  if (items.length === 0) {
    throw new Error('pickRandom: 候选列表不能为空')
  }
  return items[Math.floor(random() * items.length)]!
}

function resolveKeyCandidates(
  keySignatures: readonly KeySignatureTypeEnum[] | undefined
): KeySignatureTypeEnum[] {
  const allowed = new Set<KeySignatureTypeEnum>(MIDI_BRICK_KEY_SIGNATURES)
  const list = keySignatures?.length ? [...keySignatures] : [...MIDI_BRICK_KEY_SIGNATURES]
  return list.filter((k) => allowed.has(k))
}

/** midi 在指定调下是否为自然音级（简谱无需升降号） */
export function isMidiDiatonicInKey(midi: number, keySignature: KeySignatureTypeEnum): boolean {
  return getOctaveAndSyllable(midi, AccidentalTypeEnum.Sharp, keySignature).accidental === null
}

/** 在候选调号中筛出该 midi 可写的调（禁用变音时仅保留自然音级的调） */
export function resolveJianpuKeyCandidatesForMidi(
  midi: number,
  keySignatures: readonly KeySignatureTypeEnum[] | undefined,
  allowSingleAccidentals: boolean
): KeySignatureTypeEnum[] {
  const keys = resolveKeyCandidates(keySignatures)
  if (allowSingleAccidentals) return keys
  return keys.filter((key) => isMidiDiatonicInKey(midi, key))
}

/** 指定调号 + midi，构造单块简谱 MusicScore */
export function buildJianpuBrickScore(
  midi: number,
  keySignature: KeySignatureTypeEnum,
  options?: Pick<GenerateJianpuBrickOptions, 'random' | 'allowSingleAccidentals'>
): GeneratedJianpuBrick {
  const normalizedMidi = clampMidi(midi)
  const random = options?.random ?? Math.random
  const allowSingleAccidentals = options?.allowSingleAccidentals ?? true

  const priority = pickRandom(JIANPU_ACCIDENTAL_PRIORITIES, random)
  const { octave, syllable, accidental } = getOctaveAndSyllable(normalizedMidi, priority, keySignature)
  if (accidental !== null && !allowSingleAccidentals) {
    throw new Error(`buildJianpuBrickScore: midi ${normalizedMidi} 在 ${keySignature} 下需要变音记号`)
  }
  const octaveDot = clampOctaveDot(octave)

  const measure = createMeasure({
    keySignature,
    timeSignature: TimeSignatureTypeEnum['4_4']
  })
  measure.notes.push(
    createNoteNumber({
      syllable: syllable as JianpuSyllable,
      chronaxie: MIDI_BRICK_CHRONAXIE,
      octaveDot,
      ...(accidental != null ? { accidental } : {})
    })
  )

  const score = createMusicScore({
    type: MusicScoreTypeEnum.NumberNotation,
    keySignature,
    timeSignature: TimeSignatureTypeEnum['4_4'],
    width: NOTE_SLICE_JIANPU_BRICK_SCORE_WIDTH,
    height: NOTE_SLICE_JIANPU_BRICK_SCORE_HEIGHT,
    topSpaceHeight: NOTE_SLICE_JIANPU_BRICK_SCORE_SPACE
  })
  const grandStaff = createGrandStaff({
    withDefaultStaff: false,
    ...NOTE_SLICE_BRICK_GRAND_STAFF_SPACING
  })
  const staff = createSingleStaff({
    withDefaultMeasure: false,
    notationType: MusicScoreTypeEnum.NumberNotation,
    ...NOTE_SLICE_BRICK_SINGLE_STAFF_SPACING
  })
  staff.measures.push(measure)
  grandStaff.staves.push(staff)
  score.grandStaffs.push(grandStaff)

  return {
    midi: normalizedMidi,
    keySignature,
    syllable: syllable as JianpuSyllable,
    octaveDot,
    accidental,
    score
  }
}

/**
 * 传入 midi，在 options 限定的调号范围内随机选一个调，生成可渲染的简谱 MusicScore。
 * 禁用变音时若无任何调可让该 midi 成为自然音级，抛错（调用方视为不可生成）。
 */
export function generateRandomJianpuBrickScore(
  midi: number,
  options: GenerateJianpuBrickOptions = {}
): GeneratedJianpuBrick {
  const random = options.random ?? Math.random
  const allowSingleAccidentals = options.allowSingleAccidentals ?? true
  const keyCandidates = resolveJianpuKeyCandidatesForMidi(
    midi,
    options.keySignatures,
    allowSingleAccidentals
  )
  if (keyCandidates.length === 0) {
    throw new Error(`generateRandomJianpuBrickScore: midi ${midi} 无可用调号`)
  }
  const keySignature = pickRandom(keyCandidates, random)
  return buildJianpuBrickScore(midi, keySignature, { random, allowSingleAccidentals })
}
