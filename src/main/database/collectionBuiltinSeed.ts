import { COLLECTION_TYPE } from '../constant/collection'
import CollectionModel from '../models/CollectionModel'
import {
  buildClassicPurePianoPack,
  buildMetalGlossPianoPack
} from '../resources/virtualPianoSkins/builtinSkins'
import { BUILTIN_SCORE_SKIN_SEEDS } from '../resources/scoreSkins/builtinScoreSkins'

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
    name: '金属质感',
    buildContent: buildMetalGlossPianoPack,
    description: '金属渐变质感琴键，按下时暖金铜色反馈。'
  }
] as const

/** 写入内置藏品（随 migration 001 只执行一次） */
export async function insertBuiltinCollections() {
  for (const item of BUILTIN_SCORE_SKIN_SEEDS) {
    await CollectionModel.create({
      type: COLLECTION_TYPE.SCORE_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }

  for (const item of BUILTIN_PERFORM_SKINS) {
    await CollectionModel.create({
      type: COLLECTION_TYPE.PERFORM_SKIN,
      name: item.name,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }

  for (const item of BUILTIN_PIANO_SKINS) {
    await CollectionModel.create({
      type: COLLECTION_TYPE.PIANO_SKIN,
      name: item.name,
      content: JSON.stringify(item.buildContent()),
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }
}
