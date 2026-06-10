import { DEFAULT_COLLECTION_USAGE_IDS } from '@renderer/constant/collection'
import { CollectionTypeEnum, type CollectionRecord } from '@renderer/types/collection'
import { resolveCollectionName } from '@renderer/utils/collection/collectionHelper'

export type ToneColorOption = {
  id: number
  name: string
}

export const DEFAULT_TONE_COLOR_COLLECTION_ID =
  DEFAULT_COLLECTION_USAGE_IDS[CollectionTypeEnum.ToneColor]

export function toneColorKey(id: number): string {
  return String(id)
}

export function parseToneColorContent(content: string): unknown {
  return JSON.parse(content) as unknown
}

function parseToneColorList(res: { success?: boolean; data?: unknown }): CollectionRecord[] {
  if (!res?.success || !Array.isArray(res.data)) return []
  return res.data as CollectionRecord[]
}

/** 查询已拥有音色藏品的 id 与展示名（播放/练习页音色选择器） */
export async function fetchOwnedToneColorOptions(): Promise<ToneColorOption[]> {
  const res = await window.api.collection.query({ type: 'tone_color', owned: true })
  return parseToneColorList(res)
    .map((record) => ({
      id: record.id,
      name: resolveCollectionName(record)
    }))
    .sort((a, b) => a.id - b.id)
}
