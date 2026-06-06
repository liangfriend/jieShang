import type { MusicScore } from 'deciphony-renderer'
import { toRaw } from 'vue'
import { readTitleField } from '@renderer/dr-extensions/dr-title/titleFields'

export type SjImportResult = {
  canceled: boolean
  filePath?: string
  fileName?: string
  content?: string
}

export type SjExportResult = {
  canceled: boolean
  filePath?: string
}

export type ScoreListItem = {
  id: number
  name: string
  thumbnail?: string | null
  created_at?: string
  updated_at?: string
}

export type ScoreRecord = {
  id: number
  name: string
  data: string
  thumbnail?: string | null
}

export function displayScoreName(name?: string | null): string {
  const trimmed = name?.trim()
  return trimmed ? trimmed : '？'
}

export async function searchScoresFromDatabase(keyword = ''): Promise<ScoreListItem[]> {
  const res = await window.api.score.searchByName(keyword)
  if (!res.success || !Array.isArray(res.data)) return []
  return res.data as ScoreListItem[]
}

export function serializeScore(musicScore: MusicScore): string {
  return JSON.stringify(toRaw(musicScore))
}

export function parseScoreJson(raw: string): MusicScore {
  const parsed: unknown = JSON.parse(raw)
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('无效的 SJ 曲谱文件')
  }
  return parsed as MusicScore
}

export function resolveScoreName(musicScore: MusicScore): string {
  return readTitleField(musicScore, 'title').trim() || '未命名曲谱'
}

export async function importSjFromDisk(): Promise<{
  musicScore: MusicScore
  fileName: string
} | null> {
  const result = (await window.api.file.importSj()) as SjImportResult
  if (result.canceled || !result.content) return null

  return {
    musicScore: parseScoreJson(result.content),
    fileName: result.fileName ?? 'imported.sj'
  }
}

export async function exportSjToDisk(musicScore: MusicScore): Promise<boolean> {
  const content = serializeScore(musicScore)
  const defaultName = resolveScoreName(musicScore)
  const result = (await window.api.file.exportSj(content, defaultName)) as SjExportResult
  return !result.canceled
}

export async function saveScoreToDatabase(
  musicScore: MusicScore,
  scoreId?: number | string | null
): Promise<ScoreRecord> {
  const payload = {
    name: resolveScoreName(musicScore),
    data: serializeScore(musicScore)
  }

  if (scoreId) {
    const res = await window.api.score.update(scoreId, payload)
    if (!res.success || !res.data) {
      throw new Error('曲谱保存失败')
    }
    return res.data as ScoreRecord
  }

  const res = await window.api.score.create(payload)
  if (!res.success || !res.data) {
    throw new Error('曲谱保存失败')
  }
  return res.data as ScoreRecord
}

export async function loadScoreFromDatabase(scoreId: number | string): Promise<ScoreRecord | null> {
  const res = await window.api.score.get(scoreId)
  if (!res.success || !res.data) return null
  return res.data as ScoreRecord
}
