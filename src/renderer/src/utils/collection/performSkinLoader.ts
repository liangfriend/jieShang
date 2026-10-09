import { getPerformSkinPack } from '@renderer/components/performSkin/registry'
import { CollectionTypeEnum } from '@renderer/types/collection'
import { useActivePerformSkinId } from '@renderer/utils/collection/collectionActiveStorage'
import { fetchActiveCollectionUsageId } from '@renderer/utils/collection/initCollectionSelection'

export type ActivePerformSkinSource = {
  content: string
  option: string | null
}

/** 按当前选中的 performSkin id 查库，取 content（索引本地皮肤包）与 option（可调参数） */
export async function fetchActivePerformSkinSource(): Promise<ActivePerformSkinSource | null> {
  const skinId = await fetchActiveCollectionUsageId(CollectionTypeEnum.PerformSkin)
  if (!skinId) return null

  const res = await window.api.collection.get(skinId)
  const content = res?.success ? res.data?.content?.trim() : ''
  if (!content) return null
  return { content, option: res.data.option ?? null }
}

export function resolvePerformSkinPack(source: ActivePerformSkinSource | null | undefined) {
  return getPerformSkinPack(source?.content, source?.option)
}

export { useActivePerformSkinId }
