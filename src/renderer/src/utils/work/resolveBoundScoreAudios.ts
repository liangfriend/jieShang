import type { MusicScore } from '@deciphony/renderer'
import {
  displayAudioName,
  fetchAudioAsFile,
  getAudioFromDatabase,
  type AudioListItem
} from '@renderer/utils/fileHelper/audioFile'

export type BoundScoreAudioFile = {
  file: File
  name: string
}

function readBoundAudioId(
  musicScore: MusicScore,
  key: 'vocalPerformanceId' | 'accompanimentId'
): number | null {
  const data = (musicScore as MusicScore & { data?: Record<string, unknown> }).data
  if (!data || typeof data !== 'object') return null
  const raw = data[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

async function toBoundFile(row: AudioListItem | null): Promise<BoundScoreAudioFile | undefined> {
  if (!row) return undefined
  const file = await fetchAudioAsFile(row)
  if (!file) return undefined
  return { file, name: displayAudioName(row.name) }
}

/**
 * 曲谱 data 里若有范唱/伴奏本地音频 id，从数据库取出并转为 File，供 SJWPDF.addScore 写入资源。
 */
export async function resolveBoundScoreAudios(musicScore: MusicScore): Promise<{
  vocalPerformance?: BoundScoreAudioFile
  accompaniment?: BoundScoreAudioFile
}> {
  const vocalId = readBoundAudioId(musicScore, 'vocalPerformanceId')
  const accompId = readBoundAudioId(musicScore, 'accompanimentId')

  const [vocalRow, accompRow] = await Promise.all([
    vocalId != null ? getAudioFromDatabase(vocalId) : Promise.resolve(null),
    accompId != null ? getAudioFromDatabase(accompId) : Promise.resolve(null)
  ])

  const [vocalPerformance, accompaniment] = await Promise.all([
    toBoundFile(vocalRow),
    toBoundFile(accompRow)
  ])

  return {
    ...(vocalPerformance ? { vocalPerformance } : {}),
    ...(accompaniment ? { accompaniment } : {})
  }
}
