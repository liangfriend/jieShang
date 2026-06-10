import {
  COLLECTION_DB_TO_ENUM,
  COLLECTION_TYPE_LABEL,
  getBuiltinMeta
} from '@renderer/constant/collection'
import { CollectionTypeEnum, type CollectionDbType, type CollectionRecord } from '@renderer/types/collection'
import {
  type ActiveCollectionSelection,
  loadActiveCollectionSelection,
  setActiveCollectionId
} from '@renderer/utils/collection/collectionActiveStorage'
import { collectionTypeToStorable } from '@renderer/utils/collection/initCollectionSelection'

type ApiListResult = { success?: boolean; data?: unknown }

export function parseCollectionList(res: ApiListResult): CollectionRecord[] {
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data as CollectionRecord[]
}

function resolveBuiltinMetaKey(record: CollectionRecord): string {
  if (record.type === 'perform_skin') return record.content
  return record.name?.trim() ?? ''
}

/** 仅拉取已拥有的藏品（列表页数据源） */
export async function fetchOwnedCollections(): Promise<CollectionRecord[]> {
  const res = await window.api.collection.query({ owned: true })
  return parseCollectionList(res)
}

export function resolveCollectionName(record: CollectionRecord): string {
  const fromDb = record.name?.trim()
  if (fromDb) return fromDb
  if (record.is_built_in) {
    const meta = getBuiltinMeta(record.type, resolveBuiltinMetaKey(record))
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
    return getBuiltinMeta(record.type, resolveBuiltinMetaKey(record))?.description?.trim() ?? ''
  }
  return ''
}

/** 内置藏品：从 constant 取获取条件；社区藏品无此字段 */
export function resolveCollectionHowToGet(record: CollectionRecord): string | null {
  if (!record.is_built_in) return null
  return getBuiltinMeta(record.type, resolveBuiltinMetaKey(record))?.howToGet?.trim() ?? null
}

export function canDeleteCollection(record: CollectionRecord): boolean {
  return !record.is_built_in
}

/** 音色不写入 localStorage，无「使用中」概念 */
export function supportsCollectionUsage(record: CollectionRecord): boolean {
  return collectionTypeToStorable(record.type) != null
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

/** 判断藏品是否为 localStorage 中当前使用的项（音色恒为 false） */
export function isCollectionRecordActive(
  record: CollectionRecord,
  selection: ActiveCollectionSelection = loadActiveCollectionSelection()
): boolean {
  const storable = collectionTypeToStorable(record.type)
  if (!storable) return false
  return selection[storable] === record.id
}

/** 将藏品设为当前使用（写入 localStorage，仅存 id） */
export function activateCollectionRecord(record: CollectionRecord) {
  const storable = collectionTypeToStorable(record.type)
  if (!storable) return
  setActiveCollectionId(storable, record.id)
}
