import { ipcMain } from 'electron'
import { AchievementProgressService } from '../services/achievementProgressService'

export class AchievementProgressController {
  private achievementProgressService: AchievementProgressService

  constructor({ achievementProgressService }) {
    this.achievementProgressService = achievementProgressService
  }

  register() {
    ipcMain.handle('achievement:list', () => this.achievementProgressService.listCompleted())
    ipcMain.handle('achievement:unlock', (_, payload) =>
      this.achievementProgressService.unlock(payload)
    )
  }
}
