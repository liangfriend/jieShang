import { CollectionTypeEnum, type CollectionDbType } from '@renderer/types/collection'

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
  }
} satisfies Record<string, BuiltinCollectionMeta>

/** 钢琴皮肤内置元数据（按 name 索引；content 存皮肤本体 JSON） */
export const VirtualPianoSkinBuiltinMeta = {
  经典纯色: {
    name: '经典纯色',
    howToGet: '买游戏就送',
    description: '黑白纯色矩形琴键，简洁清晰。'
  },
  金属质感: {
    name: '金属质感',
    howToGet: '完成新手教程',
    description: '金属渐变与高光，更有质感。'
  }
} satisfies Record<string, BuiltinCollectionMeta>

/** 曲谱皮肤内置元数据（按 name 索引；content 存 SkinPack JSON） */
export const ScoreSkinBuiltinMeta = {
  默认曲谱皮肤: {
    name: '默认曲谱皮肤',
    howToGet: '买游戏就送',
    description: '经典黑白五线谱符号，简洁清晰。'
  },
  冰川曲谱皮肤: {
    name: '冰川曲谱皮肤',
    howToGet: '完成主线剧情',
    description: '冰蓝渐变与雪花点缀的曲谱主题。'
  },
  竹林曲谱皮肤: {
    name: '竹林曲谱皮肤',
    howToGet: '探索竹林关卡',
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
