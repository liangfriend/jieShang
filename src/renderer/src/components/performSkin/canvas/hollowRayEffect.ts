import type { PerformOverlayRuntime, PerformOverlayTickInput } from '../types'
import { HOLLOW_COLUMN_WIDTH, rgba, themeColorAt, type HollowTheme } from './hollowGlow'

type Ray = {
  x: number
  y: number
  dx: number
  dy: number
  /** 光线头部离发光点的距离 */
  head: number
  len: number
  maxLen: number
  speed: number
  /** 垂直方向弯曲量（相对长度），让光线像发丝一样微微弯 */
  bend: number
  life: number
  maxLife: number
}

/** 按住时每毫秒每个键持续发出的光线数 */
const HOLD_EMIT_PER_MS = 0.05
const PRESS_BURST = 12
const MAX_RAYS = 1200
/** 外倾最大角：一个锐角，光线只往外偏一点点 */
const FAN_HALF_ANGLE = Math.PI / 11
/** 外倾最小比例：避免贴着水柱竖直、和另一侧混在一起 */
const FAN_MIN_RATIO = 0.2
const ALPHA_BUCKETS = 8

type Side = -1 | 1

/** 从水柱某一侧边线发出：左边线往左上、右边线往右上，形如 \|  |/ */
function spawnRay(rays: Ray[], x: number, y: number, side: Side, burst: boolean) {
  if (rays.length >= MAX_RAYS) return
  const tilt = (FAN_MIN_RATIO + Math.random() * (1 - FAN_MIN_RATIO)) * FAN_HALF_ANGLE
  const angle = -Math.PI / 2 + side * tilt
  const maxLife = (burst ? 1500 : 1200) + Math.random() * 900
  rays.push({
    x: x + (Math.random() - 0.5) * 1.5,
    y,
    dx: Math.cos(angle),
    dy: Math.sin(angle),
    head: 1 + Math.random() * 3,
    len: 0,
    maxLen: (burst ? 22 : 14) + Math.random() * (burst ? 30 : 24),
    speed: (burst ? 0.06 : 0.045) + Math.random() * (burst ? 0.06 : 0.05),
    bend: (Math.random() - 0.5) * 0.3,
    life: maxLife,
    maxLife
  })
}

function appendRay(ctx: CanvasRenderingContext2D, r: Ray) {
  const tail = Math.max(0, r.head - r.len)
  const x1 = r.x + r.dx * tail
  const y1 = r.y + r.dy * tail
  const x2 = r.x + r.dx * r.head
  const y2 = r.y + r.dy * r.head
  const off = r.len * r.bend
  ctx.moveTo(x1, y1)
  ctx.quadraticCurveTo((x1 + x2) / 2 - r.dy * off, (y1 + y2) / 2 + r.dx * off, x2, y2)
}

/** 空洞第四层：按住时水柱两侧边线各自向外上方以锐角不断冒出闪烁的细光线并缓缓上飘，按下瞬间多冒一簇 */
export function createHollowRayRuntime(theme: HollowTheme): PerformOverlayRuntime {
  const rays: Ray[] = []
  const pending = new Set<number>()
  const emitDebt = new Map<number, number>()
  let held: Array<{ x: number; y: number }> = []

  return {
    tick(input: PerformOverlayTickInput) {
      const dt = Math.min(50, input.deltaMs)

      for (let i = rays.length - 1; i >= 0; i--) {
        const r = rays[i]!
        r.life -= dt
        if (r.life <= 0) {
          rays.splice(i, 1)
          continue
        }
        // 越飘越慢，像余烬往上浮
        const ease = 0.45 + 0.55 * (r.life / r.maxLife)
        r.head += r.speed * dt * ease
        r.len = Math.min(r.maxLen, r.len + r.speed * dt * 1.6)
      }

      // 黑键列更窄，两侧间距统一按白键算
      let widest = 0
      for (const l of input.midiLayouts.values()) widest = Math.max(widest, l.width)
      const half = Math.min(HOLLOW_COLUMN_WIDTH, widest) / 2

      const points: Array<{ x: number; y: number }> = []
      for (let midi = input.midiMin; midi <= input.midiMax; midi++) {
        const isHeld = input.activeKeys.has(midi)
        const isPressed = pending.has(midi)
        if (!isHeld && !isPressed) {
          emitDebt.delete(midi)
          continue
        }
        const layout = input.midiLayouts.get(midi)
        if (!layout) continue
        const x = layout.x + layout.width / 2
        const y = input.baselineY
        const edgeX = (side: Side) => x + side * half

        if (isPressed) {
          for (let i = 0; i < PRESS_BURST; i++) {
            const side: Side = i % 2 === 0 ? -1 : 1
            spawnRay(rays, edgeX(side), y, side, true)
          }
        }
        if (isHeld) {
          points.push({ x: edgeX(-1), y }, { x: edgeX(1), y })
          let debt = (emitDebt.get(midi) ?? 0) + dt * HOLD_EMIT_PER_MS
          while (debt >= 1) {
            const side: Side = Math.random() < 0.5 ? -1 : 1
            spawnRay(rays, edgeX(side), y, side, false)
            debt -= 1
          }
          emitDebt.set(midi, debt)
        }
      }
      pending.clear()
      held = points
    },

    onKeysChanged(prev, next) {
      for (const midi of next) {
        if (!prev.has(midi)) pending.add(midi)
      }
    },

    draw(ctx) {
      const now = performance.now()
      const halo = themeColorAt(theme, now, 0.5)
      ctx.save()
      ctx.globalCompositeOperation = 'lighter'

      const glow = theme.glowK
      const dotR = 4 + 3 * Math.min(2, glow)
      for (const p of held) {
        const flicker = 0.75 + Math.random() * 0.25
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, dotR)
        g.addColorStop(0, rgba(theme.core, 0.85 * flicker))
        g.addColorStop(0.45, rgba(halo, 0.35 * glow * flicker))
        g.addColorStop(1, rgba(halo, 0))
        ctx.fillStyle = g
        ctx.fillRect(p.x - dotR, p.y - dotR, dotR * 2, dotR * 2)
      }

      if (rays.length) {
        // 按透明度分桶合并 path：几百根光线也只需十几次 stroke；每帧随机透明度形成闪烁
        const buckets: Ray[][] = Array.from({ length: ALPHA_BUCKETS }, () => [])
        for (const r of rays) {
          const t = 1 - r.life / r.maxLife
          const fade = Math.min(1, t / 0.12) * (1 - t) ** 1.3
          const a = fade * (0.35 + Math.random() * 0.65)
          const idx = Math.min(ALPHA_BUCKETS - 1, Math.floor(a * ALPHA_BUCKETS))
          buckets[idx]!.push(r)
        }
        ctx.lineCap = 'round'
        for (let b = 0; b < ALPHA_BUCKETS; b++) {
          const group = buckets[b]!
          if (!group.length) continue
          const a = (b + 0.5) / ALPHA_BUCKETS
          ctx.beginPath()
          for (const r of group) appendRay(ctx, r)
          if (glow > 0) {
            ctx.strokeStyle = rgba(halo, a * 0.35 * glow)
            ctx.lineWidth = 1.2 + 0.6 * Math.min(2, glow)
            ctx.stroke()
          }
          ctx.strokeStyle = rgba(theme.core, a)
          ctx.lineWidth = 0.55
          ctx.stroke()
        }
      }
      ctx.restore()
    },

    isAnimating() {
      return rays.length > 0 || held.length > 0
    },

    reset() {
      rays.length = 0
      pending.clear()
      emitDebt.clear()
      held = []
    }
  }
}
