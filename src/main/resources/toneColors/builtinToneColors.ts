import accousticGrandPiano from './accoustic_grand_piano.json'
import acousticGuitarNylon from './acoustic_guitar_nylon.json'
import brightAcousticPiano from './bright_acoustic_piano.json'
import electricGrandPiano from './electric_grand_piano.json'
import musicBox from './music_box.json'
import violin from './violin.json'

/** 内置音色：content 存 NPlayer 音色 JSON */
export const BUILTIN_TONE_COLOR_SEEDS = [
  {
    name: '三角钢琴',
    content: JSON.stringify(accousticGrandPiano),
    description: '温暖饱满的三角钢琴音色。'
  },
  {
    name: '亮音钢琴',
    content: JSON.stringify(brightAcousticPiano),
    description: '更明亮、穿透力更强的钢琴音色。'
  },
  {
    name: '电钢琴',
    content: JSON.stringify(electricGrandPiano),
    description: '经典电钢琴音色，适合流行与爵士。'
  },
  {
    name: '尼龙弦吉他',
    content: JSON.stringify(acousticGuitarNylon),
    description: '柔和的尼龙弦古典吉他音色。'
  },
  {
    name: '小提琴',
    content: JSON.stringify(violin),
    description: '抒情细腻的小提琴音色。'
  },
  {
    name: '八音盒',
    content: JSON.stringify(musicBox),
    description: '清脆梦幻的八音盒音色。'
  }
] as const

export const DEFAULT_TONE_COLOR_NAME = BUILTIN_TONE_COLOR_SEEDS[0].name
