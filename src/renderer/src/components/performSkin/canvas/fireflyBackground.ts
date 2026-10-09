import type { PerformLayerBackgroundInput } from '../types'

type Firefly = {
  x: number
  y: number
  vx: number
  vy: number
  phase: number
  blinkSpeed: number
  size: number
}

type ForestScene = {
  width: number
  height: number
  still: HTMLCanvasElement
  flies: Firefly[]
}

let scene: ForestScene | null = null
let lastTime = 0
let glowSprite: HTMLCanvasElement | null = null

const GLOW_SPRITE_SIZE = 64

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

/** 预渲染的萤光贴图：黄绿核心 + 柔和外晕，drawImage 比逐个径向渐变便宜得多 */
function getGlowSprite(): HTMLCanvasElement {
  if (glowSprite) return glowSprite
  const c = document.createElement('canvas')
  c.width = c.height = GLOW_SPRITE_SIZE
  const g = c.getContext('2d')!
  const r = GLOW_SPRITE_SIZE / 2
  const grad = g.createRadialGradient(r, r, 0, r, r, r)
  grad.addColorStop(0, 'rgba(255, 255, 230, 1)')
  grad.addColorStop(0.12, 'rgba(236, 255, 140, 0.95)')
  grad.addColorStop(0.35, 'rgba(190, 240, 80, 0.35)')
  grad.addColorStop(1, 'rgba(160, 230, 60, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, GLOW_SPRITE_SIZE, GLOW_SPRITE_SIZE)
  glowSprite = c
  return c
}

/** 在 (x, y) 画一个半径 r 的萤光点 */
export function drawFireflyGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  if (alpha <= 0.01) return
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.drawImage(getGlowSprite(), x - r, y - r, r * 2, r * 2)
  ctx.globalAlpha = 1
}

function createFly(width: number, height: number): Firefly {
  return {
    x: rand(0, width),
    y: rand(height * 0.3, height * 0.95),
    vx: rand(-0.3, 0.3),
    vy: rand(-0.2, 0.2),
    phase: rand(0, Math.PI * 2),
    blinkSpeed: rand(0.0015, 0.004),
    size: rand(7, 13)
  }
}

function drawTreeLine(
  g: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  maxH: number,
  color: string,
  seed: number
) {
  g.fillStyle = color
  g.beginPath()
  g.moveTo(0, baseY + maxH)
  let x = -20
  let i = 0
  while (x < width + 20) {
    const h = maxH * (0.45 + hash(seed + i) * 0.55)
    const w = 18 + hash(seed + i + 0.3) * 26
    const pine = hash(seed + i + 0.7) < 0.65
    if (pine) {
      const tiers = 4
      for (let t = 0; t < tiers; t++) {
        const ty = baseY - (h * t) / tiers
        const tw = (w * (tiers - t)) / tiers
        g.lineTo(x + w / 2 - tw / 2, ty)
        g.lineTo(x + w / 2 - tw * 0.18, ty - h / tiers - 4)
      }
      g.lineTo(x + w / 2, baseY - h - 6)
      for (let t = tiers - 1; t >= 0; t--) {
        const ty = baseY - (h * t) / tiers
        const tw = (w * (tiers - t)) / tiers
        g.lineTo(x + w / 2 + tw * 0.18, ty - h / tiers - 4)
        g.lineTo(x + w / 2 + tw / 2, ty)
      }
    } else {
      g.lineTo(x, baseY)
      g.quadraticCurveTo(x - 4, baseY - h * 0.7, x + w * 0.5, baseY - h)
      g.quadraticCurveTo(x + w + 4, baseY - h * 0.7, x + w, baseY)
    }
    x += w * (0.7 + hash(seed + i + 0.9) * 0.4)
    i++
  }
  g.lineTo(width + 20, baseY + maxH)
  g.closePath()
  g.fill()
  g.fillRect(0, baseY, width, maxH + 200)
}

function buildStill(width: number, height: number): HTMLCanvasElement {
  const c = document.createElement('canvas')
  c.width = width
  c.height = height
  const g = c.getContext('2d')!

  const moonX = width * 0.78
  const moonY = height * 0.16
  const moonR = Math.min(width, height) * 0.06
  const halo = g.createRadialGradient(moonX, moonY, moonR, moonX, moonY, moonR * 5)
  halo.addColorStop(0, 'rgba(230, 245, 200, 0.28)')
  halo.addColorStop(1, 'rgba(230, 245, 200, 0)')
  g.fillStyle = halo
  g.fillRect(0, 0, width, height)
  const moon = g.createRadialGradient(moonX - moonR * 0.3, moonY - moonR * 0.3, moonR * 0.1, moonX, moonY, moonR)
  moon.addColorStop(0, '#fbffe6')
  moon.addColorStop(1, '#dfe9b8')
  g.fillStyle = moon
  g.beginPath()
  g.arc(moonX, moonY, moonR, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = 'rgba(180, 195, 150, 0.35)'
  for (const [dx, dy, rr] of [
    [-0.3, -0.1, 0.18],
    [0.25, 0.3, 0.12],
    [0.1, -0.4, 0.09]
  ]) {
    g.beginPath()
    g.arc(moonX + dx! * moonR, moonY + dy! * moonR, rr! * moonR, 0, Math.PI * 2)
    g.fill()
  }

  for (let i = 0; i < 70; i++) {
    const x = hash(i + 0.11) * width
    const y = hash(i + 0.37) * height * 0.5
    g.fillStyle = `rgba(220, 240, 220, ${0.2 + hash(i + 0.53) * 0.5})`
    g.fillRect(x, y, 1.2, 1.2)
  }

  drawTreeLine(g, width, height * 0.58, height * 0.22, '#13342f', 10)
  drawTreeLine(g, width, height * 0.7, height * 0.26, '#0c2521', 40)
  drawTreeLine(g, width, height * 0.84, height * 0.3, '#06140f', 80)
  return c
}

function ensureScene(width: number, height: number): ForestScene {
  if (scene && scene.width === width && scene.height === height) return scene
  const count = Math.min(46, Math.max(16, Math.floor((width * height) / 8000)))
  scene = {
    width,
    height,
    still: buildStill(width, height),
    flies: Array.from({ length: count }, () => createFly(width, height))
  }
  lastTime = 0
  return scene
}

function advance(s: ForestScene, time: number) {
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const k = Math.min(3, Math.max(0, deltaMs) / 16.67)
  for (const f of s.flies) {
    f.vx += (Math.random() - 0.5) * 0.06 * k
    f.vy += (Math.random() - 0.5) * 0.06 * k
    f.vx = Math.max(-0.45, Math.min(0.45, f.vx))
    f.vy = Math.max(-0.35, Math.min(0.35, f.vy))
    f.x += f.vx * k
    f.y += f.vy * k
    if (f.x < -10) f.x = s.width + 10
    if (f.x > s.width + 10) f.x = -10
    if (f.y < s.height * 0.25) f.vy += 0.02 * k
    if (f.y > s.height) f.vy -= 0.02 * k
  }
}

/** 萤火虫闪烁曲线：大部分时间暗，周期性亮起 */
export function fireflyBlink(phase: number) {
  const v = Math.sin(phase)
  return v > 0 ? v * v : 0.08
}

/** 萤火第一层：暮色森林、月亮、三层树影、雾带与游走萤火 */
export function drawFireflyBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  advance(s, time)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#0a1a2e')
  sky.addColorStop(0.5, '#123a3a')
  sky.addColorStop(1, '#0b2a20')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(s.still, 0, 0)

  const mistY = h * 0.66 + Math.sin(time * 0.0004) * 6
  const mist = ctx.createLinearGradient(0, mistY - 40, 0, mistY + 40)
  mist.addColorStop(0, 'rgba(150, 200, 180, 0)')
  mist.addColorStop(0.5, 'rgba(150, 200, 180, 0.12)')
  mist.addColorStop(1, 'rgba(150, 200, 180, 0)')
  ctx.fillStyle = mist
  ctx.fillRect(0, mistY - 40, w, 80)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const f of s.flies) {
    const b = fireflyBlink(time * f.blinkSpeed + f.phase)
    drawFireflyGlow(ctx, f.x, f.y, f.size * (0.6 + b * 0.6), b)
  }
  ctx.restore()
}

/** 层内无状态孢子光点：按格子哈希，缓慢上飘 */
function drawSpores(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, alpha: number) {
  const cell = 26
  const cols = Math.ceil(w / cell)
  const rise = time * 0.02
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let c = 0; c < cols; c++) {
    const offset = rise % cell
    for (let y = h + cell - offset, row = 0; y > -cell; y -= cell, row++) {
      const cellId = c * 1000 + row - Math.floor(rise / cell)
      const hx = hash(cellId)
      if (hx < 0.45) continue
      const b = fireflyBlink(time * 0.003 + cellId)
      drawFireflyGlow(ctx, c * cell + hx * cell, y - hash(cellId + 0.25) * cell, 5, b * alpha)
    }
  }
  ctx.restore()
}

/** 萤火 normal 层：苔藓绿 + 流动柔光 + 漂浮孢子 */
export function drawFireflyNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#8fcf52')
  g.addColorStop(1, '#3f8a3a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)

  const period = 220
  const shift = (time * 0.04) % period
  for (let y = -period + shift; y < h + period; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + 90)
    band.addColorStop(0, 'rgba(210, 255, 150, 0)')
    band.addColorStop(0.5, 'rgba(210, 255, 150, 0.3)')
    band.addColorStop(1, 'rgba(210, 255, 150, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, 90)
  }
  drawSpores(ctx, w, h, time, 0.55)
}

/** 萤火 active 层：暖黄绿萤光，整体随呼吸明暗 */
export function drawFireflyActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const pulse = 0.5 + 0.5 * Math.sin(time * 0.006)
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#fbffd0')
  g.addColorStop(1, pulse > 0.5 ? '#e4f76a' : '#d2ec4a')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  ctx.fillStyle = `rgba(255, 255, 240, ${0.15 + pulse * 0.25})`
  ctx.fillRect(0, 0, w, h)
  drawSpores(ctx, w, h, time, 0.9)
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const FIREFLY_CONTAINER_BG = 'linear-gradient(180deg, #0a1a2e 0%, #123a3a 50%, #0b2a20 100%)'
