import type { CSSProperties } from 'vue'
import type { MidiColumnLayout } from '@renderer/utils/pianoWaterfallCanvasRenderer'

export type MidiBoxBlockStyleInput = {
  midi: number
  batchIndex: number
  blockSize: number
  blockStride: number
  baseLineBottom: number
  highlighted: boolean
  fallen: boolean
  fallDuration: number
}

export type WaterfallColumnStyleInput = {
  midi: number
  start: number
  end: number
  columnHeightConstant: number
}

export type WaterfallActiveColumnStyleInput = {
  start: number
  end: number
  columnHeightConstant: number
}

/** 基准线绘制入参 */
export type PerformOverlayBaselineDrawInput = {
  width: number
  baselineY: number
  baselineHeight: number
}

/** 琴键按下高亮几何入参 */
export type PerformOverlayKeyActiveBarStyleInput = {
  active: boolean
}

export type PerformOverlayKeyActiveBarShape = {
  height: number
  borderRadius: number
  /** 高亮条底边距基准线顶边的向上间距（0 = 紧贴基准线上方） */
  gapAboveBaseline: number
}

/** 第四层 tick 入参（粒子动画等） */
export type PerformOverlayTickInput = {
  now: number
  deltaMs: number
  baselineY: number
  midiMin: number
  midiMax: number
  activeKeys: ReadonlySet<number>
  midiLayouts: Map<number, MidiColumnLayout>
  keyActiveBarWidth: number
}

export type PerformOverlayRuntime = {
  tick: (input: PerformOverlayTickInput) => void
  onKeysChanged?: (prev: ReadonlySet<number>, next: ReadonlySet<number>) => void
  draw: (ctx: CanvasRenderingContext2D) => void
  isAnimating: () => boolean
  reset: () => void
}

/** 第四层：基准线 + 琴键按下高亮（canvas 参数，非 SVG） */
export type PerformOverlayCanvasCommand = {
  getBaselineHeight: () => number
  drawBaseline: (ctx: CanvasRenderingContext2D, input: PerformOverlayBaselineDrawInput) => void
  getKeyActiveBarShape: (
    input: PerformOverlayKeyActiveBarStyleInput
  ) => PerformOverlayKeyActiveBarShape | null
  drawKeyActiveBar: (ctx: CanvasRenderingContext2D, rect: OverlayRect) => void
  createRuntime?: () => PerformOverlayRuntime
}

export type OverlayRect = {
  x: number
  y: number
  width: number
  height: number
  borderRadius: number
}

/** 整层背景绘制入参（每层每帧调用一次） */
export type PerformLayerBackgroundInput = {
  width: number
  height: number
  dpr: number
  /** 与播放进度同步的毫秒时间（0 = 未播放/已停止） */
  time: number
}

export type WaterfallColumnShape = {
  width: number
  borderRadius: number
  opacity: number
}

/** canvas 渲染指令：整层背景 + 水柱几何（用于统一 clip） */
export type WaterfallColumnCanvasCommand = {
  drawBackground: (ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) => void
  getShape: (input: WaterfallColumnStyleInput) => WaterfallColumnShape
}

export type WaterfallActiveColumnCanvasCommand = {
  drawBackground: (ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) => void
  getShape: (input: WaterfallActiveColumnStyleInput) => WaterfallColumnShape
}

export type MidiBoxBlockCanvasCommand = {
  drawBackground: (ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) => void
  getShape: (input: MidiBoxBlockStyleInput) => WaterfallColumnShape
}

export type PerformSkinPack = {
  container: CSSProperties
  midiBox: {
    normalBlock: MidiBoxBlockCanvasCommand
    activeBlock: MidiBoxBlockCanvasCommand
  }
  waterfall: {
    normalColumn: WaterfallColumnCanvasCommand
    activeColumn: WaterfallActiveColumnCanvasCommand
  }
  overlay: PerformOverlayCanvasCommand
}
