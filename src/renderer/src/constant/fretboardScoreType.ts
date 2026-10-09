import { MusicScoreTypeEnum } from '@deciphony/renderer'

/**
 * 指板类曲谱 type 数值（与本地 `@deciphony/renderer` MusicScoreTypeEnum 对齐）。
 * node_modules 尚未发版时类型里可能仍是 Tab6/Tab4；运行时 `dev:local` 读本地包。
 */
export const FretboardScoreType = {
  /** 吉他 TAB（旧名 Tab6） */
  Guitar: 3 as MusicScoreTypeEnum,
  /** 尤克里里 TAB（旧名 Tab4） */
  Ukulele: 5 as MusicScoreTypeEnum,
  /** 五弦贝斯 */
  Bass5: 6 as MusicScoreTypeEnum,
  /** 四弦贝斯 */
  Bass4: 7 as MusicScoreTypeEnum,
  /** 六弦贝斯 */
  Bass6: 8 as MusicScoreTypeEnum
} as const

export function isFretboardScoreType(type: MusicScoreTypeEnum | undefined | null): boolean {
  if (type == null) return false
  return (
    type === FretboardScoreType.Guitar ||
    type === FretboardScoreType.Ukulele ||
    type === FretboardScoreType.Bass4 ||
    type === FretboardScoreType.Bass5 ||
    type === FretboardScoreType.Bass6
  )
}

export function fretboardStringCount(type: MusicScoreTypeEnum | undefined | null): 4 | 5 | 6 {
  if (type === FretboardScoreType.Ukulele || type === FretboardScoreType.Bass4) return 4
  if (type === FretboardScoreType.Bass5) return 5
  return 6
}

/** 与 dr-play 空弦表一致：region 0 = 1 弦 */
export const GUITAR_OPEN_MIDI = [64, 59, 55, 50, 45, 40] as const
export const UKULELE_OPEN_MIDI = [69, 64, 60, 67] as const
export const BASS4_OPEN_MIDI = [28, 33, 38, 43] as const
export const BASS5_OPEN_MIDI = [23, 28, 33, 38, 43] as const
export const BASS6_OPEN_MIDI = [23, 28, 33, 38, 43, 48] as const

export function resolveOpenMidiForScoreType(type: MusicScoreTypeEnum): readonly number[] {
  if (type === FretboardScoreType.Ukulele) return UKULELE_OPEN_MIDI
  if (type === FretboardScoreType.Bass4) return BASS4_OPEN_MIDI
  if (type === FretboardScoreType.Bass5) return BASS5_OPEN_MIDI
  if (type === FretboardScoreType.Bass6) return BASS6_OPEN_MIDI
  return GUITAR_OPEN_MIDI
}
