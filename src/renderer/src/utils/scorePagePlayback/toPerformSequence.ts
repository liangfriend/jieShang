import type { PlaySequence } from 'deciphony-player'
import { ca } from 'element-plus/es/locale/index.mjs'

/** pianoWaterfall.performSequence：midi → [开始毫秒, 结束毫秒, 附加信息?][] */
export type PerformSequence = Record<string, [number, number, any?][]>

/** Unit256：256=全音符，64=四分音符 */
const UNIT256_QUARTER = 64

/** playTime / duration（Unit256）→ 毫秒 */
export function unit256ToMs(unit: number, bpm: number): number {
  return (unit * 60_000) / (UNIT256_QUARTER * bpm)
}

/** NPlayer 播放序列 → 瀑布流 performSequence（毫秒） */
export function toPerformSequence(playSequence: PlaySequence, bpm: number): PerformSequence {
  console.log("chicken")
  const result: PerformSequence = {}

  for (const item of playSequence) {
    if (item.midi <= 0 || item.duration <= 0) continue

    const startMs = unit256ToMs(item.playTime, bpm)
    const endMs = unit256ToMs(item.playTime + item.duration, bpm)
    const key = String(item.midi)

    if (!result[key]) result[key] = []
    result[key]!.push([startMs, endMs, item.id])
  }

  for (const segments of Object.values(result)) {
    segments.sort((a, b) => a[0] - b[0])
  }

  return result
}
