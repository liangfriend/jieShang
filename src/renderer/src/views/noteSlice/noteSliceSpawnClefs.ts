import { ClefTypeEnum } from 'deciphony-renderer'
import { getActiveNoteSliceDifficultyConfig } from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import type { MidiBrickClef } from '@renderer/views/noteSlice/midiBrickBuilder'

/** 各谱号可用于生成的 midi 范围（含边界） */
export const NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES: Record<  MidiBrickClef,
  { min: number; max: number }
> = {
  [ClefTypeEnum.Bass]: { min: 38, max: 62 },
  [ClefTypeEnum.Alto]: { min: 48, max: 72 },
  [ClefTypeEnum.Treble]: { min: 59, max: 83 }
}

/** 按 midi 与当前难度约束筛选可用谱号 */
export function resolveSpawnClefsForMidi(midi: number): MidiBrickClef[] {
  const { allowedClefs } = getActiveNoteSliceDifficultyConfig()
  return allowedClefs.filter((clef) => {
    const range = NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES[clef]
    return midi >= range.min && midi <= range.max
  })
}

/** 当前难度下至少有一种可用谱号的 midi 是否在全局范围内 */
export function isNoteSliceMidiSpawnable(midi: number): boolean {
  return resolveSpawnClefsForMidi(midi).length > 0
}
