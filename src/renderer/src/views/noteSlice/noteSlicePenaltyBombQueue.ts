/**
 * 乱按惩罚炸弹队列（FIFO）。
 * MIDI 输入线程只入队；在 tick 开头统一出队生成，避免与随机 spawn 抢时序。
 */

/** 创建惩罚炸弹 midi 队列 */
export function createNoteSlicePenaltyBombQueue(): {
  enqueue: (midi: number) => void
  drain: () => number[]
  peekAll: () => readonly number[]
} {
  const pendingMidis: number[] = []

  function enqueue(midi: number): void {
    if (pendingMidis.includes(midi)) return
    pendingMidis.push(midi)
  }

  function drain(): number[] {
    if (pendingMidis.length === 0) return []
    return pendingMidis.splice(0, pendingMidis.length)
  }

  function peekAll(): readonly number[] {
    return pendingMidis
  }

  return { enqueue, drain, peekAll }
}
