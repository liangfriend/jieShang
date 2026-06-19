import { COLLECTION_TYPE } from '../constant/collection'
import type { CollectionType } from '../constant/collection'
import {
  BUILTIN_COLLECTION_MAX_SEED_ID,
  BUILTIN_COLLECTION_SEED_IDS,
  isDefaultBuiltinCollectionOwned,
  resolveBuiltinCollectionLevel
} from '../constant/collectionSeedIds'
import CollectionModel from '../models/CollectionModel'
import sequelize from './connection'
import {
  buildClassicPurePianoPack,
  buildHeavyMetalPianoPack,
  buildMonoChromePianoPack,
  buildWoodBoardPianoPack
} from '../resources/virtualPianoSkins/builtinSkins'
import { BUILTIN_SCORE_SKIN_SEEDS } from '../resources/scoreSkins/builtinScoreSkins'
import { BUILTIN_TONE_COLOR_SEEDS } from '../resources/toneColors/builtinToneColors'
import { builtinCollectionThumbnailUrl } from '../constant/collectionThumbnail'

/** 内置演奏皮肤：content 存内置名称 key */
const BUILTIN_PERFORM_SKINS = [
  {
    name: '默认演奏皮肤',
    content: 'default',
    description: '默认演奏皮肤：黄块激活蓝，白底红基准线。'
  },
  {
    name: '彩虹演奏皮肤',
    content: 'RainBow',
    description: '彩虹演奏皮肤：糖果色瀑布与渐变背景。'
  },
  {
    name: '二进制演奏皮肤',
    content: 'Binary',
    description: '二进制演奏皮肤：矩阵字符瀑布，白灰高亮与绿色字符喷发。'
  },
  {
    name: '星河演奏皮肤',
    content: 'StarRiver',
    description: '星河演奏皮肤：深空星野星云，白金色高亮与星屑喷发。'
  },
  {
    name: '斑马线演奏皮肤',
    content: 'ZebraCrossing',
    description: '斑马线演奏皮肤：倾斜黑白条纹，警示黄 active 高亮。'
  }
] as const

/** 内置钢琴皮肤：白键 / 黑键各一套，函数循环生成 VirtualPianoPack */
const BUILTIN_PIANO_SKINS = [
  {
    name: '经典纯色',
    buildContent: buildClassicPurePianoPack,
    description: '经典黑白纯色琴键，单矩形简洁样式。'
  },
  {
    name: '重金属',
    buildContent: buildHeavyMetalPianoPack,
    description: '抛光金属琴键，多段反射高光与镜面质感。'
  },
  {
    name: '黑白',
    buildContent: buildMonoChromePianoPack,
    description: '略带俯视的立体黑白琴键，顶面与前沿分明。'
  },
  {
    name: '木板',
    buildContent: buildWoodBoardPianoPack,
    description: '木纹木板白键与木桩年轮黑键，做旧质感。'
  }
] as const

type BuiltinCollectionSeed = {
  id: number
  type: CollectionType
  name: string
  content: string
  description: string
  owned: boolean
  level: number
  thumbnail: string
}

async function syncCollectionAutoIncrement() {
  await sequelize.query(
    `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('collection', ${BUILTIN_COLLECTION_MAX_SEED_ID})`
  )
}

/** 写入或更新内置藏品；已拥有的 owned 不会被默认值覆盖 */
async function upsertBuiltinCollection(seed: BuiltinCollectionSeed) {
  const existing = await CollectionModel.findByPk(seed.id)

  if (existing) {
    await existing.update({
      type: seed.type,
      name: seed.name,
      content: seed.content,
      description: seed.description,
      is_built_in: true,
      owned: existing.owned || seed.owned,
      level: seed.level,
      thumbnail: seed.thumbnail
    })
    return
  }

  await CollectionModel.create({
    id: seed.id,
    type: seed.type,
    name: seed.name,
    content: seed.content,
    description: seed.description,
    is_built_in: true,
    owned: seed.owned,
    level: seed.level,
    thumbnail: seed.thumbnail
  })
}

/** 同步全部内置藏品（migration 与云存档恢复后均可安全重复执行） */
export async function syncBuiltinCollections() {
  for (const item of BUILTIN_TONE_COLOR_SEEDS) {
    const id =
      BUILTIN_COLLECTION_SEED_IDS.toneColor[
        item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.toneColor
      ]
    await upsertBuiltinCollection({
      id,
      type: COLLECTION_TYPE.TONE_COLOR,
      name: item.name,
      content: item.content,
      description: item.description,
      owned: isDefaultBuiltinCollectionOwned(id),
      level: resolveBuiltinCollectionLevel('toneColor', item.name),
      thumbnail: builtinCollectionThumbnailUrl(id)
    })
  }

  for (const item of BUILTIN_SCORE_SKIN_SEEDS) {
    const id =
      BUILTIN_COLLECTION_SEED_IDS.scoreSkin[
        item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.scoreSkin
      ]
    await upsertBuiltinCollection({
      id,
      type: COLLECTION_TYPE.SCORE_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      owned: isDefaultBuiltinCollectionOwned(id),
      level: resolveBuiltinCollectionLevel('scoreSkin', item.name),
      thumbnail: builtinCollectionThumbnailUrl(id)
    })
  }

  for (const item of BUILTIN_PERFORM_SKINS) {
    const id =
      BUILTIN_COLLECTION_SEED_IDS.performSkin[
        item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.performSkin
      ]
    await upsertBuiltinCollection({
      id,
      type: COLLECTION_TYPE.PERFORM_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      owned: isDefaultBuiltinCollectionOwned(id),
      level: resolveBuiltinCollectionLevel('performSkin', item.name),
      thumbnail: builtinCollectionThumbnailUrl(id)
    })
  }

  for (const item of BUILTIN_PIANO_SKINS) {
    const id =
      BUILTIN_COLLECTION_SEED_IDS.pianoSkin[
        item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.pianoSkin
      ]
    await upsertBuiltinCollection({
      id,
      type: COLLECTION_TYPE.PIANO_SKIN,
      name: item.name,
      content: JSON.stringify(item.buildContent()),
      description: item.description,
      owned: isDefaultBuiltinCollectionOwned(id),
      level: resolveBuiltinCollectionLevel('pianoSkin', item.name),
      thumbnail: builtinCollectionThumbnailUrl(id)
    })
  }

  await syncCollectionAutoIncrement()
}

/** @deprecated 使用 syncBuiltinCollections */
export async function insertBuiltinCollections() {
  await syncBuiltinCollections()
}
