import type { MusicScore } from 'deciphony-renderer'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import emptyTemplate from '@renderer/template/empty'
import singleVoiceTemplate from '@renderer/template/singleVoice'
import doubleVoiceTemplate from '@renderer/template/doubleVoice'
import { useDataStore } from '@renderer/store/data.store'
import { loadScoreFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper'
import { EDIT_NEW_SCORE_TEMP_ID } from '@renderer/constant'

export type ScoreTemplateKey = 'empty' | 'singleVoice' | 'DoubleVoice'

const TEMPLATE_LOADERS: Record<ScoreTemplateKey, () => MusicScore> = {
  empty: () => JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore,
  singleVoice: () => JSON.parse(JSON.stringify(singleVoiceTemplate)) as MusicScore,
  DoubleVoice: () => JSON.parse(JSON.stringify(doubleVoiceTemplate)) as MusicScore
}

export const HOME_TEMPLATE_TO_ROUTE: Record<string, ScoreTemplateKey> = {
  empty: 'empty',
  single: 'singleVoice',
  double: 'DoubleVoice'
}

export function resolveScoreId(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  return Array.isArray(raw) ? raw[0] : String(raw)
}

export function resolveTempId(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  return Array.isArray(raw) ? raw[0] : String(raw)
}

export function resolveTemplateKey(raw: unknown): ScoreTemplateKey {
  const key = Array.isArray(raw) ? raw[0] : raw
  if (key === 'singleVoice' || key === 'DoubleVoice') return key
  return 'empty'
}

function hasTemplateQuery(route: RouteLocationNormalizedLoaded): boolean {
  const template = route.query.template
  if (template == null || template === '') return false
  return true
}

export async function loadScoreFromRoute(
  route: RouteLocationNormalizedLoaded
): Promise<MusicScore | null> {
  const dataStore = useDataStore()

  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempScore(tempId)
    if (cached) return cached
  }

  const scoreId = resolveScoreId(route.query.scoreId)
  if (scoreId) {
    const record = await loadScoreFromDatabase(scoreId)
    if (!record?.data) {
      ElMessage.error('曲谱加载失败')
      return null
    }
    return parseScoreJson(record.data)
  }

  if (hasTemplateQuery(route)) {
    const template = resolveTemplateKey(route.query.template)
    const score = TEMPLATE_LOADERS[template]()
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
    return dataStore.getTempScore(EDIT_NEW_SCORE_TEMP_ID)
  }

  return null
}

export function buildScoreRouteQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const scoreId = resolveScoreId(route.query.scoreId)
  if (scoreId) {
    return { scoreId }
  }

  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    return { tempId }
  }
  // 如果template有值
  if (hasTemplateQuery(route)) {
    return { tempId: EDIT_NEW_SCORE_TEMP_ID }
  }

  return { template: resolveTemplateKey(route.query.template) }
}

export const SCORE_SLOT_CONFIG = {
  'g-r': { w: 50 },
  'g-l': { w: 50 },
  'g-d': { h: 40 },
  's-d': { h: 20 },
  t: { h: 100 }
} as const
