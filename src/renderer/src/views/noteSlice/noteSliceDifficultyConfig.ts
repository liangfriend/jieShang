import { ClefTypeEnum } from 'deciphony-renderer'
import {
  DEFAULT_GAME_DIFFICULTY,
  type GameDifficulty
} from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import { MIDI_BRICK_CLEFS, type MidiBrickClef } from '@renderer/views/noteSlice/midiBrickBuilder'
import {
  NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS,
  NOTE_SLICE_SPAWN_AVG_SECONDS,
  NOTE_SLICE_SPAWN_COOLDOWN_SECONDS
} from '@renderer/views/noteSlice/noteSliceGameConstants'

export type NoteSliceDifficultySpawnConfig = {
  midiMin: number
  midiMax: number
  /** 允许参与随机选谱号的列表 */
  allowedClefs: readonly MidiBrickClef[]
  allowDoubleAccidentals: boolean
  /** 平均多少秒尝试生成一个普通音符块 */
  spawnAvgSeconds: number
  /** 每次成功生成后的冷却（秒） */
  spawnCooldownSeconds: number
  /** 平均多少秒尝试生成一个炸弹块 */
  bombSpawnAvgSeconds: number
}

const TREBLE_ONLY: readonly MidiBrickClef[] = [ClefTypeEnum.Treble]
const TREBLE_BASS: readonly MidiBrickClef[] = [ClefTypeEnum.Treble, ClefTypeEnum.Bass]

/** 各难度对应的音符块生成预制参数 */
export const NOTE_SLICE_DIFFICULTY_CONFIG: Record<GameDifficulty, NoteSliceDifficultySpawnConfig> =
  {
    test: {
      midiMin: 60,
      midiMax: 61,
      allowedClefs: TREBLE_ONLY,
      allowDoubleAccidentals: true,
      spawnAvgSeconds: NOTE_SLICE_SPAWN_AVG_SECONDS,
      spawnCooldownSeconds: NOTE_SLICE_SPAWN_COOLDOWN_SECONDS,
      bombSpawnAvgSeconds: NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS
    },
    easy: {
      midiMin: 38,
      midiMax: 83,
      allowedClefs: TREBLE_BASS,
      allowDoubleAccidentals: false,
      spawnAvgSeconds: 0.65,
      spawnCooldownSeconds: 0.55,
      bombSpawnAvgSeconds: 5.5
    },
    standard: {
      midiMin: 38,
      midiMax: 83,
      allowedClefs: MIDI_BRICK_CLEFS,
      allowDoubleAccidentals: true,
      spawnAvgSeconds: NOTE_SLICE_SPAWN_AVG_SECONDS,
      spawnCooldownSeconds: NOTE_SLICE_SPAWN_COOLDOWN_SECONDS,
      bombSpawnAvgSeconds: NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS
    },
    hard: {
      midiMin: 21,
      midiMax: 108,
      allowedClefs: MIDI_BRICK_CLEFS,
      allowDoubleAccidentals: true,
      spawnAvgSeconds: 0.35,
      spawnCooldownSeconds: 0.4,
      bombSpawnAvgSeconds: 4
    }
  }

export function resolveNoteSliceDifficultyConfig(
  difficulty: GameDifficulty
): NoteSliceDifficultySpawnConfig {
  return NOTE_SLICE_DIFFICULTY_CONFIG[difficulty] ?? NOTE_SLICE_DIFFICULTY_CONFIG[DEFAULT_GAME_DIFFICULTY]
}

/** 读取首页设置中当前选中的难度配置 */
export function getActiveNoteSliceDifficultyConfig(): NoteSliceDifficultySpawnConfig {
  const { difficulty } = useGameSettingsStore()
  return resolveNoteSliceDifficultyConfig(difficulty.value)
}
