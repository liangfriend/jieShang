import bambooForestScoreSkin from './bambooForest.json'
import defaultScoreSkin from './default.json'
import glacierScoreSkin from './glacier.json'

/** 内置曲谱皮肤：content 存 deciphony-renderer SkinPack JSON */
export const BUILTIN_SCORE_SKIN_SEEDS = [
  {
    name: '默认曲谱皮肤',
    content: JSON.stringify(defaultScoreSkin),
    description: '经典黑白五线谱符号，简洁清晰。'
  },
  {
    name: '冰川曲谱皮肤',
    content: JSON.stringify(glacierScoreSkin),
    description: '冰蓝渐变与雪花点缀的曲谱主题。'
  },
  {
    name: '竹林曲谱皮肤',
    content: JSON.stringify(bambooForestScoreSkin),
    description: '竹绿自然风的曲谱主题。'
  }
] as const

export const DEFAULT_SCORE_SKIN_NAME = BUILTIN_SCORE_SKIN_SEEDS[0].name
