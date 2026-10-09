import type { PerformLayerBackgroundInput } from '../types'

type Snowflake = { x: number; y: number; r: number; speed: number; drift: number }

type Ribbon = {
  sprite: HTMLCanvasElement
  baseY: number
  amp: number
  freq: number
  speed: number
  curtain: number
  phase: number
}

type AuroraScene = {
  width: number
  height: number
  still: HTMLCanvasElement
  ribbons: Ribbon[]
  snow: Snowflake[]
}

let scene: AuroraScene | null = null
let lastTime = 0

const STRIP = 5

function rand(a: number, b: number) {
  return a + Math.random() * (b - a)
}

function hash(n: number) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453
  return s - Math.floor(s)
}

function makeCanvas(width: number, height: number) {
  const c = document.createElement('canvas')
  c.width = Math.max(1, Math.ceil(width))
  c.height = Math.max(1, Math.ceil(height))
  return c
}

/** 极光幕竖条贴图：底边最亮，向上渐隐并过渡到顶部色 */
function buildCurtainSprite(bottom: string, mid: string, top: string) {
  const c = makeCanvas(1, 128)
  const g = c.getContext('2d')!
  const grad = g.createLinearGradient(0, 128, 0, 0)
  grad.addColorStop(0, 'rgba(0, 0, 0, 0)')
  grad.addColorStop(0.06, bottom)
  grad.addColorStop(0.35, mid)
  grad.addColorStop(1, top)
  g.fillStyle = grad
  g.fillRect(0, 0, 1, 128)
  return c
}

function drawMountains(
  g: CanvasRenderingContext2D,
  width: number,
  baseY: number,
  maxH: number,
  seed: number,
  body: string,
  shade: string
) {
  const peaks: Array<[number, number]> = []
  for (let x = -40, i = 0; x < width + 80; x += 60 + hash(seed + i) * 70, i++) {
    peaks.push([x, baseY - maxH * (0.45 + hash(seed + i + 0.5) * 0.55)])
  }
  for (let i = 0; i < peaks.length; i++) {
    const [px, py] = peaks[i]!
    const left = i > 0 ? (peaks[i - 1]![0] + px) / 2 : px - 80
    const right = i < peaks.length - 1 ? (peaks[i + 1]![0] + px) / 2 : px + 80
    const valleyL = baseY - maxH * 0.2
    const valleyR = baseY - maxH * 0.2

    g.fillStyle = body
    g.beginPath()
    g.moveTo(left - 30, baseY)
    g.lineTo(left, valleyL)
    g.lineTo(px, py)
    g.lineTo(right, valleyR)
    g.lineTo(right + 30, baseY)
    g.closePath()
    g.fill()

    g.fillStyle = shade
    g.beginPath()
    g.moveTo(px, py)
    g.lineTo(right, valleyR)
    g.lineTo(right + 30, baseY)
    g.lineTo(px + (right - px) * 0.15, baseY)
    g.closePath()
    g.fill()

    const capH = (baseY - py) * 0.28
    g.fillStyle = 'rgba(240, 250, 255, 0.95)'
    g.beginPath()
    g.moveTo(px, py)
    g.lineTo(px + ((left - px) * capH) / (valleyL - py + 1), py + capH)
    g.lineTo(px - 6, py + capH * 0.75)
    g.lineTo(px + 4, py + capH * 1.05)
    g.lineTo(px + ((right - px) * capH) / (valleyR - py + 1), py + capH)
    g.closePath()
    g.fill()
  }
  g.fillStyle = body
  g.fillRect(0, baseY, width, 400)
}

function drawPines(g: CanvasRenderingContext2D, width: number, baseY: number, color: string) {
  g.fillStyle = color
  for (let x = -10, i = 0; x < width + 10; i++) {
    const h = 26 + hash(i + 77) * 34
    const w = h * 0.42
    g.beginPath()
    g.moveTo(x, baseY)
    g.lineTo(x + w / 2, baseY - h)
    g.lineTo(x + w, baseY)
    g.closePath()
    g.fill()
    x += w * (0.55 + hash(i + 91) * 0.9)
  }
}

function buildStill(width: number, height: number) {
  const c = makeCanvas(width, height)
  const g = c.getContext('2d')!
  for (let i = 0; i < 120; i++) {
    const x = hash(i + 0.19) * width
    const y = hash(i + 0.83) * height * 0.62
    g.fillStyle = `rgba(230, 240, 255, ${0.2 + hash(i + 0.41) * 0.6})`
    const r = hash(i + 0.67) < 0.9 ? 1 : 1.8
    g.fillRect(x, y, r, r)
  }
  drawMountains(g, width, height * 0.8, height * 0.26, 5, '#2b4a6e', '#1c3453')
  drawMountains(g, width, height * 0.88, height * 0.16, 31, '#1a2f4c', '#12233a')
  drawPines(g, width, height * 0.9, '#0a1628')

  const ground = g.createLinearGradient(0, height * 0.9, 0, height)
  ground.addColorStop(0, '#cfe3f5')
  ground.addColorStop(1, '#8fb2d4')
  g.fillStyle = ground
  g.fillRect(0, height * 0.9, width, height * 0.1)
  return c
}

function createFlake(width: number, height: number, anywhere: boolean): Snowflake {
  return {
    x: rand(0, width),
    y: anywhere ? rand(0, height) : rand(-20, -4),
    r: rand(0.8, 2.4),
    speed: rand(0.25, 0.7),
    drift: rand(0, Math.PI * 2)
  }
}

function ensureScene(width: number, height: number): AuroraScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = {
    width,
    height,
    still: buildStill(width, height),
    ribbons: [
      {
        sprite: buildCurtainSprite('rgba(120, 255, 180, 0.85)', 'rgba(60, 230, 170, 0.35)', 'rgba(170, 90, 255, 0)'),
        baseY: height * 0.36,
        amp: height * 0.06,
        freq: 0.006,
        speed: 0.00022,
        curtain: height * 0.3,
        phase: 0
      },
      {
        sprite: buildCurtainSprite('rgba(90, 240, 220, 0.7)', 'rgba(80, 160, 255, 0.28)', 'rgba(200, 100, 255, 0)'),
        baseY: height * 0.46,
        amp: height * 0.05,
        freq: 0.009,
        speed: -0.00018,
        curtain: height * 0.24,
        phase: 2.1
      },
      {
        sprite: buildCurtainSprite('rgba(210, 140, 255, 0.55)', 'rgba(150, 110, 255, 0.22)', 'rgba(255, 120, 200, 0)'),
        baseY: height * 0.26,
        amp: height * 0.04,
        freq: 0.004,
        speed: 0.00012,
        curtain: height * 0.2,
        phase: 4.2
      }
    ],
    snow: Array.from({ length: Math.min(70, Math.floor((width * height) / 5000)) }, () =>
      createFlake(width, height, true)
    )
  }
  lastTime = 0
  return scene
}

function drawRibbon(ctx: CanvasRenderingContext2D, r: Ribbon, width: number, time: number) {
  const t = time * r.speed
  for (let x = 0; x < width; x += STRIP) {
    const y =
      r.baseY +
      Math.sin(x * r.freq + t * 6 + r.phase) * r.amp +
      Math.sin(x * r.freq * 2.3 - t * 9 + r.phase * 1.7) * r.amp * 0.4
    const flicker =
      0.6 + 0.3 * Math.sin(x * 0.012 + time * 0.0012 + r.phase) + 0.1 * Math.sin(x * 0.09 - time * 0.002)
    const h = r.curtain * (0.65 + 0.35 * Math.sin(x * 0.011 + t * 4 + r.phase))
    ctx.globalAlpha = flicker
    ctx.drawImage(r.sprite, x, y - h, STRIP, h)
  }
  ctx.globalAlpha = 1
}

/** 极光第一层：星空、飘动的三条极光幕、雪山松林与飘雪 */
export function drawAuroraBackground(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const k = Math.min(3, Math.max(0, deltaMs) / 16.67)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#020617')
  sky.addColorStop(0.55, '#0b2140')
  sky.addColorStop(1, '#16405a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  ctx.save()
  ctx.globalCompositeOperation = 'lighter'
  for (const r of s.ribbons) drawRibbon(ctx, r, w, time)
  ctx.restore()

  ctx.drawImage(s.still, 0, 0)

  ctx.fillStyle = 'rgba(240, 248, 255, 0.85)'
  for (let i = 0; i < s.snow.length; i++) {
    const f = s.snow[i]!
    f.y += f.speed * k
    f.drift += 0.02 * k
    const x = f.x + Math.sin(f.drift) * 6
    if (f.y > h + 4) s.snow[i] = createFlake(w, h, false)
    ctx.beginPath()
    ctx.arc(x, f.y, f.r, 0, Math.PI * 2)
    ctx.fill()
  }
}

/** 流动的斜向光带，用于水柱层的极光反光 */
function drawShimmer(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  time: number,
  color: string,
  speed: number
) {
  const period = 200
  const shift = (time * speed) % period
  for (let y = -period + shift; y < h + period; y += period) {
    const band = ctx.createLinearGradient(0, y, 0, y + 80)
    band.addColorStop(0, 'rgba(0, 0, 0, 0)')
    band.addColorStop(0.5, color)
    band.addColorStop(1, 'rgba(0, 0, 0, 0)')
    ctx.fillStyle = band
    ctx.fillRect(0, y, w, 80)
  }
}

/** 极光 normal 层：冰青渐变 + 绿紫极光反光 */
export function drawAuroraNormalLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#9ff7e8')
  g.addColorStop(0.5, '#4fd8d0')
  g.addColorStop(1, '#2a9fc4')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  drawShimmer(ctx, w, h, time, 'rgba(190, 150, 255, 0.45)', 0.05)
  drawShimmer(ctx, w, h, time + 5000, 'rgba(230, 255, 250, 0.4)', 0.09)
}

/** 极光 active 层：白→紫罗兰的极光核心 + 细碎冰晶闪点 */
export function drawAuroraActiveLayer(ctx: CanvasRenderingContext2D, input: PerformLayerBackgroundInput) {
  const { width: w, height: h, time } = input
  const g = ctx.createLinearGradient(0, 0, 0, h)
  g.addColorStop(0, '#ffffff')
  g.addColorStop(0.5, '#e2ccff')
  g.addColorStop(1, '#a98bff')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, w, h)
  drawShimmer(ctx, w, h, time, 'rgba(160, 255, 220, 0.5)', 0.16)

  const cell = 14
  const frame = Math.floor(time / 120)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)'
  for (let y = 0, row = 0; y < h; y += cell, row++) {
    for (let x = 0, col = 0; x < w; x += cell, col++) {
      const v = hash(row * 997 + col * 13 + frame * 0.37)
      if (v > 0.06) continue
      ctx.fillRect(x + v * 100, y + (v * 1000) % cell, 1.6, 1.6)
    }
  }
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const AURORA_CONTAINER_BG = 'linear-gradient(180deg, #020617 0%, #0b2140 55%, #16405a 100%)'
