import type { GameDifficulty } from '@renderer/constant/gameSettings'

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
