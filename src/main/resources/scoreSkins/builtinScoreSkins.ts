import bambooForestScoreSkin from './bambooForest.json'
import cosmosScoreSkin from './cosmos.json'
import dawnScoreSkin from './dawn.json'
import defaultScoreSkin from './default.json'
import glacierScoreSkin from './glacier.json'
import moHuaScoreSkin from './moHua.json'

/** 内置曲谱皮肤：content 存 deciphony-renderer SkinPack JSON */
export const BUILTIN_SCORE_SKIN_SEEDS = [
  {
    name: '默认',
    content: JSON.stringify(defaultScoreSkin),
    description: '经典黑白五线谱符号，简洁清晰。'
  },
  {
    name: '冰川',
    content: JSON.stringify(glacierScoreSkin),
    description: '冰蓝清透的曲谱主题。'
  },
  {
    name: '墨华',
    content: JSON.stringify(moHuaScoreSkin),
    description: '水墨晕染的东方曲谱风格。'
  },
  {
    name: '寰宇',
    content: JSON.stringify(cosmosScoreSkin),
    description: '星空深蓝的宇宙曲谱主题。'
  },
  {
    name: '晨曦',
    content: JSON.stringify(dawnScoreSkin),
    description: '暖色朝霞的曲谱主题。'
  },
  {
    name: '竹林',
    content: JSON.stringify(bambooForestScoreSkin),
    description: '竹绿自然风的曲谱主题。'
  }
] as const

export const DEFAULT_SCORE_SKIN_NAME = BUILTIN_SCORE_SKIN_SEEDS[0].name
