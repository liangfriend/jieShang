import { defaultPerformSkin } from './default'
import { rainbowPerformSkin } from './rainbow'
import { binaryPerformSkin } from './binary'
import { starRiverPerformSkin } from './starRiver'
import { zebraCrossingPerformSkin } from './zebraCrossing'
import { pixelArcadePerformSkin } from './pixelArcade'
import { mintSodaPerformSkin } from './mintSoda'
import { sakuraPerformSkin } from './sakura'
import { fireflyPerformSkin } from './firefly'
import { synthwavePerformSkin } from './synthwave'
import { auroraPerformSkin } from './aurora'
import { imperialDragonPerformSkin } from './imperialDragon'
import { thunderPerformSkin } from './thunder'
import { createHollowPerformSkin } from './hollow'
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
  zebraCrossing: zebraCrossingPerformSkin,
  PixelArcade: pixelArcadePerformSkin,
  MintSoda: mintSodaPerformSkin,
  Sakura: sakuraPerformSkin,
  Firefly: fireflyPerformSkin,
  Synthwave: synthwavePerformSkin,
  Aurora: auroraPerformSkin,
  ImperialDragon: imperialDragonPerformSkin,
  Thunder: thunderPerformSkin,
  Hollow: createHollowPerformSkin(null)
}

/** 带可调参数的皮肤：按藏品 option 字符串生成皮肤包 */
const PERFORM_SKIN_FACTORIES: Record<string, (option: string | null | undefined) => PerformSkinPack> = {
  Hollow: createHollowPerformSkin
}

export const DEFAULT_PERFORM_SKIN_NAME = 'default'

export function getPerformSkinPack(
  name: string | null | undefined,
  option?: string | null
): PerformSkinPack {
  const key = name?.trim()
  if (key && option && PERFORM_SKIN_FACTORIES[key]) return PERFORM_SKIN_FACTORIES[key](option)
  if (key && PERFORM_SKIN_REGISTRY[key]) return PERFORM_SKIN_REGISTRY[key]
  return PERFORM_SKIN_REGISTRY[DEFAULT_PERFORM_SKIN_NAME]
}

export function normalizePerformSkinName(name: string | null | undefined): string {
  const key = name?.trim()
  if (key && PERFORM_SKIN_REGISTRY[key]) return key === 'rainBow' ? 'RainBow' : key
  return DEFAULT_PERFORM_SKIN_NAME
}
