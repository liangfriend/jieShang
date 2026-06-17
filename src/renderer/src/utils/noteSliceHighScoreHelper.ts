import type { GameDifficulty } from '@renderer/constant/gameSettings'
import { formatNoteSliceExtremeElapsed } from '@renderer/views/noteSlice/noteSliceGameMode'
import type { NoteSliceGameMode } from '@renderer/views/noteSlice/noteSliceGameMode'

export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

export type NoteSliceHighScoreRecord = {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  high_score: number
  created_at?: string
  updated_at?: string
}

export const NOTE_SLICE_HIGH_SCORE_MODES: NoteSliceHighScoreMode[] = ['arcade', 'endless', 'extreme']

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

/** 读取指定模式在当前难度下的历史最佳（极限模式忽略难度） */
export async function fetchNoteSliceModeBestScore(
  mode: NoteSliceGameMode,
  difficulty?: GameDifficulty
): Promise<number> {
  const records = await fetchNoteSliceHighScores()
  if (mode === 'extreme') {
    return resolveExtremeHighScore(records)
  }
  if (!difficulty || !isRankedDifficulty(difficulty)) return 0
  const hit = records.find((record) => record.mode === mode && record.difficulty === difficulty)
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
  score: number
): Promise<void> {
  if (!isRankedDifficulty(difficulty)) return
  await window.api.noteSliceHighScore.upsertIfHigher(mode, difficulty, score)
}

/** 极限模式存活时间入榜（不受首页难度设置影响） */
export async function upsertNoteSliceExtremeHighScoreIfHigher(survivalMs: number): Promise<void> {
  await window.api.noteSliceHighScore.upsertIfHigher('extreme', 'standard', survivalMs)
}

/** 一局结束时：先对比历史最佳，再按需写入数据库 */
export async function finalizeNoteSliceGameScore(
  mode: NoteSliceGameMode,
  score: number,
  difficulty?: GameDifficulty
): Promise<{ isNewPersonalBest: boolean; previousBest: number }> {
  const normalizedScore = Math.max(0, Math.floor(score))
  const previousBest = await fetchNoteSliceModeBestScore(mode, difficulty)

  if (mode === 'extreme') {
    const isNewPersonalBest = normalizedScore > previousBest
    if (isNewPersonalBest) {
      await upsertNoteSliceExtremeHighScoreIfHigher(normalizedScore)
    }
    return { isNewPersonalBest, previousBest }
  }

  if (!difficulty || !isRankedDifficulty(difficulty)) {
    return { isNewPersonalBest: false, previousBest: 0 }
  }

  const isNewPersonalBest = normalizedScore > previousBest
  if (isNewPersonalBest) {
    await upsertNoteSliceHighScoreIfHigher(mode, difficulty, normalizedScore)
  }
  return { isNewPersonalBest, previousBest }
}

/** @deprecated 使用 finalizeNoteSliceGameScore */
export async function persistNoteSliceGameScore(
  mode: NoteSliceGameMode,
  score: number,
  difficulty?: GameDifficulty
): Promise<void> {
  await finalizeNoteSliceGameScore(mode, score, difficulty)
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

function resolveExtremeHighScore(records: readonly NoteSliceHighScoreRecord[]): number {
  const extremeRecords = records.filter((record) => record.mode === 'extreme')
  if (extremeRecords.length === 0) return 0
  return Math.max(...extremeRecords.map((record) => record.high_score))
}

export function buildNoteSliceHighScoreMatrix(
  records: readonly NoteSliceHighScoreRecord[]
): NoteSliceHighScoreMatrixRow[] {
  const scoreMap = new Map(
    records.map((record) => [`${record.mode}:${record.difficulty}`, record.high_score] as const)
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
      singleScore: resolveExtremeHighScore(records)
    }
  ]
}
