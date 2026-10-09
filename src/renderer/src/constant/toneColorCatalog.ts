import catalog from '../../../shared/toneColorCatalog.json'
import type { AppLocale } from '@renderer/i18n/locale'

/** 内置音色名单（与主进程种子共用 src/shared/toneColorCatalog.json） */
export const TONE_COLOR_CATALOG = catalog

export type ToneColorCatalogItem = (typeof catalog.items)[number]
export type ToneColorFamilyKey = keyof typeof catalog.families

const itemById = new Map<number, ToneColorCatalogItem>(catalog.items.map((item) => [item.id, item]))
const itemByKey = new Map<string, ToneColorCatalogItem>(catalog.items.map((item) => [item.key, item]))

export function findToneColorCatalogItem(id: number): ToneColorCatalogItem | undefined {
  return itemById.get(id)
}

/** 按英文键名（singleStaff.data.instrumentValue / NPlayer 音色名）查找 */
export function findToneColorCatalogItemByKey(key: string): ToneColorCatalogItem | undefined {
  return itemByKey.get(key)
}

export function toneColorCatalogName(item: ToneColorCatalogItem, locale: AppLocale): string {
  return item.name[locale] ?? item.name.zh
}

export function toneColorFamilyName(family: string, locale: AppLocale): string {
  const names = catalog.families[family as ToneColorFamilyKey]
  return names ? names[locale] ?? names.zh : family
}

export const TONE_COLOR_CATALOG_IDS: readonly number[] = catalog.items.map((item) => item.id)
