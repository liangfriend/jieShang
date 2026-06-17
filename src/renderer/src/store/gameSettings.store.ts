import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import {
  DEFAULT_GAME_DIFFICULTY,
  DEFAULT_NOTE_BLOCK_SOUND_VOLUME,
  GAME_DIFFICULTY_OPTIONS,
  GAME_SETTINGS_STORAGE_KEY,
  NOTE_BLOCK_SOUND_VOLUME_MAX,
  NOTE_BLOCK_SOUND_VOLUME_MIN,
  type GameDifficulty
} from '@renderer/constant/gameSettings'

type PersistedGameSettings = {
  difficulty?: GameDifficulty
  noteBlockSoundVolume?: number
}

function clampVolume(value: number): number {
  return Math.min(NOTE_BLOCK_SOUND_VOLUME_MAX, Math.max(NOTE_BLOCK_SOUND_VOLUME_MIN, value))
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

function resolveNoteBlockSoundVolume(value: unknown): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return DEFAULT_NOTE_BLOCK_SOUND_VOLUME
  }
  return clampVolume(value)
}

export const useGameSettingsStore = defineStore('gameSettings', () => {
  const persisted = loadPersistedSettings()
  const difficulty = ref<GameDifficulty>(
    isGameDifficulty(persisted.difficulty) ? persisted.difficulty : DEFAULT_GAME_DIFFICULTY
  )
  const noteBlockSoundVolume = ref<number>(
    resolveNoteBlockSoundVolume(persisted.noteBlockSoundVolume)
  )

  function persist() {
    localStorage.setItem(
      GAME_SETTINGS_STORAGE_KEY,
      JSON.stringify({
        difficulty: difficulty.value,
        noteBlockSoundVolume: noteBlockSoundVolume.value
      } satisfies PersistedGameSettings)
    )
  }

  watch([difficulty, noteBlockSoundVolume], persist)

  function setDifficulty(value: GameDifficulty): void {
    difficulty.value = value
  }

  function setNoteBlockSoundVolume(value: number): void {
    noteBlockSoundVolume.value = clampVolume(value)
  }

  function init() {
    const latest = loadPersistedSettings()
    difficulty.value = isGameDifficulty(latest.difficulty)
      ? latest.difficulty
      : DEFAULT_GAME_DIFFICULTY
    noteBlockSoundVolume.value = resolveNoteBlockSoundVolume(latest.noteBlockSoundVolume)
  }

  return {
    difficulty,
    noteBlockSoundVolume,
    init,
    setDifficulty,
    setNoteBlockSoundVolume,
    persist
  }
})
