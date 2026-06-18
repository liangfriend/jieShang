import fs from 'fs'
import path from 'path'
import pathManager from './pathManager'

/** 将安装包内的内置缩略图同步到 userData/resources/image/collection（仅缺失时拷贝） */
export function syncBuiltinCollectionThumbnails(): void {
  const bundled = pathManager.getBundledThumbnailsDir()
  const target = pathManager.getCollectionThumbnailDir()

  if (!fs.existsSync(bundled)) return

  for (const file of fs.readdirSync(bundled)) {
    if (!/\.svg$/i.test(file)) continue
    const dest = path.join(target, file)
    if (!fs.existsSync(dest)) {
      fs.copyFileSync(path.join(bundled, file), dest)
    }
  }
}
