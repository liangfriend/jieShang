import type { MusicScore } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import type { RouteLocationNormalized, RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import emptyTemplate from '@renderer/template/empty'
import buildEmptyJianpuScore from '@renderer/template/emptyJianpu'
import singleVoiceTemplate from '@renderer/template/singleVoice'
import buildSingleVoiceJianpuScore from '@renderer/template/singleVoiceJianpu'
import doubleVoiceTemplate from '@renderer/template/doubleVoice'
import buildDoubleVoiceJianpuScore from '@renderer/template/doubleVoiceJianpu'
import singleVoiceTab6Template from '@renderer/template/singleVoiceTab6'
import singleVoiceTab4Template from '@renderer/template/singleVoiceTab4'
import singleVoiceBass4Template from '@renderer/template/singleVoiceBass4'
import singleVoiceBass5Template from '@renderer/template/singleVoiceBass5'
import singleVoiceBass6Template from '@renderer/template/singleVoiceBass6'
import singleVoiceDrumTemplate from '@renderer/template/singleVoiceDrum'
import { hasGrandStaffSingleStaffMismatch } from '@deciphony/extensions/score-util'
import i18n from '@renderer/i18n'
import { useDataStore } from '@renderer/store/data.store'
import { loadScoreFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper'
import { CUR_PLAY_SCORE_TEMP_ID, EDIT_NEW_SCORE_TEMP_ID } from '@renderer/constant'
import {
  applyScoreStaffSpacing,
  ensureScoreSlotHeights,
  loadScoreLayoutDefaults
} from '@renderer/utils/scoreSpacingDefaults'
import { isPlayOnlyMusicScore } from '@renderer/utils/isTabNotation'
import {
  DEFAULT_SCORE_S_L_SLOT_W,
  DEFAULT_SCORE_S_R_SLOT_W,
  DEFAULT_SCORE_T_SLOT_H
} from '@renderer/utils/scoreGdSlotHeight'

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
  | 'singleVoiceTab6'
  | 'singleVoiceTab4'
  | 'singleVoiceBass4'
  | 'singleVoiceBass5'
  | 'singleVoiceBass6'
  | 'singleVoiceDrum'

const TEMPLATE_LOADERS: Record<ScoreTemplateKey, () => MusicScore> = {
  empty: () => cloneTemplateWithSpacingDefaults(emptyTemplate),
  singleVoice: () => cloneTemplateWithSpacingDefaults(singleVoiceTemplate),
  DoubleVoice: () => cloneTemplateWithSpacingDefaults(doubleVoiceTemplate),
  emptyJianpu: () => cloneTemplateWithSpacingDefaults(buildEmptyJianpuScore()),
  singleVoiceJianpu: () => cloneTemplateWithSpacingDefaults(buildSingleVoiceJianpuScore()),
  doubleVoiceJianpu: () => cloneTemplateWithSpacingDefaults(buildDoubleVoiceJianpuScore()),
  singleVoiceTab6: () => cloneTemplateWithSpacingDefaults(singleVoiceTab6Template),
  singleVoiceTab4: () => cloneTemplateWithSpacingDefaults(singleVoiceTab4Template),
  singleVoiceBass4: () => cloneTemplateWithSpacingDefaults(singleVoiceBass4Template),
  singleVoiceBass5: () => cloneTemplateWithSpacingDefaults(singleVoiceBass5Template),
  singleVoiceBass6: () => cloneTemplateWithSpacingDefaults(singleVoiceBass6Template),
  singleVoiceDrum: () => cloneTemplateWithSpacingDefaults(singleVoiceDrumTemplate)
}

function stripNumberNotationMeasureHeaders(score: MusicScore): void {
  if (score.type !== MusicScoreTypeEnum.NumberNotation) return
  for (const grandStaff of score.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      for (const measure of staff.measures ?? []) {
        delete measure.clef_f
        delete measure.clef_b
        delete measure.keySignature_f
        delete measure.keySignature_b
        delete measure.timeSignature_f
        delete measure.timeSignature_b
      }
    }
  }
}

function cloneTemplateWithSpacingDefaults(template: MusicScore): MusicScore {
  const score = JSON.parse(JSON.stringify(template)) as MusicScore
  const layout = loadScoreLayoutDefaults()
  applyScoreStaffSpacing(score, layout)
  ensureScoreSlotHeights(score, layout)
  stripNumberNotationMeasureHeaders(score)
  return score
}

export const HOME_TEMPLATE_TO_ROUTE: Record<string, ScoreTemplateKey> = {
  empty: 'empty',
  single: 'singleVoice',
  double: 'DoubleVoice',
  jianpuEmpty: 'emptyJianpu',
  jianpuSingle: 'singleVoiceJianpu',
  jianpuDouble: 'doubleVoiceJianpu',
  guitarTab: 'singleVoiceTab6',
  ukuleleTab: 'singleVoiceTab4',
  bass4Tab: 'singleVoiceBass4',
  bass5Tab: 'singleVoiceBass5',
  bass6Tab: 'singleVoiceBass6',
  drum: 'singleVoiceDrum'
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

/** 编辑器首屏同步初始化（tempId 缓存 / template），与 temp 缓存同一引用以便就地编辑 */
export function initEditorScoreFromRoute(route: RouteLocationNormalizedLoaded): MusicScore {
  const dataStore = useDataStore()
  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempScore(tempId)
    if (cached) {
      ensureScoreSlotHeights(cached)
      return cached
    }
  }
  if (hasTemplateQuery(route)) {
    const template = resolveTemplateKey(route.query.template)
    const score = TEMPLATE_LOADERS[template]()
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
    return score
  }
  const score = cloneTemplateWithSpacingDefaults(emptyTemplate)
  dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
  return score
}

/** 编辑页当前绑定的 tempId */
export function resolveEditorTempId(route: RouteLocationNormalizedLoaded): string {
  const tempId = resolveTempId(route.query.tempId)
  if (tempId) return tempId
  if (resolveScoreId(route.query.scoreId)) return CUR_PLAY_SCORE_TEMP_ID
  return EDIT_NEW_SCORE_TEMP_ID
}

/** 将导入/转换结果写入已有曲谱对象，保持与 temp 缓存同一引用 */
export function applyMusicScoreInPlace(target: MusicScore, source: MusicScore): void {
  const next = JSON.parse(JSON.stringify(source)) as MusicScore
  for (const key of Object.keys(target)) {
    if (!(key in next)) {
      delete (target as Record<string, unknown>)[key]
    }
  }
  Object.assign(target, next)
  ensureScoreSlotHeights(target)
}

/** 按路由 query 加载曲谱，见文件顶部路由规则表 */
export async function loadScoreFromRoute(
  route: RouteLocationNormalizedLoaded
): Promise<MusicScore | null> {
  const dataStore = useDataStore()

  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempScore(tempId)
    if (cached) {
      ensureScoreSlotHeights(cached)
      return cached
    }
  }

  const scoreId = resolveScoreId(route.query.scoreId)
  if (scoreId) {
    const record = await loadScoreFromDatabase(scoreId)
    if (!record?.data) {
      ElMessage.error(i18n.global.t('common.scoreLoadFailed'))
      return null
    }
    const score = parseScoreJson(record.data)
    ensureScoreSlotHeights(score)
    dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, score)
    return dataStore.getTempScore(CUR_PLAY_SCORE_TEMP_ID) ?? score
  }

  if (hasTemplateQuery(route)) {
    const template = resolveTemplateKey(route.query.template)
    const score = TEMPLATE_LOADERS[template]()
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
    return dataStore.getTempScore(EDIT_NEW_SCORE_TEMP_ID) ?? null
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

/** 练习/新手/演唱模式入口：各 grandStaff 单谱表行数须一致；吉他/尤克里里/贝斯/鼓谱本期不可进 */
export async function guardSingleLineModeEnter(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) {
  const score = await loadScoreFromRoute(to)
  if (!score) return true

  if (isPlayOnlyMusicScore(score)) {
    ElMessage.warning(i18n.global.t('play.messages.playOnlyModeUnavailable'))
    if (from.name === 'play') return false
    return { name: 'play', query: buildScoreRouteQuery(to) }
  }

  if (hasGrandStaffSingleStaffMismatch(score)) {
    ElMessage.warning(i18n.global.t('play.messages.grandStaffMismatch'))
    if (from.name === 'play') return false
    return { name: 'play', query: buildScoreRouteQuery(to) }
  }

  return true
}

export const SCORE_SLOT_CONFIG = {
  'g-l': { w: 0 },
  // s-l / s-r 宽度、g-d / t 高度由 createScoreLyricsExtension 按 musicScore.data 覆盖；此处为静态回退
  's-l': { w: DEFAULT_SCORE_S_L_SLOT_W },
  's-r': { w: DEFAULT_SCORE_S_R_SLOT_W },
  's-d': { h: 0 },
  t: { h: DEFAULT_SCORE_T_SLOT_H }
} as const
