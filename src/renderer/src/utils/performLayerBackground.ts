import { appendRoundedRectPath } from '@renderer/utils/canvasGeometry'
import type {
  PerformColumnRect,
  PerformColumnsDraw,
  PerformLayerBackgroundInput
} from '@renderer/components/performSkin/types'

export type LayerColumnClip = PerformColumnRect

type OffscreenBuffer = {
  canvas: HTMLCanvasElement
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  dpr: number
}

let offscreenBuffer: OffscreenBuffer | null = null

function ensureOffscreenBuffer(width: number, height: number, dpr: number): OffscreenBuffer {
  if (
    offscreenBuffer &&
    offscreenBuffer.width === width &&
    offscreenBuffer.height === height &&
    offscreenBuffer.dpr === dpr
  ) {
    return offscreenBuffer
  }

  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('Failed to create layer background buffer')

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  offscreenBuffer = { canvas, ctx, width, height, dpr }
  return offscreenBuffer
}

/**
 * 每层一次：离屏绘制全层背景 → 合并所有水柱路径 clip 一次 → blit 背景。
 * 水柱移动时会从同一张变化中的背景上取不同区域。
 * 皮肤提供 drawColumns 时改为直接把几何交给皮肤自绘（可画到水柱外，如发光线框）。
 */
export function drawLayerWithUnifiedColumnClip(
  mainCtx: CanvasRenderingContext2D,
  width: number,
  height: number,
  dpr: number,
  time: number,
  columns: LayerColumnClip[],
  drawBackground: (ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) => void,
  drawColumns?: PerformColumnsDraw
) {
  mainCtx.clearRect(0, 0, width, height)
  if (!columns.length) return

  if (drawColumns) {
    drawColumns(mainCtx, columns, { width, height, dpr, time })
    return
  }

  const buffer = ensureOffscreenBuffer(width, height, dpr)
  buffer.ctx.clearRect(0, 0, width, height)
  drawBackground(buffer.ctx, { width, height, dpr, time })

  const opacityGroups = new Map<number, LayerColumnClip[]>()
  for (const column of columns) {
    const group = opacityGroups.get(column.opacity) ?? []
    group.push(column)
    opacityGroups.set(column.opacity, group)
  }

  for (const [opacity, group] of opacityGroups) {
    mainCtx.save()
    mainCtx.beginPath()
    for (const column of group) {
      appendRoundedRectPath(
        mainCtx,
        column.x,
        column.y,
        column.width,
        column.height,
        column.borderRadius
      )
    }
    mainCtx.clip()
    mainCtx.globalAlpha = opacity
    mainCtx.drawImage(buffer.canvas, 0, 0, width, height)
    mainCtx.restore()
  }
}
