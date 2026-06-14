import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  DEFAULT_GAME_DIFFICULTY,
  GAME_DIFFICULTY_OPTIONS,
  GAME_SETTINGS_STORAGE_KEY,
  type GameDifficulty
} from '@renderer/constant/gameSettings'

type PersistedGameSettings = {
  difficulty?: GameDifficulty
}

function loadPersistedSettings(): PersistedGameSettings {
  try {
    const raw = localStorage.getItem(GAME_SETTINGS_STORAGE_KEY)
    if (!raw) return {}
    const parsed = JSON.parse(raw) as PersistedGameSettings
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function isGameDifficulty(value: unknown): value is GameDifficulty {
  return GAME_DIFFICULTY_OPTIONS.some((opt) => opt.value === value)
}

export const useGameSettingsStore = defineStore('gameSettings', () => {
  const persisted = loadPersistedSettings()
  const difficulty = ref<GameDifficulty>(
    isGameDifficulty(persisted.difficulty) ? persisted.difficulty : DEFAULT_GAME_DIFFICULTY
  )

  function persist() {
    localStorage.setItem(
      GAME_SETTINGS_STORAGE_KEY,
      JSON.stringify({ difficulty: difficulty.value } satisfies PersistedGameSettings)
    )
  }

  watch(difficulty, persist)

  function setDifficulty(value: GameDifficulty): void {
    difficulty.value = value
  }

  function init() {
    const latest = loadPersistedSettings()
    difficulty.value = isGameDifficulty(latest.difficulty)
      ? latest.difficulty
      : DEFAULT_GAME_DIFFICULTY
  }

  return { difficulty, init, setDifficulty, persist }
})
