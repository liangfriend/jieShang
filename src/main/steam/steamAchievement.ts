import { getLogger } from '../utils/log'
import { getSteamClient } from './initSteam'

const logger = getLogger('SteamAchievement')

/** 向 Steam 解锁单个成就（key 与 Steamworks 后台 API 名称一致） */
export function activateSteamAchievement(key: string): boolean {
  const client = getSteamClient()
  if (!client) return false

  try {
    if (client.achievement.isActivated(key)) return true

    const ok = client.achievement.activate(key)
    if (ok) {
      logger.info(`Steam 成就已解锁: ${key}`)
    } else {
      logger.warn(`Steam 成就解锁失败: ${key}`)
    }
    return ok
  } catch (error) {
    logger.warn(`Steam 成就解锁异常: ${key}`, error)
    return false
  }
}

/** 将本地已解锁成就补同步到 Steam（启动时调用） */
export function syncSteamAchievements(keys: readonly string[]): void {
  const client = getSteamClient()
  if (!client || keys.length === 0) return

  let synced = 0

  for (const key of keys) {
    try {
      if (client.achievement.isActivated(key)) continue
      if (client.achievement.activate(key)) {
        synced += 1
        logger.info(`Steam 成就已补同步: ${key}`)
      } else {
        logger.warn(`Steam 成就补同步失败: ${key}`)
      }
    } catch (error) {
      logger.warn(`Steam 成就补同步异常: ${key}`, error)
    }
  }

  if (synced > 0) {
    logger.info(`Steam 成就补同步完成，新增 ${synced} 项`)
  }
}
