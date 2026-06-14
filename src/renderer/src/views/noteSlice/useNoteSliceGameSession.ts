import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { NoteSliceActiveBlock } from '@renderer/views/noteSlice/noteSliceBlockFactory'
import { applyNoteSliceClearScore } from '@renderer/views/noteSlice/noteSliceScoring'

export type NoteSliceGameSession = {
  score: Ref<number>
  combo: Ref<number>
  /** 为新生成的音符块分配递增批次（从 0 开始） */
  nextBatch: () => number
  /** 手动清除音符块时更新分数与连击 */
  onBlocksCleared: (blocks: readonly NoteSliceActiveBlock[]) => void
  /** 按下屏幕中不存在的 midi 时连击清零 */
  resetCombo: () => void
  /** 炸弹出现后禁止再生成该 midi，直到炸弹消失 */
  addBlacklistedMidi: (midi: number) => void
  /** 炸弹消失后解除该 midi 的生成限制 */
  removeBlacklistedMidi: (midi: number) => void
  getBlacklistedMidis: () => ReadonlySet<number>
}

const NOTE_SLICE_GAME_SESSION_KEY: InjectionKey<NoteSliceGameSession> =
  Symbol('noteSliceGameSession')

export function provideNoteSliceGameSession(): NoteSliceGameSession {
  const score = ref(0)
  const combo = ref(0)
  /** 上一次成功清除的音符块批次，用于连击判定 */
  let lastClearedBatch: number | null = null
  /** 下一个待分配音符块批次，进入页面从 0 递增 */
  let spawnBatch = 0
  /** 炸弹存活期间禁止生成的 midi */
  const blacklistedMidis = new Set<number>()

  function nextBatch(): number {
    return spawnBatch++
  }

  function onBlocksCleared(blocks: readonly NoteSliceActiveBlock[]): void {
    const next = applyNoteSliceClearScore(
      { score: score.value, combo: combo.value, lastClearedBatch },
      blocks.map((block) => ({ batch: block.batch, noteCount: block.noteCount }))
    )
    score.value = next.score
    combo.value = next.combo
    lastClearedBatch = next.lastClearedBatch
  }

  function resetCombo(): void {
    combo.value = 0
  }

  function addBlacklistedMidi(midi: number): void {
    blacklistedMidis.add(midi)
  }

  function removeBlacklistedMidi(midi: number): void {
    blacklistedMidis.delete(midi)
  }

  function getBlacklistedMidis(): ReadonlySet<number> {
    return blacklistedMidis
  }

  const session: NoteSliceGameSession = {
    score,
    combo,
    nextBatch,
    onBlocksCleared,
    resetCombo,
    addBlacklistedMidi,
    removeBlacklistedMidi,
    getBlacklistedMidis
  }

  provide(NOTE_SLICE_GAME_SESSION_KEY, session)
  return session
}

export function useNoteSliceGameSession(): NoteSliceGameSession {
  const session = inject(NOTE_SLICE_GAME_SESSION_KEY)
  if (!session) {
    throw new Error('useNoteSliceGameSession: 请在 NoteSliceGameView 中 provide session')
  }
  return session
}
