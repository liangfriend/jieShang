<script lang="ts" setup>
import { computed, onBeforeUnmount, reactive, watch } from 'vue'
import { Finger } from '@deciphony/finger'
import type { tabChord } from '@deciphony/renderer'
import guitarBodyUrl from '@renderer/assets/virtualInstruments/guitar-body.svg'
import guitarStringsUrl from '@renderer/assets/virtualInstruments/guitar-strings.svg'
import {
  GUITAR_VIEW,
  fretFingerY,
  fretWireY,
  stringNumberToFretIndex,
  stringXAtY,
  tabChordToBarreMarks,
  tabChordToFrets
} from '@renderer/constant/guitar'
import {
  GUITAR_FINGER_CANVAS,
  buildPickHandPose,
  buildRestFretHandPose,
  buildRestPickHandPose,
  resolveFretHandPose,
  type FingerPoseMap
} from '@renderer/utils/guitarFingerPose'

const props = defineProps<{
  chord: tabChord | null
  handPose?: FingerPoseMap | null
  activeString: number | null
  /** 竖向：琴头朝上，不旋转舞台 */
  vertical?: boolean
}>()

/** 横向时舞台逆时针转了 90°，文字要反向转回来才是正的 */
function uprightText(x: number, y: number): string | undefined {
  return props.vertical ? undefined : `rotate(90 ${x} ${y})`
}

const emit = defineEmits<{
  pick: [stringNumber: number]
  release: [stringNumber: number]
}>()

const frets = computed(() =>
  props.chord ? tabChordToFrets(props.chord) : [0, 0, 0, 0, 0, 0]
)

const barreMarks = computed(() => tabChordToBarreMarks(props.chord))

const fretHand = reactive(buildRestFretHandPose())
const pickHand = reactive(buildRestPickHandPose())

function assignPose(
  target: ReturnType<typeof buildRestFretHandPose>,
  next: ReturnType<typeof buildRestFretHandPose>
) {
  target.thumbF = [...next.thumbF]
  target.indexF = [...next.indexF]
  target.middleF = [...next.middleF]
  target.ringF = [...next.ringF]
  target.littleF = [...next.littleF]
}

watch(
  () => props.handPose,
  (pose) => assignPose(fretHand, resolveFretHandPose(pose)),
  { immediate: true, deep: true }
)

/** 松弦后拨弦手停留多久再回到休息位；期间再拨弦会重新计时 */
const PICK_HAND_REST_DELAY_MS = 2000
let pickHandRestTimer: ReturnType<typeof setTimeout> | null = null

function clearPickHandRestTimer() {
  if (pickHandRestTimer == null) return
  clearTimeout(pickHandRestTimer)
  pickHandRestTimer = null
}

watch(
  () => props.activeString,
  (n) => {
    clearPickHandRestTimer()
    if (n != null) {
      assignPose(pickHand, buildPickHandPose(n))
      return
    }
    pickHandRestTimer = setTimeout(() => {
      pickHandRestTimer = null
      assignPose(pickHand, buildRestPickHandPose())
    }, PICK_HAND_REST_DELAY_MS)
  },
  { immediate: true }
)

onBeforeUnmount(clearPickHandRestTimer)

const muteMarks = computed(() => {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets.value.forEach((fret, fretIndex) => {
    if (fret !== -1) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
})

const openMarks = computed(() => {
  const marks: Array<{ x: number; y: number; stringNumber: number }> = []
  frets.value.forEach((fret, fretIndex) => {
    if (fret !== 0) return
    marks.push({
      stringNumber: 6 - fretIndex,
      x: stringXAtY(fretIndex, GUITAR_VIEW.nutY),
      y: GUITAR_VIEW.nutY - 10
    })
  })
  return marks
})

/** 按住的弦：整根弦着色 + 所按品格高亮 */
const pressMarks = computed(() => {
  const marks: Array<{ stringNumber: number; fret: number; string: string; cell: string }> = []
  frets.value.forEach((fret, fretIndex) => {
    if (fret <= 0) return
    const y0 = fretWireY(fret - 1) + 2
    const y1 = fretWireY(fret) - 2
    marks.push({
      stringNumber: 6 - fretIndex,
      fret,
      string: stringHitPath(6 - fretIndex),
      cell: `M ${stringXAtY(fretIndex, y0)} ${y0} L ${stringXAtY(fretIndex, y1)} ${y1}`
    })
  })
  return marks
})

/** 品号标在 6 弦外侧（按弦手的手指从 1 弦一侧伸过来），同品多根弦共用一个 */
const fretLabels = computed(() => {
  const seen = new Set<number>()
  const labels: Array<{ fret: number; x: number; y: number }> = []
  for (const m of pressMarks.value) {
    if (seen.has(m.fret)) continue
    seen.add(m.fret)
    const y = fretFingerY(m.fret)
    labels.push({ fret: m.fret, x: stringXAtY(0, y) - 16, y })
  }
  return labels
})

function hitString(stringNumber: number, ev: PointerEvent) {
  if (ev.button !== 0) return
  ev.preventDefault()
  ;(ev.currentTarget as Element | null)?.setPointerCapture?.(ev.pointerId)
  emit('pick', stringNumber)
}

function releaseHit(stringNumber: number, ev: PointerEvent) {
  if (ev.button !== 0 && ev.type !== 'pointercancel') return
  try {
    ;(ev.currentTarget as Element | null)?.releasePointerCapture?.(ev.pointerId)
  } catch {
    /* already released */
  }
  emit('release', stringNumber)
}

function stringHitPath(stringNumber: number): string {
  const i = stringNumberToFretIndex(stringNumber)
  const x0 = GUITAR_VIEW.nutXs[i]!
  const x1 = GUITAR_VIEW.bridgeXs[i]!
  return `M ${x0} ${GUITAR_VIEW.nutY} L ${x1} ${GUITAR_VIEW.nutY + GUITAR_VIEW.scaleLength}`
}

function labelX(stringNumber: number): number {
  return stringXAtY(stringNumberToFretIndex(stringNumber), GUITAR_VIEW.pickY) + (stringNumber <= 3 ? -14 : 14)
}
</script>

<template>
  <div class="guitar-panel" :class="{ 'guitar-panel--vertical': vertical }">
    <div class="guitar-panel__frame">
    <div class="guitar-panel__stage">
      <svg
        class="guitar-panel__svg"
        :viewBox="`0 0 ${GUITAR_VIEW.width} ${GUITAR_VIEW.height}`"
        role="img"
        aria-label="guitar"
      >
        <image :href="guitarBodyUrl" x="0" y="0" width="400" height="1000" />
        <image :href="guitarStringsUrl" x="0" y="0" width="400" height="1000" />

        <line
          v-for="(b, i) in barreMarks"
          :key="`barre-${b.fret}-${i}`"
          class="guitar-panel__barre"
          :x1="b.x1"
          :y1="b.y"
          :x2="b.x2"
          :y2="b.y"
        />

        <path
          v-for="n in 6"
          :key="`hit-${n}`"
          class="guitar-panel__hit"
          :class="{ 'guitar-panel__hit--active': activeString === n }"
          :d="stringHitPath(n)"
          @pointerdown="hitString(n, $event)"
          @pointerup="releaseHit(n, $event)"
          @pointercancel="releaseHit(n, $event)"
        />

        <g v-for="m in openMarks" :key="`open-${m.stringNumber}`">
          <circle :cx="m.x" :cy="m.y" r="5" fill="none" stroke="#2ecc71" stroke-width="2" />
        </g>
        <g v-for="m in muteMarks" :key="`mute-${m.stringNumber}`">
          <line
            :x1="m.x - 4"
            :y1="m.y - 4"
            :x2="m.x + 4"
            :y2="m.y + 4"
            stroke="#e74c3c"
            stroke-width="2"
          />
          <line
            :x1="m.x + 4"
            :y1="m.y - 4"
            :x2="m.x - 4"
            :y2="m.y + 4"
            stroke="#e74c3c"
            stroke-width="2"
          />
        </g>

        <g v-for="n in 6" :key="`label-${n}`">
          <text
            :x="labelX(n)"
            :y="GUITAR_VIEW.pickY + 4"
            :transform="uprightText(labelX(n), GUITAR_VIEW.pickY)"
            text-anchor="middle"
            fill="#5c4a6a"
            font-size="12"
            font-weight="700"
            opacity="0.75"
          >
            {{ n }}
          </text>
        </g>
      </svg>

      <!-- 按弦提示：在琴弦之上、两只手之下 -->
      <svg
        class="guitar-panel__svg guitar-panel__press-layer"
        :viewBox="`0 0 ${GUITAR_VIEW.width} ${GUITAR_VIEW.height}`"
        aria-hidden="true"
      >
        <g
          v-for="m in pressMarks"
          :key="`press-${m.stringNumber}`"
          class="guitar-panel__press"
          :class="{ 'guitar-panel__press--active': activeString === m.stringNumber }"
        >
          <path class="guitar-panel__press-string" :d="m.string" />
          <path class="guitar-panel__press-cell" :d="m.cell" />
        </g>
        <g v-for="l in fretLabels" :key="`fret-${l.fret}`">
          <circle class="guitar-panel__fret-badge" :cx="l.x" :cy="l.y" r="8" />
          <text
            class="guitar-panel__fret-text"
            :x="l.x"
            :y="l.y"
            :transform="uprightText(l.x, l.y)"
            text-anchor="middle"
            dominant-baseline="central"
          >
            {{ l.fret }}
          </text>
        </g>
      </svg>

      <!-- 左侧按弦手 / 右侧拨弦手：与吉他等大叠层 -->
      <Finger
        class="guitar-panel__finger"
        :width="GUITAR_FINGER_CANVAS.width"
        :height="GUITAR_FINGER_CANVAS.height"
        :thumb-f="fretHand.thumbF"
        :index-f="fretHand.indexF"
        :middle-f="fretHand.middleF"
        :ring-f="fretHand.ringF"
        :little-f="fretHand.littleF"
        :duration="GUITAR_FINGER_CANVAS.duration"
        :finger-size="GUITAR_FINGER_CANVAS.fingerSize"
      />
      <Finger
        class="guitar-panel__finger"
        :width="GUITAR_FINGER_CANVAS.width"
        :height="GUITAR_FINGER_CANVAS.height"
        :thumb-f="pickHand.thumbF"
        :index-f="pickHand.indexF"
        :middle-f="pickHand.middleF"
        :ring-f="pickHand.ringF"
        :little-f="pickHand.littleF"
        :duration="GUITAR_FINGER_CANVAS.duration"
        :finger-size="GUITAR_FINGER_CANVAS.fingerSize"
      />
    </div>
    </div>
  </div>
</template>

<style scoped>
.guitar-panel {
  width: 100%;
  height: 100%;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  container-type: size;
}

/* 横向外框 1000:400，在容器内等比 contain */
.guitar-panel__frame {
  position: relative;
  width: min(100cqw, 250cqh);
  height: min(100cqh, 40cqw);
}

/* 原竖向舞台（400:1000）逆时针转 90°：琴头朝左，1 弦在上 */
.guitar-panel__stage {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 40%;
  height: 250%;
  transform: translate(-50%, -50%) rotate(-90deg);
}

/* 竖向外框 400:1000，舞台原样铺满 */
.guitar-panel--vertical .guitar-panel__frame {
  width: min(100cqw, 40cqh);
  height: min(100cqh, 250cqw);
}

.guitar-panel--vertical .guitar-panel__stage {
  inset: 0;
  width: 100%;
  height: 100%;
  transform: none;
}

.guitar-panel__svg {
  width: 100%;
  height: 100%;
  display: block;
}

.guitar-panel__finger {
  position: absolute;
  inset: 0;
  width: 100% !important;
  height: 100% !important;
  pointer-events: none;
}

.guitar-panel__barre {
  stroke: #1a1a1a;
  stroke-width: 11;
  stroke-linecap: round;
  pointer-events: none;
}

.guitar-panel__hit {
  fill: none;
  stroke: transparent;
  stroke-width: 14;
  pointer-events: stroke;
  cursor: pointer;
}

.guitar-panel__hit--active {
  stroke: rgba(61, 139, 253, 0.35);
}

.guitar-panel__press-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.guitar-panel__press-string {
  fill: none;
  stroke: rgba(255, 122, 69, 0.55);
  stroke-width: 2;
}

.guitar-panel__press-cell {
  fill: none;
  stroke: rgba(255, 106, 48, 0.85);
  stroke-width: 5;
  stroke-linecap: round;
  filter: drop-shadow(0 0 3px rgba(255, 140, 60, 0.9));
}

.guitar-panel__press--active .guitar-panel__press-string {
  stroke: rgba(255, 106, 48, 0.95);
  stroke-width: 3;
}

.guitar-panel__press--active .guitar-panel__press-cell {
  stroke: #ff5a1f;
  stroke-width: 6;
}

.guitar-panel__fret-badge {
  fill: #ff6a30;
  stroke: #fff;
  stroke-width: 1.5;
}

.guitar-panel__fret-text {
  fill: #fff;
  font-size: 10px;
  font-weight: 700;
}
</style>
