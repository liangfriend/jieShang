import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition
} from '@renderer/constant/achievements'
import {
  fetchCompletedAchievements,
  grantAchievementCollectionReward,
  unlockAchievement
} from '@renderer/utils/achievementHelper'
import type { NoteSliceGameMode } from '@renderer/views/noteSlice/noteSliceGameMode'

/** 单局结束时用于成就判定的快照 */
export type NoteSliceSessionAchievementSnapshot = {
  mode: NoteSliceGameMode
  /** 街机 / 无限本局得分 */
  score: number
  /** 极限模式本局存活时间（ms） */
  survivalMs: number
  /** 本局曾达到的最高连击 */
  peakCombo: number
}

export function isNoteSliceAchievementMet(
  definition: AchievementDefinition,
  snapshot: NoteSliceSessionAchievementSnapshot
): boolean {
  const { criteria } = definition

  switch (criteria.type) {
    case 'note_slice_arcade_score':
      return snapshot.mode === 'arcade' && snapshot.score >= criteria.minScore
    case 'note_slice_endless_score':
      return snapshot.mode === 'endless' && snapshot.score >= criteria.minScore
    case 'note_slice_combo':
      return snapshot.peakCombo >= criteria.minCombo
    case 'note_slice_extreme_survival':
      return snapshot.mode === 'extreme' && snapshot.survivalMs >= criteria.minSurvivalMs
    default:
      return false
  }
}

/** 遍历常量中全部成就，返回本局满足条件且尚未解锁的成就 */
export function listNoteSliceAchievementsToUnlock(
  snapshot: NoteSliceSessionAchievementSnapshot,
  ownedKeys: ReadonlySet<string>
): AchievementDefinition[] {
  const definitions: AchievementDefinition[] = []

  for (const definition of ACHIEVEMENT_DEFINITIONS) {
    if (ownedKeys.has(definition.key)) continue
    if (!isNoteSliceAchievementMet(definition, snapshot)) continue
    definitions.push(definition)
  }

  return definitions
}

export type NoteSliceSessionAchievementManager = {
  /** 连击变化时调用，仅记录峰值 */
  recordCombo: (combo: number) => void
  /** 游戏结束时调用：查库、解锁全部可触发成就、返回本局新解锁列表 */
  evaluateAndUnlock: (params: {
    score: number
    survivalMs: number
  }) => Promise<AchievementDefinition[]>
}

export function createNoteSliceSessionAchievementManager(
  mode: NoteSliceGameMode
): NoteSliceSessionAchievementManager {
  let peakCombo = 0

  function recordCombo(combo: number): void {
    if (combo > peakCombo) {
      peakCombo = combo
    }
  }

  async function evaluateAndUnlock(params: {
    score: number
    survivalMs: number
  }): Promise<AchievementDefinition[]> {
    const snapshot: NoteSliceSessionAchievementSnapshot = {
      mode,
      score: params.score,
      survivalMs: params.survivalMs,
      peakCombo
    }

    const completedRecords = await fetchCompletedAchievements()
    const ownedKeys = new Set(completedRecords.map((record) => record.key))
    const definitionsToUnlock = listNoteSliceAchievementsToUnlock(snapshot, ownedKeys)

    const newlyUnlocked: AchievementDefinition[] = []

    for (const definition of definitionsToUnlock) {
      await unlockAchievement(definition.key)
      await grantAchievementCollectionReward(definition)
      newlyUnlocked.push(definition)
    }

    return newlyUnlocked
  }

  return {
    recordCombo,
    evaluateAndUnlock
  }
}
