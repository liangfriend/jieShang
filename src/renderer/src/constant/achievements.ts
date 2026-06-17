import { BUILTIN_COLLECTION_SEED_IDS as C } from '@renderer/constant/collectionSeedIds'

/** 音符切切成就判定条件（与 key 无关，仅描述如何达成） */
export type AchievementCriteria =
  | { type: 'note_slice_arcade_score'; minScore: number }
  | { type: 'note_slice_endless_score'; minScore: number }
  | { type: 'note_slice_combo'; minCombo: number }
  | { type: 'note_slice_extreme_survival'; minSurvivalMs: number }

/** 成就定义（完整列表以代码常量为准；数据库仅存已解锁的 key + 完成时间） */
export type AchievementDefinition = {
  /** 唯一标识，与数据库 achievement_progress.key 对应 */
  key: string
  name: string
  description: string
  reward: string
  /** 插图 URL，暂无则留空 */
  illustrationUrl: string
  /** 局内成就判定条件 */
  criteria: AchievementCriteria
  /**
   * 解锁后发放的藏品 id（与 main `BUILTIN_COLLECTION_SEED_IDS` 一致）
   * 无实物奖励（如「无」）或种子尚未入库时不填
   */
  rewardCollectionId?: number
}

export const ACHIEVEMENT_DEFINITIONS: readonly AchievementDefinition[] = [
  {
    key: 'note_slice_arcade_10',
    name: '街机新手',
    description: '任意难度下，街机模式达到 10 分',
    reward: '钢琴皮肤-重金属',
    illustrationUrl: '',
    criteria: { type: 'note_slice_arcade_score', minScore: 10 },
    rewardCollectionId: C.pianoSkin.重金属
  },
  {
    key: 'note_slice_arcade_50',
    name: '街机中手',
    description: '任意难度下，街机模式达到 50 分',
    reward: '音色-亮音钢琴',
    illustrationUrl: '',
    criteria: { type: 'note_slice_arcade_score', minScore: 50 },
    rewardCollectionId: C.toneColor.亮音钢琴
  },
  {
    key: 'note_slice_arcade_300',
    name: '街机高手',
    description: '任意难度下，街机模式达到 300 分',
    reward: '音色-电钢琴',
    illustrationUrl: '',
    criteria: { type: 'note_slice_arcade_score', minScore: 300 },
    rewardCollectionId: C.toneColor.电钢琴
  },
  {
    key: 'note_slice_arcade_1000',
    name: '街机皇帝',
    description: '任意难度下，街机模式达到 1000 分',
    reward: '音色-八音盒',
    illustrationUrl: '',
    criteria: { type: 'note_slice_arcade_score', minScore: 1000 },
    rewardCollectionId: C.toneColor.八音盒
  },
  {
    key: 'note_slice_endless_100',
    name: '小小无限',
    description: '任意难度下，无限模式达到 100 分',
    reward: '无',
    illustrationUrl: '',
    criteria: { type: 'note_slice_endless_score', minScore: 100 }
  },
  {
    key: 'note_slice_endless_500',
    name: '中中无限',
    description: '任意难度下，无限模式达到 500 分',
    reward: '曲谱皮肤-墨华',
    illustrationUrl: '',
    criteria: { type: 'note_slice_endless_score', minScore: 500 },
    rewardCollectionId: C.scoreSkin.墨华
  },
  {
    key: 'note_slice_endless_2000',
    name: '大大无限',
    description: '任意难度下，无限模式达到 2000 分',
    reward: '曲谱皮肤-竹林',
    illustrationUrl: '',
    criteria: { type: 'note_slice_endless_score', minScore: 2000 },
    rewardCollectionId: C.scoreSkin.竹林
  },
  {
    key: 'note_slice_endless_10000',
    name: '彻底无限',
    description: '任意难度下，无限模式达到 10000 分',
    reward: '曲谱皮肤-寰宇',
    illustrationUrl: '',
    criteria: { type: 'note_slice_endless_score', minScore: 10000 },
    rewardCollectionId: C.scoreSkin.寰宇
  },
  {
    key: 'note_slice_combo_7',
    name: '连击七段',
    description: '达成 7 连击',
    reward: '瀑布流-彩虹糖',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 7 },
    rewardCollectionId: C.performSkin.彩虹演奏皮肤
  },
  {
    key: 'note_slice_combo_8',
    name: '连击八段',
    description: '达成 8 连击',
    reward: '无',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 8 }
  },
  {
    key: 'note_slice_combo_9',
    name: '连击九段',
    description: '达成 9 连击',
    reward: '钢琴皮肤-黑白',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 9 },
    rewardCollectionId: C.pianoSkin.黑白
  },
  {
    key: 'note_slice_combo_10',
    name: '连击十段',
    description: '达成 10 连击',
    reward: '音色-尼龙弦吉他',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 10 },
    rewardCollectionId: C.toneColor.尼龙弦吉他
  },
  {
    key: 'note_slice_combo_30',
    name: '连击大帝',
    description: '达成 30 连击',
    reward: '瀑布流-二进制',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 30 },
    rewardCollectionId: C.performSkin.二进制演奏皮肤
  },
  {
    key: 'note_slice_combo_100',
    name: '精准捕捉',
    description: '达成 100 连击',
    reward: '音色-小提琴',
    illustrationUrl: '',
    criteria: { type: 'note_slice_combo', minCombo: 100 },
    rewardCollectionId: C.toneColor.小提琴
  },
  {
    key: 'note_slice_extreme_30s',
    name: '运气而已',
    description: '极限模式存活 30 秒',
    reward: '曲谱皮肤-冰川',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 30_000 },
    rewardCollectionId: C.scoreSkin.冰川
  },
  {
    key: 'note_slice_extreme_60s',
    name: '勉强应对',
    description: '极限模式存活 60 秒',
    reward: '无',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 60_000 }
  },
  {
    key: 'note_slice_extreme_120s',
    name: '掌握规律',
    description: '极限模式存活 120 秒',
    reward: '钢琴皮肤-木板',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 120_000 },
    rewardCollectionId: C.pianoSkin.木板
  },
  {
    key: 'note_slice_extreme_150s',
    name: '视听进化',
    description: '极限模式存活 150 秒',
    reward: '瀑布流-水银',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 150_000 },
    rewardCollectionId: C.performSkin.星河演奏皮肤
  },
  {
    key: 'note_slice_extreme_180s',
    name: '人琴合一',
    description: '极限模式存活 180 秒',
    reward: '瀑布流-斑马线',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 180_000 },
    rewardCollectionId: C.performSkin.斑马线演奏皮肤
  },
  {
    key: 'note_slice_extreme_200s',
    name: '关了吧',
    description: '极限模式存活 200 秒',
    reward: '曲谱皮肤-晨曦',
    illustrationUrl: '',
    criteria: { type: 'note_slice_extreme_survival', minSurvivalMs: 200_000 },
    rewardCollectionId: C.scoreSkin.晨曦
  }
] as const

export type AchievementKey = (typeof ACHIEVEMENT_DEFINITIONS)[number]['key']

export function findAchievementDefinition(key: string): AchievementDefinition | undefined {
  return ACHIEVEMENT_DEFINITIONS.find((item) => item.key === key)
}
