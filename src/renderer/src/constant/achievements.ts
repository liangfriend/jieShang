/** 成就定义（完整列表以代码常量为准；数据库仅存已解锁的 key + 完成时间） */
export type AchievementDefinition = {
  /** 唯一标识，与数据库 achievement_progress.key 对应 */
  key: string
  name: string
  description: string
  reward: string
  /** 插图 URL，暂无则留空 */
  illustrationUrl: string
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    key: 'note_slice_arcade_10',
    name: '街机新手',
    description: '任意难度下，街机模式达到10分',
    reward: '钢琴皮肤-重金属',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_arcade_50',
    name: '街机中手',
    description: '任意难度下，街机模式达到50分',
    reward: '音色-亮音钢琴',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_arcade_300',
    name: '街机高手',
    description: '任意难度下，街机模式达到300分',
    reward: '音色-电钢琴',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_arcade_1000',
    name: '街机皇帝',
    description: '任意难度下，街机模式达到1000分',
    reward: '音色-八音盒',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_endless_100',
    name: '小小无限',
    description: '任意难度下，无限模式达到100分',
    reward: '无',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_endless_500',
    name: '中中无限',
    description: '任意难度下，无限模式达到500分',
    reward: '曲谱皮肤-墨华',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_endless_2000',
    name: '大大无限',
    description: '任意难度下，无限模式达到2000分',
    reward: '曲谱皮肤-竹林',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_endless_10000',
    name: '彻底无限',
    description: '任意难度下，无限模式达到10000分',
    reward: '曲谱皮肤-寰宇',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_7',
    name: '连击七段',
    description: '达成 10 连击',
    reward: '瀑布流-彩虹糖',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_8',
    name: '连击八段',
    description: '达成 10 连击',
    reward: '钢琴皮肤-木板',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_9',
    name: '连击九段',
    description: '达成 10 连击',
    reward: '钢琴皮肤-黑白',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_10',
    name: '连击十段',
    description: '达成 10 连击',
    reward: '音色-尼龙弦吉他',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_30',
    name: '连击大帝',
    description: '达成 30 连击',
    reward: '音色-小提琴',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_combo_100',
    name: '精准捕捉',
    description: '达成 100 连击',
    reward: '瀑布流-二进制',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_30s',
    name: '运气而已',
    description: '极限模式存活30秒',
    reward: '无',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_60s',
    name: '勉强应对',
    description: '极限模式存活60秒',
    reward: '无',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_120s',
    name: '掌握规律',
    description: '极限模式存活120秒',
    reward: '曲谱皮肤-冰川',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_150s',
    name: '视听进化',
    description: '极限模式存活150秒',
    reward: '瀑布流-水银',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_180s',
    name: '人琴合一',
    description: '极限模式存活180秒',
    reward: '瀑布流-斑马线',
    illustrationUrl: ''
  },
  {
    key: 'note_slice_extreme_200s',
    name: '关了吧',
    description: '极限模式存活200秒',
    reward: '曲谱皮肤-虚无',
    illustrationUrl: ''
  }
] as const

export type AchievementKey = (typeof ACHIEVEMENT_DEFINITIONS)[number]['key']

export function findAchievementDefinition(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((item) => item.key === key)
}
