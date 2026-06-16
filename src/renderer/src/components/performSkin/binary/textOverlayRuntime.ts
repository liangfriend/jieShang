import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { createBinaryTextBurstRuntime } from '../canvas/binaryTextBurstEffect'

export function createBinaryTextOverlayRuntime(): PerformOverlayRuntime {
  const burst = createBinaryTextBurstRuntime()

  return {
    tick(input: PerformOverlayTickInput) {
      burst.tick({ now: input.now, deltaMs: input.deltaMs })

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        if (!input.activeKeys.has(midi)) continue

        const layout = input.midiLayouts.get(midi)
        if (!layout) continue

        const spawnX = layout.x + layout.width / 2
        burst.spawnForHeldKey(midi, spawnX, input.baselineY)
      }
    },

    onKeysChanged(prev, next) {
      for (const midi of prev) {
        if (!next.has(midi)) burst.releaseKey(midi)
      }
      if (next.size === 0) burst.clearHeldKeys()
    },

    draw(ctx) {
      burst.draw(ctx)
    },

    isAnimating() {
      return burst.isAnimating()
    },

    reset() {
      burst.reset()
    }
  }
}
