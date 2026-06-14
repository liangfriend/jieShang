/** 成就定义（完整列表以代码常量为准；数据库仅存已解锁的 key + 完成时间） */
export type AchievementDefinition = {
  /** 唯一标识，与数据库 achievement_progress.key 对应 */
  key: string
  name: string
  description: string
  howToGet: string
  /** 插图 URL，暂无则留空 */
  illustrationUrl: string
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    key: 'note_slice_first_game',
    name: '初来乍到',
    description: '完成任意一局音符切切',
    howToGet: '在街机或无限模式中完成一整局游戏',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_arcade_500',
    name: '街机新星',
    description: '街机模式单局得分达到 500 分',
    howToGet: '在街机模式 60 秒内累计至少 500 分',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_10',
    name: '连击十段',
    description: '达成 10 连击',
    howToGet: '按批次顺序连续清除音符，使连击数达到 10',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_endless_survive',
    name: '久战不退',
    description: '无限模式耗尽三条命前清除大量音符',
    howToGet: '在无限模式中累计清除 50 个普通音符块',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_no_wrong_press',
    name: '指下无误',
    description: '整局未因乱按触发惩罚炸弹',
    howToGet: '完成一整局且从未按下场上不存在的 MIDI',
    illustrationUrl: ''
  }
] as const

export type AchievementKey = (typeof ACHIEVEMENT_DEFINITIONS)[number]['key']

export function findAchievementDefinition(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((item) => item.key === key)
}
