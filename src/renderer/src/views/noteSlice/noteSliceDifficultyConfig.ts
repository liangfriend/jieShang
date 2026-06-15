import {
  DEFAULT_GAME_DIFFICULTY,
  type GameDifficulty
} from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import {
  bindNoteSliceSpawnConfigManager,
  clearNoteSliceSpawnConfigManager,
  createPresetSpawnConfigManager,
  getActiveSpawnConfig,
  resolvePresetSpawnRuntimeConfig,
  type NoteSliceSpawnConfigManager
} from '@renderer/views/noteSlice/noteSliceSpawnConfigManager'
import type { NoteSliceSpawnRuntimeConfig } from '@renderer/views/noteSlice/noteSliceSpawnRuntimeConfig'

export type { NoteSliceSpawnRuntimeConfig as NoteSliceDifficultySpawnConfig }

/** @deprecated 使用 resolvePresetSpawnRuntimeConfig */
export const NOTE_SLICE_DIFFICULTY_CONFIG = {
  get test() {
    return resolvePresetSpawnRuntimeConfig('test')
  },
  get easy() {
    return resolvePresetSpawnRuntimeConfig('easy')
  },
  get standard() {
    return resolvePresetSpawnRuntimeConfig('standard')
  },
  get hard() {
    return resolvePresetSpawnRuntimeConfig('hard')
  }
} as Record<GameDifficulty, NoteSliceSpawnRuntimeConfig>

export function resolveNoteSliceDifficultyConfig(
  difficulty: GameDifficulty
): NoteSliceSpawnRuntimeConfig {
  return resolvePresetSpawnRuntimeConfig(difficulty)
}

let boundGameDifficulty: GameDifficulty | null = null

/** 本局游戏开始时绑定难度，并挂载对应参数管理器 */
export function bindNoteSliceGameDifficulty(difficulty: GameDifficulty): void {
  boundGameDifficulty = difficulty
  bindNoteSliceSpawnConfigManager(createPresetSpawnConfigManager(difficulty))
}

/** 绑定自定义参数管理器（极限模式等） */
export function bindNoteSliceSpawnManager(manager: NoteSliceSpawnConfigManager): void {
  boundGameDifficulty = null
  bindNoteSliceSpawnConfigManager(manager)
}

export function clearNoteSliceGameDifficulty(): void {
  boundGameDifficulty = null
  clearNoteSliceSpawnConfigManager()
}

export function getActiveNoteSliceDifficulty(): GameDifficulty {
  if (boundGameDifficulty !== null) {
    return boundGameDifficulty
  }
  return useGameSettingsStore().difficulty
}

/** 读取当前生效的生成配置（使用 tick 写入的 passTime，或显式传入） */
export function getActiveNoteSliceDifficultyConfig(
  passTimeMs?: number
): NoteSliceSpawnRuntimeConfig {
  return getActiveSpawnConfig(passTimeMs)
}
