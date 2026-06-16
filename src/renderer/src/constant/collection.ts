import { CollectionTypeEnum, type CollectionDbType } from '@renderer/types/collection'

/** 写入 localStorage 的藏品类型（音色默认可用全部，不存当前使用 id） */
export type StorableCollectionType =
  | CollectionTypeEnum.ScoreSkin
  | CollectionTypeEnum.VirtualPianoSkin
  | CollectionTypeEnum.PerformSkin

/**
 * 各类型默认使用藏品 id（与 migration 种子 BUILTIN_COLLECTION_SEED_IDS 一致）
 * toneColor 仅作约定/文档，不写入 localStorage
 */
export const DEFAULT_COLLECTION_USAGE_IDS: Record<CollectionTypeEnum, number> = {
  [CollectionTypeEnum.ToneColor]: 1,
  [CollectionTypeEnum.ScoreSkin]: 7,
  [CollectionTypeEnum.PerformSkin]: 10,
  [CollectionTypeEnum.VirtualPianoSkin]: 12
}

export const STORABLE_COLLECTION_TYPES: readonly StorableCollectionType[] = [
  CollectionTypeEnum.ScoreSkin,
  CollectionTypeEnum.VirtualPianoSkin,
  CollectionTypeEnum.PerformSkin
]

/** 内置藏品元数据（名称、获取条件等，不存数据库） */
export type BuiltinCollectionMeta = {
  name: string
  howToGet: string
  description?: string
}

/** 演奏皮肤内置名称列表（content 存这里的 key） */
export const PerformSkinNameList = {
  default: {
    name: '默认演奏皮肤',
    howToGet: '买游戏就送',
    description: '经典粉色基调，适合日常练习。'
  },
  RainBow: {
    name: '彩虹演奏皮肤',
    howToGet: '完成主线剧情',
    description: '完成主线后解锁的炫彩演奏主题。'
  },
  Binary: {
    name: '二进制演奏皮肤',
    howToGet: '完成进阶挑战',
    description: '矩阵字符瀑布，黑客终端风格。'
  },
  StarRiver: {
    name: '星河演奏皮肤',
    howToGet: '探索星空关卡',
    description: '深空星野与星云，白金色高亮如星屑喷发。'
  },
  ZebraCrossing: {
    name: '斑马线演奏皮肤',
    howToGet: '完成节奏挑战',
    description: '倾斜黑白条纹水柱，警示黄高亮。'
  }
} satisfies Record<string, BuiltinCollectionMeta>

/** 钢琴皮肤内置元数据（按 name 索引；content 存皮肤本体 JSON） */
export const VirtualPianoSkinBuiltinMeta = {
  经典纯色: {
    name: '经典纯色',
    howToGet: '买游戏就送',
    description: '黑白纯色矩形琴键，简洁清晰。'
  },
  重金属: {
    name: '重金属',
    howToGet: '街机模式达到10分',
    description: '抛光金属反射高光，重金属质感琴键。'
  },
  黑白: {
    name: '黑白',
    howToGet: '达成连击九段成就',
    description: '立体俯视黑白琴键，顶面与前沿层次分明。'
  },
  木板: {
    name: '木板',
    howToGet: '达成连击八段成就',
    description: '木纹木板与木桩年轮黑键，温暖做旧风格。'
  }
} satisfies Record<string, BuiltinCollectionMeta>

/** 音色内置元数据（按 name 索引；content 存 NPlayer 音色 JSON） */
export const ToneColorBuiltinMeta = {
  三角钢琴: {
    name: '三角钢琴',
    howToGet: '买游戏就送',
    description: '温暖饱满的三角钢琴音色。'
  },
  亮音钢琴: {
    name: '亮音钢琴',
    howToGet: '买游戏就送',
    description: '更明亮、穿透力更强的钢琴音色。'
  },
  电钢琴: {
    name: '电钢琴',
    howToGet: '完成新手教程',
    description: '经典电钢琴音色，适合流行与爵士。'
  },
  尼龙弦吉他: {
    name: '尼龙弦吉他',
    howToGet: '探索森林关卡',
    description: '柔和的尼龙弦古典吉他音色。'
  },
  小提琴: {
    name: '小提琴',
    howToGet: '完成主线剧情',
    description: '抒情细腻的小提琴音色。'
  },
  八音盒: {
    name: '八音盒',
    howToGet: '完成主线剧情',
    description: '清脆梦幻的八音盒音色。'
  }
} satisfies Record<string, BuiltinCollectionMeta>

/** 曲谱皮肤内置元数据（按 name 索引；content 存 SkinPack JSON） */
export const ScoreSkinBuiltinMeta = {
  默认: {
    name: '默认',
    howToGet: '买游戏就送',
    description: '经典黑白五线谱符号，简洁清晰。'
  },
  冰川: {
    name: '冰川',
    howToGet: '极限模式存活120秒',
    description: '冰蓝清透的曲谱主题。'
  },
  墨华: {
    name: '墨华',
    howToGet: '无限模式达到500分',
    description: '水墨晕染的东方曲谱风格。'
  },
  寰宇: {
    name: '寰宇',
    howToGet: '无限模式达到10000分',
    description: '星空深蓝的宇宙曲谱主题。'
  },
  晨曦: {
    name: '晨曦',
    howToGet: '完成主线剧情',
    description: '暖色朝霞的曲谱主题。'
  },
  竹林: {
    name: '竹林',
    howToGet: '无限模式达到2000分',
    description: '竹绿自然风的曲谱主题。'
  }
} satisfies Record<string, BuiltinCollectionMeta>

/**
 * 内置藏品元数据表：type → contentKey → meta
 * 二期社区下载的藏品不在此表，元数据来自数据库字段。
 */
export const BUILTIN_COLLECTION_META: Partial<
  Record<CollectionDbType, Record<string, BuiltinCollectionMeta>>
> = {
  tone_color: ToneColorBuiltinMeta,
  perform_skin: PerformSkinNameList,
  piano_skin: VirtualPianoSkinBuiltinMeta,
  score_skin: ScoreSkinBuiltinMeta
}

export const COLLECTION_ENUM_TO_DB: Record<CollectionTypeEnum, CollectionDbType> = {
  [CollectionTypeEnum.ToneColor]: 'tone_color',
  [CollectionTypeEnum.ScoreSkin]: 'score_skin',
  [CollectionTypeEnum.VirtualPianoSkin]: 'piano_skin',
  [CollectionTypeEnum.PerformSkin]: 'perform_skin'
}

export const COLLECTION_DB_TO_ENUM: Record<CollectionDbType, CollectionTypeEnum> = {
  tone_color: CollectionTypeEnum.ToneColor,
  score_skin: CollectionTypeEnum.ScoreSkin,
  piano_skin: CollectionTypeEnum.VirtualPianoSkin,
  perform_skin: CollectionTypeEnum.PerformSkin
}

export const COLLECTION_TYPE_LABEL: Record<CollectionDbType, string> = {
  tone_color: '音色',
  score_skin: '曲谱皮肤',
  piano_skin: '钢琴皮肤',
  perform_skin: '演奏皮肤'
}

export function getBuiltinMeta(
  type: CollectionDbType,
  contentKey: string
): BuiltinCollectionMeta | null {
  const key = contentKey.trim()
  if (!key) return null
  return BUILTIN_COLLECTION_META[type]?.[key] ?? null
}

/** 列表类型筛选：全部 + 各藏品枚举 */
export const COLLECTION_TYPE_FILTER_OPTIONS: Array<{
  value: CollectionDbType | 'all'
  label: string
}> = [
  { value: 'all', label: '全部' },
  ...Object.values(CollectionTypeEnum).map((enumValue) => {
    const dbType = COLLECTION_ENUM_TO_DB[enumValue]
    return { value: dbType, label: COLLECTION_TYPE_LABEL[dbType] }
  })
]
