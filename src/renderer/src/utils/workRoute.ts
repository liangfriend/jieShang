import type { SJW } from '@deciphony/work'
import { createEmptyPage } from '@deciphony/work'
import type { RouteLocationNormalizedLoaded } from 'vue-router'
import { ElMessage } from 'element-plus'
import i18n from '@renderer/i18n'
import { CUR_SHOW_WORK_TEMP_ID, EDIT_NEW_WORK_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import {
  createEmptyWork,
  loadSjwFromWorkUrl,
  loadWorkFromDatabase,
  type WorkRecord
} from '@renderer/utils/fileHelper/workFile'

/**
 * 作品页路由 query 规则（work-edit / work-show）
 *
 * | 当前 query | 模式切换后 | 保存行为 |
 * |------------|------------|----------|
 * | 无 / 仅新建 | tempId=editNewWork | 新增 |
 * | workId | workId + tempId=curShowWork | 更新 |
 * | tempId | 保留 tempId | 新增 |
 * | workId + tempId | 保留两者 | 更新 |
 *
 * 加载：tempId 缓存 > workId 查库 > 空作品。
 */

export function resolveWorkId(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  return Array.isArray(raw) ? raw[0] : String(raw)
}

export function resolveWorkTempId(raw: unknown): string | null {
  if (raw == null || raw === '') return null
  return Array.isArray(raw) ? raw[0] : String(raw)
}

export function applySjwInPlace(target: SJW, source: SJW): void {
  const next = structuredClone(source) as SJW
  for (const key of Object.keys(target)) {
    if (!(key in next)) {
      delete (target as Record<string, unknown>)[key]
    }
  }
  Object.assign(target, next)
}

/** 编辑页首屏同步初始化 */
export function initWorkFromRoute(route: RouteLocationNormalizedLoaded): SJW {
  const dataStore = useDataStore()
  const tempId = resolveWorkTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempWork(tempId)
    if (cached) return cached
  }
  const work = createEmptyWork()
  dataStore.setTempWork(EDIT_NEW_WORK_TEMP_ID, work)
  return work
}

export function resolveEditorWorkTempId(route: RouteLocationNormalizedLoaded): string {
  const tempId = resolveWorkTempId(route.query.tempId)
  if (tempId) return tempId
  if (resolveWorkId(route.query.workId)) return CUR_SHOW_WORK_TEMP_ID
  return EDIT_NEW_WORK_TEMP_ID
}

export async function loadWorkFromRoute(route: RouteLocationNormalizedLoaded): Promise<{
  work: SJW
  blob: Blob | null
  record: WorkRecord | null
} | null> {
  const dataStore = useDataStore()

  const tempId = resolveWorkTempId(route.query.tempId)
  if (tempId) {
    const cached = dataStore.getTempWork(tempId)
    if (cached) {
      return {
        work: cached,
        blob: dataStore.getTempWorkBlob(tempId) ?? null,
        record: null
      }
    }
  }

  const workId = resolveWorkId(route.query.workId)
  if (workId) {
    const record = await loadWorkFromDatabase(workId)
    if (!record?.url) {
      ElMessage.error(i18n.global.t('common.workLoadFailed'))
      return null
    }
    try {
      const parsed = await loadSjwFromWorkUrl(record.url)
      dataStore.setTempWork(CUR_SHOW_WORK_TEMP_ID, parsed.work)
      dataStore.setTempWorkBlob(CUR_SHOW_WORK_TEMP_ID, parsed.blob)
      return {
        work: dataStore.getTempWork(CUR_SHOW_WORK_TEMP_ID) ?? parsed.work,
        blob: parsed.blob,
        record
      }
    } catch {
      ElMessage.error(i18n.global.t('common.workLoadFailed'))
      return null
    }
  }

  const work = createEmptyWork()
  dataStore.setTempWork(EDIT_NEW_WORK_TEMP_ID, work)
  return {
    work: dataStore.getTempWork(EDIT_NEW_WORK_TEMP_ID) ?? work,
    blob: null,
    record: null
  }
}

export function buildWorkRouteQuery(route: RouteLocationNormalizedLoaded): Record<string, string> {
  const workId = resolveWorkId(route.query.workId)
  if (workId) {
    return {
      workId,
      tempId: resolveWorkTempId(route.query.tempId) ?? CUR_SHOW_WORK_TEMP_ID
    }
  }

  const tempId = resolveWorkTempId(route.query.tempId)
  if (tempId) {
    return { tempId }
  }

  return { tempId: EDIT_NEW_WORK_TEMP_ID }
}

/** 确保至少一页（防御坏数据） */
export function ensureWorkHasPage(work: SJW): void {
  if (!work.pages?.length) {
    work.pages = [createEmptyPage()]
  }
}
