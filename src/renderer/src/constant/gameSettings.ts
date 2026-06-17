export const GAME_SETTINGS_STORAGE_KEY = 'game.settings'

/** 音符切切游戏难度 */
export type GameDifficulty = 'test' | 'easy' | 'standard' | 'hard'

export const DEFAULT_GAME_DIFFICULTY: GameDifficulty = 'test'

/** 音符块出现时的发声音量（0~1） */
export const NOTE_BLOCK_SOUND_VOLUME_MIN = 0
export const NOTE_BLOCK_SOUND_VOLUME_MAX = 1
export const DEFAULT_NOTE_BLOCK_SOUND_VOLUME = 1

export const GAME_DIFFICULTY_OPTIONS: {
  value: GameDifficulty
  label: string
  desc: string
}[] = [
  {
    value: 'test',
    label: '测试',
    desc: '高音谱号，MIDI 60–61，便于调试'
  },
  {
    value: 'easy',
    label: '简单',
    desc: 'MIDI 38–83，高/低音谱号，无重升重降'
  },
  {
    value: 'standard',
    label: '标准',
    desc: 'MIDI 38–83，三种谱号，全部变音记号'
  },
  {
    value: 'hard',
    label: '困难',
    desc: 'MIDI 21–108，三种谱号，全部变音记号，生成更快'
  }
]
