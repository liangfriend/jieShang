import fs from 'fs'
import path from 'path'
import zlib from 'zlib'
import toneColorCatalog from '../../../shared/toneColorCatalog.json'
import pathManager from '../../utils/pathManager'

export type ToneColorFamily = keyof typeof toneColorCatalog.families

export type BuiltinToneColorSeed = {
  id: number
  name: string
  file: string
  family: ToneColorFamily
  description: string
}

/**
 * 内置音色种子（顺序 = 名单顺序）。音色本体按需从磁盘读取，
 * 不静态 import：100+ 个音色 JSON 共数百 MB，打进主进程包会拖垮启动与内存。
 */
export const BUILTIN_TONE_COLOR_SEEDS: BuiltinToneColorSeed[] = toneColorCatalog.items.map(
  (item) => {
    const family = item.family as ToneColorFamily
    const name = item.name.zh
    return {
      id: item.id,
      name,
      file: item.file,
      family,
      description:
        ('description' in item && item.description) ||
        `${name}，${toneColorCatalog.families[family].zh}类音色。`
    }
  }
)

export const BUILTIN_TONE_COLOR_IDS: number[] = BUILTIN_TONE_COLOR_SEEDS.map((s) => s.id)

export const DEFAULT_TONE_COLOR_NAME = BUILTIN_TONE_COLOR_SEEDS[0]!.name

export function builtinToneColorFilePath(file: string): string {
  return path.join(pathManager.getBundledToneColorsDir(), file)
}

/** 读取音色 JSON 文本；个别文件为 gzip 压缩（1f 8b 开头），透明解压 */
export function readBuiltinToneColorContent(file: string): string {
  const buf = fs.readFileSync(builtinToneColorFilePath(file))
  const raw = buf[0] === 0x1f && buf[1] === 0x8b ? zlib.gunzipSync(buf) : buf
  return raw.toString('utf8')
}
