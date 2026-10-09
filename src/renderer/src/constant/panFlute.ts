import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'

export const PAN_FLUTE_COLLECTION_ID = BUILTIN_COLLECTION_SEED_IDS.toneColor.排箫

export type PanFluteModelId = 'pipes16-c' | 'pipes18-c'

export type PanFluteModel = {
  id: PanFluteModelId
  /** i18n: instrumentSim.panFlute.models.<key> */
  labelKey: string
  /** 从低到高（左 → 右） */
  midis: number[]
}

/** C 大调自然音阶，从 G4 起 */
function diatonicFromG4(count: number): number[] {
  const steps = [2, 2, 1, 2, 2, 2, 1]
  // G4 起：G→A→B→C 的步距从下标 4 开始
  const out = [67]
  let i = 4
  while (out.length < count) {
    out.push(out[out.length - 1]! + steps[i % 7]!)
    i++
  }
  return out
}

export const PAN_FLUTE_MODELS: Record<PanFluteModelId, PanFluteModel> = {
  'pipes16-c': { id: 'pipes16-c', labelKey: 'pipes16', midis: diatonicFromG4(16) },
  'pipes18-c': { id: 'pipes18-c', labelKey: 'pipes18', midis: diatonicFromG4(18) }
}

export const PAN_FLUTE_MODEL_LIST = Object.values(PAN_FLUTE_MODELS)

export const DEFAULT_PAN_FLUTE_MODEL_ID: PanFluteModelId = 'pipes16-c'

/** 平缓模式包络（秒） */
export const PAN_FLUTE_SMOOTH_ENVELOPE = {
  attack: 0.06,
  decay: 0.1,
  peakVolume: 1.1,
  release: 0.28
} as const

export const PAN_FLUTE_PREF_STORAGE_KEY = 'jieShang.panFluteSimPrefs'

export type PanFluteSimPrefs = {
  modelId: PanFluteModelId
  smoothEnvelope: boolean
}

export function loadPanFlutePrefs(): PanFluteSimPrefs {
  const fallback: PanFluteSimPrefs = { modelId: DEFAULT_PAN_FLUTE_MODEL_ID, smoothEnvelope: true }
  try {
    const raw = localStorage.getItem(PAN_FLUTE_PREF_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PanFluteSimPrefs>
    return {
      modelId:
        parsed.modelId && PAN_FLUTE_MODELS[parsed.modelId] ? parsed.modelId : fallback.modelId,
      smoothEnvelope: parsed.smoothEnvelope ?? true
    }
  } catch {
    return fallback
  }
}

export function savePanFlutePrefs(prefs: PanFluteSimPrefs): void {
  localStorage.setItem(PAN_FLUTE_PREF_STORAGE_KEY, JSON.stringify(prefs))
}
