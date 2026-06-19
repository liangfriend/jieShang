import fs from 'fs'
import path from 'path'
import pathManager from './pathManager'
import { getLogger } from './log'

const logger = getLogger('CollectionThumbnail')

/** 将安装包内的内置缩略图同步到 userData/resources/image/collection（仅缺失时拷贝） */
export function syncBuiltinCollectionThumbnails(): void {
  const bundled = pathManager.getBundledThumbnailsDir()
  const target = pathManager.getCollectionThumbnailDir()

  if (!fs.existsSync(bundled)) {
    logger.warn(`内置缩略图目录不存在，跳过同步: ${bundled}`)
    return
  }

  let copied = 0
  for (const file of fs.readdirSync(bundled)) {
    if (!/\.svg$/i.test(file)) continue
    const dest = path.join(target, file)
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(bundled, file), dest)
      copied += 1
    }
  }

  if (copied > 0) {
    logger.info(`已同步 ${copied} 个内置藏品缩略图 → ${target}`)
  }
}
