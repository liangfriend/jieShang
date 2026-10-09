import type { PerformLayerBackgroundInput } from '../types'

/** 像素格边长：所有元素按此网格对齐，保持 8-bit 锯齿感 */
const PX = 2

const STAR_COLORS = ['#ffffff', '#8be9ff', '#ff79c6', '#fff38a'] as const

/** 11×8 外星人两帧点阵（1 = 像素） */
const INVADER_FRAMES = [
  [
    '00100000100',
    '00010001000',
    '00111111100',
    '01101110110',
    '11111111111',
    '10111111101',
    '10100000101',
    '00011011000'
  ],
  [
    '00100000100',
    '10010001001',
    '10111111101',
    '11101110111',
    '11111111111',
    '01111111110',
    '00100000100',
    '01000000010'
  ]
] as const

/** 列色板：横向依次过渡，让不同键位的水柱呈现街机多色 */
const COLUMN_PALETTE = ['#35d46a', '#00c8e8', '#8f5bff', '#ff3d9a'] as const

type PixelStar = { x: number; y: number; speed: number; size: number; color: string; blink: number }
type Invader = { x: number; y: number; scale: number; vx: number; color: string; phase: number }

type ArcadeScene = {
  width: number
  height: number
  stars: PixelStar[]
  invaders: Invader[]
}

let scene: ArcadeScene | null = null
let lastTime = 0

function snap(v: number) {
  return Math.round(v / PX) * PX
}

function buildScene(width: number, height: number): ArcadeScene {
  const stars: PixelStar[] = []
  const starCount = Math.min(260, Math.floor((width * height) / 2600))
  for (let i = 0; i < starCount; i++) {
    const far = Math.random() < 0.7
    stars.push({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: far ? 0.25 + Math.random() * 0.3 : 0.8 + Math.random() * 0.8,
      size: far ? PX : PX * 2,
      color: STAR_COLORS[(Math.random() * STAR_COLORS.length) | 0]!,
      blink: Math.random() * Math.PI * 2
    })
  }

  const invaders: Invader[] = []
  const invaderColors = ['#ff3d9a', '#00c8e8', '#35d46a']
  for (let i = 0; i < 5; i++) {
    invaders.push({
      x: Math.random() * width,
      y: height * (0.1 + i * 0.16),
      scale: 4 + ((Math.random() * 3) | 0),
      vx: (Math.random() < 0.5 ? -1 : 1) * (0.15 + Math.random() * 0.2),
      color: invaderColors[i % invaderColors.length]!,
      phase: Math.random() * 1000
    })
  }

  return { width, height, stars, invaders }
}

function ensureScene(width: number, height: number): ArcadeScene {
  if (scene && scene.width === width && scene.height === height) return scene
  scene = buildScene(width, height)
  lastTime = 0
  return scene
}

function advance(s: ArcadeScene, time: number) {
  const deltaMs = lastTime ? time - lastTime : 16.67
  lastTime = time
  const frameScale = Math.min(3, Math.max(0, deltaMs) / 16.67)

  for (const star of s.stars) {
    star.y += star.speed * frameScale
    star.blink += 0.05 * frameScale
    if (star.y > s.height + 4) {
      star.y = -4
      star.x = Math.random() * s.width
    }
  }

  for (const inv of s.invaders) {
    inv.x += inv.vx * frameScale
    const spriteW = 11 * inv.scale
    if (inv.x < -spriteW) inv.x = s.width
    if (inv.x > s.width) inv.x = -spriteW
  }
}

function drawInvader(ctx: CanvasRenderingContext2D, inv: Invader, time: number) {
  const frame = INVADER_FRAMES[Math.floor((time + inv.phase) / 520) % 2]!
  const x0 = snap(inv.x)
  const y0 = snap(inv.y)
  ctx.fillStyle = inv.color
  for (let row = 0; row < frame.length; row++) {
    const line = frame[row]!
    for (let col = 0; col < line.length; col++) {
      if (line[col] !== '1') continue
      ctx.fillRect(x0 + col * inv.scale, y0 + row * inv.scale, inv.scale, inv.scale)
    }
  }
}

/** 像素街机第一层：CRT 深蓝屏、下落像素星、外星人剪影、扫描线与暗角 */
export function drawPixelArcadeBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width: w, height: h, time } = input
  const s = ensureScene(w, h)
  advance(s, time)

  const sky = ctx.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#070a1f')
  sky.addColorStop(0.6, '#0d1236')
  sky.addColorStop(1, '#1c0f3a')
  ctx.fillStyle = sky
  ctx.fillRect(0, 0, w, h)

  ctx.globalAlpha = 0.13
  for (const inv of s.invaders) drawInvader(ctx, inv, time)
  ctx.globalAlpha = 1

  for (const star of s.stars) {
    const a = 0.45 + Math.sin(star.blink) * 0.35
    if (a <= 0.12) continue
    ctx.globalAlpha = a
    ctx.fillStyle = star.color
    ctx.fillRect(snap(star.x), snap(star.y), star.size, star.size)
  }
  ctx.globalAlpha = 1

  // 底部霓虹地平线辉光
  const glow = ctx.createLinearGradient(0, h * 0.72, 0, h)
  glow.addColorStop(0, 'rgba(255, 61, 154, 0)')
  glow.addColorStop(1, 'rgba(255, 61, 154, 0.22)')
  ctx.fillStyle = glow
  ctx.fillRect(0, h * 0.72, w, h * 0.28)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.22)'
  for (let y = 0; y < h; y += PX * 2) ctx.fillRect(0, y, w, 1)

  const vignette = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75)
  vignette.addColorStop(0, 'rgba(0, 0, 0, 0)')
  vignette.addColorStop(1, 'rgba(0, 0, 0, 0.55)')
  ctx.fillStyle = vignette
  ctx.fillRect(0, 0, w, h)
}

/**
 * 像素街机 normal 层：横向平滑过渡的街机色（水柱按所在键位取色，不会被色段一分为二）
 * + 向下滚动的像素抖动条
 */
export function drawPixelArcadeNormalLayer(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width: w, height: h, time } = input
  const hue = ctx.createLinearGradient(0, 0, w, 0)
  COLUMN_PALETTE.forEach((c, i) => hue.addColorStop(i / (COLUMN_PALETTE.length - 1), c))
  ctx.fillStyle = hue
  ctx.fillRect(0, 0, w, h)

  const period = PX * 6
  const scroll = snap((time * 0.04) % period)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.42)'
  for (let y = scroll - period; y < h; y += period) ctx.fillRect(0, y, w, PX)

  ctx.fillStyle = 'rgba(0, 0, 0, 0.2)'
  for (let y = scroll - period + PX * 3; y < h; y += period) ctx.fillRect(0, y, w, PX)
}

/** 像素街机 active 层：黄橙跑马灯棋盘格，逐帧交替闪烁 */
export function drawPixelArcadeActiveLayer(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width: w, height: h, time } = input
  ctx.fillStyle = '#ffd400'
  ctx.fillRect(0, 0, w, h)

  const cell = PX * 2
  const phase = Math.floor(time / 140) % 2
  ctx.fillStyle = '#fff6a8'
  for (let y = 0, row = 0; y < h; y += cell, row++) {
    for (let x = ((row + phase) % 2) * cell; x < w; x += cell * 2) {
      ctx.fillRect(x, y, cell, cell)
    }
  }

  ctx.fillStyle = 'rgba(255, 120, 0, 0.35)'
  for (let y = snap((time * 0.06) % 24) - 24; y < h; y += 24) {
    ctx.fillRect(0, y, w, PX * 2)
  }
}

/** 与第一层 canvas 一致的容器 CSS 背景 */
export const PIXEL_ARCADE_CONTAINER_BG = 'linear-gradient(180deg, #070a1f 0%, #0d1236 60%, #1c0f3a 100%)'
