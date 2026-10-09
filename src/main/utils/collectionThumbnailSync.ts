import fs from 'fs'
import path from 'path'
import pathManager from './pathManager'
import { getLogger } from './log'

const logger = getLogger('CollectionThumbnail')

function isSameFile(a: string, b: string): boolean {
  return fs.readFileSync(a).equals(fs.readFileSync(b))
}

/** 将安装包内的内置缩略图同步到 userData/resources/image/collection（缺失或内容变化时拷贝） */
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
    const src = path.join(bundled, file)
    const dest = path.join(target, file)
    if (!fs.existsSync(dest) || !isSameFile(src, dest)) {
      fs.copyFileSync(src, dest)
      copied += 1
    }
  }

  if (copied > 0) {
    logger.info(`已同步 ${copied} 个内置藏品缩略图 → ${target}`)
  }
}
