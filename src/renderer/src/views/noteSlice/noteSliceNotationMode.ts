import type { GameNotationMode } from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'

/**
 * 本局谱面模式（线谱 / 简谱）。
 * 与难度一样：进入一局时由 NoteSliceGameView 绑定，避免游戏中途改设置影响出题；
 * 未绑定时回退读取 gameSettings store（成就页 / 结算等场景）。
 * 极限模式同样受此设置控制（谱面模式对所有游戏模式生效）。
 */
let boundNotationMode: GameNotationMode | null = null
let notationBindGeneration = 0

/** @returns 世代号，卸载时传给 clear，避免再来一局时旧实例清掉新局绑定 */
export function bindNoteSliceGameNotationMode(mode: GameNotationMode): number {
  boundNotationMode = mode
  notationBindGeneration += 1
  return notationBindGeneration
}

export function clearNoteSliceGameNotationMode(generation?: number): void {
  if (generation != null && generation !== notationBindGeneration) return
  boundNotationMode = null
}

export function getActiveNoteSliceNotationMode(): GameNotationMode {
  if (boundNotationMode !== null) return boundNotationMode
  return useGameSettingsStore().notationMode
}

export function isNoteSliceJianpuMode(): boolean {
  return getActiveNoteSliceNotationMode() === 'jianpu'
}
