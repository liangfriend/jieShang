import type { PerformLayerBackgroundInput } from '../types'

type Cloud = { x: number; y: number; scale: number; speed: number }
type Dust = { x: number; y: number; r: number; speed: number; phase: number }

type DragonScene = {
  width: number
  height: number
  still: HTMLCanvasElement
  dragonCanvas: HTMLCanvasElement
  clouds: Cloud[]
  dust: Dust[]
}

let scene: DragonScene | null = null
let lastTime = 0
let cloudSprite: HTMLCanvasElement | null = null
let segmentSprite: HTMLCanvasElement | null = null
let glowSprite: HTMLCanvasElement | null = null
const scalePatterns = new Map<string, CanvasPattern>()

const GOLD = '#f5c542'
const GOLD_DEEP = '#b8860b'
const CLOUD_W = 150
const CLOUD_H = 70
const SEGMENT_SPRITE = 64
const DRAGON_SEGMENTS = 70

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function makeCanvas(width: number, height: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  return c
}

/** 金色光晕贴图，供火珠、金粉与烟花复用 */
export function getImperialGlowSprite(): HTMLCanvasElement {
  if (glowSprite) return glowSprite
  const c = makeCanvas(64, 64)
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grad.addColorStop(0, 'rgba(255, 250, 220, 1)')
  grad.addColorStop(0.18, 'rgba(255, 210, 90, 0.9)')
  grad.addColorStop(0.45, 'rgba(255, 140, 30, 0.3)')
  grad.addColorStop(1, 'rgba(255, 90, 0, 0)')
  g.fillStyle = grad
  g.fillRect(0, 0, 64, 64)
  glowSprite = c
  return c
}

export function drawImperialGlow(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, alpha: number) {
  if (alpha <= 0.01) return
  ctx.globalAlpha = Math.min(1, alpha)
  ctx.drawImage(getImperialGlowSprite(), x - r, y - r, r * 2, r * 2)
  ctx.globalAlpha = 1
}

/** 祥云：三团云头 + 卷曲云纹，暗红填充金色描边 */
function getCloudSprite(): HTMLCanvasElement {
  if (cloudSprite) return cloudSprite
  const c = makeCanvas(CLOUD_W, CLOUD_H)
  const g = c.getContext('2d')!
  const lobes: Array<[number, number, number]> = [
    [40, 42, 20],
    [72, 32, 26],
    [106, 42, 20]
  ]
  g.fillStyle = 'rgba(120, 20, 26, 0.9)'
  g.beginPath()
  for (const [x, y, r] of lobes) {
    g.moveTo(x + r, y)
    g.arc(x, y, r, 0, Math.PI * 2)
  }
  g.rect(22, 42, 104, 18)
  g.fill()

  g.strokeStyle = GOLD
  g.lineWidth = 2.2
  g.lineCap = 'round'
  for (const [x, y, r] of lobes) {
    g.beginPath()
    for (let a = 0; a < Math.PI * 3.2; a += 0.12) {
      const rr = r * (1 - a / (Math.PI * 3.6))
      const px = x + Math.cos(a + Math.PI) * rr
      const py = y + Math.sin(a + Math.PI) * rr
      if (a === 0) g.moveTo(px, py)
      else g.lineTo(px, py)
    }
    g.stroke()
  }
  g.beginPath()
  g.moveTo(14, 60)
  g.quadraticCurveTo(75, 66, 136, 60)
  g.stroke()
  cloudSprite = c
  return c
}

/** 龙身节段贴图：金色圆鳞 + 深金弧线 */
function getSegmentSprite(): HTMLCanvasElement {
  if (segmentSprite) return segmentSprite
  const c = makeCanvas(SEGMENT_SPRITE, SEGMENT_SPRITE)
  const g = c.getContext('2d')!
  const r = SEGMENT_SPRITE / 2
  const grad = g.createRadialGradient(r * 0.8, r * 0.7, r * 0.1, r, r, r)
  grad.addColorStop(0, '#fff2b0')
  grad.addColorStop(0.55, GOLD)
  grad.addColorStop(1, GOLD_DEEP)
  g.fillStyle = grad
  g.beginPath()
  g.arc(r, r, r - 1, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = 'rgba(120, 60, 0, 0.7)'
  g.lineWidth = 3
  g.beginPath()
  g.arc(r - r * 0.35, r, r * 0.75, -Math.PI / 2.6, Math.PI / 2.6)
  g.stroke()
  segmentSprite = c
  return c
}

function getScalePattern(ctx: CanvasRenderingContext2D, stroke: string, highlight: string) {
  const key = stroke + highlight
  const cached = scalePatterns.get(key)
  if (cached) return cached
  const tile = makeCanvas(20, 12)
  const g = tile.getContext('2d')!
  g.lineWidth = 1.2
  for (const [cx, cy] of [
    [0, -6],
    [20, -6],
    [10, 0],
    [0, 6],
    [20, 6]
  ] as const) {
    g.strokeStyle = stroke
    g.beginPath()
    g.arc(cx, cy, 10, 0, Math.PI)
    g.stroke()
    g.strokeStyle = highlight
    g.beginPath()
    g.arc(cx, cy, 6.5, Math.PI * 0.25, Math.PI * 0.75)
    g.stroke()
  }
  const p = ctx.createPattern(tile, 'repeat')!
  scalePatterns.set(key, p)
  return p
}

/** 回纹：一段底线 + 方形螺旋 */
function traceKeyFret(g: CanvasRenderingContext2D, x: number, y: number, unit: number) {
  const p = (px: number, py: number) => [x + px * unit, y + py * unit] as const
  g.moveTo(...p(0, 7))
  g.lineTo(...p(8, 7))
  g.moveTo(...p(1, 7))
  g.lineTo(...p(1, 1))
  g.lineTo(...p(7, 1))
  g.lineTo(...p(7, 5))
  g.lineTo(...p(3, 5))
  g.lineTo(...p(3, 3))
  g.lineTo(...p(5, 3))
}

export function drawKeyFretStrip(
  g: CanvasRenderingContext2D,
  width: number,
  y: number,
  unit: number,
  color: string
) {
  g.strokeStyle = color
  g.lineWidth = Math.max(1, unit * 0.7)
  g.lineCap = 'square'
  g.beginPath()
  for (let x = 0; x < width; x += unit * 8) traceKeyFret(g, x, y, unit)
  g.stroke()
}

function buildStill(width: number, height: number) {
  const c = makeCanvas(width, height)
  const g = c.getContext('2d')!

  const discX = width / 2
  const discY = height * 0.38
  const discR = Math.min(width, height) * 0.3
  const disc = g.createRadialGradient(discX, discY, 0, discX, discY, discR)
  disc.addColorStop(0, 'rgba(255, 190, 90, 0.2)')
  disc.addColorStop(0.8, 'rgba(255, 150, 60, 0.1)')
  disc.addColorStop(1, 'rgba(255, 150, 60, 0)')
  g.fillStyle = disc
  g.beginPath()
  g.arc(discX, discY, discR, 0, Math.PI * 2)
  g.fill()
  g.strokeStyle = 'rgba(245, 197, 66, 0.22)'
  g.lineWidth = 1.5
  for (const k of [0.62, 0.8, 0.96]) {
    g.beginPath()
    g.arc(discX, discY, discR * k, 0, Math.PI * 2)
    g.stroke()
  }

  g.fillStyle = 'rgba(40, 4, 8, 0.85)'
  g.fillRect(0, 0, width, 18)
  drawKeyFretStrip(g, width, 2, 1.8, GOLD)
  g.fillStyle = GOLD
  g.fillRect(0, 18, width, 1.5)
  return c
}

function createCloud(width: number, height: number, anywhere: boolean): Cloud {
  const scale = rand(0.55, 1)
  return {
    x: anywhere ? rand(-CLOUD_W, width) : -CLOUD_W * scale - rand(0, 80),
    y: rand(height * 0.12, height * 0.72),
    scale,
    speed: rand(0.08, 0.2)
  }
}

function createDust(width: number, height: number, anywhere: boolean): Dust {
  return {
    x: rand(0, width),
    y: anywhere ? rand(0, height) : height + rand(0, 20),
    r: rand(3, 7),
    speed: rand(0.2, 0.6),
    phase: rand(0, Math.PI * 2)
  }
}

function ensureScene(width: number, height: number): DragonScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = {
    width,
    height,
    still: buildStill(width, height),
    dragonCanvas: makeCanvas(width, height),
    clouds: Array.from({ length: 4 }, () => createCloud(width, height, true)),
    dust: Array.from({ length: Math.min(40, Math.floor((width * height) / 8000)) }, () =>
      createDust(width, height, true)
    )
  }
  lastTime = 0
  return scene
}

function drawLantern(ctx: CanvasRenderingContext2D, x: number, time: number, phase: number, size: number) {
  const swing = Math.sin(time * 0.0014 + phase) * 0.08
  const ropeLen = size * 1.3
  ctx.save()
  ctx.translate(x, 18)
  ctx.rotate(swing)
  ctx.strokeStyle = GOLD_DEEP
  ctx.lineWidth = 1.5
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.lineTo(0, ropeLen)
  ctx.stroke()

  const cy = ropeLen + size
  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  drawImperialGlow(ctx, 0, cy, size * 2.6, 0.35 + 0.08 * Math.sin(time * 0.004 + phase))
  ctx.restore()

  const body = ctx.createRadialGradient(-size * 0.25, cy - size * 0.3, size * 0.1, 0, cy, size * 1.1)
  body.addColorStop(0, '#ff6a4a')
  body.addColorStop(0.6, '#d7141e')
  body.addColorStop(1, '#8a0a12')
  ctx.fillStyle = body
  ctx.beginPath()
  ctx.ellipse(0, cy, size * 0.95, size, 0, 0, Math.PI * 2)
  ctx.fill()

  ctx.strokeStyle = 'rgba(245, 197, 66, 0.55)'
  ctx.lineWidth = 1
  for (const k of [-0.55, 0, 0.55]) {
    ctx.beginPath()
    ctx.ellipse(0, cy, Math.abs(k) * size * 0.95 || 0.5, size, 0, 0, Math.PI * 2)
    ctx.stroke()
  }

  ctx.fillStyle = GOLD
  ctx.fillRect(-size * 0.45, cy - size - 4, size * 0.9, 6)
  ctx.fillRect(-size * 0.45, cy + size - 2, size * 0.9, 6)

  ctx.strokeStyle = '#e03a2a'
  ctx.lineWidth = 1.2
  ctx.beginPath()
  for (let i = -3; i <= 3; i++) {
    ctx.moveTo(i * 1.6, cy + size + 4)
    ctx.lineTo(i * 2.4 + Math.sin(time * 0.003 + i) * 1.5, cy + size + 4 + size * 0.9)
  }
  ctx.stroke()
  ctx.restore()
}

function spineY(x: number, cy: number, amp: number, time: number) {
  return cy + Math.sin(x * 0.012 - time * 0.0022) * amp + Math.sin(x * 0.027 - time * 0.0013) * amp * 0.3
}

/** 金龙：沿行波游动的鳞片身躯 + 龙首（角、眼、须）+ 前方火珠 */
function drawDragon(g: CanvasRenderingContext2D, s: DragonScene, time: number) {
  const { width: w, height: h } = s
  const R = Math.min(w, h) * 0.034
  const radii: number[] = []
  const offsets: number[] = []
  let bodyLen = 0
  for (let i = 0; i < DRAGON_SEGMENTS; i++) {
    const t = i / DRAGON_SEGMENTS
    const r = R * (1.05 - t * 0.78) * (i < 4 ? 0.85 + i * 0.05 : 1)
    radii.push(r)
    offsets.push(bodyLen)
    bodyLen += r * 0.62
  }
  const travel = w + bodyLen + R * 12
  const headX = ((time * 0.045) % travel) - R * 4
  const cy = h * 0.4
  const amp = h * 0.09
  const sprite = getSegmentSprite()

  g.clearRect(0, 0, w, h)

  for (let i = DRAGON_SEGMENTS - 1; i >= 0; i--) {
    const x = headX - R * 1.6 - offsets[i]!
    if (x < -R * 3 || x > w + R * 3) continue
    const r = radii[i]!
    const y = spineY(x, cy, amp, time)

    if (i % 3 === 0) {
      g.fillStyle = '#c8102e'
      g.beginPath()
      g.moveTo(x - r * 0.5, y - r * 0.8)
      g.lineTo(x - r * 0.1, y - r * 1.7)
      g.lineTo(x + r * 0.4, y - r * 0.8)
      g.closePath()
      g.fill()
    }
    g.drawImage(sprite, x - r, y - r, r * 2, r * 2)
  }

  const tailX = headX - R * 1.6 - bodyLen
  const tailY = spineY(tailX, cy, amp, time)
  const T = R * 0.6
  const flick = Math.sin(time * 0.003) * T * 0.4
  g.fillStyle = '#c8102e'
  g.beginPath()
  g.moveTo(tailX + T * 0.4, tailY - T * 0.15)
  g.quadraticCurveTo(tailX - T * 0.8, tailY - T * 1.3 + flick, tailX - T * 1.8, tailY - T * 0.9 + flick)
  g.quadraticCurveTo(tailX - T * 1.0, tailY - T * 0.2, tailX - T * 1.6, tailY + T * 0.7 - flick)
  g.quadraticCurveTo(tailX - T * 0.4, tailY + T * 0.5, tailX + T * 0.4, tailY + T * 0.15)
  g.fill()

  const hy = spineY(headX, cy, amp, time)
  const slope = (spineY(headX + 2, cy, amp, time) - hy) / 2
  const angle = Math.atan(slope)

  g.save()
  g.translate(headX, hy)
  g.rotate(angle)
  g.scale(1.25, 1.25)

  g.strokeStyle = '#ffe9a0'
  g.lineWidth = 1.6
  g.lineCap = 'round'
  const whip = Math.sin(time * 0.004)
  g.beginPath()
  g.moveTo(R * 1.8, R * 0.2)
  g.bezierCurveTo(R * 0.5, R * 1.8 + whip * R, -R * 2, R * 1.2 - whip * R, -R * 4.5, R * 2.2 + whip * R)
  g.moveTo(R * 1.8, -R * 0.1)
  g.bezierCurveTo(R * 0.6, -R * 1.9 - whip * R, -R * 2, -R * 1.4 + whip * R, -R * 4.2, -R * 2.4 - whip * R)
  g.stroke()

  g.strokeStyle = GOLD_DEEP
  g.lineWidth = R * 0.28
  g.beginPath()
  g.moveTo(-R * 0.2, -R * 0.7)
  g.quadraticCurveTo(-R * 1.2, -R * 1.8, -R * 2.3, -R * 1.9)
  g.moveTo(-R * 0.9, -R * 1.45)
  g.lineTo(-R * 0.9, -R * 2.2)
  g.stroke()

  const head = g.createLinearGradient(0, -R, 0, R)
  head.addColorStop(0, '#fff2b0')
  head.addColorStop(0.5, GOLD)
  head.addColorStop(1, GOLD_DEEP)
  g.fillStyle = head
  g.beginPath()
  g.moveTo(-R * 1.1, -R * 0.9)
  g.quadraticCurveTo(R * 0.4, -R * 1.25, R * 1.4, -R * 0.45)
  g.quadraticCurveTo(R * 2.3, -R * 0.35, R * 2.2, R * 0.05)
  g.lineTo(R * 1.1, R * 0.15)
  g.lineTo(R * 2.0, R * 0.55)
  g.quadraticCurveTo(R * 1.2, R * 1.0, -R * 0.2, R * 0.85)
  g.quadraticCurveTo(-R * 1.3, R * 0.6, -R * 1.1, -R * 0.9)
  g.closePath()
  g.fill()

  g.fillStyle = '#c8102e'
  g.beginPath()
  g.moveTo(-R * 0.9, -R * 0.6)
  g.lineTo(-R * 1.8, -R * 0.1)
  g.lineTo(-R * 0.9, R * 0.1)
  g.lineTo(-R * 1.7, R * 0.6)
  g.lineTo(-R * 0.6, R * 0.6)
  g.closePath()
  g.fill()

  g.fillStyle = '#fffbe8'
  g.beginPath()
  g.ellipse(R * 0.45, -R * 0.45, R * 0.28, R * 0.2, 0, 0, Math.PI * 2)
  g.fill()
  g.fillStyle = '#8a0a12'
  g.beginPath()
  g.arc(R * 0.52, -R * 0.45, R * 0.12, 0, Math.PI * 2)
  g.fill()
  g.restore()

  const pearlX = headX + R * 5.4
  const pearlY = spineY(pearlX, cy, amp, time) - R * 0.6
  g.save()
  g.globalCompositeOperation = 'lighter'
  drawImperialGlow(g, pearlX, pearlY, R * 3.4, 0.9)
  for (let i = 0; i < 5; i++) {
    const a = time * 0.006 + (i * Math.PI * 2) / 5
    drawImperialGlow(g, pearlX + Math.cos(a) * R * 0.9, pearlY + Math.sin(a) * R * 0.9, R * 1.2, 0.5)
  }
  g.restore()
  g.fillStyle = '#fff6d8'
  g.beginPath()
  g.arc(pearlX, pearlY, R * 0.7, 0, Math.PI * 2)
  g.fill()
}

/** 金龙第一层：朱红宫墙底、回纹顶饰、灯笼、祥云、游龙戏珠与上浮金粉 */
export function drawImperialDragonBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const k = Math.min(3, Math.max(0, deltaMs) / 16.67)

  const bg = ctx.createLinearGradient(0, 0, 0, h)
  bg.addColorStop(0, '#3a060c')
  bg.addColorStop(0.45, '#6a0d16')
  bg.addColorStop(1, '#1e0306')
  ctx.fillStyle = bg
  ctx.fillRect(0, 0, w, h)
  ctx.drawImage(s.still, 0, 0)

  const cloud = getCloudSprite()
  ctx.globalAlpha = 0.6
  for (let i = 0; i < s.clouds.length; i++) {
    const c = s.clouds[i]!
    c.x += c.speed * k
    if (c.x > w + 10) s.clouds[i] = createCloud(w, h, false)
    ctx.drawImage(cloud, c.x, c.y, CLOUD_W * c.scale, CLOUD_H * c.scale)
  }
  ctx.globalAlpha = 1

  drawDragon(s.dragonCanvas.getContext('2d')!, s, time)
  ctx.globalAlpha = 0.62
  ctx.drawImage(s.dragonCanvas, 0, 0)
  ctx.globalAlpha = 1

  const lanternSize = Math.min(w, h) * 0.045
  drawLantern(ctx, w * 0.08, time, 0, lanternSize)
  drawLantern(ctx, w * 0.92, time, 1.7, lanternSize)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (let i = 0; i < s.dust.length; i++) {
    const d = s.dust[i]!
    d.y -= d.speed * k
    d.phase += 0.03 * k
    if (d.y < -10) s.dust[i] = createDust(w, h, false)
    drawImperialGlow(ctx, d.x + Math.sin(d.phase) * 4, d.y, d.r, 0.35 + 0.35 * Math.sin(d.phase * 1.7))
  }
  ctx.restore()
}

function fillScales(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  stroke: string,
  highlight: string
) {
  const p = getScalePattern(ctx, stroke, highlight)
  p.setTransform(new DOMMatrix().translate(0, (time * 0.05) % 12))
  ctx.fillStyle = p
  ctx.fillRect(0, 0, w, h)
}

function drawSheen(ctx: CanvasRenderingContext2D, w: number, h: number, time: number, color: string) {
  const period = 240
  const shift = (time * 0.09) % period
  for (let y = -period + shift; y < h + period; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + 60)
    band.addColorStop(0, 'rgba(0, 0, 0, 0)')
    band.addColorStop(0.5, color)
    band.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, 60)
  }
}

/** 金龙 normal 层：朱漆 + 金色鱼鳞纹 + 流光 */
export function drawImperialDragonNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#e8283c')
  g.addColorStop(1, '#a00c22')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  fillScales(ctx, w, h, time, 'rgba(245, 197, 66, 0.55)', 'rgba(255, 140, 120, 0.35)')
  drawSheen(ctx, w, h, time, 'rgba(255, 220, 150, 0.35)')
}

/** 金龙 active 层：熔金 + 深金鳞纹 + 白热流光 */
export function drawImperialDragonActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#fff6c8')
  g.addColorStop(0.5, '#ffd24a')
  g.addColorStop(1, '#f09a10')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  fillScales(ctx, w, h, time * 2, 'rgba(170, 90, 0, 0.5)', 'rgba(255, 255, 255, 0.6)')
  drawSheen(ctx, w, h, time * 1.6, 'rgba(255, 255, 255, 0.55)')
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const IMPERIAL_DRAGON_CONTAINER_BG = 'linear-gradient(180deg, #3a060c 0%, #6a0d16 45%, #1e0306 100%)'
