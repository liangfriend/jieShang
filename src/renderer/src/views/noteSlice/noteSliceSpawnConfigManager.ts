import { ClefTypeEnum, KeySignatureTypeEnum } from 'deciphony-renderer'
import {
  DEFAULT_GAME_DIFFICULTY,
  type GameDifficulty
} from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import {
  createBaseSpawnRuntimeConfig,
  type NoteSliceSpawnRuntimeConfig
} from '@renderer/views/noteSlice/noteSliceSpawnRuntimeConfig'
import {
  MIDI_BRICK_CLEFS,
  MIDI_BRICK_KEY_SIGNATURES,
  type MidiBrickClef
} from '@renderer/views/noteSlice/midiBrickBuilder'
import { resolveNoteSliceExtremeDecay } from '@renderer/views/noteSlice/noteSliceExtremeDecay'

export type NoteSliceSpawnConfigManager = {
  /** 根据开局后经过的时间（ms）返回当前生成参数 */
  getConfig(passTimeMs: number): NoteSliceSpawnRuntimeConfig
}

const TREBLE_ONLY = [ClefTypeEnum.Treble] as const
const TREBLE_BASS = [ClefTypeEnum.Treble, ClefTypeEnum.Bass] as const

/** 文档「概率 N」= shouldSpawnByInterval 的平均间隔秒数（越大越稀疏） */
const PRESET_RUNTIME_CONFIG: Record<GameDifficulty, NoteSliceSpawnRuntimeConfig> = {
  test: createBaseSpawnRuntimeConfig({
    midiMin: 60,
    midiMax: 61,
    allowedClefs: TREBLE_ONLY,
    spawnAvgSeconds: 2,
    spawnCooldownSeconds: 1,
    bombSpawnAvgSeconds: 0,
    freezeSpawnAvgSeconds: 0,
    doubleSpawnAvgSeconds: 0
  }),
  easy: createBaseSpawnRuntimeConfig({
    midiMin: 38,
    midiMax: 83,
    allowedClefs: TREBLE_BASS,
    allowedKeySignatures: MIDI_BRICK_KEY_SIGNATURES,
    allowDoubleAccidentals: false,
    blockSolidMs: 3000,
    blockFadeMs: 2000,
    spawnAvgSeconds: 2,
    spawnCooldownSeconds: 1,
    bombSpawnAvgSeconds: 10,
    bombSpawnCooldownSeconds: 2,
    freezeSpawnAvgSeconds: 20,
    freezeSpawnCooldownSeconds: 5,
    doubleSpawnAvgSeconds: 20,
    doubleSpawnCooldownSeconds: 5
  }),
  standard: createBaseSpawnRuntimeConfig({
    midiMin: 38,
    midiMax: 83,
    allowedClefs: MIDI_BRICK_CLEFS,
    allowedKeySignatures: MIDI_BRICK_KEY_SIGNATURES,
    allowDoubleAccidentals: false,
    blockSolidMs: 2000,
    blockFadeMs: 1500,
    spawnAvgSeconds: 1,
    spawnCooldownSeconds: 0.5,
    bombSpawnAvgSeconds: 5,
    bombSpawnCooldownSeconds: 1,
    freezeSpawnAvgSeconds: 15,
    freezeSpawnCooldownSeconds: 5,
    doubleSpawnAvgSeconds: 15,
    doubleSpawnCooldownSeconds: 5
  }),
  hard: createBaseSpawnRuntimeConfig({
    midiMin: 38,
    midiMax: 83,
    allowedClefs: MIDI_BRICK_CLEFS,
    allowedKeySignatures: MIDI_BRICK_KEY_SIGNATURES,
    allowDoubleAccidentals: true,
    blockSolidMs: 1500,
    blockFadeMs: 1000,
    spawnAvgSeconds: 1,
    spawnCooldownSeconds: 0.2,
    bombSpawnAvgSeconds: 3,
    bombSpawnCooldownSeconds: 0.5,
    freezeSpawnAvgSeconds: 13,
    freezeSpawnCooldownSeconds: 3,
    doubleSpawnAvgSeconds: 13,
    doubleSpawnCooldownSeconds: 3
  })
}

export function resolvePresetSpawnRuntimeConfig(
  difficulty: GameDifficulty
): NoteSliceSpawnRuntimeConfig {
  return PRESET_RUNTIME_CONFIG[difficulty] ?? PRESET_RUNTIME_CONFIG[DEFAULT_GAME_DIFFICULTY]
}

export function createPresetSpawnConfigManager(
  difficulty: GameDifficulty
): NoteSliceSpawnConfigManager {
  const config = resolvePresetSpawnRuntimeConfig(difficulty)
  return {
    getConfig() {
      return config
    }
  }
}

/** 极限模式初始基准（再乘曲线衰减系数） */
const EXTREME_BASE_CONFIG = createBaseSpawnRuntimeConfig({
  midiMin: 38,
  midiMax: 83,
  allowedClefs: TREBLE_BASS,
  allowedKeySignatures: [KeySignatureTypeEnum.C],
  allowDoubleAccidentals: false,
  allowSingleAccidentals: false,
  blockSolidMs: 3000,
  blockFadeMs: 2000,
  spawnAvgSeconds: 2,
  spawnCooldownSeconds: 1,
  bombSpawnAvgSeconds: 0,
  freezeSpawnAvgSeconds: 0,
  doubleSpawnAvgSeconds: 0,
  healSpawnAvgSeconds: 10,
  healSpawnCooldownSeconds: 2
})

type ExtremeKeyUnlock = {
  fromMs: number
  keys: readonly KeySignatureTypeEnum[]
}

/** 调号按时间逐步解锁（累积） */
const EXTREME_KEY_UNLOCKS: ExtremeKeyUnlock[] = [
  { fromMs: 10_000, keys: [KeySignatureTypeEnum.F, KeySignatureTypeEnum.G] },
  { fromMs: 15_000, keys: [KeySignatureTypeEnum.D, KeySignatureTypeEnum.B_flat] },
  { fromMs: 20_000, keys: [KeySignatureTypeEnum.A, KeySignatureTypeEnum.E_flat] },
  { fromMs: 25_000, keys: [KeySignatureTypeEnum.E, KeySignatureTypeEnum.A_flat] },
  { fromMs: 30_000, keys: [KeySignatureTypeEnum.B, KeySignatureTypeEnum.D_flat] },
  { fromMs: 35_000, keys: [KeySignatureTypeEnum.F_sharp, KeySignatureTypeEnum.G_flat] },
  { fromMs: 40_000, keys: [KeySignatureTypeEnum.C_sharp, KeySignatureTypeEnum.C_flat] }
]

function resolveExtremeAllowedKeySignatures(passTimeMs: number): KeySignatureTypeEnum[] {
  const keys = new Set<KeySignatureTypeEnum>([KeySignatureTypeEnum.C])
  for (const unlock of EXTREME_KEY_UNLOCKS) {
    if (passTimeMs >= unlock.fromMs) {
      for (const key of unlock.keys) {
        keys.add(key)
      }
    }
  }
  return MIDI_BRICK_KEY_SIGNATURES.filter((key) => keys.has(key))
}

function resolveExtremeAllowedClefs(passTimeMs: number): MidiBrickClef[] {
  if (passTimeMs >= 40_000) {
    return [...MIDI_BRICK_CLEFS]
  }
  return [...TREBLE_BASS]
}

function resolveExtremeAllowDoubleAccidentals(passTimeMs: number): boolean {
  return passTimeMs >= 30_000
}

function resolveExtremeAllowSingleAccidentals(passTimeMs: number): boolean {
  return passTimeMs >= 5_000
}

function scaleSpawnSeconds(value: number, decay: number): number {
  return Math.max(0.05, value * decay)
}

function resolveExtremeSpawnConfig(passTimeMs: number): NoteSliceSpawnRuntimeConfig {
  const elapsed = Math.max(0, passTimeMs)
  const decay = resolveNoteSliceExtremeDecay(elapsed)

  return {
    ...EXTREME_BASE_CONFIG,
    allowedClefs: resolveExtremeAllowedClefs(elapsed),
    allowedKeySignatures: resolveExtremeAllowedKeySignatures(elapsed),
    allowDoubleAccidentals: resolveExtremeAllowDoubleAccidentals(elapsed),
    allowSingleAccidentals: resolveExtremeAllowSingleAccidentals(elapsed),
    blockSolidMs: Math.round(EXTREME_BASE_CONFIG.blockSolidMs * decay),
    blockFadeMs: Math.round(EXTREME_BASE_CONFIG.blockFadeMs * decay),
    spawnAvgSeconds: scaleSpawnSeconds(EXTREME_BASE_CONFIG.spawnAvgSeconds, decay),
    spawnCooldownSeconds: scaleSpawnSeconds(EXTREME_BASE_CONFIG.spawnCooldownSeconds, decay),
    healSpawnAvgSeconds: scaleSpawnSeconds(EXTREME_BASE_CONFIG.healSpawnAvgSeconds, decay),
    healSpawnCooldownSeconds: scaleSpawnSeconds(
      EXTREME_BASE_CONFIG.healSpawnCooldownSeconds,
      decay
    )
  }
}

export function createExtremeSpawnConfigManager(): NoteSliceSpawnConfigManager {
  return {
    getConfig(passTimeMs: number) {
      return resolveExtremeSpawnConfig(passTimeMs)
    }
  }
}

let activeManager: NoteSliceSpawnConfigManager | null = null
/** tick 每帧写入，供生成逻辑读取当前 passTime */
let activePassTimeMs = 0

export function bindNoteSliceSpawnConfigManager(manager: NoteSliceSpawnConfigManager): void {
  activeManager = manager
  activePassTimeMs = 0
}

export function clearNoteSliceSpawnConfigManager(): void {
  activeManager = null
  activePassTimeMs = 0
}

/** 由 GameLayer 每帧 tick 开始时调用 */
export function setSpawnConfigPassTime(passTimeMs: number): void {
  activePassTimeMs = Math.max(0, passTimeMs)
}

export function getSpawnConfigPassTime(): number {
  return activePassTimeMs
}

/** 读取当前生效的运行时生成配置 */
export function getActiveSpawnConfig(passTimeMs?: number): NoteSliceSpawnRuntimeConfig {
  const elapsed = passTimeMs ?? activePassTimeMs
  if (activeManager) {
    return activeManager.getConfig(elapsed)
  }
  return resolvePresetSpawnRuntimeConfig(DEFAULT_GAME_DIFFICULTY)
}
