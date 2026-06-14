import {
  AchievementProgressRepository,
  type AchievementUnlockPayload
} from '../repositories/achievementProgressRepository'

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
    const data = await this.achievementProgressRepository.unlock(payload)
    return { success: true, data }
  }
}
