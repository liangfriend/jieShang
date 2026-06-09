import { normalizePerformSkinName } from '@renderer/components/performSkin/registry'
import {
  COLLECTION_DB_TO_ENUM,
  COLLECTION_TYPE_LABEL,
  getBuiltinMeta
} from '@renderer/constant/collection'
import { CollectionTypeEnum, type CollectionDbType, type CollectionRecord } from '@renderer/types/collection'
import {
  type ActiveCollectionSelection,
  loadActiveCollectionSelection,
  setActiveCollectionByType,
  setActivePerformSkin
} from '@renderer/utils/collection/collectionActiveStorage'

type ApiListResult = { success?: boolean; data?: unknown }

function parseCollectionList(res: ApiListResult): CollectionRecord[] {
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data as CollectionRecord[]
}

/** 仅拉取已拥有的藏品（列表页数据源） */
export async function fetchOwnedCollections(): Promise<CollectionRecord[]> {
  const res = await window.api.collection.query({ owned: true })
  return parseCollectionList(res)
}

export function resolveCollectionName(record: CollectionRecord): string {
  if (record.is_built_in) {
    const meta = getBuiltinMeta(record.type, record.content)
    if (meta?.name) return meta.name
  }
  const fromDescription = record.description?.trim()
  if (fromDescription) return fromDescription.split('\n')[0]!
  return `${COLLECTION_TYPE_LABEL[record.type]} #${record.id}`
}

export function resolveCollectionDescription(record: CollectionRecord): string {
  const fromDb = record.description?.trim()
  if (fromDb) return fromDb
  if (record.is_built_in) {
    return getBuiltinMeta(record.type, record.content)?.description?.trim() ?? ''
  }
  return ''
}

/** 内置藏品：从 constant 取获取条件；社区藏品无此字段 */
export function resolveCollectionHowToGet(record: CollectionRecord): string | null {
  if (!record.is_built_in) return null
  return getBuiltinMeta(record.type, record.content)?.howToGet?.trim() ?? null
}

export function canDeleteCollection(record: CollectionRecord): boolean {
  return !record.is_built_in
}

export async function deleteCollectionFromDatabase(id: number): Promise<void> {
  const res = await window.api.collection.delete(id)
  if (!res?.success) {
    throw new Error('删除藏品失败')
  }
}

export function collectionTypeLabel(type: CollectionDbType): string {
  return COLLECTION_TYPE_LABEL[type]
}

/** 判断藏品是否为 localStorage 中当前使用的项 */
export function isCollectionRecordActive(
  record: CollectionRecord,
  selection: ActiveCollectionSelection = loadActiveCollectionSelection()
): boolean {
  const enumType = COLLECTION_DB_TO_ENUM[record.type]
  const active = selection[enumType]
  if (!active) return false

  if (enumType === CollectionTypeEnum.PerformSkin) {
    const activeName = normalizePerformSkinName(active.name)
    const recordName = normalizePerformSkinName(record.content)
    if (activeName && activeName === recordName) return true
    return active.id != null && active.id === record.id
  }

  return active.id != null && active.id === record.id
}

/** 将藏品设为当前使用（写入 localStorage） */
export function activateCollectionRecord(record: CollectionRecord) {
  const enumType = COLLECTION_DB_TO_ENUM[record.type]
  const displayName = resolveCollectionName(record)

  if (enumType === CollectionTypeEnum.PerformSkin) {
    setActivePerformSkin({ id: record.id, name: record.content })
    return
  }

  setActiveCollectionByType(enumType, { id: record.id, name: displayName })
}
