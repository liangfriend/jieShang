import type {
  PerformBackgroundCanvasCommand,
  PerformLayerBackgroundInput
} from '@renderer/components/performSkin/types'

export type PerformCanvasLayerRefs = {
  bg: HTMLCanvasElement | null
  normal: HTMLCanvasElement | null
  active: HTMLCanvasElement | null
  overlay: HTMLCanvasElement | null
}

export type PerformCanvasContexts = {
  bg: CanvasRenderingContext2D | null
  normal: CanvasRenderingContext2D | null
  active: CanvasRenderingContext2D | null
  overlay: CanvasRenderingContext2D | null
  width: number
  height: number
  dpr: number
}

function setupCanvasLayer(
  canvas: HTMLCanvasElement,
  width: number,
  height: number,
  dpr: number
): CanvasRenderingContext2D | null {
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  canvas.style.width = `${width}px`
  canvas.style.height = `${height}px`

  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  return ctx
}

/** 同步四层 canvas 尺寸与 DPR，返回各层 2D 上下文 */
export function syncPerformCanvasStack(
  layers: PerformCanvasLayerRefs,
  container: HTMLElement
): PerformCanvasContexts {
  const rect = container.getBoundingClientRect()
  const width = Math.max(1, Math.floor(rect.width))
  const height = Math.max(1, Math.floor(rect.height))
  const dpr = window.devicePixelRatio || 1

  const empty: PerformCanvasContexts = {
    bg: null,
    normal: null,
    active: null,
    overlay: null,
    width,
    height,
    dpr
  }

  if (!layers.bg || !layers.normal || !layers.active || !layers.overlay) return empty

  return {
    bg: setupCanvasLayer(layers.bg, width, height, dpr),
    normal: setupCanvasLayer(layers.normal, width, height, dpr),
    active: setupCanvasLayer(layers.active, width, height, dpr),
    overlay: setupCanvasLayer(layers.overlay, width, height, dpr),
    width,
    height,
    dpr
  }
}

/** 第一层：由当前演奏皮肤的 background 指令绘制 */
export function drawPerformBackgroundLayer(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput,
  command: PerformBackgroundCanvasCommand
) {
  command.drawBackground(ctx, input)
}
