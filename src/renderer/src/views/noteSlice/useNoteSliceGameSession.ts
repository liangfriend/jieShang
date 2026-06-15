import { inject, provide, ref, type InjectionKey, type Ref } from 'vue'
import type { NoteSliceActiveBlock } from '@renderer/views/noteSlice/noteSliceBlockFactory'
import {
  NOTE_SLICE_ARCADE_BOMB_PENALTY,
  NOTE_SLICE_ARCADE_DURATION_SECONDS,
  NOTE_SLICE_ENDLESS_LIVES,
  NOTE_SLICE_EXTREME_LIVES,
  type NoteSliceGameEndReason,
  type NoteSliceGameMode
} from '@renderer/views/noteSlice/noteSliceGameMode'
import { applyNoteSliceClearScore } from '@renderer/views/noteSlice/noteSliceScoring'
import { NOTE_SLICE_BUFF_DURATION_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

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
  /** 开局后经过的时间（ms），由 GameLayer tick 写入 */
  passTimeMs: Ref<number>
  /** 极限模式结束时锁定的存活时间（ms），用于结算展示 */
  finalSurvivalMs: Ref<number>
  isGameOver: Ref<boolean>
  gameEndReason: Ref<NoteSliceGameEndReason | null>
  /** 倒计时结束后调用，开始计时 / 启用输入 */
  startGame: () => void
  /** 为新生成的音符块分配递增批次（从 0 开始） */
  nextBatch: () => number
  /** 手动清除音符块时更新分数与连击 */
  onBlocksCleared: (blocks: readonly NoteSliceActiveBlock[]) => void
  /** 切中炸弹：街机扣分 / 无限·极限扣命，必要时结束游戏 */
  onBombCleared: () => void
  /** 切中治疗块：极限模式恢复 1 条命 */
  onHealCleared: () => void
  /** 极限模式：漏音或乱按扣命 */
  onMissedBlocks: (missedCount: number) => void
  /** 冰冻增益：音符块 solidMs / fadeMs ×2 */
  isFrozen: Ref<boolean>
  /** 加倍增益：得分 ×2 */
  isDoubleScore: Ref<boolean>
  /** 切中冰冻块：激活 10s 冰冻增益 */
  onFreezeCleared: () => void
  /** 切中加倍块：激活 10s 得分加倍 */
  onDoubleCleared: () => void
  /** 每帧更新增益剩余时间 */
  tickBuffState: (deltaMs: number) => void
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
  const lives = ref(
    mode === 'endless'
      ? NOTE_SLICE_ENDLESS_LIVES
      : mode === 'extreme'
        ? NOTE_SLICE_EXTREME_LIVES
        : 0
  )
  const isRunning = ref(false)
  const passTimeMs = ref(0)
  const finalSurvivalMs = ref(0)
  const isGameOver = ref(false)
  const gameEndReason = ref<NoteSliceGameEndReason | null>(null)
  const isFrozen = ref(false)
  const isDoubleScore = ref(false)
  let freezeRemainingMs = 0
  let doubleRemainingMs = 0
  /** 上一次成功清除的音符块批次，用于连击判定 */
  let lastClearedBatch: number | null = null
  /** 下一个待分配音符块批次，进入页面从 0 递增 */
  let spawnBatch = 0
  /** 炸弹存活期间禁止生成的 midi */
  const blacklistedMidis = new Set<number>()

  function endGame(reason: NoteSliceGameEndReason): void {
    if (isGameOver.value) return
    if (mode === 'extreme') {
      finalSurvivalMs.value = passTimeMs.value
    }
    isRunning.value = false
    isGameOver.value = true
    gameEndReason.value = reason
  }

  function startGame(): void {
    isRunning.value = true
    passTimeMs.value = 0
    finalSurvivalMs.value = 0
    isGameOver.value = false
    gameEndReason.value = null
    isFrozen.value = false
    isDoubleScore.value = false
    freezeRemainingMs = 0
    doubleRemainingMs = 0
  }

  function nextBatch(): number {
    return spawnBatch++
  }

  function onBlocksCleared(blocks: readonly NoteSliceActiveBlock[]): void {
    if (mode === 'extreme') return

    const next = applyNoteSliceClearScore(
      { score: score.value, combo: combo.value, lastClearedBatch },
      blocks.map((block) => ({ batch: block.batch, noteCount: block.noteCount })),
      isDoubleScore.value ? 2 : 1
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

  function onHealCleared(): void {
    if (!isRunning.value || isGameOver.value || mode !== 'extreme') return
    lives.value = Math.min(NOTE_SLICE_EXTREME_LIVES, lives.value + 1)
  }

  function onMissedBlocks(missedCount: number): void {
    if (!isRunning.value || isGameOver.value || mode !== 'extreme' || missedCount <= 0) return

    lives.value = Math.max(0, lives.value - missedCount)
    if (lives.value <= 0) {
      endGame('no_lives')
    }
  }

  function activateFreezeBuff(): void {
    if (mode === 'extreme') return
    freezeRemainingMs = NOTE_SLICE_BUFF_DURATION_MS
    isFrozen.value = true
  }

  function activateDoubleBuff(): void {
    if (mode === 'extreme') return
    doubleRemainingMs = NOTE_SLICE_BUFF_DURATION_MS
    isDoubleScore.value = true
  }

  function onFreezeCleared(): void {
    if (!isRunning.value || isGameOver.value) return
    activateFreezeBuff()
  }

  function onDoubleCleared(): void {
    if (!isRunning.value || isGameOver.value) return
    activateDoubleBuff()
  }

  function tickBuffState(deltaMs: number): void {
    if (!isRunning.value || isGameOver.value || mode === 'extreme') return

    if (freezeRemainingMs > 0) {
      freezeRemainingMs = Math.max(0, freezeRemainingMs - deltaMs)
      if (freezeRemainingMs <= 0) {
        isFrozen.value = false
      }
    }

    if (doubleRemainingMs > 0) {
      doubleRemainingMs = Math.max(0, doubleRemainingMs - deltaMs)
      if (doubleRemainingMs <= 0) {
        isDoubleScore.value = false
      }
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
    passTimeMs,
    finalSurvivalMs,
    isGameOver,
    gameEndReason,
    startGame,
    nextBatch,
    onBlocksCleared,
    onBombCleared,
    onHealCleared,
    onMissedBlocks,
    isFrozen,
    isDoubleScore,
    onFreezeCleared,
    onDoubleCleared,
    tickBuffState,
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
