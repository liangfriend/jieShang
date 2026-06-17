/**
 * 内置藏品种子 id（与 main `collectionSeedIds` 保持一致）
 * 成就奖励、默认使用项等 renderer 侧引用此文件，避免与主进程 id 漂移。
 */
export const BUILTIN_COLLECTION_SEED_IDS = {
  toneColor: {
    三角钢琴: 1,
    亮音钢琴: 2,
    电钢琴: 3,
    尼龙弦吉他: 4,
    小提琴: 5,
    八音盒: 6
  },
  scoreSkin: {
    默认: 7,
    冰川: 8,
    墨华: 9,
    寰宇: 19,
    晨曦: 20,
    竹林: 21
  },
  performSkin: {
    默认演奏皮肤: 10,
    彩虹演奏皮肤: 11,
    二进制演奏皮肤: 14,
    星河演奏皮肤: 15,
    斑马线演奏皮肤: 16
  },
  pianoSkin: {
    经典纯色: 12,
    重金属: 13,
    黑白: 17,
    木板: 18
  }
} as const

/** 内置藏品级别（1 最低，5 最高；与 main 一致） */
export const BUILTIN_COLLECTION_LEVELS = {
  toneColor: {
    三角钢琴: 1,
    亮音钢琴: 1,
    电钢琴: 1,
    尼龙弦吉他: 1,
    小提琴: 1,
    八音盒: 1
  },
  scoreSkin: {
    默认: 1,
    冰川: 1,
    墨华: 2,
    竹林: 2,
    晨曦: 3,
    寰宇: 3
  },
  performSkin: {
    默认演奏皮肤: 1,
    彩虹演奏皮肤: 1,
    二进制演奏皮肤: 2,
    星河演奏皮肤: 3,
    斑马线演奏皮肤: 3
  },
  pianoSkin: {
    经典纯色: 1,
    重金属: 2,
    黑白: 2,
    木板: 2
  }
} as const

export type CollectionLevel = 1 | 2 | 3 | 4 | 5 | 6

/** 种子写入后 sqlite 自增序列续号起点 */
export const BUILTIN_COLLECTION_MAX_SEED_ID = 21

/** 各类型默认赠送、初始 owned=true 的藏品 id（与 main 一致） */
export const DEFAULT_BUILTIN_COLLECTION_OWNED_IDS = [
  BUILTIN_COLLECTION_SEED_IDS.toneColor.三角钢琴,
  BUILTIN_COLLECTION_SEED_IDS.scoreSkin.默认,
  BUILTIN_COLLECTION_SEED_IDS.performSkin.默认演奏皮肤,
  BUILTIN_COLLECTION_SEED_IDS.pianoSkin.经典纯色
] as const

export function isDefaultBuiltinCollectionOwned(id: number): boolean {
  return (DEFAULT_BUILTIN_COLLECTION_OWNED_IDS as readonly number[]).includes(id)
}

