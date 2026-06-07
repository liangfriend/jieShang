import type { ToneColorId } from '@renderer/types/toneColor'

export interface ToneColorMeta {
  id: ToneColorId
  labelZh: string
  labelEn: string
  /** NPlayer addToneColor 使用的资源路径（相对 renderer） */
  assetPath: string
  loader: () => Promise<{ default: unknown }>
}

/** 音色 id → 展示名与资源路径；后续新增音色在此扩展 */
export const TONE_COLOR_MAP: Record<ToneColorId, ToneColorMeta> = {
  accoustic_grand_piano: {
    id: 'accoustic_grand_piano',
    labelZh: '声学钢琴',
    labelEn: 'Acoustic Grand Piano',
    assetPath: '@renderer/toneColor/accoustic_grand_piano.json',
    loader: () => import('@renderer/toneColor/accoustic_grand_piano.json')
  }
}

export const TONE_COLOR_OPTIONS = Object.values(TONE_COLOR_MAP)

export const DEFAULT_TONE_COLOR_ID: ToneColorId = 'accoustic_grand_piano'

export function resolveToneColorLabel(id: ToneColorId): string {
  return TONE_COLOR_MAP[id]?.labelZh ?? id
}
