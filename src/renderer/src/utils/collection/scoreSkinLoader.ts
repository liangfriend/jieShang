import type { SkinPack } from 'deciphony-renderer'
import { CollectionTypeEnum } from '@renderer/types/collection'
import { useActiveScoreSkinId } from '@renderer/utils/collection/collectionActiveStorage'
import { fetchActiveCollectionUsageId } from '@renderer/utils/collection/initCollectionSelection'

export function parseScoreSkinPack(raw: string): SkinPack | null {
  try {
    const parsed = JSON.parse(raw) as SkinPack
    if (!parsed || typeof parsed !== 'object') return null
    if (parsed.standardStaff || parsed.numberNotation) return parsed
    return null
  } catch {
    return null
  }
}

/** 按 localStorage 中 scoreSkin id 查库，返回 { id, pack } 供 musicScore :skin / :skin-name */
export async function fetchActiveScoreSkin(): Promise<{ id: string; pack: SkinPack } | null> {
  const skinId = await fetchActiveCollectionUsageId(CollectionTypeEnum.ScoreSkin)
  if (!skinId) return null

  const res = await window.api.collection.get(skinId)
  if (!res?.success || !res.data?.content) return null

  const pack = parseScoreSkinPack(res.data.content)
  if (!pack) return null

  return { id: String(skinId), pack }
}

export { useActiveScoreSkinId }
