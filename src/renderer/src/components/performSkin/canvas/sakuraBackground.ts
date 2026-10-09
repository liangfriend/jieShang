import type { PerformLayerBackgroundInput } from '../types'

const PETAL_COLORS = ['#ffc6d9', '#ffb3cb', '#ffd9e6', '#ff9fbf'] as const

type Petal = {
  x: number
  y: number
  size: number
  rot: number
  rotSpeed: number
  flip: number
  flipSpeed: number
  vx: number
  vy: number
  sway: number
  color: string
}

type SakuraScene = {
  width: number
  height: number
  petals: Petal[]
  /** 远山 + 樱枝静态层（尺寸变化时重建） */
  still: HTMLCanvasElement | null
}

let scene: SakuraScene | null = null
let lastTime = 0

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

/** 樱花瓣：外缘带缺口的心形瓣，以中心为原点，长度 size */
export function traceSakuraPetal(ctx: CanvasRenderingContext2D, size: number) {
  const l = size / 2
  ctx.beginPath()
  ctx.moveTo(0, l)
  ctx.bezierCurveTo(-l * 0.95, l * 0.35, -l * 0.8, -l * 0.8, -l * 0.28, -l * 0.95)
  ctx.lineTo(0, -l * 0.62)
  ctx.lineTo(l * 0.28, -l * 0.95)
  ctx.bezierCurveTo(l * 0.8, -l * 0.8, l * 0.95, l * 0.35, 0, l)
  ctx.closePath()
}

/** 绘制一片带翻转（flip 为横向压缩系数 -1~1）的花瓣 */
export function drawSakuraPetal(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  rot: number,
  flip: number,
  color: string,
  alpha = 1
) {
  ctx.save()
  ctx.translate(x, y)
  ctx.rotate(rot)
  ctx.scale(Math.max(0.15, Math.abs(flip)), 1)
  ctx.globalAlpha = alpha
  traceSakuraPetal(ctx, size)
  ctx.fillStyle = color
  ctx.fill()
  ctx.strokeStyle = 'rgba(220, 90, 130, 0.35)'
  ctx.lineWidth = 0.6
  ctx.stroke()
  ctx.beginPath()
  ctx.moveTo(0, size * 0.42)
  ctx.lineTo(0, -size * 0.12)
  ctx.strokeStyle = 'rgba(230, 110, 150, 0.35)'
  ctx.stroke()
  ctx.restore()
}

function createPetal(width: number, height: number, anywhere: boolean): Petal {
  return {
    x: anywhere ? rand(0, width) : rand(-width * 0.2, width),
    y: anywhere ? rand(0, height) : rand(-40, -10),
    size: rand(7, 14),
    rot: rand(0, Math.PI * 2),
    rotSpeed: rand(-0.03, 0.03),
    flip: rand(0, Math.PI * 2),
    flipSpeed: rand(0.02, 0.06),
    vx: rand(0.25, 0.7),
    vy: rand(0.45, 1),
    sway: rand(0, Math.PI * 2),
    color: PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]!
  }
}

function drawBlossom(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
  ctx.fillStyle = color
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2 - Math.PI / 2
    ctx.save()
    ctx.translate(x + Math.cos(a) * r * 0.55, y + Math.sin(a) * r * 0.55)
    ctx.rotate(a + Math.PI / 2)
    traceSakuraPetal(ctx, r * 1.1)
    ctx.fill()
    ctx.restore()
  }
  ctx.fillStyle = '#ffe98a'
  ctx.beginPath()
  ctx.arc(x, y, r * 0.18, 0, Math.PI * 2)
  ctx.fill()
}

type BranchSeg = { x0: number; y0: number; x1: number; y1: number; w: number }

/** 递归生成樱枝：主干向下斜伸，逐级分叉变细 */
function growBranch(
  segs: BranchSeg[],
  tips: Array<{ x: number; y: number }>,
  x: number,
  y: number,
  angle: number,
  len: number,
  w: number,
  depth: number
) {
  const x1 = x + Math.cos(angle) * len
  const y1 = y + Math.sin(angle) * len
  segs.push({ x0: x, y0: y, x1, y1, w })
  if (depth <= 0 || len < 10) {
    tips.push({ x: x1, y: y1 })
    return
  }
  tips.push({ x: (x + x1) / 2, y: (y + y1) / 2 })
  growBranch(segs, tips, x1, y1, angle + rand(-0.35, 0.1), len * rand(0.68, 0.82), w * 0.68, depth - 1)
  if (Math.random() < 0.8) {
    growBranch(segs, tips, x1, y1, angle + rand(0.35, 0.8), len * rand(0.45, 0.65), w * 0.55, depth - 2)
  }
}

function paintStill(width: number, height: number, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement('canvas')
  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)
  const ctx = canvas.getContext('2d')!
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // 远山：淡紫剪影 + 雪顶
  const peakX = width * 0.62
  const peakY = height * 0.5
  const baseY = height * 0.86
  ctx.fillStyle = 'rgba(190, 150, 200, 0.45)'
  ctx.beginPath()
  ctx.moveTo(-20, baseY)
  ctx.quadraticCurveTo(width * 0.3, baseY - height * 0.08, peakX - 40, peakY + 18)
  ctx.lineTo(peakX - 12, peakY)
  ctx.lineTo(peakX + 14, peakY + 2)
  ctx.quadraticCurveTo(width * 0.85, baseY - height * 0.1, width + 20, baseY)
  ctx.lineTo(width + 20, height)
  ctx.lineTo(-20, height)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(255, 255, 255, 0.75)'
  ctx.beginPath()
  ctx.moveTo(peakX - 40, peakY + 18)
  ctx.lineTo(peakX - 12, peakY)
  ctx.lineTo(peakX + 14, peakY + 2)
  ctx.lineTo(peakX + 38, peakY + 20)
  ctx.lineTo(peakX + 20, peakY + 16)
  ctx.lineTo(peakX + 8, peakY + 26)
  ctx.lineTo(peakX - 6, peakY + 14)
  ctx.lineTo(peakX - 22, peakY + 24)
  ctx.closePath()
  ctx.fill()

  ctx.fillStyle = 'rgba(170, 120, 175, 0.35)'
  ctx.beginPath()
  ctx.moveTo(-20, height * 0.92)
  ctx.quadraticCurveTo(width * 0.25, height * 0.84, width * 0.5, height * 0.9)
  ctx.quadraticCurveTo(width * 0.78, height * 0.96, width + 20, height * 0.88)
  ctx.lineTo(width + 20, height)
  ctx.lineTo(-20, height)
  ctx.closePath()
  ctx.fill()

  // 左上 / 右上樱枝
  const corners = [
    { x: -10, y: height * 0.03, angle: 0.25 },
    { x: width + 10, y: height * 0.06, angle: Math.PI - 0.3 }
  ]
  for (const corner of corners) {
    const segs: BranchSeg[] = []
    const tips: Array<{ x: number; y: number }> = []
    growBranch(segs, tips, corner.x, corner.y, corner.angle, Math.min(width, height) * 0.15, 8, 4)
    ctx.strokeStyle = '#6e4639'
    ctx.lineCap = 'round'
    for (const seg of segs) {
      ctx.lineWidth = seg.w
      ctx.beginPath()
      ctx.moveTo(seg.x0, seg.y0)
      ctx.lineTo(seg.x1, seg.y1)
      ctx.stroke()
    }
    for (const tip of tips) {
      const count = 2 + ((Math.random() * 3) | 0)
      for (let i = 0; i < count; i++) {
        drawBlossom(
          ctx,
          tip.x + rand(-12, 12),
          tip.y + rand(-10, 10),
          rand(6, 10),
          PETAL_COLORS[(Math.random() * PETAL_COLORS.length) | 0]!
        )
      }
    }
  }
  return canvas
}

function ensureScene(width: number, height: number): SakuraScene {
  if (scene && scene.width === width && scene.height === height) return scene
  const count = Math.min(80, Math.floor((width * height) / 5000))
  scene = {
    width,
    height,
    petals: Array.from({ length: count }, () => createPetal(width, height, true)),
    still: null
  }
  lastTime = 0
  return scene
}

function advance(s: SakuraScene, time: number) {
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const k = Math.min(3, Math.max(0, deltaMs) / 16.67)
  const gust = 0.6 + Math.sin(time * 0.0004) * 0.4

  for (let i = 0; i < s.petals.length; i++) {
    const p = s.petals[i]!
    p.sway += 0.02 * k
    p.x += (p.vx * gust + Math.sin(p.sway) * 0.4) * k
    p.y += p.vy * k
    p.rot += p.rotSpeed * k
    p.flip += p.flipSpeed * k
    if (p.y > s.height + 20 || p.x > s.width + 30) s.petals[i] = createPetal(s.width, s.height, false)
  }
}

/** 樱花第一层：黄昏粉天空、远山、樱枝与随风翻飞的花瓣 */
export function drawSakuraBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time, dpr } = input
  const s = ensureScene(w, h)
  advance(s, time)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#fff1f5')
  sky.addColorStop(0.5, '#ffdce7')
  sky.addColorStop(1, '#f7c4d6')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  const sun = ctx.createRadialGradient(w * 0.3, h * 0.42, 0, w * 0.3, h * 0.42, h * 0.35)
  sun.addColorStop(0, 'rgba(255, 250, 235, 0.85)')
  sun.addColorStop(1, 'rgba(255, 250, 235, 0)')
  ctx.fillStyle = sun
  ctx.fillRect(0, 0, w, h)

  if (!s.still) s.still = paintStill(w, h, dpr)
  ctx.drawImage(s.still, 0, 0, w, h)

  for (const p of s.petals) {
    drawSakuraPetal(ctx, p.x, p.y, p.size, p.rot, Math.cos(p.flip), p.color, 0.9)
  }
}

/** 樱花 normal 层：花瓣粉渐变 + 缓慢流过的柔光带 */
export function drawSakuraNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#ef6f9c')
  g.addColorStop(1, '#c93a6d')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const period = 180
  const offset = (time * 0.05) % period
  for (let y = offset - period; y < h; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + period * 0.5)
    band.addColorStop(0, 'rgba(255, 255, 255, 0)')
    band.addColorStop(0.5, 'rgba(255, 220, 232, 0.35)')
    band.addColorStop(1, 'rgba(255, 255, 255, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, period * 0.5)
  }
}

/** 樱花 active 层：白粉色暖光 + 闪烁光点 */
export function drawSakuraActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.5, '#ffe3ee')
  g.addColorStop(1, '#ffb6d0')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const cell = 16
  for (let x = 0; x < w; x += cell) {
    for (let y = 0; y < h; y += cell) {
      const seed = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
      const r = seed - Math.floor(seed)
      const tw = Math.sin(time * 0.006 + r * 40) * 0.5 + 0.5
      if (tw < 0.75) continue
      ctx.fillStyle = `rgba(255, 120, 170, ${(tw - 0.75) * 2.4})`
      ctx.fillRect(x + r * cell, y + ((r * 7) % 1) * cell, 1.6, 1.6)
    }
  }
}

export { drawBlossom as drawSakuraBlossom, PETAL_COLORS as SAKURA_PETAL_COLORS }

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const SAKURA_CONTAINER_BG = 'linear-gradient(180deg, #fff1f5 0%, #ffdce7 50%, #f7c4d6 100%)'
