import fs from 'fs'
import { fn, col } from 'sequelize'
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
import { getLogger } from '../utils/log'
import {
  buildClassicPurePianoPack,
  buildHeavyMetalPianoPack,
  buildMonoChromePianoPack,
  buildWoodBoardPianoPack
} from '../resources/virtualPianoSkins/builtinSkins'
import { BUILTIN_SCORE_SKIN_SEEDS } from '../resources/scoreSkins/builtinScoreSkins'
import {
  BUILTIN_TONE_COLOR_SEEDS,
  builtinToneColorFilePath,
  readBuiltinToneColorContent,
  type BuiltinToneColorSeed
} from '../resources/toneColors/builtinToneColors'
import { builtinCollectionThumbnailUrl } from '../constant/collectionThumbnail'

const logger = getLogger('CollectionSeed')

const EMPTY_OPTION = '{}'

/** 空洞演奏皮肤默认参数；须与 renderer `performSkin/hollow/option.ts` 的默认值一致 */
const HOLLOW_DEFAULT_OPTION = JSON.stringify({
  gradientStops: [
    { color: '#FF8A00', offset: 0 },
    { color: '#FFD45C', offset: 40 },
    { color: '#FFF6D6', offset: 55 },
    { color: '#C86A00', offset: 100 }
  ],
  flowSpeed: 50,
  glowStrength: 60
})

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
  },
  {
    name: '像素街机演奏皮肤',
    content: 'PixelArcade',
    description: '像素街机演奏皮肤：CRT 扫描线与像素星空，彩色像素柱，按键迸出像素碎片。'
  },
  {
    name: '薄荷汽水演奏皮肤',
    content: 'MintSoda',
    description: '薄荷汽水演奏皮肤：清凉薄荷汽水与上浮气泡，柠檬黄高亮，按键冒泡。'
  },
  {
    name: '樱花演奏皮肤',
    content: 'Sakura',
    description: '樱花演奏皮肤：远山樱枝与漫天落樱，樱枝基准线，按键绽放花瓣。'
  },
  {
    name: '萤火演奏皮肤',
    content: 'Firefly',
    description: '萤火演奏皮肤：月下暮色森林与游走萤火，苔绿光柱，按键放飞萤火虫。'
  },
  {
    name: '霓虹落日演奏皮肤',
    content: 'Synthwave',
    description: '霓虹落日演奏皮肤：条纹落日、线框山脉与透视网格，霓虹光柱，按键喷射火花。'
  },
  {
    name: '极光演奏皮肤',
    content: 'Aurora',
    description: '极光演奏皮肤：雪山星夜与飘动极光，冰青光柱，按键升起光柱并迸出冰晶。'
  },
  {
    name: '金龙演奏皮肤',
    content: 'ImperialDragon',
    description: '金龙演奏皮肤：朱红宫灯祥云与游龙戏珠，金鳞朱漆光柱，按键绽放金色烟花。'
  },
  {
    name: '雷霆演奏皮肤',
    content: 'Thunder',
    description: '雷霆演奏皮肤：暴雨积云与分叉闪电，电弧等离子光柱，按键电弧连锁。'
  },
  {
    name: '空洞演奏皮肤',
    content: 'Hollow',
    description: '空洞演奏皮肤：纯黑底上渐变流动的发光线框水柱与光晕基准线，按住琴键有细光线缓缓向上飘散，渐变色可在藏品中自定义。',
    option: HOLLOW_DEFAULT_OPTION
  }
] as const satisfies ReadonlyArray<{ name: string; content: string; description: string; option?: string }>

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
  option?: string
}

function isEmptyOption(option: string | null | undefined) {
  const raw = option?.trim()
  return !raw || raw === EMPTY_OPTION
}

async function syncCollectionAutoIncrement() {
  await sequelize.query(
    `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('collection', ${BUILTIN_COLLECTION_MAX_SEED_ID})`
  )
}

/** 写入或更新内置藏品；已拥有的 owned 不会被默认值覆盖 */
async function upsertBuiltinCollection(seed: BuiltinCollectionSeed) {
  const existing = await CollectionModel.findByPk(seed.id)
  if (existing && !existing.is_built_in) {
    logger.warn(`藏品 id=${seed.id} 已被非内置藏品占用，跳过内置藏品「${seed.name}」`)
    return
  }

  const seedOption = seed.option ?? EMPTY_OPTION

  if (existing) {
    await existing.update({
      type: seed.type,
      name: seed.name,
      content: seed.content,
      description: seed.description,
      is_built_in: true,
      owned: existing.owned || seed.owned,
      level: seed.level,
      thumbnail: seed.thumbnail,
      // 用户保存过的参数不覆盖，只给还没有参数的记录补默认值
      ...(isEmptyOption(existing.option) ? { option: seedOption } : {})
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
    thumbnail: seed.thumbnail,
    option: seedOption
  })
}

function readFileHead(filePath: string, length: number): Buffer {
  const fd = fs.openSync(filePath, 'r')
  try {
    const buf = Buffer.alloc(length)
    fs.readSync(fd, buf, 0, length, 0)
    return buf
  } finally {
    fs.closeSync(fd)
  }
}

/**
 * 音色本体每个 2~5MB，每次启动全量读写代价太大：
 * 仅在新增、文件长度变化或文件比记录新时才读盘写入 content，其余只同步元数据。
 */
async function syncBuiltinToneColor(seed: BuiltinToneColorSeed) {
  const filePath = builtinToneColorFilePath(seed.file)
  if (!fs.existsSync(filePath)) {
    logger.warn(`内置音色文件缺失，跳过: ${filePath}`)
    return
  }

  const existing = await CollectionModel.findByPk(seed.id, {
    attributes: {
      exclude: ['content'],
      include: [[fn('length', col('content')), 'content_length']]
    }
  })
  if (existing && !existing.is_built_in) {
    logger.warn(`藏品 id=${seed.id} 已被非内置藏品占用，跳过内置音色「${seed.name}」`)
    return
  }

  const meta = {
    type: COLLECTION_TYPE.TONE_COLOR,
    name: seed.name,
    description: seed.description,
    is_built_in: true,
    level: resolveBuiltinCollectionLevel('toneColor', seed.name),
    thumbnail: builtinCollectionThumbnailUrl(seed.id)
  }
  const seedOwned = isDefaultBuiltinCollectionOwned(seed.id)

  if (!existing) {
    await CollectionModel.create({
      id: seed.id,
      ...meta,
      content: readBuiltinToneColorContent(seed.file),
      owned: seedOwned
    })
    return
  }

  const stat = fs.statSync(filePath)
  const head = readFileHead(filePath, 2)
  const isGzip = head[0] === 0x1f && head[1] === 0x8b
  const storedLength = Number(existing.get('content_length') ?? 0)
  const expectedLength = isGzip ? null : stat.size
  const content =
    storedLength === 0 ||
    (expectedLength != null && storedLength !== expectedLength) ||
    stat.mtime > existing.updated_at
      ? readBuiltinToneColorContent(seed.file)
      : null

  await existing.update({
    ...meta,
    ...(content != null ? { content } : {}),
    owned: existing.owned || seedOwned
  })
}

/** 同步全部内置藏品（每次启动执行；可安全重复执行，不会取消已拥有） */
export async function syncBuiltinCollections() {
  for (const seed of BUILTIN_TONE_COLOR_SEEDS) {
    await syncBuiltinToneColor(seed)
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
      thumbnail: builtinCollectionThumbnailUrl(id),
      option: 'option' in item ? item.option : undefined
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

