/**
 * 通用口琴数据模型：孔位数组即可描述任意种类（布鲁斯 / 复音 / 未来半音阶）。
 * blowMidi / drawMidi 为 null 表示该孔该方向无簧；slide* 预留给半音阶推键。
 */

export type HarmonicaBreath = 'blow' | 'draw'

export type HarmonicaHoleDef = {
  /** 1-based 孔号 */
  index: number
  blowMidi: number | null
  drawMidi: number | null
  blowSlideMidi?: number | null
  drawSlideMidi?: number | null
}

export type HarmonicaModelId = 'blues10-c' | 'tremolo24-c'

export type HarmonicaModel = {
  id: HarmonicaModelId
  /** i18n: instrumentSim.harmonica.models.<key> */
  labelKey: string
  holes: HarmonicaHoleDef[]
  viewBox: { width: number; height: number }
  /** 孔排几何（吹口朝向用户的正视图） */
  holeRow: {
    y: number
    height: number
    startX: number
    endX: number
  }
  /** 装饰用机体 SVG（可选） */
  bodyAsset: 'blues10' | 'tremolo24'
  /** 默认嘴宽（覆盖孔数） */
  defaultMouthHoles: number
}

export const HARMONICA_COLLECTION_ID = 22

export const HARMONICA_PREF_STORAGE_KEY = 'jieShang.harmonicaSimPrefs'

export type HarmonicaSimPrefs = {
  modelId: HarmonicaModelId
  mouthHoles: number
}

/** 10 孔 C 调布鲁斯（Richter），C3 起 */
const BLUES10_C_HOLES: HarmonicaHoleDef[] = [
  { index: 1, blowMidi: 48, drawMidi: 50 }, // C3 D3
  { index: 2, blowMidi: 52, drawMidi: 55 }, // E3 G3
  { index: 3, blowMidi: 55, drawMidi: 59 }, // G3 B3
  { index: 4, blowMidi: 60, drawMidi: 62 }, // C4 D4
  { index: 5, blowMidi: 64, drawMidi: 65 }, // E4 F4
  { index: 6, blowMidi: 67, drawMidi: 69 }, // G4 A4
  { index: 7, blowMidi: 72, drawMidi: 71 }, // C5 B4
  { index: 8, blowMidi: 76, drawMidi: 74 }, // E5 D5
  { index: 9, blowMidi: 79, drawMidi: 77 }, // G5 F5
  { index: 10, blowMidi: 84, drawMidi: 81 } // C6 A5
]

/**
 * 24 孔 C 调复音（亚洲音阶布局）：奇孔吹、偶孔吸。
 * 吹：G3 C4 E4 G4 C5 E5 G5 C6 E6 G6 C7 E7
 * 吸：D4 F4 A4 B4 D5 F5 A5 B5 D6 F6 A6 B6
 */
const TREMOLO24_C_HOLES: HarmonicaHoleDef[] = (() => {
  const blows = [55, 60, 64, 67, 72, 76, 79, 84, 88, 91, 96, 100]
  const draws = [62, 65, 69, 71, 74, 77, 81, 83, 86, 89, 93, 95]
  const holes: HarmonicaHoleDef[] = []
  for (let i = 0; i < 12; i++) {
    holes.push({ index: i * 2 + 1, blowMidi: blows[i]!, drawMidi: null })
    holes.push({ index: i * 2 + 2, blowMidi: null, drawMidi: draws[i]! })
  }
  return holes
})()

export const HARMONICA_MODELS: Record<HarmonicaModelId, HarmonicaModel> = {
  'blues10-c': {
    id: 'blues10-c',
    labelKey: 'blues10',
    holes: BLUES10_C_HOLES,
    viewBox: { width: 720, height: 160 },
    holeRow: { y: 58, height: 44, startX: 72, endX: 648 },
    bodyAsset: 'blues10',
    defaultMouthHoles: 2.5
  },
  'tremolo24-c': {
    id: 'tremolo24-c',
    labelKey: 'tremolo24',
    holes: TREMOLO24_C_HOLES,
    viewBox: { width: 980, height: 150 },
    holeRow: { y: 52, height: 46, startX: 48, endX: 932 },
    bodyAsset: 'tremolo24',
    defaultMouthHoles: 3
  }
}

export const HARMONICA_MODEL_LIST = Object.values(HARMONICA_MODELS)

export const DEFAULT_HARMONICA_MODEL_ID: HarmonicaModelId = 'tremolo24-c'

export function getHarmonicaModel(id: HarmonicaModelId): HarmonicaModel {
  return HARMONICA_MODELS[id] ?? HARMONICA_MODELS[DEFAULT_HARMONICA_MODEL_ID]
}

export function midiForHole(
  hole: HarmonicaHoleDef,
  breath: HarmonicaBreath,
  slide = false
): number | null {
  if (breath === 'blow') return slide ? (hole.blowSlideMidi ?? hole.blowMidi) : hole.blowMidi
  return slide ? (hole.drawSlideMidi ?? hole.drawMidi) : hole.drawMidi
}

export function holeCentersX(model: HarmonicaModel): number[] {
  const n = model.holes.length
  if (n <= 0) return []
  const { startX, endX } = model.holeRow
  if (n === 1) return [(startX + endX) / 2]
  const step = (endX - startX) / (n - 1)
  return model.holes.map((_, i) => startX + step * i)
}

export function holeSlotWidth(model: HarmonicaModel): number {
  const n = model.holes.length
  if (n <= 1) return model.holeRow.endX - model.holeRow.startX
  return (model.holeRow.endX - model.holeRow.startX) / (n - 1)
}

export function loadHarmonicaPrefs(): HarmonicaSimPrefs {
  const fallback: HarmonicaSimPrefs = {
    modelId: DEFAULT_HARMONICA_MODEL_ID,
    mouthHoles: HARMONICA_MODELS[DEFAULT_HARMONICA_MODEL_ID].defaultMouthHoles
  }
  try {
    const raw = localStorage.getItem(HARMONICA_PREF_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<HarmonicaSimPrefs>
    const modelId =
      parsed.modelId && HARMONICA_MODELS[parsed.modelId] ? parsed.modelId : fallback.modelId
    const mouth = Number(parsed.mouthHoles)
    return {
      modelId,
      mouthHoles:
        Number.isFinite(mouth) && mouth > 0
          ? Math.min(12, Math.max(0.5, mouth))
          : HARMONICA_MODELS[modelId].defaultMouthHoles
    }
  } catch {
    return fallback
  }
}

export function saveHarmonicaPrefs(prefs: HarmonicaSimPrefs): void {
  localStorage.setItem(HARMONICA_PREF_STORAGE_KEY, JSON.stringify(prefs))
}
