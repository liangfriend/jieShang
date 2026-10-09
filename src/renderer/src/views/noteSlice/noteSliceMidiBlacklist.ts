import { getActiveNoteSliceDifficultyConfig } from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import { resolveSpawnClefsForMidi } from '@renderer/views/noteSlice/noteSliceSpawnClefs'
import { resolveJianpuKeyCandidatesForMidi } from '@renderer/views/noteSlice/jianpuBrickBuilder'
import { isNoteSliceJianpuMode } from '@renderer/views/noteSlice/noteSliceNotationMode'

export function resolveNoteSliceSpawnMidiRange(): { min: number; max: number } {
  const { midiMin, midiMax } = getActiveNoteSliceDifficultyConfig()
  return { min: midiMin, max: midiMax }
}

/**
 * 当前谱面模式下该 midi 是否可生成音符块：
 * - 线谱：至少有一种可用谱号（受 NOTE_SLICE_SPAWN_CLEF_MIDI_RANGES 约束）
 * - 简谱：不看谱号；至少有一个候选调号可写（禁用变音时需为该调自然音级）
 */
export function isNoteSliceMidiRenderable(midi: number): boolean {
  if (isNoteSliceJianpuMode()) {
    const { allowedKeySignatures, allowSingleAccidentals } = getActiveNoteSliceDifficultyConfig()
    return (
      resolveJianpuKeyCandidatesForMidi(midi, allowedKeySignatures, allowSingleAccidentals).length > 0
    )
  }
  return resolveSpawnClefsForMidi(midi).length > 0
}

/** 当前 spawn 范围内、且不在黑名单中、且当前谱面模式可渲染的 midi 列表 */
export function listNoteSliceSpawnableMidis(excludedMidis: ReadonlySet<number>): number[] {
  const { min, max } = resolveNoteSliceSpawnMidiRange()
  const candidates: number[] = []
  for (let midi = min; midi <= max; midi++) {
    if (excludedMidis.has(midi)) continue
    if (!isNoteSliceMidiRenderable(midi)) continue
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
