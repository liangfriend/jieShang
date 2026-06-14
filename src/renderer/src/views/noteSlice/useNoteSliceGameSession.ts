import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { NoteSliceActiveBlock } from '@renderer/views/noteSlice/noteSliceBlockFactory'
import {
  NOTE_SLICE_ARCADE_BOMB_PENALTY,
  NOTE_SLICE_ARCADE_DURATION_SECONDS,
  NOTE_SLICE_ENDLESS_LIVES,
  type NoteSliceGameEndReason,
  type NoteSliceGameMode
} from '@renderer/views/noteSlice/noteSliceGameMode'
import { applyNoteSliceClearScore } from '@renderer/views/noteSlice/noteSliceScoring'

export type NoteSliceGameSession = {
  mode: NoteSliceGameMode
  score: Ref<number>
  combo: Ref<number>
  /** 街机模式剩余时间（ms）；无限模式恒为 0 */
  timeRemainingMs: Ref<number>
  /** 无限模式剩余生命；街机模式恒为 0 */
  lives: Ref<number>
  /** 倒计时结束后为 true，游戏结束为 false */
  isRunning: Ref<boolean>
  isGameOver: Ref<boolean>
  gameEndReason: Ref<NoteSliceGameEndReason | null>
  /** 倒计时结束后调用，开始计时 / 启用输入 */
  startGame: () => void
  /** 为新生成的音符块分配递增批次（从 0 开始） */
  nextBatch: () => number
  /** 手动清除音符块时更新分数与连击 */
  onBlocksCleared: (blocks: readonly NoteSliceActiveBlock[]) => void
  /** 切中炸弹：街机扣分 / 无限扣命，必要时结束游戏 */
  onBombCleared: () => void
  /** 每帧更新模式状态（街机倒计时等） */
  tickModeState: (deltaMs: number) => void
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

export function provideNoteSliceGameSession(mode: NoteSliceGameMode): NoteSliceGameSession {
  const score = ref(0)
  const combo = ref(0)
  const timeRemainingMs = ref(mode === 'arcade' ? NOTE_SLICE_ARCADE_DURATION_SECONDS * 1000 : 0)
  const lives = ref(mode === 'endless' ? NOTE_SLICE_ENDLESS_LIVES : 0)
  const isRunning = ref(false)
  const isGameOver = ref(false)
  const gameEndReason = ref<NoteSliceGameEndReason | null>(null)
  /** 上一次成功清除的音符块批次，用于连击判定 */
  let lastClearedBatch: number | null = null
  /** 下一个待分配音符块批次，进入页面从 0 递增 */
  let spawnBatch = 0
  /** 炸弹存活期间禁止生成的 midi */
  const blacklistedMidis = new Set<number>()

  function endGame(reason: NoteSliceGameEndReason): void {
    if (isGameOver.value) return
    isRunning.value = false
    isGameOver.value = true
    gameEndReason.value = reason
  }

  function startGame(): void {
    isRunning.value = true
    isGameOver.value = false
    gameEndReason.value = null
  }

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

  function onBombCleared(): void {
    if (!isRunning.value || isGameOver.value) return

    if (mode === 'arcade') {
      score.value = Math.max(0, score.value - NOTE_SLICE_ARCADE_BOMB_PENALTY)
      return
    }

    lives.value = Math.max(0, lives.value - 1)
    if (lives.value <= 0) {
      endGame('no_lives')
    }
  }

  function tickModeState(deltaMs: number): void {
    if (!isRunning.value || isGameOver.value || mode !== 'arcade') return

    timeRemainingMs.value = Math.max(0, timeRemainingMs.value - deltaMs)
    if (timeRemainingMs.value <= 0) {
      endGame('time_up')
    }
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
    mode,
    score,
    combo,
    timeRemainingMs,
    lives,
    isRunning,
    isGameOver,
    gameEndReason,
    startGame,
    nextBatch,
    onBlocksCleared,
    onBombCleared,
    tickModeState,
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
