/**
 * 音符块 MusicScore 生成：一小节 = 谱号 + 调号 + 一个四分音符。
 * region / accidental 由 scoreUtil.getAllNoteRegion 枚举后随机选取。
 */

import {
  AccidentalTypeEnum,
  ClefTypeEnum,
  KeySignatureTypeEnum,
  MusicScore,
  TimeSignatureTypeEnum,
  type Chronaxie
} from 'deciphony-renderer'
import {
  createGrandStaff,
  createMeasure,
  createMusicScore,
  createNoteSymbol,
  createSingleStaff
} from '@renderer/dr-extensions/dr-edit/score-builder'
import { getAllNoteRegion, type NoteRegionsByAccidental } from '@renderer/dr-extensions/scoreUtil'

/** 音符块可用的谱号（不含次中音） */
export const MIDI_BRICK_CLEFS = [ClefTypeEnum.Treble, ClefTypeEnum.Bass, ClefTypeEnum.Alto] as const

export type MidiBrickClef = (typeof MIDI_BRICK_CLEFS)[number]

/** 全部 15 种调号 */
export const MIDI_BRICK_KEY_SIGNATURES = [
  KeySignatureTypeEnum.C,
  KeySignatureTypeEnum.C_sharp,
  KeySignatureTypeEnum.D_flat,
  KeySignatureTypeEnum.D,
  KeySignatureTypeEnum.E_flat,
  KeySignatureTypeEnum.E,
  KeySignatureTypeEnum.F,
  KeySignatureTypeEnum.F_sharp,
  KeySignatureTypeEnum.G_flat,
  KeySignatureTypeEnum.G,
  KeySignatureTypeEnum.A_flat,
  KeySignatureTypeEnum.A,
  KeySignatureTypeEnum.B_flat,
  KeySignatureTypeEnum.B,
  KeySignatureTypeEnum.C_flat
] as const

export type MidiBrickKeySignature = (typeof MIDI_BRICK_KEY_SIGNATURES)[number]

export const MIDI_BRICK_MIDI_MIN = 21
export const MIDI_BRICK_MIDI_MAX = 108

export const MIDI_BRICK_CHRONAXIE: Chronaxie = 64

export type GenerateMidiBrickOptions = {
  /** 候选谱号，默认 treble / bass / alto */
  clefs?: readonly MidiBrickClef[]
  /** 候选调号，默认全部 15 种 */
  keySignatures?: readonly KeySignatureTypeEnum[]
  /** 随机源，默认 Math.random */
  random?: () => number
  measureWidthRatio?: number
  scoreWidth?: number
  scoreHeight?: number
}

export type GeneratedMidiBrick = {
  midi: number
  clef: MidiBrickClef
  keySignature: KeySignatureTypeEnum
  region: number
  accidental: AccidentalTypeEnum | null
  score: MusicScore
}

function clampMidi(midi: number): number {
  return Math.min(MIDI_BRICK_MIDI_MAX, Math.max(MIDI_BRICK_MIDI_MIN, Math.round(midi)))
}

function pickRandom<T>(items: readonly T[], random: () => number): T {
  if (items.length === 0) {
    throw new Error('pickRandom: 候选列表不能为空')
  }
  return items[Math.floor(random() * items.length)]!
}

function resolveClefCandidates(clefs: readonly MidiBrickClef[] | undefined): MidiBrickClef[] {
  const list = clefs?.length ? [...clefs] : [...MIDI_BRICK_CLEFS]
  return list.filter((c) => MIDI_BRICK_CLEFS.includes(c))
}

function resolveKeyCandidates(
  keySignatures: readonly KeySignatureTypeEnum[] | undefined
): KeySignatureTypeEnum[] {
  const allowed = new Set<KeySignatureTypeEnum>(MIDI_BRICK_KEY_SIGNATURES)
  const list = keySignatures?.length ? [...keySignatures] : [...MIDI_BRICK_KEY_SIGNATURES]
  return list.filter((k) => allowed.has(k))
}

const WRITTEN_ACCIDENTAL_CHOICES = [
  AccidentalTypeEnum.Natural,
  AccidentalTypeEnum.Sharp,
  AccidentalTypeEnum.Flat,
  AccidentalTypeEnum.Double_sharp,
  AccidentalTypeEnum.Double_flat
] as const

type WrittenAccidentalChoice = 'none' | AccidentalTypeEnum

function collectValidPlacements(
  map: NoteRegionsByAccidental
): { choice: WrittenAccidentalChoice; region: number }[] {
  const list: { choice: WrittenAccidentalChoice; region: number }[] = []
  if (map.none != null) {
    list.push({ choice: 'none', region: map.none })
  }
  for (const accidental of WRITTEN_ACCIDENTAL_CHOICES) {
    const region = map[accidental]
    if (region != null) {
      list.push({ choice: accidental, region })
    }
  }
  return list
}

function pickNotePlacement(
  clef: MidiBrickClef,
  midi: number,
  keySignature: KeySignatureTypeEnum,
  random?: () => number
): { region: number; accidental: AccidentalTypeEnum | null } {
  const choices = collectValidPlacements(getAllNoteRegion(clef, midi, keySignature))
  if (choices.length === 0) {
    throw new Error(`pickNotePlacement: midi ${midi} 在 ${clef} + ${keySignature} 下无合法写法`)
  }
  const picked = random ? pickRandom(choices, random) : choices[0]!
  return {
    region: picked.region,
    accidental: picked.choice === 'none' ? null : picked.choice
  }
}

/** 指定谱号 + 调号 + midi，构造单块 MusicScore */
export function buildMidiBrickScore(
  midi: number,
  clef: MidiBrickClef,
  keySignature: KeySignatureTypeEnum,
  layout?: Pick<
    GenerateMidiBrickOptions,
    'measureWidthRatio' | 'scoreWidth' | 'scoreHeight' | 'random'
  >
): GeneratedMidiBrick {
  const normalizedMidi = clampMidi(midi)
  const { region, accidental } = pickNotePlacement(
    clef,
    normalizedMidi,
    keySignature,
    layout?.random
  )

  const measure = createMeasure({
    clef,
    keySignature,
    timeSignature: TimeSignatureTypeEnum['4_4'],
    widthRatioForMeasure: layout?.measureWidthRatio ?? 24
  })

  measure.notes.push(
    createNoteSymbol({
      notesInfo: [
        {
          region,
          chronaxie: MIDI_BRICK_CHRONAXIE,
          ...(accidental != null ? { accidental } : {})
        }
      ]
    })
  )

  const score = createMusicScore({
    width: layout?.scoreWidth ?? 320,
    height: layout?.scoreHeight ?? 240
  })
  const grandStaff = createGrandStaff({ withDefaultStaff: false })
  const staff = createSingleStaff({ withDefaultMeasure: false })
  staff.measures.push(measure)
  grandStaff.staves.push(staff)
  score.grandStaffs.push(grandStaff)

  return {
    midi: normalizedMidi,
    clef,
    keySignature,
    region,
    accidental,
    score
  }
}

/**
 * 传入 midi，在 options 限定的谱号 / 调号范围内随机选一组，生成可渲染的 MusicScore。
 */
export function generateRandomMidiBrickScore(
  midi: number,
  options: GenerateMidiBrickOptions = {}
): GeneratedMidiBrick {
  const random = options.random ?? Math.random
  const clefCandidates = resolveClefCandidates(options.clefs)
  const keyCandidates = resolveKeyCandidates(options.keySignatures)

  if (clefCandidates.length === 0) {
    throw new Error('generateRandomMidiBrickScore: clefs 过滤后为空')
  }
  if (keyCandidates.length === 0) {
    throw new Error('generateRandomMidiBrickScore: keySignatures 过滤后为空')
  }

  const clef = pickRandom(clefCandidates, random)
  const keySignature = pickRandom(keyCandidates, random)

  return buildMidiBrickScore(midi, clef, keySignature, { ...options, random })
}
