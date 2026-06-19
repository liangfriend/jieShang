import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import type { Sequelize } from 'sequelize'
import pathManager from '../utils/pathManager'
import { getLogger } from '../utils/log'
import { getSteamClient } from './initSteam'
import { isSteamCloudSaveEnabled } from './steamCloudConfig'

const logger = getLogger('SteamCloud')

export const CLOUD_MANIFEST_FILE = 'jie-shang-cloud-manifest.json'
export const CLOUD_DB_FILE = 'jie-shang-cloud-app-db.b64'
export const CLOUD_SAVE_SCHEMA_VERSION = 1

export type CloudSaveManifest = {
  schemaVersion: number
  revision: number
  updatedAt: string
  dbSize: number
  dbSha256: string
}

function getLocalManifestPath(): string {
  return path.join(path.dirname(pathManager.getConfigPath()), 'cloud-save-manifest.json')
}

function sha256Buffer(buffer: Buffer): string {
  return crypto.createHash('sha256').update(buffer).digest('hex')
}

function sha256File(filePath: string): string {
  return sha256Buffer(fs.readFileSync(filePath))
}

function readLocalManifest(): CloudSaveManifest | null {
  const manifestPath = getLocalManifestPath()
  if (!fs.existsSync(manifestPath)) return null

  try {
    const parsed = JSON.parse(fs.readFileSync(manifestPath, 'utf8')) as CloudSaveManifest
    if (parsed.schemaVersion !== CLOUD_SAVE_SCHEMA_VERSION) return null
    return parsed
  } catch (error) {
    logger.warn('读取本地云存档 manifest 失败', error)
    return null
  }
}

function writeLocalManifest(manifest: CloudSaveManifest): void {
  fs.writeFileSync(getLocalManifestPath(), JSON.stringify(manifest, null, 2), 'utf8')
}

function buildManifestFromDb(dbPath: string, revision: number): CloudSaveManifest {
  const stat = fs.statSync(dbPath)
  return {
    schemaVersion: CLOUD_SAVE_SCHEMA_VERSION,
    revision,
    updatedAt: new Date().toISOString(),
    dbSize: stat.size,
    dbSha256: sha256File(dbPath)
  }
}

function readCloudManifest(): CloudSaveManifest | null {
  const client = getSteamClient()
  if (!client?.cloud.fileExists(CLOUD_MANIFEST_FILE)) return null

  try {
    const parsed = JSON.parse(client.cloud.readFile(CLOUD_MANIFEST_FILE)) as CloudSaveManifest
    if (parsed.schemaVersion !== CLOUD_SAVE_SCHEMA_VERSION) {
      logger.warn('云端 manifest 版本不兼容，跳过')
      return null
    }
    return parsed
  } catch (error) {
    logger.warn('读取云端 manifest 失败', error)
    return null
  }
}

function isCloudAvailable(): boolean {
  const client = getSteamClient()
  if (!client) return false
  return client.cloud.isEnabledForAccount() && client.cloud.isEnabledForApp()
}

function isRemoteNewer(remote: CloudSaveManifest, local: CloudSaveManifest | null): boolean {
  if (!local) return true
  if (remote.revision !== local.revision) return remote.revision > local.revision
  return remote.updatedAt > local.updatedAt
}

function writeDatabaseAtomically(dbPath: string, buffer: Buffer): void {
  const dbDir = path.dirname(dbPath)
  if (!fs.existsSync(dbDir)) fs.mkdirSync(dbDir, { recursive: true })

  const tempPath = `${dbPath}.cloud-download`
  fs.writeFileSync(tempPath, buffer)
  fs.renameSync(tempPath, dbPath)
}

/** 启动时比对 manifest，仅在云端更新时下载 app.db */
export async function pullCloudSaveIfNeeded(): Promise<void> {
  if (!isSteamCloudSaveEnabled()) {
    logger.info('Steam 云存档未启用，跳过拉取')
    return
  }

  if (!isCloudAvailable()) {
    logger.info('Steam 云存档不可用，跳过拉取')
    return
  }

  const remoteManifest = readCloudManifest()
  if (!remoteManifest) {
    logger.info('云端无存档，跳过拉取')
    return
  }

  const localManifest = readLocalManifest()
  if (!isRemoteNewer(remoteManifest, localManifest)) {
    logger.info('本地存档已是最新，跳过云存档下载')
    return
  }

  const client = getSteamClient()
  if (!client?.cloud.fileExists(CLOUD_DB_FILE)) {
    logger.warn('云端 manifest 存在但缺少数据库文件')
    return
  }

  try {
    logger.info(`正在从 Steam 云拉取存档 (revision ${remoteManifest.revision})…`)
    const dbBuffer = Buffer.from(client.cloud.readFile(CLOUD_DB_FILE), 'base64')

    if (sha256Buffer(dbBuffer) !== remoteManifest.dbSha256) {
      logger.warn('云端数据库校验失败，放弃拉取')
      return
    }

    writeDatabaseAtomically(pathManager.getDatabasePath(), dbBuffer)
    writeLocalManifest(remoteManifest)
    logger.info('Steam 云存档拉取完成')
  } catch (error) {
    logger.warn('Steam 云存档拉取失败', error)
  }
}

/** 退出时上传 app.db（仅在有变更且云端较旧时） */
export async function pushCloudSave(sequelize?: Sequelize): Promise<void> {
  if (!isSteamCloudSaveEnabled()) return
  if (!isCloudAvailable()) return

  const dbPath = pathManager.getDatabasePath()
  if (!fs.existsSync(dbPath)) return

  const client = getSteamClient()
  if (!client) return

  try {
    if (sequelize) {
      await sequelize.close()
    }

    const currentSha = sha256File(dbPath)
    const localManifest = readLocalManifest()
    const remoteManifest = readCloudManifest()

    if (remoteManifest?.dbSha256 === currentSha) {
      if (!localManifest || localManifest.dbSha256 !== currentSha) {
        writeLocalManifest(remoteManifest)
      }
      logger.info('云端存档已是最新，跳过上传')
      return
    }

    if (localManifest?.dbSha256 === currentSha && remoteManifest) {
      const remoteIsNewer =
        remoteManifest.revision > localManifest.revision ||
        (remoteManifest.revision === localManifest.revision &&
          remoteManifest.updatedAt > localManifest.updatedAt)
      if (remoteIsNewer) {
        logger.info('云端存档比本地更新，跳过上传')
        return
      }
    }

    const nextRevision =
      Math.max(localManifest?.revision ?? 0, remoteManifest?.revision ?? 0) + 1
    const manifest = buildManifestFromDb(dbPath, nextRevision)
    const dbBase64 = fs.readFileSync(dbPath).toString('base64')

    const manifestOk = client.cloud.writeFile(CLOUD_MANIFEST_FILE, JSON.stringify(manifest))
    const dbOk = client.cloud.writeFile(CLOUD_DB_FILE, dbBase64)

    if (manifestOk && dbOk) {
      writeLocalManifest(manifest)
      logger.info(`Steam 云存档上传完成 (revision ${manifest.revision})`)
    } else {
      logger.warn('Steam 云存档上传失败')
    }
  } catch (error) {
    logger.warn('Steam 云存档上传异常', error)
  }
}
