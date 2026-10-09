import type { KeySignatureTypeEnum, MusicScore, TimeSignatureTypeEnum } from '@deciphony/renderer'
import {
  createKeySignature,
  createTimeSignature
} from '@deciphony/extensions/dr-edit/score-builder'
import type { OmrPageResult, OmrRecognizeResult } from '@renderer/types/omr'
import { DEFAULT_SCORE_GD_SLOT_H, DEFAULT_SCORE_T_SLOT_H } from '@renderer/utils/scoreGdSlotHeight'

export const SCORE_IMAGE_ACCEPT = '.png,.jpg,.jpeg,.webp,.bmp'

const DIRECT_TYPES = new Set(['image/png', 'image/jpeg'])

/** 识别库只解码 PNG / JPEG，其他格式先在渲染进程转成 PNG */
async function toRecognizableBytes(file: File): Promise<Uint8Array> {
  if (DIRECT_TYPES.has(file.type)) return new Uint8Array(await file.arrayBuffer())
  const bitmap = await createImageBitmap(file)
  try {
    const canvas = new OffscreenCanvas(bitmap.width, bitmap.height)
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('canvas 2d unavailable')
    ctx.fillStyle = '#fff'
    ctx.fillRect(0, 0, bitmap.width, bitmap.height)
    ctx.drawImage(bitmap, 0, 0)
    const blob = await canvas.convertToBlob({ type: 'image/png' })
    return new Uint8Array(await blob.arrayBuffer())
  } finally {
    bitmap.close()
  }
}

export async function recognizeScoreImage(file: File): Promise<OmrRecognizeResult> {
  let bytes: Uint8Array
  try {
    bytes = await toRecognizableBytes(file)
  } catch (error) {
    return { ok: false, code: 'BAD_IMAGE', message: (error as Error).message }
  }
  return window.api.omr.recognize(bytes)
}

const KEY_RELIABLE = new Set(['option', 'detected'])

/** 后续页未写调号时识别库会给出「默认 C 调」提示，拼接时沿用前页调号，该提示无意义 */
const DEFAULT_KEY_WARNING = /未识别到调号/

export function pageWarnings(page: OmrPageResult, index: number): string[] {
  if (index > 0 && page.info.keySignatureSource === 'default') {
    return page.warnings.filter((w) => !DEFAULT_KEY_WARNING.test(w))
  }
  return page.warnings
}

export type PageSignature = {
  key: KeySignatureTypeEnum
  /** false：图中未识别到调号，沿用前页（首页则取后续第一个识别到的，都没有为 C） */
  keyFromImage: boolean
  time: TimeSignatureTypeEnum
  timeFromImage: boolean
}

/** 页内中途变调 / 变拍后，该页结束时生效的调号与拍号 */
function endSignatures(score: MusicScore, key: KeySignatureTypeEnum, time: TimeSignatureTypeEnum) {
  for (const grand of score.grandStaffs) {
    for (const m of grand.staves[0]?.measures ?? []) {
      if (m.keySignature_f) key = m.keySignature_f.type
      if (m.timeSignature_f) time = m.timeSignature_f.type
    }
  }
  return { key, time }
}

/**
 * 每页开头实际生效的调号 / 拍号。
 * 全曲调号 / 拍号取第一个识别到的；之后的页没写调号 / 拍号时沿用前页。
 */
export function resolvePageSignatures(pages: OmrPageResult[]): PageSignature[] {
  if (!pages.length) return []
  const keyPage = pages.find((p) => KEY_RELIABLE.has(p.info.keySignatureSource)) ?? pages[0]
  const timePage =
    pages.find((p) => KEY_RELIABLE.has(p.info.timeSignatureSource)) ??
    pages.find((p) => p.info.timeSignatureSource === 'inferred') ??
    pages[0]
  let cur = {
    key: keyPage.info.keySignature,
    time: timePage.info.timeSignature
  }
  return pages.map((page) => {
    const keyFromImage = KEY_RELIABLE.has(page.info.keySignatureSource)
    const timeFromImage = KEY_RELIABLE.has(page.info.timeSignatureSource)
    const sig: PageSignature = {
      key: keyFromImage ? page.info.keySignature : cur.key,
      keyFromImage,
      time: timeFromImage ? page.info.timeSignature : cur.time,
      timeFromImage
    }
    cur = endSignatures(page.musicScore, sig.key, sig.time)
    return sig
  })
}

/**
 * 按顺序拼接多页识别结果的复谱表。
 * 某页开头的调号 / 拍号与前页结束时不同，写到该页首个复谱表各单谱表的第一小节
 * （简谱渲染与播放都按小节调号切换）。
 */
export function mergeOmrPages(pages: OmrPageResult[]): MusicScore {
  if (!pages.length) throw new Error('no pages')
  const copies = pages.map((p) => JSON.parse(JSON.stringify(p.musicScore)) as MusicScore)
  const sigs = resolvePageSignatures(pages)

  const merged: MusicScore = {
    ...copies[0],
    keySignature: sigs[0].key,
    timeSignature: sigs[0].time,
    grandStaffs: [],
    affiliatedSymbols: [],
    height: 0
  }

  let prev = { key: sigs[0].key, time: sigs[0].time }
  pages.forEach((page, i) => {
    const score = copies[i]
    const sig = sigs[i]
    const firstGrand = score.grandStaffs[0]
    if (firstGrand && sig.key !== prev.key) {
      for (const staff of firstGrand.staves) {
        const m = staff.measures[0]
        if (m) m.keySignature_f = createKeySignature(sig.key)
      }
    }
    if (firstGrand && sig.time !== prev.time) {
      for (const staff of firstGrand.staves) {
        const m = staff.measures[0]
        if (m && !m.timeSignature_f) m.timeSignature_f = createTimeSignature(sig.time)
      }
    }
    prev = endSignatures(page.musicScore, sig.key, sig.time)

    merged.grandStaffs.push(...score.grandStaffs)
    merged.affiliatedSymbols.push(...score.affiliatedSymbols)
    merged.height += score.height
  })

  // 识别库按谱表行估算高度，不含本应用的标题区（t）和每行歌词区（g-d）
  merged.height += DEFAULT_SCORE_T_SLOT_H + merged.grandStaffs.length * DEFAULT_SCORE_GD_SLOT_H
  return merged
}
