import type { MusicScore } from 'deciphony-renderer'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import emptyTemplate from '@renderer/template/empty'
import { loadScoreFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper'

export type ScoreTemplateKey = 'empty' | 'singleVoice' | 'DoubleVoice'

const TEMPLATE_LOADERS: Record<ScoreTemplateKey, () => MusicScore> = {
  empty: () => JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore,
  singleVoice: () => JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore,
  DoubleVoice: () => JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore
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

export function resolveTemplateKey(raw: unknown): ScoreTemplateKey {
  const key = Array.isArray(raw) ? raw[0] : raw
  if (key === 'singleVoice' || key === 'DoubleVoice') return key
  return 'empty'
}

export function loadScoreTemplate(template: ScoreTemplateKey): MusicScore {
  return TEMPLATE_LOADERS[template]()
}
// TODO 这里还要判断route.template
export async function loadScoreFromRoute(
  route: RouteLocationNormalizedLoaded
): Promise<MusicScore | null> {
  const scoreId = resolveScoreId(route.query.scoreId)
  if (!scoreId) return null

  const record = await loadScoreFromDatabase(scoreId)
  if (!record?.data) {
    ElMessage.error('曲谱加载失败')
    return null
  }
  return parseScoreJson(record.data)
}

export function buildScoreRouteQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const scoreId = resolveScoreId(route.query.scoreId)
  if (scoreId) {
    return { scoreId }
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
