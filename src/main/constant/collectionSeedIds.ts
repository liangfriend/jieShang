/**
 * 内置藏品种子 id（与 renderer DEFAULT_COLLECTION_USAGE_IDS 约定一致）
 * 新装 migration 001 写入时显式指定，便于默认项用固定 id 查库。
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
    默认曲谱皮肤: 7,
    冰川曲谱皮肤: 8,
    竹林曲谱皮肤: 9
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
    金属质感: 13
  }
} as const

/** 种子写入后 sqlite 自增序列续号起点 */
export const BUILTIN_COLLECTION_MAX_SEED_ID = 16
