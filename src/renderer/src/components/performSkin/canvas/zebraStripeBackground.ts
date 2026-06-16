import type { PerformLayerBackgroundInput } from '../types'

const STRIPE_WIDTH = 5
/** 斑马线倾斜角（弧度，约 32°） */
const STRIPE_ANGLE = Math.PI / 2
const ROAD_COLOR = '#141414'
const STRIPE_COLOR = '#f4f4f4'

/** 倾斜黑白条纹（斑马线 normal 层） */
export function drawZebraStripeLayerBackground(
  ctx: CanvasRenderingContext2D,
  input: PerformLayerBackgroundInput
) {
  const { width, height } = input

  ctx.fillStyle = ROAD_COLOR
  ctx.fillRect(0, 0, width, height)

  ctx.save()
  ctx.translate(width / 2, height / 2)
  ctx.rotate(STRIPE_ANGLE)

  const span = Math.hypot(width, height) * 1.6
  const start = -span / 2

  for (let x = start; x < start + span; x += STRIPE_WIDTH * 2) {
    ctx.fillStyle = STRIPE_COLOR
    ctx.fillRect(x, -span / 2, STRIPE_WIDTH, span)
  }

  ctx.restore()
}
