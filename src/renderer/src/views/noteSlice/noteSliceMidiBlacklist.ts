import { getActiveNoteSliceDifficultyConfig } from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import { resolveSpawnClefsForMidi } from '@renderer/views/noteSlice/noteSliceSpawnClefs'

export function resolveNoteSliceSpawnMidiRange(): { min: number; max: number } {
  const { midiMin, midiMax } = getActiveNoteSliceDifficultyConfig()
  return { min: midiMin, max: midiMax }
}

/** 当前 spawn 范围内、且不在黑名单中、且至少有一种可用谱号的 midi 列表 */
export function listNoteSliceSpawnableMidis(excludedMidis: ReadonlySet<number>): number[] {
  const { min, max } = resolveNoteSliceSpawnMidiRange()
  const candidates: number[] = []
  for (let midi = min; midi <= max; midi++) {
    if (excludedMidis.has(midi)) continue
    if (resolveSpawnClefsForMidi(midi).length === 0) continue
    candidates.push(midi)
  }
  return candidates
}

/** 随机选一个未被排除的 spawn midi；无可用则返回 null */
export function randomNoteSliceSpawnMidiExcluding(
  excludedMidis: ReadonlySet<number>,
  random: () => number = Math.random
): number | null {
  const candidates = listNoteSliceSpawnableMidis(excludedMidis)
  if (candidates.length === 0) return null
  return candidates[Math.floor(random() * candidates.length)] ?? null
}
