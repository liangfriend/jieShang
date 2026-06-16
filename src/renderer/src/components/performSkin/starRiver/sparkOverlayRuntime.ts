import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { createStarSparkBurstRuntime } from '../canvas/starSparkBurstEffect'

export function createStarRiverSparkOverlayRuntime(): PerformOverlayRuntime {
  const burst = createStarSparkBurstRuntime()

  return {
    tick(input: PerformOverlayTickInput) {
      burst.tick({ now: input.now, deltaMs: input.deltaMs })

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        if (!input.activeKeys.has(midi)) continue

        const layout = input.midiLayouts.get(midi)
        if (!layout) continue

        burst.spawnForHeldKey(midi, layout.x + layout.width / 2, input.baselineY)
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
