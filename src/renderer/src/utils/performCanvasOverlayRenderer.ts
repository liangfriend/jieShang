import type {
  PerformOverlayCanvasCommand,
  PerformOverlayRuntime
} from '@renderer/components/performSkin/types'
import type { MidiColumnLayout } from '@renderer/utils/pianoWaterfallCanvasRenderer'

export type PerformOverlayHost = {
  command: PerformOverlayCanvasCommand | null
  runtime: PerformOverlayRuntime | null
  prevActiveKeys: Set<number>
}

export function createPerformOverlayHost(): PerformOverlayHost {
  return {
    command: null,
    runtime: null,
    prevActiveKeys: new Set()
  }
}

function activeKeysChanged(prev: ReadonlySet<number>, next: ReadonlySet<number>): boolean {
  if (prev.size !== next.size) return true
  for (const midi of next) {
    if (!prev.has(midi)) return true
  }
  return false
}

export function syncPerformOverlayRuntime(
  host: PerformOverlayHost,
  command: PerformOverlayCanvasCommand
): PerformOverlayRuntime | null {
  if (host.command !== command) {
    host.runtime?.reset()
    host.command = command
    host.runtime = command.createRuntime?.() ?? null
    host.prevActiveKeys = new Set()
  }
  return host.runtime
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
  keyActiveBarWidth: number
  command: PerformOverlayCanvasCommand
  host: PerformOverlayHost
  now: number
  deltaMs: number
}

/** 第四层：基准线 + 琴键按下高亮（横坐标与 waterfall / midiBox 共用 midiLayouts） */
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
    keyActiveBarWidth,
    command,
    host,
    now,
    deltaMs
  } = input

  const runtime = syncPerformOverlayRuntime(host, command)

  if (runtime && activeKeysChanged(host.prevActiveKeys, activeKeys)) {
    runtime.onKeysChanged?.(host.prevActiveKeys, activeKeys)
    host.prevActiveKeys = new Set(activeKeys)
  }

  const baselineY = height - baseLineBottom
  const baselineHeight = command.getBaselineHeight()

  if (runtime) {
    runtime.tick({
      now,
      deltaMs,
      baselineY,
      midiMin,
      midiMax,
      activeKeys,
      midiLayouts,
      keyActiveBarWidth
    })
  }

  ctx.clearRect(0, 0, width, height)

  command.drawBaseline(ctx, { width, baselineY, baselineHeight })

  for (let midi = midiMin; midi <= midiMax; midi++) {
    if (!activeKeys.has(midi)) continue

    const layout = midiLayouts.get(midi)
    if (!layout) continue

    const shape = command.getKeyActiveBarShape({ active: true })
    if (!shape) continue

    const barWidth = keyActiveBarWidth
    const barX = layout.x + (layout.width - barWidth) / 2
    const barY = baselineY - shape.gapAboveBaseline - shape.height

    command.drawKeyActiveBar(ctx, {
      x: barX,
      y: barY,
      width: barWidth,
      height: shape.height,
      borderRadius: shape.borderRadius
    })
  }

  runtime?.draw(ctx)
}
