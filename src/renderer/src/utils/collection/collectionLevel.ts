import type { CollectionLevel } from '@renderer/constant/collectionSeedIds'

const COLLECTION_LEVEL_LABELS: Record<CollectionLevel, string> = {
  1: '一级',
  2: '二级',
  3: '三级',
  4: '四级',
  5: '五级',
  6: '六级'
}

export function normalizeCollectionLevel(level: unknown): CollectionLevel {
  const value = Number(level)
  if (value >= 1 && value <= 6) return value as CollectionLevel
  return 1
}

export function collectionLevelLabel(level: unknown): string {
  return COLLECTION_LEVEL_LABELS[normalizeCollectionLevel(level)]
}

export function collectionLevelCardClass(level: unknown): string {
  return `collection-card--level-${normalizeCollectionLevel(level)}`
}
