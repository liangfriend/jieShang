import {
  COLLECTION_DB_TO_ENUM,
  COLLECTION_ENUM_TO_DB,
  DEFAULT_COLLECTION_USAGE_IDS,
  STORABLE_COLLECTION_TYPES,
  type StorableCollectionType
} from '@renderer/constant/collection'
import { CollectionTypeEnum, type CollectionDbType } from '@renderer/types/collection'
import {
  loadActiveCollectionSelection,
  saveActiveCollectionSelection,
  type ActiveCollectionSelection
} from '@renderer/utils/collection/collectionActiveStorage'

async function isValidCollectionId(id: number, expectedDbType: CollectionDbType): Promise<boolean> {
  const res = await window.api.collection.get(id)
  if (!res?.success || !res.data) return false
  return res.data.type === expectedDbType && res.data.owned === true
}

async function resolveUsageId(type: StorableCollectionType): Promise<number | null> {
  const dbType = COLLECTION_ENUM_TO_DB[type]
  const storedId = loadActiveCollectionSelection()[type]
  if (storedId != null && (await isValidCollectionId(storedId, dbType))) {
    return storedId
  }
  const defaultId = DEFAULT_COLLECTION_USAGE_IDS[type]
  if (await isValidCollectionId(defaultId, dbType)) {
    return defaultId
  }
  return null
}

/** 首次启动或 localStorage 中 id 失效时，按约定默认 id 查库并写入 localStorage */
export async function initDefaultCollectionSelection() {
  const selection: ActiveCollectionSelection = { ...loadActiveCollectionSelection() }
  let changed = false

  for (const type of STORABLE_COLLECTION_TYPES) {
    const resolvedId = await resolveUsageId(type)
    if (resolvedId == null) continue
    if (selection[type] !== resolvedId) {
      selection[type] = resolvedId
      changed = true
    }
  }

  if (changed) {
    saveActiveCollectionSelection(selection)
  }
}

/** 删除当前使用中的藏品后，回退到约定默认 id */
export async function resetCollectionUsageToDefault(type: StorableCollectionType) {
  const defaultId = DEFAULT_COLLECTION_USAGE_IDS[type]
  const dbType = COLLECTION_ENUM_TO_DB[type]
  if (!(await isValidCollectionId(defaultId, dbType))) return

  const selection = loadActiveCollectionSelection()
  selection[type] = defaultId
  saveActiveCollectionSelection(selection)
}

/** 按类型取当前使用 id（含默认 id 回退逻辑，供运行期校验） */
export async function fetchActiveCollectionUsageId(
  type: StorableCollectionType
): Promise<number | null> {
  return resolveUsageId(type)
}

export function collectionTypeToStorable(
  dbType: CollectionDbType
): StorableCollectionType | null {
  const enumType = COLLECTION_DB_TO_ENUM[dbType]
  if (enumType === CollectionTypeEnum.ToneColor) return null
  return enumType as StorableCollectionType
}
