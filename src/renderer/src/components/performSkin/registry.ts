import { defaultPerformSkin } from './default'
import { rainbowPerformSkin } from './rainbow'
import { binaryPerformSkin } from './binary'
import { starRiverPerformSkin } from './starRiver'
import { zebraCrossingPerformSkin } from './zebraCrossing'
import type { PerformSkinPack } from './types'

/** content 字段 → 本地皮肤包（与数据库 PerformSkinNameList key 一致） */
export const PERFORM_SKIN_REGISTRY: Record<string, PerformSkinPack> = {
  default: defaultPerformSkin,
  RainBow: rainbowPerformSkin,
  rainBow: rainbowPerformSkin,
  Binary: binaryPerformSkin,
  binary: binaryPerformSkin,
  StarRiver: starRiverPerformSkin,
  starRiver: starRiverPerformSkin,
  ZebraCrossing: zebraCrossingPerformSkin,
  zebraCrossing: zebraCrossingPerformSkin
}

export const DEFAULT_PERFORM_SKIN_NAME = 'default'

export function getPerformSkinPack(name: string | null | undefined): PerformSkinPack {
  const key = name?.trim()
  if (key && PERFORM_SKIN_REGISTRY[key]) return PERFORM_SKIN_REGISTRY[key]
  return PERFORM_SKIN_REGISTRY[DEFAULT_PERFORM_SKIN_NAME]
}

export function normalizePerformSkinName(name: string | null | undefined): string {
  const key = name?.trim()
  if (key && PERFORM_SKIN_REGISTRY[key]) return key === 'rainBow' ? 'RainBow' : key
  return DEFAULT_PERFORM_SKIN_NAME
}
