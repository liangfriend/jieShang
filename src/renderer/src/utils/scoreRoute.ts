import type { MusicScore } from 'deciphony-renderer'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import emptyTemplate from '@renderer/template/empty'
import emptyJianpuTemplate from '@renderer/template/emptyJianpu'
import singleVoiceTemplate from '@renderer/template/singleVoice'
import singleVoiceJianpuTemplate from '@renderer/template/singleVoiceJianpu'
import doubleVoiceTemplate from '@renderer/template/doubleVoice'
import doubleVoiceJianpuTemplate from '@renderer/template/doubleVoiceJianpu'
import { useDataStore } from '@renderer/store/data.store'
import { loadScoreFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper'
import { CUR_PLAY_SCORE_TEMP_ID, EDIT_NEW_SCORE_TEMP_ID } from '@renderer/constant'

/**
 * 曲谱页路由 query 规则（edit / play 模式切换与加载）
 *
 * | 当前 query | 模式切换后 query（buildScoreRouteQuery） | 保存行为 |
 * |------------|------------------------------------------|----------|
 * | template   | tempId=editNewScore（去掉 template）     | 新增曲谱 |
 * | scoreId    | scoreId + tempId=curPlayScore            | 更新已有 |
 * | tempId     | 保留 tempId                              | 新增曲谱 |
 * | scoreId + tempId | 保留 scoreId + tempId              | 更新已有 |
 *
 * 加载优先级（loadScoreFromRoute）：tempId 缓存 > scoreId 查库 > template 模版。
 * 同时有 scoreId 与 tempId 时优先用 tempId 对应缓存；查库结果写入 curPlayScore。
 * tempId 常量见 @renderer/constant/score.ts（editNewScore / curPlayScore / curPlayScoreTrans）。
 */

export type ScoreTemplateKey =
  | 'empty'
  | 'singleVoice'
  | 'DoubleVoice'
  | 'emptyJianpu'
  | 'singleVoiceJianpu'
  | 'doubleVoiceJianpu'

const TEMPLATE_LOADERS: Record<ScoreTemplateKey, () => MusicScore> = {
  empty: () => JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore,
  singleVoice: () => JSON.parse(JSON.stringify(singleVoiceTemplate)) as MusicScore,
  DoubleVoice: () => JSON.parse(JSON.stringify(doubleVoiceTemplate)) as MusicScore,
  emptyJianpu: () => JSON.parse(JSON.stringify(emptyJianpuTemplate)) as MusicScore,
  singleVoiceJianpu: () => JSON.parse(JSON.stringify(singleVoiceJianpuTemplate)) as MusicScore,
  doubleVoiceJianpu: () => JSON.parse(JSON.stringify(doubleVoiceJianpuTemplate)) as MusicScore
}

export const HOME_TEMPLATE_TO_ROUTE: Record<string, ScoreTemplateKey> = {
  empty: 'empty',
  single: 'singleVoice',
  double: 'DoubleVoice',
  jianpuEmpty: 'emptyJianpu',
  jianpuSingle: 'singleVoiceJianpu',
  jianpuDouble: 'doubleVoiceJianpu'
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
  if (key && key in TEMPLATE_LOADERS) return key as ScoreTemplateKey
  return 'empty'
}

function hasTemplateQuery(route: RouteLocationNormalizedLoaded): boolean {
  const template = route.query.template
  if (template == null || template === '') return false
  return true
}

/** 编辑器首屏同步初始化（tempId 缓存 / template），保证 useRenderEdit 按正确 type 分发 */
export function initEditorScoreFromRoute(route: RouteLocationNormalizedLoaded): MusicScore {
  const dataStore = useDataStore()
  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempScore(tempId)
    if (cached) return JSON.parse(JSON.stringify(cached)) as MusicScore
  }
  if (hasTemplateQuery(route)) {
    const template = resolveTemplateKey(route.query.template)
    const score = TEMPLATE_LOADERS[template]()
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
    return JSON.parse(JSON.stringify(score)) as MusicScore
  }
  return JSON.parse(JSON.stringify(emptyTemplate)) as MusicScore
}

/** 按路由 query 加载曲谱，见文件顶部路由规则表 */
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
    const score = parseScoreJson(record.data)
    dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, score)
    return dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID) ?? score
  }

  if (hasTemplateQuery(route)) {
    const template = resolveTemplateKey(route.query.template)
    const score = TEMPLATE_LOADERS[template]()
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
    return dataStore.getTempScore(EDIT_NEW_SCORE_TEMP_ID)
  }

  return null
}

/** 编辑/播放模式切换时构造下一页 query，见文件顶部路由规则表 */
export function buildScoreRouteQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const scoreId = resolveScoreId(route.query.scoreId)
  if (scoreId) {
    return {
      scoreId,
      tempId: resolveTempId(route.query.tempId) ?? CUR_PLAY_SCORE_TEMP_ID
    }
  }

  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    return { tempId }
  }

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
