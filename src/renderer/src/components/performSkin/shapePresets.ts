import type { WaterfallColumnShape } from './types'

/** 瀑布流水柱默认几何：胶囊圆角 */
export const PERFORM_WATERFALL_COLUMN_SHAPE: WaterfallColumnShape = {
  width: 14,
  borderRadius: 999,
  opacity: 1
}

export function getPerformWaterfallActiveColumnShape(opacity = 0.85): WaterfallColumnShape {
  return {
    width: PERFORM_WATERFALL_COLUMN_SHAPE.width,
    borderRadius: PERFORM_WATERFALL_COLUMN_SHAPE.borderRadius,
    opacity
  }
}

export function getPerformMidiBoxBlockShape(
  blockSize: number,
  fallen: boolean
): WaterfallColumnShape {
  return {
    width: blockSize,
    borderRadius: 3,
    opacity: fallen ? 0.35 : 1
  }
}
