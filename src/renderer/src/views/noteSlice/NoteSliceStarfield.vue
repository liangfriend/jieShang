<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'

type Star = {
  x: number
  y: number
  radius: number
  alpha: number
  twinkleSpeed: number
  twinklePhase: number
  driftX: number
  driftY: number
}

const canvasRef = ref<HTMLCanvasElement | null>(null)

const STAR_COUNT = 180
let stars: Star[] = []
let animationId = 0
let resizeObserver: ResizeObserver | null = null
let viewWidth = 0
let viewHeight = 0

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min)
}

function createStars(width: number, height: number): Star[] {
  return Array.from({ length: STAR_COUNT }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    radius: randomBetween(0.6, 2.2),
    alpha: randomBetween(0.35, 1),
    twinkleSpeed: randomBetween(0.008, 0.028),
    twinklePhase: Math.random() * Math.PI * 2,
    driftX: randomBetween(-0.08, 0.08),
    driftY: randomBetween(0.02, 0.18)
  }))
}

function scaleStars(fromW: number, fromH: number, toW: number, toH: number): void {
  if (fromW <= 0 || fromH <= 0) {
    stars = createStars(toW, toH)
    return
  }
  const scaleX = toW / fromW
  const scaleY = toH / fromH
  for (const star of stars) {
    star.x *= scaleX
    star.y *= scaleY
  }
}

function syncCanvasSize(canvas: HTMLCanvasElement): boolean {
  const rect = canvas.getBoundingClientRect()
  const dpr = window.devicePixelRatio || 1
  const width = Math.max(1, Math.floor(rect.width))
  const height = Math.max(1, Math.floor(rect.height))

  if (width === viewWidth && height === viewHeight) {
    return false
  }

  const prevW = viewWidth
  const prevH = viewHeight
  viewWidth = width
  viewHeight = height

  canvas.width = Math.floor(width * dpr)
  canvas.height = Math.floor(height * dpr)

  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  if (stars.length === 0) {
    stars = createStars(width, height)
  } else {
    scaleStars(prevW, prevH, width, height)
  }

  return true
}

function drawFrame(canvas: HTMLCanvasElement, time: number): void {
  const ctx = canvas.getContext('2d')
  if (!ctx || viewWidth <= 0 || viewHeight <= 0) return

  const gradient = ctx.createLinearGradient(0, 0, 0, viewHeight)
  gradient.addColorStop(0, '#070818')
  gradient.addColorStop(0.55, '#10122a')
  gradient.addColorStop(1, '#1a1030')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, viewWidth, viewHeight)

  for (const star of stars) {
    star.x += star.driftX
    star.y += star.driftY

    if (star.x < -4) star.x = viewWidth + 4
    if (star.x > viewWidth + 4) star.x = -4
    if (star.y > viewHeight + 4) {
      star.y = -4
      star.x = Math.random() * viewWidth
    }

    const twinkle = 0.55 + 0.45 * Math.sin(time * star.twinkleSpeed + star.twinklePhase)
    const alpha = Math.min(1, star.alpha * twinkle)

    ctx.beginPath()
    ctx.fillStyle = `rgba(220, 230, 255, ${alpha.toFixed(3)})`
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2)
    ctx.fill()

    if (star.radius > 1.4) {
      ctx.beginPath()
      ctx.fillStyle = `rgba(180, 200, 255, ${(alpha * 0.25).toFixed(3)})`
      ctx.arc(star.x, star.y, star.radius * 2.4, 0, Math.PI * 2)
      ctx.fill()
    }
  }
}

function startAnimation(canvas: HTMLCanvasElement): void {
  const tick = (time: number) => {
    syncCanvasSize(canvas)
    drawFrame(canvas, time * 0.001)
    animationId = window.requestAnimationFrame(tick)
  }

  syncCanvasSize(canvas)
  animationId = window.requestAnimationFrame(tick)

  resizeObserver = new ResizeObserver(() => {
    syncCanvasSize(canvas)
  })
  resizeObserver.observe(canvas)

  window.addEventListener('resize', handleWindowResize)
}

function handleWindowResize(): void {
  const canvas = canvasRef.value
  if (!canvas) return
  syncCanvasSize(canvas)
}

onMounted(() => {
  const canvas = canvasRef.value
  if (!canvas) return
  startAnimation(canvas)
})

onUnmounted(() => {
  window.cancelAnimationFrame(animationId)
  resizeObserver?.disconnect()
  resizeObserver = null
  window.removeEventListener('resize', handleWindowResize)
})
</script>

<template>
  <canvas ref="canvasRef" class="note-slice-starfield" aria-hidden="true" />
</template>

<style scoped>
.note-slice-starfield {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
