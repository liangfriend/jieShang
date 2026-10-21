import { ClefTypeEnum, KeySignatureTypeEnum, type MusicScore } from '@deciphony/renderer'
import {
  DEFAULT_GAME_NOTATION_MODE,
  isGameNotationMode,
  type GameNotationMode
} from '@renderer/constant/gameSettings'
import {
  MIDI_BRICK_CLEFS,
  MIDI_BRICK_KEY_SIGNATURES,
  MIDI_BRICK_MIDI_MAX,
  MIDI_BRICK_MIDI_MIN,
  generateRandomMidiBrickScore,
  type MidiBrickClef
} from '@renderer/views/noteSlice/midiBrickBuilder'
import {
  generateRandomJianpuBrickScore,
  isMidiDiatonicInKey,
  resolveJianpuKeyCandidatesForMidi
} from '@renderer/views/noteSlice/jianpuBrickBuilder'
import {
  applyNoteSliceBrickScoreLayout,
  applyNoteSliceJianpuBrickScoreLayout
} from '@renderer/views/noteSlice/noteSliceBrickLayout'
import { NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES } from '@renderer/views/noteSlice/noteSliceSpawnClefs'

export const NOTE_PRACTICE_STORAGE_KEY = 'abilityTest.notePractice.settings'

export const NOTE_PRACTICE_MIDI_MIN = MIDI_BRICK_MIDI_MIN
export const NOTE_PRACTICE_MIDI_MAX = MIDI_BRICK_MIDI_MAX

export const NOTE_PRACTICE_COUNT_MIN = 1
export const NOTE_PRACTICE_COUNT_MAX = 10000

/** 临时变音：不出现 / 升降号 / 含重升重降（简谱没有重升重降，按升降号处理） */
export type NotePracticeAccidentals = 'none' | 'single' | 'double'

export const NOTE_PRACTICE_ACCIDENTAL_OPTIONS: readonly NotePracticeAccidentals[] = [
  'none',
  'single',
  'double'
]

/** 按升号数、降号数排列，方便设置面板逐个勾选 */
export const NOTE_PRACTICE_KEY_OPTIONS: readonly { value: KeySignatureTypeEnum; label: string }[] = [
  { value: KeySignatureTypeEnum.C, label: 'C' },
  { value: KeySignatureTypeEnum.G, label: 'G 1♯' },
  { value: KeySignatureTypeEnum.D, label: 'D 2♯' },
  { value: KeySignatureTypeEnum.A, label: 'A 3♯' },
  { value: KeySignatureTypeEnum.E, label: 'E 4♯' },
  { value: KeySignatureTypeEnum.B, label: 'B 5♯' },
  { value: KeySignatureTypeEnum.F_sharp, label: 'F♯ 6♯' },
  { value: KeySignatureTypeEnum.C_sharp, label: 'C♯ 7♯' },
  { value: KeySignatureTypeEnum.F, label: 'F 1♭' },
  { value: KeySignatureTypeEnum.B_flat, label: 'B♭ 2♭' },
  { value: KeySignatureTypeEnum.E_flat, label: 'E♭ 3♭' },
  { value: KeySignatureTypeEnum.A_flat, label: 'A♭ 4♭' },
  { value: KeySignatureTypeEnum.D_flat, label: 'D♭ 5♭' },
  { value: KeySignatureTypeEnum.G_flat, label: 'G♭ 6♭' },
  { value: KeySignatureTypeEnum.C_flat, label: 'C♭ 7♭' }
]

export const NOTE_PRACTICE_CLEF_OPTIONS: readonly { value: MidiBrickClef; key: string }[] = [
  { value: ClefTypeEnum.Treble, key: 'treble' },
  { value: ClefTypeEnum.Alto, key: 'alto' },
  { value: ClefTypeEnum.Bass, key: 'bass' }
]

export type NotePracticeSettings = {
  notationMode: GameNotationMode
  clefs: MidiBrickClef[]
  keySignatures: KeySignatureTypeEnum[]
  accidentals: NotePracticeAccidentals
  midiMin: number
  midiMax: number
  count: number
  infinite: boolean
  /** 新音符出现时播放它的音高 */
  playTargetSound: boolean
  /** 弹奏（MIDI / 虚拟钢琴）时由软件发声 */
  keySound: boolean
  showPiano: boolean
}

export const DEFAULT_NOTE_PRACTICE_SETTINGS: NotePracticeSettings = {
  notationMode: DEFAULT_GAME_NOTATION_MODE,
  clefs: [ClefTypeEnum.Treble, ClefTypeEnum.Bass],
  keySignatures: [KeySignatureTypeEnum.C],
  accidentals: 'none',
  midiMin: 38,
  midiMax: 83,
  count: 50,
  infinite: false,
  playTargetSound: true,
  keySound: true,
  showPiano: true
}

function clampInt(value: unknown, min: number, max: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function pickList<T>(value: unknown, allowed: readonly T[], fallback: T[]): T[] {
  if (!Array.isArray(value)) return [...fallback]
  return allowed.filter((item) => value.includes(item))
}

export function normalizeNotePracticeSettings(raw: unknown): NotePracticeSettings {
  const d = DEFAULT_NOTE_PRACTICE_SETTINGS
  const src = (raw && typeof raw === 'object' ? raw : {}) as Partial<Record<keyof NotePracticeSettings, unknown>>
  const midiMin = clampInt(src.midiMin, NOTE_PRACTICE_MIDI_MIN, NOTE_PRACTICE_MIDI_MAX, d.midiMin)
  const midiMax = clampInt(src.midiMax, NOTE_PRACTICE_MIDI_MIN, NOTE_PRACTICE_MIDI_MAX, d.midiMax)
  return {
    notationMode: isGameNotationMode(src.notationMode) ? src.notationMode : d.notationMode,
    clefs: pickList(src.clefs, MIDI_BRICK_CLEFS, d.clefs),
    keySignatures: pickList(src.keySignatures, MIDI_BRICK_KEY_SIGNATURES, d.keySignatures),
    accidentals: NOTE_PRACTICE_ACCIDENTAL_OPTIONS.includes(src.accidentals as NotePracticeAccidentals)
      ? (src.accidentals as NotePracticeAccidentals)
      : d.accidentals,
    midiMin: Math.min(midiMin, midiMax),
    midiMax: Math.max(midiMin, midiMax),
    count: clampInt(src.count, NOTE_PRACTICE_COUNT_MIN, NOTE_PRACTICE_COUNT_MAX, d.count),
    infinite: typeof src.infinite === 'boolean' ? src.infinite : d.infinite,
    playTargetSound: typeof src.playTargetSound === 'boolean' ? src.playTargetSound : d.playTargetSound,
    keySound: typeof src.keySound === 'boolean' ? src.keySound : d.keySound,
    showPiano: typeof src.showPiano === 'boolean' ? src.showPiano : d.showPiano
  }
}

export function loadNotePracticeSettings(): NotePracticeSettings {
  try {
    const raw = localStorage.getItem(NOTE_PRACTICE_STORAGE_KEY)
    return normalizeNotePracticeSettings(raw ? JSON.parse(raw) : null)
  } catch {
    return normalizeNotePracticeSettings(null)
  }
}

export function saveNotePracticeSettings(settings: NotePracticeSettings): void {
  localStorage.setItem(NOTE_PRACTICE_STORAGE_KEY, JSON.stringify(settings))
}

function allowSingleAccidentals(settings: NotePracticeSettings): boolean {
  return settings.accidentals !== 'none'
}

function staffClefsForMidi(midi: number, settings: NotePracticeSettings): MidiBrickClef[] {
  return settings.clefs.filter((clef) => {
    const range = NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES[clef]
    return midi >= range.min && midi <= range.max
  })
}

/** 不允许临时变音时，只保留该 midi 为自然音级的调 */
function staffKeysForMidi(midi: number, settings: NotePracticeSettings): KeySignatureTypeEnum[] {
  if (allowSingleAccidentals(settings)) return [...settings.keySignatures]
  return settings.keySignatures.filter((key) => isMidiDiatonicInKey(midi, key))
}

function isMidiPracticable(midi: number, settings: NotePracticeSettings): boolean {
  if (settings.keySignatures.length === 0) return false
  if (settings.notationMode === 'jianpu') {
    return (
      resolveJianpuKeyCandidatesForMidi(midi, settings.keySignatures, allowSingleAccidentals(settings))
        .length > 0
    )
  }
  return staffClefsForMidi(midi, settings).length > 0 && staffKeysForMidi(midi, settings).length > 0
}

/** 当前设置下能出题的全部 midi */
export function listNotePracticeMidis(settings: NotePracticeSettings): number[] {
  const out: number[] = []
  for (let midi = settings.midiMin; midi <= settings.midiMax; midi++) {
    if (isMidiPracticable(midi, settings)) out.push(midi)
  }
  return out
}

export type NotePracticeBlock = {
  id: string
  midi: number
  musicScore: MusicScore
}

/** 按设置为指定 midi 生成一个音符块；写不出来时返回 null */
export function buildNotePracticeBlock(
  id: string,
  midi: number,
  settings: NotePracticeSettings,
  random: () => number = Math.random
): NotePracticeBlock | null {
  const allowSingle = allowSingleAccidentals(settings)
  try {
    if (settings.notationMode === 'jianpu') {
      const brick = generateRandomJianpuBrickScore(midi, {
        random,
        keySignatures: settings.keySignatures,
        allowSingleAccidentals: allowSingle
      })
      const musicScore = JSON.parse(JSON.stringify(brick.score)) as MusicScore
      applyNoteSliceJianpuBrickScoreLayout(musicScore)
      return { id, midi: brick.midi, musicScore }
    }

    const clefs = staffClefsForMidi(midi, settings)
    const keySignatures = staffKeysForMidi(midi, settings)
    if (clefs.length === 0 || keySignatures.length === 0) return null
    const brick = generateRandomMidiBrickScore(midi, {
      random,
      clefs,
      keySignatures,
      allowSingleAccidentals: allowSingle,
      allowDoubleAccidentals: settings.accidentals === 'double'
    })
    const musicScore = JSON.parse(JSON.stringify(brick.score)) as MusicScore
    applyNoteSliceBrickScoreLayout(musicScore, brick.keySignature)
    return { id, midi: brick.midi, musicScore }
  } catch {
    return null
  }
}
