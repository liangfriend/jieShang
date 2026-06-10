import { getPerformSkinPack } from '@renderer/components/performSkin/registry'
import { CollectionTypeEnum } from '@renderer/types/collection'
import { useActivePerformSkinId } from '@renderer/utils/collection/collectionActiveStorage'
import { fetchActiveCollectionUsageId } from '@renderer/utils/collection/initCollectionSelection'

/** 按当前选中的 performSkin id 查库，用 content 索引本地皮肤包 */
export async function fetchActivePerformSkinContentKey(): Promise<string | null> {
  const skinId = await fetchActiveCollectionUsageId(CollectionTypeEnum.PerformSkin)
  if (!skinId) return null

  const res = await window.api.collection.get(skinId)
  if (!res?.success || !res.data?.content) return null
  return res.data.content.trim() || null
}

export function resolvePerformSkinPack(contentKey: string | null | undefined) {
  return getPerformSkinPack(contentKey)
}

export { useActivePerformSkinId }
