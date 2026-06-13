export const GAME_SETTINGS_STORAGE_KEY = 'game.settings'

/** 音符切切等游戏的整体难度（影响出题与判定，后续接入） */
export type GameDifficulty = 'easy' | 'standard'

export const DEFAULT_GAME_DIFFICULTY: GameDifficulty = 'standard'

export const GAME_DIFFICULTY_OPTIONS: {
  value: GameDifficulty
  label: string
  desc: string
}[] = [
  {
    value: 'easy',
    label: '简单',
    desc: '适合不懂乐理的新手，提示更多、容错更高'
  },
  {
    value: 'standard',
    label: '标准',
    desc: '默认难度，正常出题与判定'
  }
]
