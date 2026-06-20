import type { CollectionLevel } from '@renderer/constant/collectionSeedIds'
import { t } from '@renderer/i18n/helpers'

export function normalizeCollectionLevel(level: unknown): CollectionLevel {
  const value = Number(level)
  if (value >= 1 && value <= 6) return value as CollectionLevel
  return 1
}

export function collectionLevelLabel(level: unknown): string {
  const normalized = normalizeCollectionLevel(level)
  return t(`collection.level.${normalized}`)
}

export function collectionLevelCardClass(level: unknown): string {
  return `collection-card--level-${normalizeCollectionLevel(level)}`
}
