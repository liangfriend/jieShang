import { CollectionTypeEnum, type VirtualPianoPack } from '@renderer/types/collection'
import { loadActiveCollectionSelection } from '@renderer/utils/collection/collectionActiveStorage'

/** 解析 piano_skin 的 content：按 midi 分的皮肤包 */
export function parseVirtualPianoPack(raw: string): VirtualPianoPack | null {
  try {
    const parsed = JSON.parse(raw) as VirtualPianoPack
    if (!parsed || typeof parsed !== 'object') return null
    // 至少有一个键含 normal 字段才认为有效
    const hasValidEntry = Object.values(parsed).some((skin) => typeof skin?.normal === 'string')
    return hasValidEntry ? parsed : null
  } catch {
    return null
  }
}

export async function fetchActiveVirtualPianoPack(): Promise<VirtualPianoPack | null> {
  const skinId = loadActiveCollectionSelection()[CollectionTypeEnum.VirtualPianoSkin]?.id
  if (!skinId) return null

  const res = await window.api.collection.get(skinId)
  if (!res?.success || !res.data?.content) return null
  return parseVirtualPianoPack(res.data.content)
}
