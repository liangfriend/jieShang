import fs from 'node:fs'
import path from 'node:path'
import { app } from 'electron'
import { electronEnableSteamOverlay, init as initSteamworks } from 'steamworks.js'
import type { Client } from 'steamworks.js'
import { getLogger } from '../utils/log'

const logger = getLogger('Steam')

let steamClient: Omit<Client, 'init' | 'runCallbacks'> | null = null

/** Overlay 须在创建窗口前启用（追加 Chromium 启动参数） */
export function enableSteamOverlay(): void {
  try {
    electronEnableSteamOverlay()
    logger.info('Steam Overlay 已启用')
  } catch (error) {
    logger.warn('Steam Overlay 启用失败', error)
  }
}

function readSteamAppIdFromFile(): number | undefined {
  const candidates = [
    path.join(process.cwd(), 'steam_appid.txt'),
    path.join(app.getAppPath(), 'steam_appid.txt'),
    path.join(app.getAppPath(), '..', 'steam_appid.txt')
  ]

  for (const filePath of candidates) {
    if (!fs.existsSync(filePath)) continue
    const raw = fs.readFileSync(filePath, 'utf8').trim()
    const appId = Number.parseInt(raw, 10)
    if (Number.isFinite(appId)) {
      logger.info(`从 ${filePath} 读取 App ID: ${appId}`)
      return appId
    }
  }

  return undefined
}

/** 初始化 Steamworks；失败时返回 null，不阻断应用启动 */
export function initSteam(): Omit<Client, 'init' | 'runCallbacks'> | null {
  if (steamClient) return steamClient

  const appId = readSteamAppIdFromFile()

  try {
    steamClient = initSteamworks(appId)
    const { localplayer, utils } = steamClient
    const steamId = localplayer.getSteamId()
    const name = localplayer.getName()
    const activeAppId = utils.getAppId()

    logger.info(
      `Steam 已连接 | 玩家: ${name} | SteamID64: ${steamId.steamId64.toString()} | AppID: ${activeAppId}`
    )
    return steamClient
  } catch (error) {
    logger.warn(
      'Steam 初始化失败（请确认 Steam 客户端已登录，且 steam_appid.txt / 账号拥有该 App 测试权限）',
      error
    )
    steamClient = null
    return null
  }
}

export function getSteamClient(): typeof steamClient {
  return steamClient
}
