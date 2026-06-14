import { ipcRenderer } from 'electron'

export type AchievementUnlockPayload = {
  key: string
  completed_at?: string
}

export type AchievementProgressRecord = {
  id: number
  key: string
  completed_at: string
}

export const achievementInvoke = {
  list: () => ipcRenderer.invoke('achievement:list'),
  unlock: (payload: AchievementUnlockPayload) => ipcRenderer.invoke('achievement:unlock', payload)
}
