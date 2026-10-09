import type { CollectionRecord } from '@renderer/types/collection'
import { resolveCollectionName } from '@renderer/utils/collection/collectionHelper'
import { parseScoreSkinPack } from '@renderer/utils/collection/scoreSkinLoader'
import type { SkinPack } from '@deciphony/renderer'

export type ScoreSkinOption = {
  id: number
  name: string
}

function parseScoreSkinList(res: { success?: boolean; data?: unknown }): CollectionRecord[] {
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data as CollectionRecord[]
}

/** 查询已拥有曲谱皮肤藏品（作品添加曲谱时选择） */
export async function fetchOwnedScoreSkinOptions(): Promise<ScoreSkinOption[]> {
  const res = await window.api.collection.query({ type: 'score_skin', owned: true })
  return parseScoreSkinList(res)
    .map((record) => ({
      id: record.id,
      name: resolveCollectionName(record)
    }))
    .sort((a, b) => a.id - b.id)
}

/** 按藏品 id 加载 SkinPack；失败返回 null */
export async function loadOwnedScoreSkinPack(skinId: number): Promise<{
  id: number
  name: string
  pack: SkinPack
} | null> {
  const res = await window.api.collection.get(skinId)
  if (!res?.success || !res.data?.content) return null
  const pack = parseScoreSkinPack(res.data.content)
  if (!pack) return null
  const record = res.data as CollectionRecord
  return {
    id: skinId,
    name: resolveCollectionName(record),
    pack
  }
}
