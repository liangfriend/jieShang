import {
  AchievementProgressRepository,
  type AchievementUnlockPayload
} from '../repositories/achievementProgressRepository'
import {
  activateSteamAchievement,
  syncSteamAchievements
} from '../steam/steamAchievement'

export class AchievementProgressService {
  private achievementProgressRepository: AchievementProgressRepository

  constructor({ achievementProgressRepository }) {
    this.achievementProgressRepository = achievementProgressRepository
  }

  async listCompleted() {
    const data = await this.achievementProgressRepository.list()
    return { success: true, data }
  }

  async unlock(payload: AchievementUnlockPayload) {
    const existing = await this.achievementProgressRepository.findByKey(payload.key)
    const data = await this.achievementProgressRepository.unlock(payload)

    if (!existing) {
      activateSteamAchievement(payload.key)
    }

    return { success: true, data }
  }

  /** 启动时将本地已解锁成就同步到 Steam */
  async syncCompletedToSteam() {
    const rows = await this.achievementProgressRepository.list()
    syncSteamAchievements(rows.map((row) => row.key))
    return { success: true }
  }
}
