/** 连击达到该次数后在 HUD 显示 */
export const NOTE_SLICE_COMBO_DISPLAY_MIN = 3

/** 连击得分倍率上限（十连击及以后） */
export const NOTE_SLICE_COMBO_MULTIPLIER_CAP = 256

export type NoteSliceScoreState = {
  score: number
  combo: number
  /** 上一次清除的音符块批次 */
  lastClearedBatch: number | null
}

export type NoteSliceClearedBlockScoreInput = {
  /** 音符块生成批次，用于连击判定 */
  batch: number
  /** 块上音符数量（当前无和弦，恒为 1） */
  noteCount: number
}

/** 第三个连击 *2，第四个 *4 … 第十个及以后 *256 */
export function resolveNoteSliceComboMultiplier(combo: number): number {
  if (combo < NOTE_SLICE_COMBO_DISPLAY_MIN) return 1
  return Math.min(2 ** (combo - 2), NOTE_SLICE_COMBO_MULTIPLIER_CAP)
}

/**
 * 连击判定：先算「连击所需批次」= lastClearedBatch + 1。
 * - 参与清除的块里含有该批次 → combo +1，lastClearedBatch 记为该批次
 * - 否则 combo 归零；若多个批次参与评分则取最大批次，单个则取该批次
 */
export function resolveNoteSliceClearComboState(
  state: Pick<NoteSliceScoreState, 'combo' | 'lastClearedBatch'>,
  clearedBlocks: readonly NoteSliceClearedBlockScoreInput[]
): Pick<NoteSliceScoreState, 'combo' | 'lastClearedBatch'> {
  const batches = clearedBlocks.map((block) => block.batch)
  const comboRequiredBatch =
    state.lastClearedBatch !== null ? state.lastClearedBatch + 1 : null

  if (comboRequiredBatch !== null && batches.includes(comboRequiredBatch)) {
    return {
      combo: state.combo + 1,
      lastClearedBatch: comboRequiredBatch
    }
  }

  const lastClearedBatch =
    batches.length === 1 ? batches[0]! : Math.max(...batches)

  return {
    combo: 0,
    lastClearedBatch
  }
}

/** 根据清除的音符块更新分数与连击；scoreMultiplier 为加倍增益等额外倍率 */
export function applyNoteSliceClearScore(
  state: NoteSliceScoreState,
  clearedBlocks: readonly NoteSliceClearedBlockScoreInput[],
  scoreMultiplier = 1
): NoteSliceScoreState {
  if (clearedBlocks.length === 0) return state

  const basePoints = clearedBlocks.reduce((sum, block) => sum + block.noteCount, 0)
  const { combo, lastClearedBatch } = resolveNoteSliceClearComboState(state, clearedBlocks)
  const multiplier = resolveNoteSliceComboMultiplier(combo)
  const extraMultiplier = Math.max(1, scoreMultiplier)

  return {
    score: state.score + basePoints * multiplier * extraMultiplier,
    combo,
    lastClearedBatch
  }
}
