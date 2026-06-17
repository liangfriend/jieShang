import {
  ACHIEVEMENT_DEFINITIONS,
  type AchievementDefinition
} from '@renderer/constant/achievements'

export type AchievementProgressRecord = {
  id: number
  key: string
  completed_at: string
}

export type AchievementListItem = AchievementDefinition & {
  completed: boolean
  completedAt: string | null
}

function parseAchievementProgressList(res: unknown): AchievementProgressRecord[] {
  if (!res || typeof res !== 'object') return []
  const payload = res as { success?: boolean; data?: unknown }
  if (!payload.success || !Array.isArray(payload.data)) return []
  return payload.data as AchievementProgressRecord[]
}

export async function fetchCompletedAchievements(): Promise<AchievementProgressRecord[]> {
  const res = await window.api.achievement.list()
  return parseAchievementProgressList(res)
}

export function mergeAchievementDefinitions(
  completedRecords: readonly AchievementProgressRecord[]
): AchievementListItem[] {
  const completedMap = new Map(
    completedRecords.map((record) => [record.key, record.completed_at] as const)
  )

  return ACHIEVEMENT_DEFINITIONS.map((definition) => {
    const completedAt = completedMap.get(definition.key) ?? null
    return {
      ...definition,
      completed: completedAt !== null,
      completedAt
    }
  })
}

export async function loadAchievementListItems(): Promise<AchievementListItem[]> {
  const completedRecords = await fetchCompletedAchievements()
  return mergeAchievementDefinitions(completedRecords)
}

export function formatAchievementCompletedAt(iso: string | null): string {
  if (!iso) return ''
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export async function unlockAchievement(key: string): Promise<void> {
  await window.api.achievement.unlock({ key })
}

/** 将内置藏品标记为已拥有（幂等） */
export async function grantCollectionOwnership(collectionId: number): Promise<void> {
  const res = await window.api.collection.update(collectionId, { owned: true })
  if (!res?.success) {
    throw new Error(`grantCollectionOwnership failed: id=${collectionId}`)
  }
}

/** 发放成就关联的藏品奖励 */
export async function grantAchievementCollectionReward(
  definition: AchievementDefinition
): Promise<void> {
  const collectionId = definition.rewardCollectionId
  if (collectionId == null) return
  await grantCollectionOwnership(collectionId)
}
