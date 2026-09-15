import type { tabChord } from '@deciphony/renderer'
import {
  GUITAR_VIEW,
  buildFingerDotsFromTabChord,
  stringNumberToFretIndex,
  stringXAtY,
  type GuitarFingerDot
} from '@renderer/constant/guitar'

export type FingerPoseMap = {
  thumbF: number[]
  indexF: number[]
  middleF: number[]
  ringF: number[]
  littleF: number[]
}

/** 与吉他 viewBox 同尺寸的 Finger 画布 */
export const GUITAR_FINGER_CANVAS = {
  width: GUITAR_VIEW.width,
  height: GUITAR_VIEW.height,
  fingerSize: 18,
  duration: 0.22
} as const

/** 食指等大致伸展长度（相对 fingerSize） */
const INDEX_REACH = 5.5
const THUMB_REACH = 3.5

function tipToRoot(tipX: number, tipY: number, angleDeg: number, reach: number): [number, number] {
  const rad = (angleDeg * Math.PI) / 180
  // 0° 朝左：tip = root + (-reach*cos θ, reach*sin θ)（SVG 顺时针）
  return [tipX + reach * Math.cos(rad), tipY - reach * Math.sin(rad)]
}

function curled(rootX: number, rootY: number, baseAngle: number, joints: 2 | 3): number[] {
  if (joints === 2) return [rootX, rootY, baseAngle + 55, 40]
  return [rootX, rootY, baseAngle + 8, 95, 70]
}

function extended(rootX: number, rootY: number, baseAngle: number, joints: 2 | 3): number[] {
  if (joints === 2) return [rootX, rootY, baseAngle, 8]
  return [rootX, rootY, baseAngle, 6, 4]
}

/** 左侧和弦手：静止在指板左上 */
export function buildRestFretHandPose(): FingerPoseMap {
  const baseX = 96
  const baseY = 72
  const a = 170
  return {
    thumbF: extended(baseX + 32, baseY + 42, a - 35, 2),
    indexF: extended(baseX, baseY, a, 3),
    middleF: extended(baseX, baseY + 26, a, 3),
    ringF: extended(baseX, baseY + 50, a, 3),
    littleF: extended(baseX, baseY + 72, a, 3)
  }
}

/** 右侧拨弦手：静止在右上 */
export function buildRestPickHandPose(): FingerPoseMap {
  const baseX = 310
  const baseY = 64
  const a = 12
  return {
    thumbF: extended(baseX - 18, baseY + 34, a + 48, 2),
    indexF: extended(baseX, baseY, a, 3),
    middleF: curled(baseX + 6, baseY + 28, a, 3),
    ringF: curled(baseX + 8, baseY + 52, a, 3),
    littleF: curled(baseX + 10, baseY + 74, a, 3)
  }
}

const FINGER_KEYS = ['indexF', 'middleF', 'ringF', 'littleF'] as const

/**
 * 和弦手：按 tabChord 品位把 1~4 指根点摆到对应品位左侧，指尖朝弦。
 */
export function buildChordHandPose(chord: tabChord | null): FingerPoseMap {
  if (!chord) return buildRestFretHandPose()
  const dots = buildFingerDotsFromTabChord(chord)
  if (!dots.length) return buildRestFretHandPose()

  const byFinger = new Map<number, GuitarFingerDot>()
  for (const d of dots) {
    if (!byFinger.has(d.finger)) byFinger.set(d.finger, d)
  }

  const reach = GUITAR_FINGER_CANVAS.fingerSize * INDEX_REACH
  const angle = 178
  const pose = buildRestFretHandPose()

  for (let f = 1; f <= 4; f++) {
    const key = FINGER_KEYS[f - 1]!
    const dot = byFinger.get(f)
    if (!dot) {
      const rest = buildRestFretHandPose()
      pose[key] = rest[key]
      continue
    }
    const [rx, ry] = tipToRoot(dot.x, dot.y, angle, reach)
    pose[key] = extended(rx, ry, angle, 3)
  }

  // 拇指搁在指板上侧
  const anchor = dots[0]!
  const [tx, ty] = tipToRoot(anchor.x - 10, Math.min(anchor.y, GUITAR_VIEW.nutY + 20), 210, GUITAR_FINGER_CANVAS.fingerSize * THUMB_REACH)
  pose.thumbF = extended(tx, ty, 210, 2)

  return pose
}

/**
 * 拨弦手：拨某弦时食指指尖落到该弦拨弦点，其余指微曲。
 */
export function buildPickHandPose(stringNumber: number | null): FingerPoseMap {
  if (stringNumber == null || stringNumber < 1 || stringNumber > 6) {
    return buildRestPickHandPose()
  }
  const fretIndex = stringNumberToFretIndex(stringNumber)
  const tipX = stringXAtY(fretIndex, GUITAR_VIEW.pickY)
  const tipY = GUITAR_VIEW.pickY
  const angle = 5
  const reach = GUITAR_FINGER_CANVAS.fingerSize * INDEX_REACH
  const [rx, ry] = tipToRoot(tipX, tipY, angle, reach)
  const pose = buildRestPickHandPose()
  pose.indexF = extended(rx, ry, angle, 3)
  pose.thumbF = extended(rx - 18, ry + 28, angle + 55, 2)
  pose.middleF = curled(rx + 8, ry + 26, angle, 3)
  pose.ringF = curled(rx + 10, ry + 50, angle, 3)
  pose.littleF = curled(rx + 12, ry + 72, angle, 3)
  return pose
}
