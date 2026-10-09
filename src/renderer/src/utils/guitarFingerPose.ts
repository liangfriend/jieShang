import type { tabChord } from '@deciphony/renderer'
import { boneOffset, FINGER_PART_DEFS } from '@deciphony/finger'
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

export function cloneFingerPoseMap(src: FingerPoseMap): FingerPoseMap {
  return {
    thumbF: [...src.thumbF],
    indexF: [...src.indexF],
    middleF: [...src.middleF],
    ringF: [...src.ringF],
    littleF: [...src.littleF]
  }
}

function isPoseArray(v: unknown, joints: number): v is number[] {
  return Array.isArray(v) && v.length >= 2 + joints && v.every((n) => typeof n === 'number' && Number.isFinite(n))
}

export function isFingerPoseMap(v: unknown): v is FingerPoseMap {
  if (!v || typeof v !== 'object') return false
  const o = v as Record<string, unknown>
  return (
    isPoseArray(o.thumbF, 2) &&
    isPoseArray(o.indexF, 3) &&
    isPoseArray(o.middleF, 3) &&
    isPoseArray(o.ringF, 3) &&
    isPoseArray(o.littleF, 3)
  )
}

/** 模拟演奏：用手型编辑结果，否则静止手型 */
export function resolveFretHandPose(pose: FingerPoseMap | null | undefined): FingerPoseMap {
  return isFingerPoseMap(pose) ? cloneFingerPoseMap(pose) : buildRestFretHandPose()
}

/** 与吉他 viewBox 同尺寸的 Finger 画布 */
export const GUITAR_FINGER_CANVAS = {
  width: GUITAR_VIEW.width,
  height: GUITAR_VIEW.height,
  fingerSize: 12,
  duration: 0.22
} as const

function segmentLengths(finger: 'thumb' | 'index' | 'middle' | 'ring' | 'little'): number[] {
  return FINGER_PART_DEFS.filter((d) => d.finger === finger).map((d) => d.length)
}

const FINGER_SEGMENT_LENGTHS: Record<keyof FingerPoseMap, number[]> = {
  thumbF: segmentLengths('thumb'),
  indexF: segmentLengths('index'),
  middleF: segmentLengths('middle'),
  ringF: segmentLengths('ring'),
  littleF: segmentLengths('little')
}

/**
 * 默认按弦手（取自和弦 A 手型）：
 * 新建和弦默认手型、模拟吉他未按弦时的左侧手。
 */
export const DEFAULT_FRET_HAND_POSE: FingerPoseMap = {
  thumbF: [155.1962432861328, 187.41249084472656, -57.528832617156, -105.78270610000594],
  indexF: [
    267.92828369140625, 190.3030548095703, -48.81407483429035, 101.89473137758905, 33.039827847135925
  ],
  middleF: [
    278.0452575683594, 203.3105926513672, -47.290610042638534, 75.41377120060146, 40.39327580272683
  ],
  ringF: [280.9358215332031, 216.31814575195312, -58.57043438516149, 78.7087223846728, 4],
  littleF: [285.27166748046875, 230.77096557617188, -56.30995108659864, 67.27968591543522, 4]
}

/**
 * 默认拨弦手（取自和弦 Am 手型）：
 * 模拟吉他未拨弦时的右侧手（五指弯曲）。
 */
export const DEFAULT_PICK_HAND_POSE: FingerPoseMap = {
  thumbF: [84.37739562988281, 631.1141967773438, 78.69005201546922, -261.00093177280996],
  indexF: [
    81.48683166503906, 636.8953247070312, -114.22771262022599, 244.77962411108626, -44.63408909147063
  ],
  middleF: [
    81.48683166503906, 649.9028930664062, -115.46337916490428, 238.90797013762796, -28.617087598340632
  ],
  ringF: [
    81.48683166503906, 662.9104614257812, -117.75857931002261, 239.2898538279182, -40.32590410913711
  ],
  littleF: [
    84.37739562988281, 671.5821533203125, -105.52407633155222, 241.3741234484421, -39.89420682052072
  ]
}

/** 左侧和弦手：未按弦时用 A 手型 */
export function buildRestFretHandPose(): FingerPoseMap {
  return cloneFingerPoseMap(DEFAULT_FRET_HAND_POSE)
}

/** 右侧拨弦手：未拨弦时用 Am 手型 */
export function buildRestPickHandPose(): FingerPoseMap {
  return cloneFingerPoseMap(DEFAULT_PICK_HAND_POSE)
}

const PICK_POSE_KEYS: (keyof FingerPoseMap)[] = [
  'thumbF',
  'indexF',
  'middleF',
  'ringF',
  'littleF'
]

type PickFingerKey = 'thumbF' | 'indexF' | 'middleF' | 'ringF'

function pickFingerForString(stringNumber: number): PickFingerKey {
  if (stringNumber === 1) return 'ringF'
  if (stringNumber === 2) return 'middleF'
  if (stringNumber === 3) return 'indexF'
  return 'thumbF'
}

function pickPoint(stringNumber: number): { x: number; y: number } {
  return {
    x: stringXAtY(stringNumberToFretIndex(stringNumber), GUITAR_VIEW.pickY),
    y: GUITAR_VIEW.pickY
  }
}

function chainOffset(
  angles: number[],
  lengths: readonly number[],
  size: number
): { x: number; y: number } {
  let abs = 0
  let x = 0
  let y = 0
  for (let i = 0; i < lengths.length; i++) {
    abs += angles[i] ?? 0
    const { dx, dy } = boneOffset(abs, lengths[i]!, size)
    x += dx
    y += dy
  }
  return { x, y }
}

function tipFromPose(pose: number[], lengths: readonly number[]): { x: number; y: number } {
  const off = chainOffset(pose.slice(2), lengths, GUITAR_FINGER_CANVAS.fingerSize)
  return { x: (pose[0] ?? 0) + off.x, y: (pose[1] ?? 0) + off.y }
}

function normalizeDeg(deg: number): number {
  let a = deg % 360
  if (a > 180) a -= 360
  if (a <= -180) a += 360
  return a
}

/** 最短弧插值，避免穿过朝左造成反向弯曲 */
function lerpAngle(from: number, to: number, t: number): number {
  const a = normalizeDeg(from)
  const b = normalizeDeg(to)
  let diff = b - a
  if (diff > 180) diff -= 360
  if (diff < -180) diff += 360
  return a + diff * t
}

/**
 * Finger 对角度做线性插值，不绕圆。把目标角加减 360° 贴到 from 附近，
 * 这样 244°→301° 舒展，而不会 244°→-59° 反向绕一大圈。
 */
function unwrapNear(from: number, to: number): number {
  let b = to
  while (b - from > 180) b -= 360
  while (b - from < -180) b += 360
  return b
}

/**
 * 食指～小指：关节向右舒展（a0 更朝右 = -180°，后段弯角收向 0）。
 * 拇指：根段保持朝上，第二关节向上打开（相对角收向 0）。
 */
function mildExtendPickFinger(restPose: number[], key: keyof FingerPoseMap): number[] {
  const rx = restPose[0] ?? 0
  const ry = restPose[1] ?? 0
  const restAngles = restPose.slice(2)
  const raw =
    key === 'thumbF'
      ? [
          lerpAngle(restAngles[0] ?? 0, 90, 0.55 * 0.25),
          lerpAngle(restAngles[1] ?? 0, 8, 0.55)
        ]
      : [
          lerpAngle(restAngles[0] ?? 0, -180, 0.42),
          lerpAngle(restAngles[1] ?? 0, 18, 0.42),
          lerpAngle(restAngles[2] ?? 0, 10, 0.42)
        ]
  return [rx, ry, ...raw.map((ang, i) => unwrapNear(restAngles[i] ?? 0, ang))]
}

function translateAllRoots(pose: FingerPoseMap, dx: number, dy: number): FingerPoseMap {
  const next = cloneFingerPoseMap(pose)
  for (const key of PICK_POSE_KEYS) {
    const p = next[key]
    next[key] = [p[0]! + dx, p[1]! + dy, ...p.slice(2)]
  }
  return next
}

const FINGER_KEYS = ['indexF', 'middleF', 'ringF', 'littleF'] as const

/** 和弦图 1～4 指 → 食指～小指。同指同品且弦相邻视为横按（取均值）；否则多余按点分给空闲手指。 */
function fretTargetsByFinger(chord: tabChord): Map<number, { x: number; y: number }> {
  const groups = new Map<number, GuitarFingerDot[]>()
  for (const d of buildFingerDotsFromTabChord(chord)) {
    const f = Math.round(d.finger)
    if (f < 1 || f > 4) continue
    const arr = groups.get(f)
    if (arr) arr.push(d)
    else groups.set(f, [d])
  }

  const centroid = (arr: GuitarFingerDot[]) => ({
    x: arr.reduce((s, d) => s + d.x, 0) / arr.length,
    y: arr.reduce((s, d) => s + d.y, 0) / arr.length
  })

  const stringsContiguous = (arr: GuitarFingerDot[]) => {
    const nums = arr.map((d) => d.stringNumber).sort((a, b) => a - b)
    return nums[nums.length - 1]! - nums[0]! + 1 === nums.length
  }

  const claimed = new Set<number>()
  const extras: GuitarFingerDot[] = []
  const out = new Map<number, { x: number; y: number }>()

  for (const [f, arr] of groups) {
    const sameFret = arr.every((d) => d.fret === arr[0]!.fret)
    const unusedSlots = 4 - groups.size
    const keepTogether =
      arr.length === 1 ||
      (sameFret && stringsContiguous(arr)) ||
      unusedSlots === 0
    if (keepTogether) {
      out.set(f, centroid(arr))
      claimed.add(f)
      continue
    }
    // 同品但不连续（G 的两根 3 品）：粗弦留给原指，其余待分配
    const sorted = [...arr].sort((a, b) => b.stringNumber - a.stringNumber)
    out.set(f, { x: sorted[0]!.x, y: sorted[0]!.y })
    claimed.add(f)
    extras.push(...sorted.slice(1))
  }

  const takeUnused = (from: number) => {
    for (let i = from; i <= 4; i++) if (!claimed.has(i)) return i
    for (let i = 1; i < from; i++) if (!claimed.has(i)) return i
    return null
  }

  for (const d of extras) {
    const n = takeUnused(Math.round(d.finger) + 1)
    if (n == null) continue
    claimed.add(n)
    out.set(n, { x: d.x, y: d.y })
  }
  return out
}

function translateFinger(pose: number[], dx: number, dy: number): number[] {
  return [(pose[0] ?? 0) + dx, (pose[1] ?? 0) + dy, ...pose.slice(2)]
}

/**
 * 按弦手：沿用 A 手型关节角（不改旋转方向），只平移根点，
 * 让 1～4 指指尖落到对应品位；未按的指随整手平移。
 */
export function buildStoredFretHandPose(chord: tabChord | null): FingerPoseMap {
  const rest = buildRestFretHandPose()
  if (!chord) return rest
  const targets = fretTargetsByFinger(chord)
  if (targets.size === 0) return rest

  const used: number[] = []
  for (let f = 1; f <= 4; f++) if (targets.has(f)) used.push(f)

  let dx = 0
  let dy = 0
  for (const f of used) {
    const key = FINGER_KEYS[f - 1]!
    const tip = tipFromPose(rest[key], FINGER_SEGMENT_LENGTHS[key])
    const dest = targets.get(f)!
    dx += dest.x - tip.x
    dy += dest.y - tip.y
  }
  dx /= used.length
  dy /= used.length

  const pose = translateAllRoots(rest, dx, dy)
  for (const f of used) {
    const key = FINGER_KEYS[f - 1]!
    const tip = tipFromPose(pose[key], FINGER_SEGMENT_LENGTHS[key])
    const dest = targets.get(f)!
    pose[key] = translateFinger(pose[key], dest.x - tip.x, dest.y - tip.y)
  }
  return pose
}

/** @deprecated 同 buildStoredFretHandPose */
export function buildChordHandPose(chord: tabChord | null): FingerPoseMap {
  return buildStoredFretHandPose(chord)
}

/**
 * 拨弦手：
 * 1. 拨弦指在原位略微舒展（食指～无名指向右打开；拇指第二关节向上打开）
 * 2. 用舒展后的指尖算出整手平移，使指尖落到弦上
 * 3. 其余指保持弯曲，仅根点随整手平移
 * 1→无名指 / 2→中指 / 3→食指 / 4–6→拇指
 */
export function buildPickHandPose(stringNumber: number | null): FingerPoseMap {
  const rest = buildRestPickHandPose()
  if (stringNumber == null || stringNumber < 1 || stringNumber > 6) {
    return rest
  }

  const { x: tipX, y: tipY } = pickPoint(stringNumber)
  const fingerKey = pickFingerForString(stringNumber)
  const lengths = FINGER_SEGMENT_LENGTHS[fingerKey]
  const extended = mildExtendPickFinger(rest[fingerKey], fingerKey)
  const tipNow = tipFromPose(extended, lengths)

  const pose = translateAllRoots(rest, tipX - tipNow.x, tipY - tipNow.y)
  pose[fingerKey] = [
    (extended[0] ?? 0) + (tipX - tipNow.x),
    (extended[1] ?? 0) + (tipY - tipNow.y),
    ...extended.slice(2)
  ]
  return pose
}

