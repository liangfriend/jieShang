import { KeySignatureTypeEnum } from 'deciphony-renderer'
import {
  MIDI_BRICK_CLEFS,
  MIDI_BRICK_KEY_SIGNATURES,
  type MidiBrickClef
} from '@renderer/views/noteSlice/midiBrickBuilder'

/** 单局运行时音符块生成参数（由 SpawnConfigManager 按 passTime 产出） */
export type NoteSliceSpawnRuntimeConfig = {
  midiMin: number
  midiMax: number
  /** 允许参与随机选谱号的列表 */
  allowedClefs: readonly MidiBrickClef[]
  /** 允许参与随机选调号的列表 */
  allowedKeySignatures: readonly KeySignatureTypeEnum[]
  /** 是否允许重升号 / 重降号 */
  allowDoubleAccidentals: boolean
  /** 是否允许升号 / 降号（不含重升、重降）；false 时仅自然音 */
  allowSingleAccidentals: boolean
  /** 普通音符：平均多少秒尝试生成一次（越小越频繁） */
  spawnAvgSeconds: number
  /** 普通音符：每次成功生成后的冷却（秒） */
  spawnCooldownSeconds: number
  /** 炸弹：平均多少秒尝试生成一次；≤0 表示不生成 */
  bombSpawnAvgSeconds: number
  /** 炸弹：每次成功生成后的冷却（秒） */
  bombSpawnCooldownSeconds: number
  /** 治疗块（极限专属）：平均多少秒尝试生成一次；≤0 表示不生成 */
  healSpawnAvgSeconds: number
  /** 治疗块（极限专属）：每次成功生成后的冷却（秒） */
  healSpawnCooldownSeconds: number
  /** 冰冻：平均多少秒尝试生成一次；≤0 表示不生成 */
  freezeSpawnAvgSeconds: number
  /** 冰冻：每次成功生成后的冷却（秒） */
  freezeSpawnCooldownSeconds: number
  /** 加倍：平均多少秒尝试生成一次；≤0 表示不生成 */
  doubleSpawnAvgSeconds: number
  /** 加倍：每次成功生成后的冷却（秒） */
  doubleSpawnCooldownSeconds: number
  /** 音符块完全不透明阶段时长（ms） */
  blockSolidMs: number
  /** 音符块淡出阶段时长（ms） */
  blockFadeMs: number
}

export const DEFAULT_BLOCK_SOLID_MS = 2000
export const DEFAULT_BLOCK_FADE_MS = 2000

/** 简单难度默认调号子集（无升降较多的调） */
export const NOTE_SLICE_EASY_KEY_SIGNATURES = [
  KeySignatureTypeEnum.C,
  KeySignatureTypeEnum.G,
  KeySignatureTypeEnum.F,
  KeySignatureTypeEnum.D,
  KeySignatureTypeEnum.B_flat
] as const satisfies readonly KeySignatureTypeEnum[]

export function getNoteSliceBlockLifetimeMsFromConfig(
  config: Pick<NoteSliceSpawnRuntimeConfig, 'blockSolidMs' | 'blockFadeMs'>
): number {
  return config.blockSolidMs + config.blockFadeMs
}

export function resolveNoteSliceBlockOpacityFromConfig(
  ageMs: number,
  config: Pick<NoteSliceSpawnRuntimeConfig, 'blockSolidMs' | 'blockFadeMs'>
): number {
  const { blockSolidMs, blockFadeMs } = config
  if (ageMs <= blockSolidMs) return 1
  if (blockFadeMs <= 0 || ageMs >= blockSolidMs + blockFadeMs) return 0
  return 1 - (ageMs - blockSolidMs) / blockFadeMs
}

/** 冰冻增益：solidMs / fadeMs ×2 */
export function applyNoteSliceFreezeToSpawnConfig(
  config: NoteSliceSpawnRuntimeConfig
): NoteSliceSpawnRuntimeConfig {
  return {
    ...config,
    blockSolidMs: config.blockSolidMs * 2,
    blockFadeMs: config.blockFadeMs * 2
  }
}

export function createBaseSpawnRuntimeConfig(
  partial: Partial<NoteSliceSpawnRuntimeConfig> &
    Pick<
      NoteSliceSpawnRuntimeConfig,
      | 'midiMin'
      | 'midiMax'
      | 'allowedClefs'
      | 'spawnAvgSeconds'
      | 'spawnCooldownSeconds'
      | 'bombSpawnAvgSeconds'
    >
): NoteSliceSpawnRuntimeConfig {
  return {
    allowedKeySignatures: MIDI_BRICK_KEY_SIGNATURES,
    allowDoubleAccidentals: true,
    allowSingleAccidentals: true,
    healSpawnAvgSeconds: 0,
    healSpawnCooldownSeconds: 0,
    bombSpawnCooldownSeconds: partial.spawnCooldownSeconds,
    freezeSpawnAvgSeconds: 0,
    freezeSpawnCooldownSeconds: partial.spawnCooldownSeconds,
    doubleSpawnAvgSeconds: 0,
    doubleSpawnCooldownSeconds: partial.spawnCooldownSeconds,
    blockSolidMs: DEFAULT_BLOCK_SOLID_MS,
    blockFadeMs: DEFAULT_BLOCK_FADE_MS,
    ...partial
  }
}

export { MIDI_BRICK_CLEFS, MIDI_BRICK_KEY_SIGNATURES }
