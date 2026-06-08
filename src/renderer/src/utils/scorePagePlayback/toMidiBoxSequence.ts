import type { PlaySequence } from 'deciphony-player'

/** midi → [批次索引, 附加信息][] */
export type MidiBoxSequence = Record<string, [number, any?][]>

/**
 * NPlayer 播放序列 → 新手模式 midi 块序列（按同时发声分组为批次索引）
 * 同一 playTime 的音符共享同一批次索引。
 */
export function toMidiBoxSequence(playSequence: PlaySequence): MidiBoxSequence {
  const sorted = [...playSequence]
    .filter((item) => item.midi > 0 && item.duration > 0)
    .sort((a, b) => a.playTime - b.playTime || a.midi - b.midi)

  const result: MidiBoxSequence = {}
  let batchIndex = -1
  let lastPlayTime = -1

  for (const item of sorted) {
    if (item.playTime !== lastPlayTime) {
      batchIndex += 1
      lastPlayTime = item.playTime
    }
    const key = String(item.midi)
    if (!result[key]) result[key] = []
    result[key].push([batchIndex, item.id])
  }

  return result
}
