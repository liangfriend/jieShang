import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import { DIZI6_G_CHART, type FingeringChart } from '@renderer/constant/fingering'

export const PICCOLO_COLLECTION_ID = BUILTIN_COLLECTION_SEED_IDS.toneColor.短笛

export type PiccoloModelId = 'dizi6-g'

/** 笛头（吹孔）朝向演奏者身体的哪一侧 */
export type PiccoloFacing = 'left' | 'right'

export type PiccoloKeyMap = {
  /** 按孔位下标（0 = 最靠近吹孔）的全按 / 半按键 */
  full: string[]
  half: string[]
}

export type PiccoloModel = {
  id: PiccoloModelId
  /** i18n: instrumentSim.piccolo.models.<key> */
  labelKey: string
  chart: FingeringChart
  /** 朝左时右手反握，朝右时左手反握，键位随之镜像 */
  keys: Record<PiccoloFacing, PiccoloKeyMap>
}

export const PICCOLO_MODELS: Record<PiccoloModelId, PiccoloModel> = {
  'dizi6-g': {
    id: 'dizi6-g',
    labelKey: 'dizi6G',
    chart: DIZI6_G_CHART,
    keys: {
      left: {
        full: ['q', 'w', 'e', 'p', 'o', 'i'],
        half: ['a', 's', 'd', 'l', 'k', 'j']
      },
      right: {
        full: ['o', 'i', 'u', 'q', 'w', 'e'],
        half: ['l', 'k', 'j', 'a', 's', 'd']
      }
    }
  }
}

export const PICCOLO_MODEL_LIST = Object.values(PICCOLO_MODELS)

export const DEFAULT_PICCOLO_MODEL_ID: PiccoloModelId = 'dizi6-g'

/** 吹气来源：麦克风气压 / 按住空格 */
export type PiccoloBreathMode = 'mic' | 'space'

/** 气压 0 → 1 映射到总音量 0 → PICCOLO_MAX_VOLUME */
export const PICCOLO_MAX_VOLUME = 2
/** 同一指法有多个八度时，气压 0 → 1 上各音（从低到高）所占宽度；未列出的个数按等分 */
export const PICCOLO_REGISTER_WIDTHS: Record<number, number[]> = {
  2: [0.7, 0.3],
  3: [0.4, 0.3, 0.3]
}
/** 段边界的迟滞，避免临界来回跳 */
export const PICCOLO_REGISTER_HYSTERESIS = 0.03

/** count 个候选音时每段的起点，如 3 → [0, 0.4, 0.7] */
export function piccoloRegisterStarts(count: number): number[] {
  const widths =
    PICCOLO_REGISTER_WIDTHS[count] ?? Array.from({ length: count }, () => 1 / count)
  const starts: number[] = []
  let acc = 0
  for (const w of widths) {
    starts.push(acc)
    acc += w
  }
  return starts
}
/** 换音时旧音的释放时长（秒） */
export const PICCOLO_SWITCH_RELEASE_SEC = 0.05

export const PICCOLO_PREF_STORAGE_KEY = 'jieShang.piccoloSimPrefs'

export type PiccoloSimPrefs = {
  modelId: PiccoloModelId
  facing: PiccoloFacing
  breathMode: PiccoloBreathMode
}

export function loadPiccoloPrefs(): PiccoloSimPrefs {
  const fallback: PiccoloSimPrefs = {
    modelId: DEFAULT_PICCOLO_MODEL_ID,
    facing: 'left',
    breathMode: 'mic'
  }
  try {
    const raw = localStorage.getItem(PICCOLO_PREF_STORAGE_KEY)
    if (!raw) return fallback
    const parsed = JSON.parse(raw) as Partial<PiccoloSimPrefs>
    return {
      modelId: parsed.modelId && PICCOLO_MODELS[parsed.modelId] ? parsed.modelId : fallback.modelId,
      facing: parsed.facing === 'right' ? 'right' : 'left',
      breathMode: parsed.breathMode === 'space' ? 'space' : 'mic'
    }
  } catch {
    return fallback
  }
}

export function savePiccoloPrefs(prefs: PiccoloSimPrefs): void {
  localStorage.setItem(PICCOLO_PREF_STORAGE_KEY, JSON.stringify(prefs))
}
