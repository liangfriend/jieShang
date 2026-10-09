import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'

const PX = 2
const COLORS = ['#ffd400', '#ff3d9a', '#00c8e8', '#35d46a', '#ffffff'] as const

type PixelChip = {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  color: string
  life: number
  maxLife: number
}

function createChip(x: number, y: number, burst: boolean): PixelChip {
  const angle = -Math.PI / 2 + (Math.random() - 0.5) * (burst ? 2.2 : 1.1)
  const speed = burst ? 2.4 + Math.random() * 3.2 : 1.2 + Math.random() * 1.6
  const maxLife = burst ? 420 + Math.random() * 380 : 320 + Math.random() * 240
  return {
    x,
    y,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
    size: PX * (1 + ((Math.random() * 2) | 0)),
    color: COLORS[(Math.random() * COLORS.length) | 0]!,
    life: maxLife,
    maxLife
  }
}

/** 像素街机第四层：按下瞬间迸出一簇方块碎屑，按住时持续少量喷出 */
export function createPixelArcadeBurstRuntime(): PerformOverlayRuntime {
  const chips: PixelChip[] = []
  const pendingBursts = new Set<number>()
  const holdAcc = new Map<number, number>()

  return {
    tick(input: PerformOverlayTickInput) {
      const frameScale = Math.min(3, input.deltaMs / 16.67)

      for (let i = chips.length - 1; i >= 0; i--) {
        const chip = chips[i]!
        chip.vy += 0.16 * frameScale
        chip.x += chip.vx * frameScale
        chip.y += chip.vy * frameScale
        chip.life -= input.deltaMs
        if (chip.life <= 0) chips.splice(i, 1)
      }

      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const burst = pendingBursts.has(midi)
        if (!burst && !input.activeKeys.has(midi)) continue
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const cx = layout.x + layout.width / 2
        const y = input.baselineY - 12

        if (burst) {
          for (let i = 0; i < 12; i++) chips.push(createChip(cx + (Math.random() - 0.5) * 8, y, true))
          continue
        }
        const acc = (holdAcc.get(midi) ?? 0) + frameScale
        if (acc >= 4) {
          chips.push(createChip(cx + (Math.random() - 0.5) * 6, y, false))
          holdAcc.set(midi, 0)
        } else {
          holdAcc.set(midi, acc)
        }
      }
      pendingBursts.clear()
    },

    onKeysChanged(prev, next) {
      for (const midi of next) {
        if (!prev.has(midi)) pendingBursts.add(midi)
      }
      for (const midi of prev) {
        if (!next.has(midi)) holdAcc.delete(midi)
      }
    },

    draw(ctx) {
      for (const chip of chips) {
        const t = chip.life / chip.maxLife
        ctx.globalAlpha = t < 0.3 ? t / 0.3 : 1
        ctx.fillStyle = chip.color
        ctx.fillRect(Math.round(chip.x / PX) * PX, Math.round(chip.y / PX) * PX, chip.size, chip.size)
      }
      ctx.globalAlpha = 1
    },

    isAnimating() {
      return chips.length > 0
    },

    reset() {
      chips.length = 0
      pendingBursts.clear()
      holdAcc.clear()
    }
  }
}
