import type { PlaySequence } from '@deciphony/player'

/** pianoWaterfall.performSequence：midi → [开始毫秒, 结束毫秒, 附加信息?][] */
export type PerformSequence = Record<string, [number, number, any?][]>

/**
 * Unit256 时值 → 毫秒。
 * beatUnit：几分音符为一拍（拍号分母）；默认 4=四分音符。
 * 公式与 NPlayer/MPlayer toSeconds 一致：(unit * beatUnit * 60000) / (256 * bpm)
 */
export function unit256ToMs(unit: number, bpm: number, beatUnit = 4): number {
  const bu = beatUnit > 0 ? beatUnit : 4
  return (unit * bu * 60_000) / (256 * bpm)
}

/** NPlayer 播放序列 → 瀑布流 performSequence（毫秒） */
export function toPerformSequence(
  playSequence: PlaySequence,
  bpm: number,
  beatUnit = 4
): PerformSequence {
  const result: PerformSequence = {}

  for (const item of playSequence) {
    if (item.midi <= 0 || item.duration <= 0) continue

    const startMs = unit256ToMs(item.playTime, bpm, beatUnit)
    const endMs = unit256ToMs(item.playTime + item.duration, bpm, beatUnit)
    const key = String(item.midi)

    if (!result[key]) result[key] = []
    result[key]!.push([startMs, endMs, item.id])
  }

  for (const segments of Object.values(result)) {
    segments.sort((a, b) => a[0] - b[0])
  }

  return result
}
