import { app } from 'electron'

/**
 * 云存档开关：
 * - 正式包默认开启
 * - 开发环境默认关闭，避免 .dev-data 覆盖 Steam 云上的正式档
 * - 设 STEAM_CLOUD_SAVE=1 可在开发环境手动开启
 */
export function isSteamCloudSaveEnabled(): boolean {
  const env = process.env.STEAM_CLOUD_SAVE
  if (env === '1') return true
  if (env === '0') return false
  return app.isPackaged
}
