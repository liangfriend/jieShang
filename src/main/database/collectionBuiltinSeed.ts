import { COLLECTION_TYPE } from '../constant/collection'
import { BUILTIN_COLLECTION_MAX_SEED_ID, BUILTIN_COLLECTION_SEED_IDS } from '../constant/collectionSeedIds'
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
    description: '经典黑白纯色琴键，单矩形简洁样式。',
    owned: true
  },
  {
    name: '重金属',
    buildContent: buildHeavyMetalPianoPack,
    description: '抛光金属琴键，多段反射高光与镜面质感。',
    owned: true
  },
  {
    name: '黑白',
    buildContent: buildMonoChromePianoPack,
    description: '略带俯视的立体黑白琴键，顶面与前沿分明。',
    owned: true
  },
  {
    name: '木板',
    buildContent: buildWoodBoardPianoPack,
    description: '木纹木板白键与木桩年轮黑键，做旧质感。',
    owned: true
  }
] as const

async function syncCollectionAutoIncrement() {
  await sequelize.query(
    `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('collection', ${BUILTIN_COLLECTION_MAX_SEED_ID})`
  )
}

/** 写入内置藏品（随 migration 001 只执行一次） */
export async function insertBuiltinCollections() {
  for (const item of BUILTIN_TONE_COLOR_SEEDS) {
    const id = BUILTIN_COLLECTION_SEED_IDS.toneColor[item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.toneColor]
    await CollectionModel.create({
      id,
      type: COLLECTION_TYPE.TONE_COLOR,
      name: item.name,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }

  for (const item of BUILTIN_SCORE_SKIN_SEEDS) {
    const id = BUILTIN_COLLECTION_SEED_IDS.scoreSkin[item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.scoreSkin]
    await CollectionModel.create({
      id,
      type: COLLECTION_TYPE.SCORE_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }

  for (const item of BUILTIN_PERFORM_SKINS) {
    const id = BUILTIN_COLLECTION_SEED_IDS.performSkin[item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.performSkin]
    await CollectionModel.create({
      id,
      type: COLLECTION_TYPE.PERFORM_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }

  for (const item of BUILTIN_PIANO_SKINS) {
    const id = BUILTIN_COLLECTION_SEED_IDS.pianoSkin[item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.pianoSkin]
    await CollectionModel.create({
      id,
      type: COLLECTION_TYPE.PIANO_SKIN,
      name: item.name,
      content: JSON.stringify(item.buildContent()),
      description: item.description,
      is_built_in: true,
      owned: item.owned
    })
  }

  await syncCollectionAutoIncrement()
}
