import {
  DEFAULT_GAME_NOTATION_MODE,
  type GameDifficulty,
  type GameNotationMode
} from '@renderer/constant/gameSettings'
import { formatNoteSliceExtremeElapsed } from '@renderer/views/noteSlice/noteSliceGameMode'
import type { NoteSliceGameMode } from '@renderer/views/noteSlice/noteSliceGameMode'

export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

/** 谱面模式维度：线谱 / 简谱；最高分按 (mode, difficulty, notation) 分开记录 */
export type NoteSliceHighScoreNotation = GameNotationMode

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  /** 旧库迁移前的记录在 002 迁移中统一补为 'staff'；前端仍做兜底 */
  notation?: NoteSliceHighScoreNotation
  high_score: number
  created_at?: string
  updated_at?: string
}

export const NOTE_SLICE_HIGH_SCORE_MODES: NoteSliceHighScoreMode[] = ['arcade', 'endless', 'extreme']

export const NOTE_SLICE_HIGH_SCORE_NOTATIONS: NoteSliceHighScoreNotation[] = ['staff', 'jianpu']

export const NOTE_SLICE_HIGH_SCORE_NOTATION_LABELS: Record<NoteSliceHighScoreNotation, string> = {
  staff: '线谱',
  jianpu: '简谱'
}

function resolveRecordNotation(record: NoteSliceHighScoreRecord): NoteSliceHighScoreNotation {
  return record.notation === 'jianpu' ? 'jianpu' : DEFAULT_GAME_NOTATION_MODE
}

export const NOTE_SLICE_HIGH_SCORE_DIFFICULTIES: NoteSliceHighScoreDifficulty[] = [
  'easy',
  'standard',
  'hard'
]

export const NOTE_SLICE_HIGH_SCORE_MODE_LABELS: Record<NoteSliceHighScoreMode, string> = {
  arcade: '街机模式',
  endless: '无限模式',
  extreme: '极限模式'
}

export const NOTE_SLICE_HIGH_SCORE_DIFFICULTY_LABELS: Record<NoteSliceHighScoreDifficulty, string> =
  {
    easy: '简单',
    standard: '标准',
    hard: '困难'
  }

function parseHighScoreList(res: unknown): NoteSliceHighScoreRecord[] {
  if (!res || typeof res !== 'object') return []
  const payload = res as { success?: boolean; data?: unknown }
  if (!payload.success || !Array.isArray(payload.data)) return []
  return payload.data as NoteSliceHighScoreRecord[]
}

export async function fetchNoteSliceHighScores(): Promise<NoteSliceHighScoreRecord[]> {
  const res = await window.api.noteSliceHighScore.list()
  return parseHighScoreList(res)
}

/** 读取指定模式在当前难度 + 谱面模式下的历史最佳（极限模式忽略难度，但仍区分谱面模式） */
export async function fetchNoteSliceModeBestScore(
  mode: NoteSliceGameMode,
  difficulty?: GameDifficulty,
  notation: NoteSliceHighScoreNotation = DEFAULT_GAME_NOTATION_MODE
): Promise<number> {
  const records = await fetchNoteSliceHighScores()
  if (mode === 'extreme') {
    return resolveExtremeHighScore(records, notation)
  }
  if (!difficulty || !isRankedDifficulty(difficulty)) return 0
  const hit = records.find(
    (record) =>
      record.mode === mode &&
      record.difficulty === difficulty &&
      resolveRecordNotation(record) === notation
  )
  return hit?.high_score ?? 0
}

function isRankedDifficulty(
  difficulty: GameDifficulty
): difficulty is NoteSliceHighScoreDifficulty {
  return difficulty === 'easy' || difficulty === 'standard' || difficulty === 'hard'
}

export async function upsertNoteSliceHighScoreIfHigher(
  mode: NoteSliceHighScoreMode,
  difficulty: GameDifficulty,
  score: number,
  notation: NoteSliceHighScoreNotation = DEFAULT_GAME_NOTATION_MODE
): Promise<void> {
  if (!isRankedDifficulty(difficulty)) return
  await window.api.noteSliceHighScore.upsertIfHigher(mode, difficulty, score, notation)
}

/** 极限模式存活时间入榜（不受首页难度设置影响，但区分线谱 / 简谱） */
export async function upsertNoteSliceExtremeHighScoreIfHigher(
  survivalMs: number,
  notation: NoteSliceHighScoreNotation = DEFAULT_GAME_NOTATION_MODE
): Promise<void> {
  await window.api.noteSliceHighScore.upsertIfHigher('extreme', 'standard', survivalMs, notation)
}

/**
 * 一局结束时：先对比历史最佳，再按需写入数据库。
 * notation 为本局谱面模式（线谱 / 简谱），最高分按此维度分开记录；成就判定不在此处、与谱面模式无关。
 */
export async function finalizeNoteSliceGameScore(
  mode: NoteSliceGameMode,
  score: number,
  difficulty?: GameDifficulty,
  notation: NoteSliceHighScoreNotation = DEFAULT_GAME_NOTATION_MODE
): Promise<{ isNewPersonalBest: boolean; previousBest: number }> {
  const normalizedScore = Math.max(0, Math.floor(score))
  const previousBest = await fetchNoteSliceModeBestScore(mode, difficulty, notation)

  if (mode === 'extreme') {
    const isNewPersonalBest = normalizedScore > previousBest
    if (isNewPersonalBest) {
      await upsertNoteSliceExtremeHighScoreIfHigher(normalizedScore, notation)
    }
    return { isNewPersonalBest, previousBest }
  }

  if (!difficulty || !isRankedDifficulty(difficulty)) {
    return { isNewPersonalBest: false, previousBest: 0 }
  }

  const isNewPersonalBest = normalizedScore > previousBest
  if (isNewPersonalBest) {
    await upsertNoteSliceHighScoreIfHigher(mode, difficulty, normalizedScore, notation)
  }
  return { isNewPersonalBest, previousBest }
}

/** @deprecated 使用 finalizeNoteSliceGameScore */
export async function persistNoteSliceGameScore(
  mode: NoteSliceGameMode,
  score: number,
  difficulty?: GameDifficulty,
  notation?: NoteSliceHighScoreNotation
): Promise<void> {
  await finalizeNoteSliceGameScore(mode, score, difficulty, notation)
}

/** 成就页等展示：极限模式存活时间（ms → 秒.毫秒，如 127.251） */
export function formatNoteSliceExtremeHighScore(survivalMs: number): string {
  return formatNoteSliceExtremeElapsed(survivalMs)
}

export type NoteSliceHighScoreMatrixRow = {
  mode: NoteSliceHighScoreMode
  modeLabel: string
  /** 街机 / 无限：按简单、标准、困难分列 */
  scores?: {
    difficulty: NoteSliceHighScoreDifficulty
    difficultyLabel: string
    high_score: number
  }[]
  /** 极限：单一分数，不受难度设置影响 */
  singleScore?: number
}

/** 成就页「历史最高分」：按谱面模式分组，每组内是 模式 × 难度 矩阵 */
export type NoteSliceHighScoreNotationGroup = {
  notation: NoteSliceHighScoreNotation
  notationLabel: string
  rows: NoteSliceHighScoreMatrixRow[]
}

function resolveExtremeHighScore(
  records: readonly NoteSliceHighScoreRecord[],
  notation: NoteSliceHighScoreNotation
): number {
  const extremeRecords = records.filter(
    (record) => record.mode === 'extreme' && resolveRecordNotation(record) === notation
  )
  if (extremeRecords.length === 0) return 0
  return Math.max(...extremeRecords.map((record) => record.high_score))
}

/** 单一谱面模式下的 模式 × 难度 矩阵 */
export function buildNoteSliceHighScoreMatrix(
  records: readonly NoteSliceHighScoreRecord[],
  notation: NoteSliceHighScoreNotation = DEFAULT_GAME_NOTATION_MODE
): NoteSliceHighScoreMatrixRow[] {
  const scoreMap = new Map(
    records
      .filter((record) => resolveRecordNotation(record) === notation)
      .map((record) => [`${record.mode}:${record.difficulty}`, record.high_score] as const)
  )

  const rankedModes: Array<'arcade' | 'endless'> = ['arcade', 'endless']

  return [
    ...rankedModes.map((mode) => ({
      mode,
      modeLabel: NOTE_SLICE_HIGH_SCORE_MODE_LABELS[mode],
      scores: NOTE_SLICE_HIGH_SCORE_DIFFICULTIES.map((difficulty) => ({
        difficulty,
        difficultyLabel: NOTE_SLICE_HIGH_SCORE_DIFFICULTY_LABELS[difficulty],
        high_score: scoreMap.get(`${mode}:${difficulty}`) ?? 0
      }))
    })),
    {
      mode: 'extreme',
      modeLabel: NOTE_SLICE_HIGH_SCORE_MODE_LABELS.extreme,
      singleScore: resolveExtremeHighScore(records, notation)
    }
  ]
}

/** 线谱 / 简谱两组矩阵（成就页展示用） */
export function buildNoteSliceHighScoreNotationGroups(
  records: readonly NoteSliceHighScoreRecord[]
): NoteSliceHighScoreNotationGroup[] {
  return NOTE_SLICE_HIGH_SCORE_NOTATIONS.map((notation) => ({
    notation,
    notationLabel: NOTE_SLICE_HIGH_SCORE_NOTATION_LABELS[notation],
    rows: buildNoteSliceHighScoreMatrix(records, notation)
  }))
}
