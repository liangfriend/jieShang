import { toRaw } from 'vue'
import { createClSheet, type ClSheetData } from '@deciphony/cl-sheet'
import type { MusicScore } from '@deciphony/renderer'
import i18n from '@renderer/i18n'
import {
  isClSheetRecord,
  loadScoreFromDatabase,
  parseScoreJson,
  type ScoreRecord
} from './scoreFile'

/** ClSheet 的展示参数不在 ClSheetData 顶层，存进 data.style 随谱保存 */
export type ClSheetStyle = {
  fontSize: number
  lineGap: number
  color: string
  chordColor: string
  /** 新加的字写入的颜色，'' 表示不写（跟随 color） */
  addLyricColor: string
  /** 新加的和弦写入的颜色，'' 表示不写（跟随 chordColor） */
  addChordColor: string
}

export const DEFAULT_CL_SHEET_STYLE: ClSheetStyle = {
  fontSize: 20,
  lineGap: 14,
  color: '#222222',
  chordColor: '#1d6fd8',
  addLyricColor: '',
  addChordColor: ''
}

export const DEFAULT_CL_SHEET_WIDTH = 720

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/

function pickNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function pickColor(value: unknown, fallback: string): string {
  return typeof value === 'string' && HEX_COLOR.test(value) ? value : fallback
}

export function readClSheetStyle(sheet: ClSheetData): ClSheetStyle {
  const raw = (sheet.data?.style ?? {}) as Partial<Record<keyof ClSheetStyle, unknown>>
  return {
    fontSize: pickNumber(raw.fontSize, DEFAULT_CL_SHEET_STYLE.fontSize),
    lineGap: pickNumber(raw.lineGap, DEFAULT_CL_SHEET_STYLE.lineGap),
    color: pickColor(raw.color, DEFAULT_CL_SHEET_STYLE.color),
    chordColor: pickColor(raw.chordColor, DEFAULT_CL_SHEET_STYLE.chordColor),
    addLyricColor: pickColor(raw.addLyricColor, DEFAULT_CL_SHEET_STYLE.addLyricColor),
    addChordColor: pickColor(raw.addChordColor, DEFAULT_CL_SHEET_STYLE.addChordColor)
  }
}

export function writeClSheetStyle(sheet: ClSheetData, style: ClSheetStyle): void {
  sheet.data = { ...(sheet.data ?? {}), style: { ...style } }
}

/**
 * 弹唱谱顶部展示的曲谱（如节奏型），存 data.embeddedScore。
 * 添加时整份复制曲谱数据，原曲谱之后被修改或删除都不影响弹唱谱
 */
export type ClSheetEmbeddedScore = {
  score: MusicScore | null
  /** 添加时的曲谱名 */
  name: string
  /** 展示区高度（px） */
  height: number
  /** 曲谱缩放 */
  scale: number
  /** 和弦图只画和弦名，不画指法框 */
  onlyChordName: boolean
}

export const CL_SHEET_EMBEDDED_HEIGHT_RANGE = { min: 60, max: 600 } as const
export const CL_SHEET_EMBEDDED_SCALE_RANGE = { min: 0.3, max: 1.5 } as const

export const DEFAULT_CL_SHEET_EMBEDDED_SCORE: ClSheetEmbeddedScore = {
  score: null,
  name: '',
  height: 140,
  scale: 0.6,
  onlyChordName: false
}

function clamp(value: number, range: { min: number; max: number }): number {
  return Math.min(range.max, Math.max(range.min, value))
}

export function readClSheetEmbeddedScore(sheet: ClSheetData): ClSheetEmbeddedScore {
  const raw = (sheet.data?.embeddedScore ?? {}) as Partial<
    Record<keyof ClSheetEmbeddedScore, unknown>
  >
  const score = raw.score
  return {
    score:
      score && typeof score === 'object' && !Array.isArray(score) ? (score as MusicScore) : null,
    name: typeof raw.name === 'string' ? raw.name : '',
    height: clamp(
      pickNumber(raw.height, DEFAULT_CL_SHEET_EMBEDDED_SCORE.height),
      CL_SHEET_EMBEDDED_HEIGHT_RANGE
    ),
    scale: clamp(
      pickNumber(raw.scale, DEFAULT_CL_SHEET_EMBEDDED_SCORE.scale),
      CL_SHEET_EMBEDDED_SCALE_RANGE
    ),
    onlyChordName:
      typeof raw.onlyChordName === 'boolean'
        ? raw.onlyChordName
        : DEFAULT_CL_SHEET_EMBEDDED_SCORE.onlyChordName
  }
}

export function writeClSheetEmbeddedScore(
  sheet: ClSheetData,
  embedded: ClSheetEmbeddedScore
): void {
  sheet.data = { ...(sheet.data ?? {}), embeddedScore: { ...embedded } }
}

/** 标题下方的描述（如「1=C 4/4」），存 data.description */
export function readClSheetDescription(sheet: ClSheetData): string {
  const raw = sheet.data?.description
  return typeof raw === 'string' ? raw : ''
}

export function writeClSheetDescription(sheet: ClSheetData, description: string): void {
  sheet.data = { ...(sheet.data ?? {}), description }
}

/** 读出曲谱并复制一份；不存在或不是普通曲谱时返回 null */
export async function copyScoreForClSheet(
  scoreId: number | string
): Promise<{ score: MusicScore; name: string } | null> {
  const record = await loadScoreFromDatabase(scoreId)
  if (!record?.data || isClSheetRecord(record)) return null
  return { score: parseScoreJson(record.data), name: record.name }
}

export function createEmptyClSheet(): ClSheetData {
  return createClSheet({
    width: DEFAULT_CL_SHEET_WIDTH,
    height: 600,
    fontFamily: '',
    data: {
      style: { ...DEFAULT_CL_SHEET_STYLE },
      embeddedScore: { ...DEFAULT_CL_SHEET_EMBEDDED_SCORE }
    }
  })
}

export function parseClSheetJson(raw: string): ClSheetData {
  return normalizeClSheet(JSON.parse(raw))
}

function normalizeClSheet(parsed: unknown): ClSheetData {
  if (!parsed || typeof parsed !== 'object' || !Array.isArray((parsed as ClSheetData).lyrics)) {
    throw new Error('无效的和弦弹唱谱数据')
  }
  const sheet = parsed as ClSheetData
  return createClSheet({
    ...sheet,
    title: typeof sheet.title === 'string' ? sheet.title : '',
    author: typeof sheet.author === 'string' ? sheet.author : '',
    width: pickNumber(sheet.width, DEFAULT_CL_SHEET_WIDTH),
    height: pickNumber(sheet.height, 600),
    data: sheet.data && typeof sheet.data === 'object' ? sheet.data : {}
  })
}

export function serializeClSheet(sheet: ClSheetData): string {
  return JSON.stringify(toRaw(sheet))
}

export function resolveClSheetName(sheet: ClSheetData): string {
  return sheet.title.trim() || i18n.global.t('clSheet.untitled')
}

export async function saveClSheetToDatabase(
  sheet: ClSheetData,
  scoreId?: number | string | null
): Promise<ScoreRecord> {
  const payload = {
    name: resolveClSheetName(sheet),
    data: serializeClSheet(sheet)
  }

  const res = scoreId
    ? await window.api.score.update(scoreId, payload)
    : await window.api.score.create({ ...payload, type: 'cl_sheet' })
  if (!res.success || !res.data) {
    throw new Error('和弦弹唱谱保存失败')
  }
  return res.data as ScoreRecord
}

/** 导出文件的外壳：format 用来认出是解熵的和弦弹唱谱 */
const CL_SHEET_FILE_FORMAT = 'jieshang-cl-sheet'
const CL_SHEET_FILE_VERSION = 1

type ClSheetFile = {
  format: typeof CL_SHEET_FILE_FORMAT
  version: number
  sheet: ClSheetData
}

function isClSheetFile(value: unknown): value is ClSheetFile {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as ClSheetFile).format === CL_SHEET_FILE_FORMAT
  )
}

/** 解析导入的 .json：带外壳的导出文件，或直接是 ClSheetData */
export function parseClSheetFile(raw: string): ClSheetData {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error(i18n.global.t('clSheet.file.invalid'))
  }
  try {
    return normalizeClSheet(isClSheetFile(parsed) ? parsed.sheet : parsed)
  } catch {
    throw new Error(i18n.global.t('clSheet.file.invalid'))
  }
}

export function serializeClSheetFile(sheet: ClSheetData): string {
  const file: ClSheetFile = {
    format: CL_SHEET_FILE_FORMAT,
    version: CL_SHEET_FILE_VERSION,
    sheet: toRaw(sheet)
  }
  return JSON.stringify(file, null, 2)
}

export async function importClSheetFromDisk(): Promise<{
  sheet: ClSheetData
  fileName: string
} | null> {
  const result = await window.api.file.importClSheet()
  if (result.canceled || !result.content) return null
  return {
    sheet: parseClSheetFile(result.content),
    fileName: result.fileName ?? 'imported.json'
  }
}

export async function exportClSheetToDisk(sheet: ClSheetData): Promise<boolean> {
  const result = await window.api.file.exportClSheet(
    serializeClSheetFile(sheet),
    resolveClSheetName(sheet)
  )
  return !result.canceled
}

/** 记录不存在或不是和弦弹唱谱时返回 null */
export async function loadClSheetFromDatabase(
  scoreId: number | string
): Promise<ClSheetData | null> {
  const res = await window.api.score.get(scoreId)
  const record = res.success ? (res.data as ScoreRecord | null) : null
  if (!record?.data || record.type !== 'cl_sheet') return null
  return parseClSheetJson(record.data)
}
