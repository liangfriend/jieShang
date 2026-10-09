import type { MusicScore } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import { toRaw } from 'vue'
import { readTitleField } from '@deciphony/extensions/dr-title'
import {
  getXmlJson,
  musicScoreToXml,
  xmlToMusicScore,
  type MusicXmlExportTarget
} from '@deciphony/extensions/dr-musicxml-transfer'
import { midiFileToMusicScore, musicScoreToMidi } from '@deciphony/extensions/dr-midi-transfer'
import { DEFAULT_SCORE_GD_SLOT_H, DEFAULT_SCORE_T_SLOT_H } from '@renderer/utils/scoreGdSlotHeight'
import { convertScoreNotationType } from '@renderer/utils/scoreNotationTransfer'

/** 与编辑器新建模板一致的谱面宽度 */
const EDITOR_SCORE_WIDTH = 800

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

export type MusicXmlImportResult = {
  canceled: boolean
  filePath?: string
  fileName?: string
  content?: string
}

export type MusicXmlExportResult = {
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

export async function importMusicXmlFromDisk(): Promise<{
  musicScore: MusicScore
  fileName: string
} | null> {
  const result = (await window.api.file.importMusicXml()) as MusicXmlImportResult
  if (result.canceled || !result.content) return null

  const fileName = result.fileName ?? 'imported.musicxml'
  const file = new File([result.content], fileName, {
    type: 'application/vnd.recordare.musicxml+xml'
  })
  const xmlJson = await getXmlJson(file)
  if (!xmlJson) return null

  return {
    musicScore: xmlToMusicScore(xmlJson),
    fileName
  }
}

/** 将谱子转为 MusicXML 并通过另存为对话框写入磁盘；target 默认 ms4（4.0），ms3 为 3.1 给 MuseScore 3 */
export async function exportMusicXmlToDisk(
  musicScore: MusicScore,
  target: MusicXmlExportTarget = 'ms4'
): Promise<boolean> {
  // musicScoreToXml 只认线谱音符，且算音高时不读调号；简谱转成 C 调线谱，让升降号都显式写出
  const raw = toRaw(musicScore)
  const exportScore =
    raw.type === MusicScoreTypeEnum.NumberNotation
      ? convertScoreNotationType(raw, MusicScoreTypeEnum.StandardStaff)
      : raw
  const xmlFile = musicScoreToXml(exportScore, { target })
  if (!xmlFile?.size) {
    throw new Error('MusicXML 导出失败：生成的文件为空')
  }

  const content = await xmlFile.text()
  const defaultName = resolveScoreName(musicScore)
  const result = (await window.api.file.exportMusicXml(content, defaultName)) as MusicXmlExportResult
  return !result.canceled
}

/** 读取 .mid 并转为五线谱；warnings 为量化 / 变速等被舍弃信息 */
export async function importMidiFromDisk(): Promise<{
  musicScore: MusicScore
  fileName: string
  warnings: string[]
} | null> {
  const result = await window.api.file.importMidi()
  if (result.canceled || !result.content?.byteLength) return null

  const fileName = result.fileName ?? 'imported.mid'
  const file = new File([result.content as BlobPart], fileName, { type: 'audio/midi' })
  const { musicScore, warnings } = await midiFileToMusicScore(file, { width: EDITOR_SCORE_WIDTH })
  // 库只按谱表间距估算高度，不含本应用的标题区（t）和每行歌词区（g-d），不补会截掉末尾几行
  musicScore.height +=
    DEFAULT_SCORE_T_SLOT_H + musicScore.grandStaffs.length * DEFAULT_SCORE_GD_SLOT_H
  return { musicScore, fileName, warnings }
}

/** 将谱子转为 MIDI 并通过另存为对话框写入磁盘 */
export async function exportMidiToDisk(musicScore: MusicScore): Promise<boolean> {
  const bytes = musicScoreToMidi(toRaw(musicScore))
  if (!bytes.byteLength) {
    throw new Error('MIDI 导出失败：生成的文件为空')
  }
  const result = await window.api.file.exportMidi(bytes, resolveScoreName(musicScore))
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

export async function deleteScoreFromDatabase(scoreId: number | string): Promise<void> {
  const res = await window.api.score.delete(scoreId)
  if (!res.success) {
    throw new Error('曲谱删除失败')
  }
}
