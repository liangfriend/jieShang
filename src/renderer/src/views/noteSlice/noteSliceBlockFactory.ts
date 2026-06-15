import type { MusicScore } from 'deciphony-renderer'
import {
  generateRandomMidiBrickScore
} from '@renderer/views/noteSlice/midiBrickBuilder'
import {
  NOTE_SLICE_BLOCK_SHELL_HEIGHT,
  NOTE_SLICE_BLOCK_SHELL_WIDTH,
  NOTE_SLICE_BOMB_BATCH,
  NOTE_SLICE_DOUBLE_BATCH,
  NOTE_SLICE_FREEZE_BATCH,
  NOTE_SLICE_HEAL_BATCH
} from '@renderer/views/noteSlice/noteSliceGameConstants'
import { getActiveNoteSliceDifficultyConfig } from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import { applyNoteSliceBrickScoreLayout } from '@renderer/views/noteSlice/noteSliceBrickLayout'
import { randomNoteSliceSpawnMidiExcluding } from '@renderer/views/noteSlice/noteSliceMidiBlacklist'
import {
  NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES,
  resolveSpawnClefsForMidi
} from '@renderer/views/noteSlice/noteSliceSpawnClefs'

export { NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES, resolveSpawnClefsForMidi }

export type NoteSliceBlockType = 'normal' | 'bomb' | 'heal' | 'freeze' | 'double'

export type NoteSliceActiveBlock = {
  id: string
  slotIndex: number
  /** 生成批次，从 0 递增；炸弹固定为 NOTE_SLICE_BOMB_BATCH（-1） */
  batch: number
  /** 块类型：普通音符 / 炸弹 */
  type: NoteSliceBlockType
  x: number
  y: number
  midi: number
  /** 块上音符数量（当前无和弦，恒为 1） */
  noteCount: number
  width: number
  height: number
  musicScore: MusicScore
  ageMs: number
}

export type BuildRandomNoteSliceBlockOptions = {
  type?: NoteSliceBlockType
  random?: () => number
  /** 不可选用的 midi（黑名单 + 屏上已有等） */
  excludedMidis?: ReadonlySet<number>
}

/** 指定 midi 生成音符块（用于乱按惩罚炸弹等）；无法渲染时返回 null */
export function buildNoteSliceBlockWithMidi(
  id: string,
  midi: number,
  options: { type?: NoteSliceBlockType; random?: () => number } = {}
): Omit<NoteSliceActiveBlock, 'slotIndex' | 'batch' | 'x' | 'y' | 'ageMs'> | null {
  const random = options.random ?? Math.random
  const type = options.type ?? 'normal'
  const { midiMin, midiMax, allowDoubleAccidentals, allowSingleAccidentals, allowedKeySignatures } =
    getActiveNoteSliceDifficultyConfig()
  if (midi < midiMin || midi > midiMax) return null

  const clefs = resolveSpawnClefsForMidi(midi)
  if (clefs.length === 0) return null

  let brick
  try {
    brick = generateRandomMidiBrickScore(midi, {
      random,
      clefs,
      keySignatures: allowedKeySignatures,
      allowSingleAccidentals,
      allowDoubleAccidentals
    })
  } catch {
    return null
  }
  const musicScore = JSON.parse(JSON.stringify(brick.score)) as MusicScore
  applyNoteSliceBrickScoreLayout(musicScore, brick.keySignature)

  return {
    id,
    type,
    midi: brick.midi,
    noteCount: 1,
    width: NOTE_SLICE_BLOCK_SHELL_WIDTH,
    height: NOTE_SLICE_BLOCK_SHELL_HEIGHT,
    musicScore
  }
}

/** 生成带 musicScore 的音符块数据（不含位置）；无可用 midi 时返回 null */
export function buildRandomNoteSliceBlock(
  id: string,
  options: BuildRandomNoteSliceBlockOptions = {}
): Omit<NoteSliceActiveBlock, 'slotIndex' | 'batch' | 'x' | 'y' | 'ageMs'> | null {
  const random = options.random ?? Math.random
  const type = options.type ?? 'normal'
  const excludedMidis = options.excludedMidis ?? new Set<number>()
  const midi = randomNoteSliceSpawnMidiExcluding(excludedMidis, random)
  if (midi === null) return null
  return buildNoteSliceBlockWithMidi(id, midi, { type, random })
}

export { NOTE_SLICE_BOMB_BATCH, NOTE_SLICE_DOUBLE_BATCH, NOTE_SLICE_FREEZE_BATCH, NOTE_SLICE_HEAL_BATCH }
