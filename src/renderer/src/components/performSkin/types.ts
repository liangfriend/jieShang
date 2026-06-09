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

export type PerformSkinPack = {
  /** 演奏区域外容器（背景由 bgSvg 叠加） */
  container: CSSProperties
  midiBox: {
    normalBlock: (input: MidiBoxBlockStyleInput) => CSSProperties
    activeBlock: (input: MidiBoxBlockStyleInput) => CSSProperties
    keyActiveBar: (input: KeyActiveBarStyleInput) => CSSProperties
  }
  waterfall: {
    normalColumn: (input: WaterfallColumnStyleInput) => CSSProperties
    activeColumn: (input: WaterfallActiveColumnStyleInput) => CSSProperties
    keyActiveBar: (input: KeyActiveBarStyleInput) => CSSProperties
  }
  /** 基准线容器样式（可与 baselineSvg 叠加） */
  baseline: CSSProperties
  bgSvg: string
  baselineSvg: string
}
