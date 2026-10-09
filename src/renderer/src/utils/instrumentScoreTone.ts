import type { MusicScore, SingleStaff } from '@deciphony/renderer'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import { writeStaffInstrumentValue } from '@deciphony/extensions/dr-play'
import { writeInstrumentName } from '@deciphony/extensions/dr-instrument-name'
import {
  findToneColorCatalogItemByKey,
  toneColorCatalogName
} from '@renderer/constant/toneColorCatalog'
import { FretboardScoreType, isFretboardScoreType } from '@renderer/constant/fretboardScoreType'
import { toneColorIdByKey } from '@renderer/utils/collection/toneColorUsage'

/** 与 dr-play TONE_VARIANT_HARMONIC 一致 */
const HARMONIC_VARIANT = 'harmonic'
const INSTRUMENT_VALUE_HARMONIC_KEY = `instrumentValue_${HARMONIC_VARIANT}`

/** 乐器谱（吉他 / 尤克里里 / 贝斯 / 鼓）创建时写入单谱表的音色键 */
export type InstrumentScoreTonePreset = {
  /** singleStaff.data.instrumentValue / NPlayer 音色名 */
  instrumentValue: string
  /** tab 泛音：instrumentValue_harmonic；鼓谱无 */
  instrumentValueHarmonic?: string
}

const GUITAR_LIKE: InstrumentScoreTonePreset = {
  instrumentValue: 'acoustic_guitar_nylon',
  // 泛音音色与基础音色同用尼龙弦（无单独泛音采样）
  instrumentValueHarmonic: 'acoustic_guitar_nylon'
}

const BASS_LIKE: InstrumentScoreTonePreset = {
  instrumentValue: 'acoustic_bass',
  // 暂无贝斯泛音音色，先与基础音色同键，保证 addToneColor 与播放键一致
  instrumentValueHarmonic: 'acoustic_bass'
}

const DRUM: InstrumentScoreTonePreset = {
  instrumentValue: 'percussion'
}

/** 曲谱类型 → 创建时默认音色；非乐器谱返回 null */
export function instrumentScoreTonePreset(
  type: MusicScoreTypeEnum | undefined | null
): InstrumentScoreTonePreset | null {
  if (type == null) return null
  if (type === FretboardScoreType.Guitar || type === FretboardScoreType.Ukulele) return GUITAR_LIKE
  if (
    type === FretboardScoreType.Bass4 ||
    type === FretboardScoreType.Bass5 ||
    type === FretboardScoreType.Bass6
  ) {
    return BASS_LIKE
  }
  if (type === MusicScoreTypeEnum.DrumNotation) return DRUM
  return null
}

export function isInstrumentLockedScoreType(type: MusicScoreTypeEnum | undefined | null): boolean {
  return instrumentScoreTonePreset(type) != null
}

function displayNameForToneKey(key: string): string {
  const item = findToneColorCatalogItemByKey(key)
  return item ? toneColorCatalogName(item, 'zh') : key
}

function writeInstrumentValueHarmonic(staff: SingleStaff, value: string | undefined): void {
  const data = (staff.data ?? {}) as Record<string, unknown>
  if (value == null || !value.trim()) {
    delete data[INSTRUMENT_VALUE_HARMONIC_KEY]
  } else {
    data[INSTRUMENT_VALUE_HARMONIC_KEY] = value.trim()
  }
  staff.data = data
}

/** 按曲谱类型写入单谱表 instrumentValue / 泛音键 / 展示名 */
export function applyInstrumentScoreToneToStaff(
  staff: SingleStaff,
  type: MusicScoreTypeEnum | undefined | null
): void {
  const preset = instrumentScoreTonePreset(type)
  if (!preset) return
  writeStaffInstrumentValue(staff, preset.instrumentValue)
  writeInstrumentName(staff, displayNameForToneKey(preset.instrumentValue))
  if (preset.instrumentValueHarmonic) {
    writeInstrumentValueHarmonic(staff, preset.instrumentValueHarmonic)
  }
}

/** 曲谱上所有单谱表套用乐器谱默认音色（创建模版用） */
export function applyInstrumentScoreToneToScore(score: MusicScore): void {
  const type = score.type
  if (!instrumentScoreTonePreset(type)) return
  for (const grandStaff of score.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      applyInstrumentScoreToneToStaff(staff, type)
    }
  }
}

/**
 * 收集曲谱播放需要的音色藏品 id：
 * 各单谱表 instrumentValue + instrumentValue_harmonic（及曲谱 data 同名键）。
 */
export function collectInstrumentToneColorIds(musicScore: MusicScore): number[] {
  const keys = new Set<string>()
  const take = (data: unknown) => {
    if (data == null || typeof data !== 'object' || Array.isArray(data)) return
    const bag = data as Record<string, unknown>
    for (const key of ['instrumentValue', INSTRUMENT_VALUE_HARMONIC_KEY]) {
      const raw = bag[key]
      if (typeof raw === 'string' && raw.trim()) keys.add(raw.trim())
    }
  }
  take(musicScore.data)
  for (const grandStaff of musicScore.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) take(staff.data)
  }
  const ids = new Set<number>()
  for (const key of keys) {
    const id = toneColorIdByKey(key)
    if (id != null) ids.add(id)
  }
  return [...ids]
}

/** 指板类谱（吉他 / 尤克里里 / 贝斯）播放需同时灌基础音色与泛音音色 */
export function needsHarmonicToneColor(type: MusicScoreTypeEnum | undefined | null): boolean {
  return isFretboardScoreType(type)
}
