import type { MusicScore } from '@deciphony/renderer'
import { isFixedToneColorScore } from '@renderer/utils/isTabNotation'
import {
  DEFAULT_SCORE_INSTRUMENT_NAME_FONT_FAMILY,
  DEFAULT_SCORE_LYRICS_FONT_FAMILY,
  DEFAULT_SCORE_LYRICS_FONT_SIZE,
  DEFAULT_SCORE_S_L_SLOT_W,
  DEFAULT_SCORE_S_R_SLOT_W,
  DEFAULT_SCORE_T_SLOT_H,
  DEFAULT_SCORE_TITLE_FONT_FAMILY,
  SCORE_DATA_GD_SLOT_H,
  SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY,
  SCORE_DATA_LYRICS_FONT_FAMILY,
  SCORE_DATA_LYRICS_FONT_SIZE,
  SCORE_DATA_S_L_SLOT_W,
  SCORE_DATA_S_R_SLOT_W,
  SCORE_DATA_SHOW_INSTRUMENT_NAME,
  SCORE_DATA_T_SLOT_H,
  SCORE_DATA_TITLE_FONT_FAMILY,
  SCORE_LYRICS_FONT_SIZE_MAX,
  SCORE_LYRICS_FONT_SIZE_MIN,
  SCORE_S_L_SLOT_W_MAX,
  SCORE_S_L_SLOT_W_MIN,
  SCORE_S_R_SLOT_W_MAX,
  SCORE_S_R_SLOT_W_MIN,
  SCORE_T_SLOT_H_MAX,
  SCORE_T_SLOT_H_MIN
} from '@renderer/utils/scoreGdSlotHeight'
import { normalizeScoreFontFamily } from '@renderer/utils/scoreFontOptions'

/** 曲谱布局默认值（谱表边距 + 标题区高度 + 左右留白 + 字体字号）→ localStorage，仅影响新建 */
export const SCORE_SPACING_STORAGE_KEY = 'jieShang.score.staffSpacingDefaults'

export type ScoreStaffSpacing = {
  uSpace: number
  dSpace: number
  uSpaceO: number
  uSpaceI: number
  dSpaceI: number
  dSpaceO: number
}

export type ScoreSlotHeights = {
  /** 标题区 t 高度 */
  tSlotH: number
  /** 左留白 s-l 宽度 */
  sLSlotW: number
  /** 右留白 s-r 宽度 */
  sRSlotW: number
  /** 歌词字号（px） */
  lyricsFontSize: number
  /** 歌词字体（CSS font-family；空 = 系统默认） */
  lyricsFontFamily: string
  /** 标题字体（CSS font-family；空 = 系统默认） */
  titleFontFamily: string
  /** 音色名字体（CSS font-family；空 = 系统默认） */
  instrumentNameFontFamily: string
}

export type ScoreLayoutDefaults = ScoreStaffSpacing & ScoreSlotHeights

/** 内置默认：标题区 140、左留白 80、右留白 50、歌词字号 13、上下内边距 20，其余 0 */
export const BUILTIN_SCORE_STAFF_SPACING: ScoreStaffSpacing = {
  uSpace: 0,
  dSpace: 0,
  uSpaceO: 0,
  uSpaceI: 20,
  dSpaceI: 20,
  dSpaceO: 0
}

export const BUILTIN_SCORE_LAYOUT_DEFAULTS: ScoreLayoutDefaults = {
  ...BUILTIN_SCORE_STAFF_SPACING,
  tSlotH: DEFAULT_SCORE_T_SLOT_H,
  sLSlotW: DEFAULT_SCORE_S_L_SLOT_W,
  sRSlotW: DEFAULT_SCORE_S_R_SLOT_W,
  lyricsFontSize: DEFAULT_SCORE_LYRICS_FONT_SIZE,
  lyricsFontFamily: DEFAULT_SCORE_LYRICS_FONT_FAMILY,
  titleFontFamily: DEFAULT_SCORE_TITLE_FONT_FAMILY,
  instrumentNameFontFamily: DEFAULT_SCORE_INSTRUMENT_NAME_FONT_FAMILY
}

export const SCORE_SPACING_MIN = 0
export const SCORE_SPACING_MAX = 200
export const SCORE_SPACING_STEP = 2

/** 谱面总高度（musicScore.height），不参与「同步为默认」：新建模板固定高度 */
export const SCORE_HEIGHT_MIN = 200
export const SCORE_HEIGHT_MAX = 100000
export const SCORE_HEIGHT_STEP = 100

/** 谱面总宽度（musicScore.width），同样只作用于当前曲谱 */
export const SCORE_WIDTH_MIN = 300
export const SCORE_WIDTH_MAX = 4000
export const SCORE_WIDTH_STEP = 10

function normalizeSpacingValue(
  value: unknown,
  fallback: number,
  max = SCORE_SPACING_MAX,
  min = SCORE_SPACING_MIN
): number {
  const n = typeof value === 'number' ? value : Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, Math.round(n)))
}

export function normalizeScoreStaffSpacing(
  partial: Partial<ScoreStaffSpacing> | null | undefined,
  fallback: ScoreStaffSpacing = BUILTIN_SCORE_STAFF_SPACING
): ScoreStaffSpacing {
  return {
    uSpace: normalizeSpacingValue(partial?.uSpace, fallback.uSpace),
    dSpace: normalizeSpacingValue(partial?.dSpace, fallback.dSpace),
    uSpaceO: normalizeSpacingValue(partial?.uSpaceO, fallback.uSpaceO),
    uSpaceI: normalizeSpacingValue(partial?.uSpaceI, fallback.uSpaceI),
    dSpaceI: normalizeSpacingValue(partial?.dSpaceI, fallback.dSpaceI),
    dSpaceO: normalizeSpacingValue(partial?.dSpaceO, fallback.dSpaceO)
  }
}

export function normalizeScoreSlotHeights(
  partial: Partial<ScoreSlotHeights> | null | undefined,
  fallback: ScoreSlotHeights = {
    tSlotH: BUILTIN_SCORE_LAYOUT_DEFAULTS.tSlotH,
    sLSlotW: BUILTIN_SCORE_LAYOUT_DEFAULTS.sLSlotW,
    sRSlotW: BUILTIN_SCORE_LAYOUT_DEFAULTS.sRSlotW,
    lyricsFontSize: BUILTIN_SCORE_LAYOUT_DEFAULTS.lyricsFontSize,
    lyricsFontFamily: BUILTIN_SCORE_LAYOUT_DEFAULTS.lyricsFontFamily,
    titleFontFamily: BUILTIN_SCORE_LAYOUT_DEFAULTS.titleFontFamily,
    instrumentNameFontFamily: BUILTIN_SCORE_LAYOUT_DEFAULTS.instrumentNameFontFamily
  }
): ScoreSlotHeights {
  return {
    tSlotH: normalizeSpacingValue(
      partial?.tSlotH,
      fallback.tSlotH,
      SCORE_T_SLOT_H_MAX,
      SCORE_T_SLOT_H_MIN
    ),
    sLSlotW: normalizeSpacingValue(
      partial?.sLSlotW,
      fallback.sLSlotW,
      SCORE_S_L_SLOT_W_MAX,
      SCORE_S_L_SLOT_W_MIN
    ),
    sRSlotW: normalizeSpacingValue(
      partial?.sRSlotW,
      fallback.sRSlotW,
      SCORE_S_R_SLOT_W_MAX,
      SCORE_S_R_SLOT_W_MIN
    ),
    lyricsFontSize: normalizeSpacingValue(
      partial?.lyricsFontSize,
      fallback.lyricsFontSize,
      SCORE_LYRICS_FONT_SIZE_MAX,
      SCORE_LYRICS_FONT_SIZE_MIN
    ),
    lyricsFontFamily: normalizeScoreFontFamily(
      partial?.lyricsFontFamily,
      fallback.lyricsFontFamily
    ),
    titleFontFamily: normalizeScoreFontFamily(partial?.titleFontFamily, fallback.titleFontFamily),
    instrumentNameFontFamily: normalizeScoreFontFamily(
      partial?.instrumentNameFontFamily,
      fallback.instrumentNameFontFamily
    )
  }
}

export function normalizeScoreLayoutDefaults(
  partial: Partial<ScoreLayoutDefaults> | null | undefined,
  fallback: ScoreLayoutDefaults = BUILTIN_SCORE_LAYOUT_DEFAULTS
): ScoreLayoutDefaults {
  return {
    ...normalizeScoreStaffSpacing(partial, fallback),
    ...normalizeScoreSlotHeights(partial, fallback)
  }
}

export function loadScoreLayoutDefaults(): ScoreLayoutDefaults {
  try {
    const raw = localStorage.getItem(SCORE_SPACING_STORAGE_KEY)
    if (!raw) return { ...BUILTIN_SCORE_LAYOUT_DEFAULTS }
    return normalizeScoreLayoutDefaults(JSON.parse(raw) as Partial<ScoreLayoutDefaults>)
  } catch {
    return { ...BUILTIN_SCORE_LAYOUT_DEFAULTS }
  }
}

export function loadScoreStaffSpacingDefaults(): ScoreStaffSpacing {
  const {
    tSlotH: _t,
    sLSlotW: _sl,
    sRSlotW: _sr,
    lyricsFontSize: _lf,
    lyricsFontFamily: _lff,
    titleFontFamily: _tff,
    instrumentNameFontFamily: _iff,
    ...staff
  } = loadScoreLayoutDefaults()
  return staff
}

/** 仅写入软件默认（新建曲谱用），不改当前打开的谱 */
export function saveScoreLayoutDefaults(settings: ScoreLayoutDefaults): ScoreLayoutDefaults {
  const next = normalizeScoreLayoutDefaults(settings)
  localStorage.setItem(SCORE_SPACING_STORAGE_KEY, JSON.stringify(next))
  return next
}

export function saveScoreStaffSpacingDefaults(spacing: ScoreStaffSpacing): ScoreStaffSpacing {
  const current = loadScoreLayoutDefaults()
  const next = saveScoreLayoutDefaults({ ...current, ...normalizeScoreStaffSpacing(spacing) })
  const {
    tSlotH: _t,
    sLSlotW: _sl,
    sRSlotW: _sr,
    lyricsFontSize: _lf,
    lyricsFontFamily: _lff,
    titleFontFamily: _tff,
    instrumentNameFontFamily: _iff,
    ...staff
  } = next
  return staff
}

function ensureScoreData(score: MusicScore): Record<string, unknown> {
  const raw = score as MusicScore & { data?: Record<string, unknown> }
  if (!raw.data || typeof raw.data !== 'object') {
    raw.data = {}
  }
  return raw.data
}

/** 从 musicScore.data 读标题区高度、左右留白与字体字号；缺省回落软件默认（不写回） */
export function readScoreSlotHeights(score: MusicScore): ScoreSlotHeights {
  const data = (score as MusicScore & { data?: Record<string, unknown> }).data
  const defaults = loadScoreLayoutDefaults()
  return normalizeScoreSlotHeights(
    {
      tSlotH: data?.[SCORE_DATA_T_SLOT_H] as number | undefined,
      sLSlotW: data?.[SCORE_DATA_S_L_SLOT_W] as number | undefined,
      sRSlotW: data?.[SCORE_DATA_S_R_SLOT_W] as number | undefined,
      lyricsFontSize: data?.[SCORE_DATA_LYRICS_FONT_SIZE] as number | undefined,
      lyricsFontFamily: data?.[SCORE_DATA_LYRICS_FONT_FAMILY] as string | undefined,
      titleFontFamily: data?.[SCORE_DATA_TITLE_FONT_FAMILY] as string | undefined,
      instrumentNameFontFamily: data?.[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY] as string | undefined
    },
    {
      tSlotH: defaults.tSlotH,
      sLSlotW: defaults.sLSlotW,
      sRSlotW: defaults.sRSlotW,
      lyricsFontSize: defaults.lyricsFontSize,
      lyricsFontFamily: defaults.lyricsFontFamily,
      titleFontFamily: defaults.titleFontFamily,
      instrumentNameFontFamily: defaults.instrumentNameFontFamily
    }
  )
}

/**
 * 确保 data 上有 tSlotH / sLSlotW / sRSlotW / lyricsFontSize 等（创建曲谱或打开旧谱时补齐），已有合法值不覆盖；
 * gdSlotH 一律写 0（旧谱里存的歌词区高度不再生效）。
 */
export function ensureScoreSlotHeights(
  score: MusicScore,
  defaults: ScoreSlotHeights = loadScoreLayoutDefaults()
): ScoreSlotHeights {
  const data = ensureScoreData(score)
  const normalizedDefaults = normalizeScoreSlotHeights(defaults)
  data[SCORE_DATA_GD_SLOT_H] = 0
  const tRaw = data[SCORE_DATA_T_SLOT_H]
  if (tRaw == null || !Number.isFinite(Number(tRaw))) {
    data[SCORE_DATA_T_SLOT_H] = normalizedDefaults.tSlotH
  } else {
    data[SCORE_DATA_T_SLOT_H] = normalizeSpacingValue(
      tRaw,
      normalizedDefaults.tSlotH,
      SCORE_T_SLOT_H_MAX,
      SCORE_T_SLOT_H_MIN
    )
  }
  data[SCORE_DATA_S_L_SLOT_W] = normalizeSpacingValue(
    data[SCORE_DATA_S_L_SLOT_W],
    normalizedDefaults.sLSlotW,
    SCORE_S_L_SLOT_W_MAX,
    SCORE_S_L_SLOT_W_MIN
  )
  data[SCORE_DATA_S_R_SLOT_W] = normalizeSpacingValue(
    data[SCORE_DATA_S_R_SLOT_W],
    normalizedDefaults.sRSlotW,
    SCORE_S_R_SLOT_W_MAX,
    SCORE_S_R_SLOT_W_MIN
  )
  data[SCORE_DATA_LYRICS_FONT_SIZE] = normalizeSpacingValue(
    data[SCORE_DATA_LYRICS_FONT_SIZE],
    normalizedDefaults.lyricsFontSize,
    SCORE_LYRICS_FONT_SIZE_MAX,
    SCORE_LYRICS_FONT_SIZE_MIN
  )
  if (typeof data[SCORE_DATA_LYRICS_FONT_FAMILY] !== 'string') {
    data[SCORE_DATA_LYRICS_FONT_FAMILY] = normalizedDefaults.lyricsFontFamily
  } else {
    data[SCORE_DATA_LYRICS_FONT_FAMILY] = normalizeScoreFontFamily(
      data[SCORE_DATA_LYRICS_FONT_FAMILY],
      normalizedDefaults.lyricsFontFamily
    )
  }
  if (typeof data[SCORE_DATA_TITLE_FONT_FAMILY] !== 'string') {
    data[SCORE_DATA_TITLE_FONT_FAMILY] = normalizedDefaults.titleFontFamily
  } else {
    data[SCORE_DATA_TITLE_FONT_FAMILY] = normalizeScoreFontFamily(
      data[SCORE_DATA_TITLE_FONT_FAMILY],
      normalizedDefaults.titleFontFamily
    )
  }
  if (typeof data[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY] !== 'string') {
    data[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY] = normalizedDefaults.instrumentNameFontFamily
  } else {
    data[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY] = normalizeScoreFontFamily(
      data[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY],
      normalizedDefaults.instrumentNameFontFamily
    )
  }
  return readScoreSlotHeights(score)
}

/** 写入当前曲谱 data.sLSlotW（左留白，随谱保存） */
export function applySLSlotWidth(score: MusicScore, value: number): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_S_L_SLOT_W] = normalizeSpacingValue(
    value,
    readScoreSlotHeights(score).sLSlotW,
    SCORE_S_L_SLOT_W_MAX,
    SCORE_S_L_SLOT_W_MIN
  )
}

/** 写入当前曲谱 data.sRSlotW（右留白，随谱保存） */
export function applySRSlotWidth(score: MusicScore, value: number): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_S_R_SLOT_W] = normalizeSpacingValue(
    value,
    readScoreSlotHeights(score).sRSlotW,
    SCORE_S_R_SLOT_W_MAX,
    SCORE_S_R_SLOT_W_MIN
  )
}

/** 写入当前曲谱 data.lyricsFontSize（歌词字号，随谱保存） */
export function applyLyricsFontSize(score: MusicScore, value: number): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_LYRICS_FONT_SIZE] = normalizeSpacingValue(
    value,
    readScoreSlotHeights(score).lyricsFontSize,
    SCORE_LYRICS_FONT_SIZE_MAX,
    SCORE_LYRICS_FONT_SIZE_MIN
  )
}

/** 写入当前曲谱 data.lyricsFontFamily（歌词字体，随谱保存） */
export function applyLyricsFontFamily(score: MusicScore, value: string): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_LYRICS_FONT_FAMILY] = normalizeScoreFontFamily(
    value,
    readScoreSlotHeights(score).lyricsFontFamily
  )
}

/** 写入当前曲谱 data.titleFontFamily（标题字体，随谱保存） */
export function applyTitleFontFamily(score: MusicScore, value: string): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_TITLE_FONT_FAMILY] = normalizeScoreFontFamily(
    value,
    readScoreSlotHeights(score).titleFontFamily
  )
}

/** 写入当前曲谱 data.instrumentNameFontFamily（音色名字体，随谱保存） */
export function applyInstrumentNameFontFamily(score: MusicScore, value: string): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_INSTRUMENT_NAME_FONT_FAMILY] = normalizeScoreFontFamily(
    value,
    readScoreSlotHeights(score).instrumentNameFontFamily
  )
}

/** 写入当前曲谱总宽度（随谱保存） */
export function applyScoreWidth(score: MusicScore, value: number): void {
  score.width = normalizeSpacingValue(value, score.width, SCORE_WIDTH_MAX, SCORE_WIDTH_MIN)
}

/** 乐器谱固定音色，始终不显示「显示音色」开关效果 */
export function readShowInstrumentName(score: MusicScore): boolean {
  if (isFixedToneColorScore(score)) return false
  const data = (score as MusicScore & { data?: Record<string, unknown> }).data
  return data?.[SCORE_DATA_SHOW_INSTRUMENT_NAME] === true
}

/** 写入当前曲谱 data.showInstrumentName（s-l 显示音色名，随谱保存） */
export function applyShowInstrumentName(score: MusicScore, show: boolean): void {
  ensureScoreData(score)[SCORE_DATA_SHOW_INSTRUMENT_NAME] = show
}

export function readScoreStaffSpacing(score: MusicScore): ScoreStaffSpacing {
  const grand = score.grandStaffs[0]
  const single = grand?.staves[0]
  return normalizeScoreStaffSpacing({
    uSpace: grand?.uSpace,
    dSpace: grand?.dSpace,
    uSpaceO: single?.uSpaceO,
    uSpaceI: single?.uSpaceI,
    dSpaceI: single?.dSpaceI,
    dSpaceO: single?.dSpaceO
  })
}

export function readScoreLayoutDraft(score: MusicScore): ScoreLayoutDefaults {
  return {
    ...readScoreStaffSpacing(score),
    ...readScoreSlotHeights(score)
  }
}

export function applyScoreStaffSpacing(score: MusicScore, spacing: ScoreStaffSpacing): void {
  const next = normalizeScoreStaffSpacing(spacing)
  for (const grand of score.grandStaffs) {
    grand.uSpace = next.uSpace
    grand.dSpace = next.dSpace
    for (const single of grand.staves) {
      single.uSpaceO = next.uSpaceO
      single.uSpaceI = next.uSpaceI
      single.dSpaceI = next.dSpaceI
      single.dSpaceO = next.dSpaceO
    }
  }
}

/** 把软件默认布局（谱表间距 + 标题区 + 左右留白 + 字体字号）整体写入当前曲谱；不含页面宽高 */
export function applyScoreLayoutDefaults(
  score: MusicScore,
  defaults: ScoreLayoutDefaults = loadScoreLayoutDefaults()
): ScoreLayoutDefaults {
  const next = normalizeScoreLayoutDefaults(defaults)
  applyScoreStaffSpacing(score, next)
  applyTSlotHeight(score, next.tSlotH)
  applySLSlotWidth(score, next.sLSlotW)
  applySRSlotWidth(score, next.sRSlotW)
  applyLyricsFontSize(score, next.lyricsFontSize)
  applyLyricsFontFamily(score, next.lyricsFontFamily)
  applyTitleFontFamily(score, next.titleFontFamily)
  applyInstrumentNameFontFamily(score, next.instrumentNameFontFamily)
  return readScoreLayoutDraft(score)
}

/** 写入当前曲谱 data.tSlotH（随谱保存） */
export function applyTSlotHeight(score: MusicScore, value: number): void {
  const data = ensureScoreData(score)
  data[SCORE_DATA_T_SLOT_H] = normalizeSpacingValue(
    value,
    readScoreSlotHeights(score).tSlotH,
    SCORE_T_SLOT_H_MAX,
    SCORE_T_SLOT_H_MIN
  )
}

/** 写入当前曲谱总高度（随谱保存） */
export function applyScoreHeight(score: MusicScore, value: number): void {
  score.height = normalizeSpacingValue(value, score.height, SCORE_HEIGHT_MAX, SCORE_HEIGHT_MIN)
}

export function applySpacingToGrandStaff(
  grand: MusicScore['grandStaffs'][number],
  spacing: ScoreStaffSpacing = loadScoreStaffSpacingDefaults()
): void {
  const next = normalizeScoreStaffSpacing(spacing)
  grand.uSpace = next.uSpace
  grand.dSpace = next.dSpace
  for (const single of grand.staves) {
    single.uSpaceO = next.uSpaceO
    single.uSpaceI = next.uSpaceI
    single.dSpaceI = next.dSpaceI
    single.dSpaceO = next.dSpaceO
  }
}

export function applySpacingToSingleStaff(
  single: MusicScore['grandStaffs'][number]['staves'][number],
  spacing: ScoreStaffSpacing = loadScoreStaffSpacingDefaults()
): void {
  const next = normalizeScoreStaffSpacing(spacing)
  single.uSpaceO = next.uSpaceO
  single.uSpaceI = next.uSpaceI
  single.dSpaceI = next.dSpaceI
  single.dSpaceO = next.dSpaceO
}
