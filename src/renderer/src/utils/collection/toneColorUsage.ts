import type { ToneColor } from '@deciphony/player'
import { DEFAULT_COLLECTION_USAGE_IDS } from '@renderer/constant/collection'
import { CollectionTypeEnum, type CollectionRecord } from '@renderer/types/collection'
import { resolveCollectionName } from '@renderer/utils/collection/collectionHelper'
import {
  findToneColorCatalogItem,
  findToneColorCatalogItemByKey
} from '@renderer/constant/toneColorCatalog'

export type ToneColorOption = {
  id: number
  /** NPlayer 音色名 / singleStaff.data.instrumentValue */
  key: string
  name: string
}

export const DEFAULT_TONE_COLOR_COLLECTION_ID =
  DEFAULT_COLLECTION_USAGE_IDS[CollectionTypeEnum.ToneColor]

/** NPlayer 音色名：内置音色用名单英文键名（与 singleStaff.data.instrumentValue 一致），社区音色用 collection-id */
export function toneColorKey(id: number): string {
  return findToneColorCatalogItem(id)?.key ?? `collection-${id}`
}

/** instrumentValue → 藏品 id；非内置键名返回 undefined */
export function toneColorIdByKey(key: string): number | undefined {
  const catalogId = findToneColorCatalogItemByKey(key)?.id
  if (catalogId != null) return catalogId
  const match = /^collection-(\d+)$/.exec(key)
  return match ? Number(match[1]) : undefined
}

export function parseToneColorContent(content: string): unknown {
  return JSON.parse(content) as unknown
}

/** 读取已拥有音色藏品的音色数据；缺失 / 未拥有返回 null */
export async function loadOwnedToneColorContent(id: number): Promise<ToneColor | null> {
  const res = await window.api.collection.get(id)
  const record = res?.success && res.data ? (res.data as CollectionRecord) : null
  if (record == null || record.type !== 'tone_color' || !record.owned || !record.content) return null
  return parseToneColorContent(record.content) as ToneColor
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
      key: toneColorKey(record.id),
      name: resolveCollectionName(record)
    }))
    .sort((a, b) => a.id - b.id)
}
