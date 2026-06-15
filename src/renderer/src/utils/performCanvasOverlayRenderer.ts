import type { CSSProperties } from 'vue'
import type { KeyActiveBarStyleInput } from '@renderer/components/performSkin/types'
import type { MidiColumnLayout } from '@renderer/utils/pianoWaterfallCanvasRenderer'

const svgImageCache = new Map<string, HTMLImageElement>()

function parsePx(value: string | number | undefined, fallback: number): number {
  if (typeof value === 'number') return value
  if (!value) return fallback
  const n = parseFloat(String(value))
  return Number.isFinite(n) ? n : fallback
}

function loadSvgImage(svg: string): Promise<HTMLImageElement> {
  const cached = svgImageCache.get(svg)
  if (cached) return Promise.resolve(cached)

  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      svgImageCache.set(svg, img)
      resolve(img)
    }
    img.onerror = reject
    img.src = `data:image/svg+xml,${encodeURIComponent(svg)}`
  })
}

export async function preloadPerformOverlayAssets(input: {
  baselineSvg: string
  baselineMidiActiveSvg: string
}): Promise<void> {
  await Promise.all([
    loadSvgImage(input.baselineSvg),
    loadSvgImage(input.baselineMidiActiveSvg)
  ])
}

export type DrawPerformOverlayInput = {
  ctx: CanvasRenderingContext2D
  width: number
  height: number
  baseLineBottom: number
  midiMin: number
  midiMax: number
  activeKeys: ReadonlySet<number>
  midiLayouts: Map<number, MidiColumnLayout>
  baselineSvg: string
  baselineMidiActiveSvg: string
  baselineStyle: CSSProperties
  getKeyActiveBarStyle: (input: KeyActiveBarStyleInput) => CSSProperties
}

/** 第四层：基准线 + 琴键按下高亮 */
export function drawPerformOverlayLayer(input: DrawPerformOverlayInput) {
  const {
    ctx,
    width,
    height,
    baseLineBottom,
    midiMin,
    midiMax,
    activeKeys,
    midiLayouts,
    baselineSvg,
    baselineMidiActiveSvg,
    baselineStyle,
    getKeyActiveBarStyle
  } = input

  ctx.clearRect(0, 0, width, height)

  const baselineHeight = parsePx(baselineStyle.height, 3)
  const baselineY = height - baseLineBottom
  const baselineImage = svgImageCache.get(baselineSvg)

  if (baselineImage) {
    ctx.drawImage(baselineImage, 0, baselineY, width, baselineHeight)
  } else if (typeof baselineStyle.background === 'string' && baselineStyle.background) {
    ctx.fillStyle = baselineStyle.background
    ctx.fillRect(0, baselineY, width, baselineHeight)
  }

  const activeImage = svgImageCache.get(baselineMidiActiveSvg)
  const barContainerBottom = height - baseLineBottom + 4

  for (let midi = midiMin; midi <= midiMax; midi++) {
    if (!activeKeys.has(midi)) continue

    const layout = midiLayouts.get(midi)
    if (!layout) continue

    const barStyle = getKeyActiveBarStyle({ width: layout.width, active: true })
    const barHeight = parsePx(barStyle.height, 6)
    const barY = barContainerBottom - barHeight - 3

    if (activeImage) {
      ctx.drawImage(activeImage, layout.x, barY, layout.width, barHeight)
      continue
    }

    ctx.fillStyle = '#2196f3'
    const radius = Math.min(barHeight / 2, layout.width / 2)
    ctx.beginPath()
    ctx.moveTo(layout.x + radius, barY)
    ctx.lineTo(layout.x + layout.width - radius, barY)
    ctx.quadraticCurveTo(layout.x + layout.width, barY, layout.x + layout.width, barY + radius)
    ctx.lineTo(layout.x + layout.width, barY + barHeight - radius)
    ctx.quadraticCurveTo(
      layout.x + layout.width,
      barY + barHeight,
      layout.x + layout.width - radius,
      barY + barHeight
    )
    ctx.lineTo(layout.x + radius, barY + barHeight)
    ctx.quadraticCurveTo(layout.x, barY + barHeight, layout.x, barY + barHeight - radius)
    ctx.lineTo(layout.x, barY + radius)
    ctx.quadraticCurveTo(layout.x, barY, layout.x + radius, barY)
    ctx.closePath()
    ctx.fill()
  }
}
