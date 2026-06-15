/** 游戏层 SVG 逻辑坐标 */
export const NOTE_SLICE_GAME_WIDTH = 1920
export const NOTE_SLICE_GAME_HEIGHT = 1080

/** 音符块生成时的 midi 范围（含边界，标准难度默认值） */
export const NOTE_SLICE_SPAWN_MIDI_MIN = 38
export const NOTE_SLICE_SPAWN_MIDI_MAX = 83

import {
  DEFAULT_BLOCK_FADE_MS,
  DEFAULT_BLOCK_SOLID_MS,
  getNoteSliceBlockLifetimeMsFromConfig,
  resolveNoteSliceBlockOpacityFromConfig
} from '@renderer/views/noteSlice/noteSliceSpawnRuntimeConfig'
import { getActiveSpawnConfig } from '@renderer/views/noteSlice/noteSliceSpawnConfigManager'

/** 音符块完全可见的维持时间（秒），默认值 */
export const NOTE_SLICE_BLOCK_SOLID_SECONDS = DEFAULT_BLOCK_SOLID_MS / 1000

/** 音符块淡出时间（秒），默认值 */
export const NOTE_SLICE_BLOCK_FADE_SECONDS = DEFAULT_BLOCK_FADE_MS / 1000

/** 平均多少秒尝试生成一个音符块（配合 shouldSpawnByInterval） */
export const NOTE_SLICE_SPAWN_AVG_SECONDS = 0.5

/** 每次成功生成音符块后，多少秒内禁止再生成 */
export const NOTE_SLICE_SPAWN_COOLDOWN_SECONDS = 0.5

/** 音符块外壳尺寸（与 musicScore 实际宽高无关） */
export const NOTE_SLICE_BLOCK_SHELL_WIDTH = 200
export const NOTE_SLICE_BLOCK_SHELL_HEIGHT = 200

/** 琴键清除特效时长（ms） */
export const NOTE_SLICE_CLEAR_EFFECT_MS = 450

/** 炸弹块平均多少秒尝试生成一次（配合 shouldSpawnByInterval） */
export const NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS = 5

/** 炸弹块固定批次（不参与正常 batch 递增） */
export const NOTE_SLICE_BOMB_BATCH = -1

/** 治疗块固定批次（不参与正常 batch 递增） */
export const NOTE_SLICE_HEAL_BATCH = -2

/** 炸弹爆炸特效时长（ms） */
export const NOTE_SLICE_EXPLOSION_EFFECT_MS = 600

/** 治疗块特效时长（ms） */
export const NOTE_SLICE_HEAL_EFFECT_MS = 650

/** 冰冻块固定批次（不参与正常 batch 递增） */
export const NOTE_SLICE_FREEZE_BATCH = -3

/** 加倍块固定批次（不参与正常 batch 递增） */
export const NOTE_SLICE_DOUBLE_BATCH = -4

/** 冰冻块平均多少秒尝试生成一次 */
export const NOTE_SLICE_FREEZE_SPAWN_AVG_SECONDS = 8

/** 加倍块平均多少秒尝试生成一次 */
export const NOTE_SLICE_DOUBLE_SPAWN_AVG_SECONDS = 8

/** 冰冻 / 加倍特效时长（ms） */
export const NOTE_SLICE_FREEZE_EFFECT_MS = 600
export const NOTE_SLICE_DOUBLE_EFFECT_MS = 600

/** 冰冻 / 加倍增益持续时长（ms） */
export const NOTE_SLICE_BUFF_DURATION_MS = 7_000

// 解析 block 当前的透明度，ageMs：音符块已存活时间
export function resolveNoteSliceBlockOpacity(ageMs: number): number {
  return resolveNoteSliceBlockOpacityFromConfig(ageMs, getActiveSpawnConfig())
}

// 音符块应该存活的总时间
export function getNoteSliceBlockLifetimeMs(): number {
  return getNoteSliceBlockLifetimeMsFromConfig(getActiveSpawnConfig())
}
