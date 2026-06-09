import { COLLECTION_TYPE } from '../constant/collection'
import CollectionModel from '../models/CollectionModel'

const BUILTIN_PERFORM_SKINS = [
  {
    content: 'default',
    description: '默认演奏皮肤：黄块激活蓝，白底红基准线。'
  },
  {
    content: 'RainBow',
    description: '彩虹演奏皮肤：糖果色瀑布与渐变背景。'
  }
] as const

/** migration 005 建表后写入内置演奏皮肤（仅执行一次） */
export async function insertBuiltinPerformSkins() {
  for (const item of BUILTIN_PERFORM_SKINS) {
    await CollectionModel.create({
      type: COLLECTION_TYPE.PERFORM_SKIN,
      content: item.content,
      description: item.description,
      is_built_in: true,
      owned: true
    })
  }
}
