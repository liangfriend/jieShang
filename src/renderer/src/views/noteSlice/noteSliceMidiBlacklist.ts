import {
  NOTE_SLICE_SPAWN_MIDI_MAX,
  NOTE_SLICE_SPAWN_MIDI_MIN,
  NOTE_SLICE_TEST_MODE,
  NOTE_SLICE_TEST_SPAWN_MIDI_MAX,
  NOTE_SLICE_TEST_SPAWN_MIDI_MIN
} from '@renderer/views/noteSlice/noteSliceGameConstants'

export function resolveNoteSliceSpawnMidiRange(): { min: number; max: number } {
  if (NOTE_SLICE_TEST_MODE) {
    return {
      min: NOTE_SLICE_TEST_SPAWN_MIDI_MIN,
      max: NOTE_SLICE_TEST_SPAWN_MIDI_MAX
    }
  }
  return {
    min: NOTE_SLICE_SPAWN_MIDI_MIN,
    max: NOTE_SLICE_SPAWN_MIDI_MAX
  }
}

/** 当前 spawn 范围内、且不在黑名单中的 midi 列表 */
export function listNoteSliceSpawnableMidis(excludedMidis: ReadonlySet<number>): number[] {
  const { min, max } = resolveNoteSliceSpawnMidiRange()
  const candidates: number[] = []
  for (let midi = min; midi <= max; midi++) {
    if (!excludedMidis.has(midi)) {
      candidates.push(midi)
    }
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
