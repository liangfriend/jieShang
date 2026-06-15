import type { CSSProperties } from 'vue'

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

export type KeyActiveBarStyleInput = {
  width: number
  active: boolean
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
    keyActiveBar: (input: KeyActiveBarStyleInput) => CSSProperties
  }
  waterfall: {
    normalColumn: WaterfallColumnCanvasCommand
    activeColumn: WaterfallActiveColumnCanvasCommand
    keyActiveBar: (input: KeyActiveBarStyleInput) => CSSProperties
  }
  baseline: CSSProperties
  bgSvg: string
  baselineSvg: string
  baselineMidiActiveSvg: string
}
