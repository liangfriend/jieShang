import type { MusicScore } from '@deciphony/renderer'
import type { ScoreVerticalBand } from '@deciphony/work'
import { DEFAULT_PAGE_HEIGHT, DEFAULT_PAGE_WIDTH } from '@deciphony/work'

/** 曲谱导出为作品的设置（页面像素） */
export type ScoreToWorkSettings = {
  pageWidth: number
  pageHeight: number
  /** 曲谱在页面上的显示宽度，按比例缩放 */
  scoreWidth: number
  /** 曲谱距页面顶部；底部留同样的边距 */
  topMargin: number
}

/** 编辑器交给作品编辑页执行的分页任务 */
export type ScoreToWorkJob = ScoreToWorkSettings & {
  musicScore: MusicScore
  /** 曲谱皮肤藏品 id；无则用默认皮肤 */
  skinId: number | null
}

/** 一页要放的曲谱区域（musicScore 坐标） */
export type ScorePageSlice = {
  cropY: number
  cropHeight: number
}

export const PAGE_SIZE_MIN = 100
export const PAGE_SIZE_MAX = 10000

const STORAGE_KEY = 'jieShang.scoreToWork.settings'
const DEFAULT_TOP_MARGIN = 48
const DEFAULT_SIDE_MARGIN = 40

export function defaultScoreWidth(pageWidth: number): number {
  return Math.max(PAGE_SIZE_MIN, Math.round(pageWidth - DEFAULT_SIDE_MARGIN * 2))
}

export function loadScoreToWorkSettings(): ScoreToWorkSettings {
  const fallback: ScoreToWorkSettings = {
    pageWidth: DEFAULT_PAGE_WIDTH,
    pageHeight: DEFAULT_PAGE_HEIGHT,
    scoreWidth: defaultScoreWidth(DEFAULT_PAGE_WIDTH),
    topMargin: DEFAULT_TOP_MARGIN
  }
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? 'null') as Partial<ScoreToWorkSettings> | null
    if (!parsed) return fallback
    const num = (v: unknown, d: number) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : d)
    return {
      pageWidth: num(parsed.pageWidth, fallback.pageWidth),
      pageHeight: num(parsed.pageHeight, fallback.pageHeight),
      scoreWidth: num(parsed.scoreWidth, fallback.scoreWidth),
      topMargin: num(parsed.topMargin, fallback.topMargin)
    }
  } catch {
    return fallback
  }
}

export function saveScoreToWorkSettings(settings: ScoreToWorkSettings): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(settings))
}

/**
 * 按复谱表分页：第一页带标题区，每页从上边距开始排，放不下的复谱表整行移到下一页。
 * bands：0 = 标题区，1..n = 复谱表（scoreVerticalBands 结果）。
 * 单个复谱表比可用高度还高时独占一页（会超出页面底部）。
 */
export function planScorePages(
  bands: ScoreVerticalBand[],
  settings: ScoreToWorkSettings,
  sourceWidth: number
): ScorePageSlice[] {
  const scale = settings.scoreWidth / sourceWidth
  const available = Math.max(1, (settings.pageHeight - settings.topMargin * 2) / scale)
  const title = bands.find((band) => band.index === 0)
  const rows = bands.filter((band) => band.index > 0).sort((a, b) => a.y - b.y)
  if (!rows.length) {
    return title && title.height > 0 ? [{ cropY: title.y, cropHeight: title.height }] : []
  }

  const slices: ScorePageSlice[] = []
  let top = title && title.height > 0 ? title.y : rows[0]!.y
  let bottom = top
  let rowsOnPage = 0
  for (const row of rows) {
    const rowBottom = row.y + row.height
    if (rowsOnPage > 0 && rowBottom - top > available) {
      slices.push({ cropY: top, cropHeight: bottom - top })
      top = row.y
      rowsOnPage = 0
    }
    bottom = rowBottom
    rowsOnPage++
  }
  slices.push({ cropY: top, cropHeight: bottom - top })
  return slices
}
