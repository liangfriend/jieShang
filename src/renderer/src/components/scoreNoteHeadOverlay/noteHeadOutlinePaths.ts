/** 五线谱符头轮廓（与 deciphony-renderer defaultSkin / noteSvg 一致） */
export const STANDARD_WHOLE_NOTE_RING_PATH =
  'M 16 4 A 8 5 0 0 1 0 4 A 8 5 0 0 1 16 4 L 13 4 A 5 2.5 0 0 0 3 4 A 5 2.5 0 0 0 13 4 Z'

export const STANDARD_TILTED_RING_PATH =
  'M 15 4 A 7 4.5 -20 0 1 1 4 A 7 4.5 -20 0 1 15 4 L 11.76 5.37 A 4 2 -20 0 0 4.24 2.63 A 4 2 -20 0 0 11.76 5.37 Z'

export const STANDARD_TILTED_FILLED_OUTLINE_PATH =
  'M 15 4 A 7 4.5 -20 0 1 1 4 A 7 4.5 -20 0 1 15 4 Z'

export const STANDARD_WHOLE_NOTE_LOCAL = {
  offsetX: 0,
  offsetY: 1,
  width: 16,
  height: 10
} as const

export const STANDARD_TILTED_NOTE_LOCAL = {
  offsetX: -0.7051,
  offsetY: 1.2474,
  width: 14.59,
  height: 10.49
} as const

export type StandardNoteHeadShape = 'whole' | 'tilted-ring' | 'tilted-filled'

export function resolveStandardNoteHeadShape(skinKey?: string): StandardNoteHeadShape | null {
  if (skinKey === 'noteHead_1') return 'whole'
  if (skinKey === 'noteHead_2') return 'tilted-ring'
  if (skinKey === 'noteHead_3') return 'tilted-filled'
  return null
}

export function isNumberNotationSkinKey(skinKey?: string): boolean {
  return Boolean(skinKey?.startsWith('Number_'))
}
