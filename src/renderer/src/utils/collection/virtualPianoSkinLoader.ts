import { DEFAULT_VIRTUAL_PIANO_SKIN_NAME } from '@renderer/resources/virtualPianoSkins'
import { CollectionTypeEnum, type VirtualPianoPack } from '@renderer/types/collection'
import {
  loadActiveCollectionSelection,
  setActiveCollectionByType
} from '@renderer/utils/collection/collectionActiveStorage'
import { parseCollectionList } from '@renderer/utils/collection/collectionHelper'

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

/** 无缓存时默认选中经典纯色钢琴皮肤 */
export async function initDefaultVirtualPianoSkinSelection() {
  const selection = loadActiveCollectionSelection()
  if (selection[CollectionTypeEnum.VirtualPianoSkin]?.id) return

  const res = await window.api.collection.query({ type: 'piano_skin', owned: true })
  const list = parseCollectionList(res)
  const classic = list.find((record) => record.name === DEFAULT_VIRTUAL_PIANO_SKIN_NAME)

  if (!classic) return
  setActiveCollectionByType(CollectionTypeEnum.VirtualPianoSkin, { id: classic.id })
}
