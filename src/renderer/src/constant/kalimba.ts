import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'

export const KALIMBA_COLLECTION_ID = BUILTIN_COLLECTION_SEED_IDS.toneColor.卡林巴

export type KalimbaModelId = 'tines17-c' | 'tines21-c'

export type KalimbaTine = {
  midi: number
  /** 快捷键（小写字母） */
  key: string
}

export type KalimbaModel = {
  id: KalimbaModelId
  /** i18n: instrumentSim.kalimba.models.<key> */
  labelKey: string
  /** 从左到右排列：中间最低，向两侧交替升高 */
  tines: KalimbaTine[]
}

const C_MAJOR_STEPS = [2, 2, 1, 2, 2, 2, 1]

/** 从 startMidi（须为 C 大调音）起连续 count 个自然音 */
function diatonic(startMidi: number, count: number): number[] {
  const pc = [0, 2, 4, 5, 7, 9, 11]
  let degree = pc.indexOf(((startMidi % 12) + 12) % 12)
  const out = [startMidi]
  while (out.length < count) {
    out.push(out[out.length - 1]! + C_MAJOR_STEPS[degree % 7]!)
    degree++
  }
  return out
}

/**
 * 键位：左侧琴键用键盘左半区、右侧琴键用右半区。
 * 每侧从中间向外依次取：主行（由内向外）→ 上行（由内向外）→ 下行；中间最低音用 G 键。
 */
const CENTER_KEY = 'g'
const LEFT_KEYS = ['f', 'd', 's', 'a', 't', 'r', 'e', 'w', 'q', 'b']
const RIGHT_KEYS = ['h', 'j', 'k', 'l', 'y', 'u', 'i', 'o', 'p', 'n']

/** 由升序音高生成左右交替排布：最低在中间，第 2 低在左，第 3 低在右… */
function buildTines(midis: number[]): KalimbaTine[] {
  const [center, ...rest] = midis
  const left: KalimbaTine[] = []
  const right: KalimbaTine[] = []
  rest.forEach((midi, i) => {
    if (i % 2 === 0) left.push({ midi, key: LEFT_KEYS[left.length]! })
    else right.push({ midi, key: RIGHT_KEYS[right.length]! })
  })
  return [...left.reverse(), { midi: center!, key: CENTER_KEY }, ...right]
}

export const KALIMBA_MODELS: Record<KalimbaModelId, KalimbaModel> = {
  /** C4 – E6 */
  'tines17-c': { id: 'tines17-c', labelKey: 'tines17', tines: buildTines(diatonic(60, 17)) },
  /** F3 – E6 */
  'tines21-c': { id: 'tines21-c', labelKey: 'tines21', tines: buildTines(diatonic(53, 21)) }
}

export const KALIMBA_MODEL_LIST = Object.values(KALIMBA_MODELS)

export const DEFAULT_KALIMBA_MODEL_ID: KalimbaModelId = 'tines17-c'

/** 平缓模式包络（秒） */
export const KALIMBA_SMOOTH_ENVELOPE = {
  attack: 0.008,
  decay: 0.12,
  peakVolume: 1.1,
  release: 0.45
} as const

export const KALIMBA_PREF_STORAGE_KEY = 'jieShang.kalimbaSimPrefs'

export type KalimbaSimPrefs = {
  modelId: KalimbaModelId
  smoothEnvelope: boolean
}

export function loadKalimbaPrefs(): KalimbaSimPrefs {
  const fallback: KalimbaSimPrefs = { modelId: DEFAULT_KALIMBA_MODEL_ID, smoothEnvelope: true }
  try {
    const raw = localStorage.getItem(KALIMBA_PREF_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<KalimbaSimPrefs>
    return {
      modelId: parsed.modelId && KALIMBA_MODELS[parsed.modelId] ? parsed.modelId : fallback.modelId,
      smoothEnvelope: parsed.smoothEnvelope ?? true
    }
  } catch {
    return fallback
  }
}

export function saveKalimbaPrefs(prefs: KalimbaSimPrefs): void {
  localStorage.setItem(KALIMBA_PREF_STORAGE_KEY, JSON.stringify(prefs))
}
