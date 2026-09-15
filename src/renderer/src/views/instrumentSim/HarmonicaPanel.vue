<script lang="ts" setup>
import { computed, onUnmounted, ref, watch } from 'vue'
import blues10Url from '@renderer/assets/virtualInstruments/harmonica-blues10.svg'
import tremolo24Url from '@renderer/assets/virtualInstruments/harmonica-tremolo24.svg'
import {
  holeCentersX,
  holeSlotWidth,
  midiForHole,
  type HarmonicaBreath,
  type HarmonicaHoleDef,
  type HarmonicaModel
} from '@renderer/constant/harmonica'

const props = defineProps<{
  model: HarmonicaModel
  /** 嘴部覆盖孔数 */
  mouthHoles: number
  /** 音色未就绪时禁止吹吸 */
  disabled?: boolean
}>()

const emit = defineEmits<{
  activeMidis: [midis: number[]]
  breath: [breath: HarmonicaBreath | null]
}>()

const BODY_URL: Record<HarmonicaModel['bodyAsset'], string> = {
  blues10: blues10Url,
  tremolo24: tremolo24Url
}

const stageRef = ref<HTMLElement | null>(null)
const hovering = ref(false)
/** 口琴相对舞台中心的平移（舞台像素） */
const followPx = ref(0)
const breath = ref<HarmonicaBreath | null>(null)
const activeHoleIndexes = ref<number[]>([])

const centers = computed(() => holeCentersX(props.model))
const slotW = computed(() => holeSlotWidth(props.model))
const bodyUrl = computed(() => BODY_URL[props.model.bodyAsset])

/** 嘴框宽度占舞台宽度比例（按孔数换算） */
const mouthWidthPercent = computed(() => {
  const holes = Math.max(0.5, props.mouthHoles)
  const cover = (holes * slotW.value) / props.model.viewBox.width
  // 乐器约占舞台 92% 宽
  return Math.min(90, Math.max(4, cover * 92))
})

function vbToStageX(vbX: number, stageW: number): number {
  // 乐器渲染宽度 ≈ stageW * 0.92
  return (vbX / props.model.viewBox.width) * stageW * 0.92
}

function harmonicaCenterStageX(stageW: number): number {
  return stageW / 2 + followPx.value
}

function holeStageX(holeIndex0: number, stageW: number): number {
  const cx = centers.value[holeIndex0] ?? 0
  const offsetFromHarmonicaCenter = vbToStageX(cx - props.model.viewBox.width / 2, stageW)
  return harmonicaCenterStageX(stageW) + offsetFromHarmonicaCenter
}

function recomputeActiveHoles() {
  const stage = stageRef.value
  if (!stage || !breath.value) {
    activeHoleIndexes.value = []
    return
  }
  const stageW = stage.clientWidth
  const mouthW = (mouthWidthPercent.value / 100) * stageW
  const left = stageW / 2 - mouthW / 2
  const right = stageW / 2 + mouthW / 2

  const next: number[] = []
  props.model.holes.forEach((hole, i) => {
    const x = holeStageX(i, stageW)
    if (x < left || x > right) return
    if (midiForHole(hole, breath.value!) == null) return
    next.push(hole.index)
  })
  activeHoleIndexes.value = next
}

function activeMidisFromHoles(): number[] {
  if (!breath.value) return []
  const midis: number[] = []
  for (const idx of activeHoleIndexes.value) {
    const hole = props.model.holes.find((h) => h.index === idx)
    if (!hole) continue
    const midi = midiForHole(hole, breath.value)
    if (midi != null) midis.push(midi)
  }
  return [...new Set(midis)]
}

watch(
  [activeHoleIndexes, breath],
  () => {
    emit('breath', breath.value)
    emit('activeMidis', activeMidisFromHoles())
  },
  { deep: true }
)

watch(
  () => [props.model.id, props.mouthHoles] as const,
  () => {
    followPx.value = 0
    recomputeActiveHoles()
  }
)

function onPointerEnter() {
  if (props.disabled) return
  hovering.value = true
}

function onPointerLeave() {
  hovering.value = false
  followPx.value = 0
  stopBreath()
}

function onPointerMove(ev: PointerEvent) {
  const stage = stageRef.value
  if (!stage || !hovering.value || props.disabled) return
  const rect = stage.getBoundingClientRect()
  const x = ev.clientX - rect.left
  const maxShift = rect.width * 0.42
  followPx.value = Math.max(-maxShift, Math.min(maxShift, x - rect.width / 2))
  if (breath.value) recomputeActiveHoles()
}

function startBreath(next: HarmonicaBreath) {
  if (props.disabled) return
  breath.value = next
  recomputeActiveHoles()
}

function stopBreath() {
  if (!breath.value && activeHoleIndexes.value.length === 0) return
  breath.value = null
  activeHoleIndexes.value = []
}

function onPointerDown(ev: PointerEvent) {
  if (props.disabled) return
  if (ev.button === 0) {
    ev.preventDefault()
    startBreath('blow')
  } else if (ev.button === 2) {
    ev.preventDefault()
    startBreath('draw')
  }
}

function onPointerUp(ev: PointerEvent) {
  if (ev.button === 0 || ev.button === 2) stopBreath()
}

function onContextMenu(ev: Event) {
  ev.preventDefault()
}

function isActive(hole: HarmonicaHoleDef): boolean {
  return activeHoleIndexes.value.includes(hole.index)
}

function holeFill(hole: HarmonicaHoleDef): string {
  if (isActive(hole)) {
    return breath.value === 'blow' ? '#ff6b6b' : '#4dabf7'
  }
  if (hole.blowMidi != null && hole.drawMidi != null) return '#1a120e'
  if (hole.blowMidi != null) return '#241810'
  if (hole.drawMidi != null) return '#181c24'
  return '#0c0c10'
}

onUnmounted(() => {
  stopBreath()
})
</script>

<template>
  <div
    ref="stageRef"
    class="harmonica-panel"
    :class="{ 'harmonica-panel--disabled': disabled }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointermove="onPointerMove"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointercancel="stopBreath"
    @contextmenu="onContextMenu"
  >
    <!-- 固定在舞台中心的嘴部范围 -->
    <div
      class="harmonica-panel__mouth"
      :style="{ width: `${mouthWidthPercent}%` }"
      aria-hidden="true"
    />

    <div
      class="harmonica-panel__instrument"
      :style="{ transform: `translateX(${followPx}px)` }"
    >
      <svg
        class="harmonica-panel__svg"
        :viewBox="`0 0 ${model.viewBox.width} ${model.viewBox.height}`"
        role="img"
        :aria-label="model.id"
      >
        <image
          :href="bodyUrl"
          x="0"
          y="0"
          :width="model.viewBox.width"
          :height="model.viewBox.height"
        />

        <g v-for="(hole, i) in model.holes" :key="hole.index">
          <rect
            class="harmonica-panel__hole"
            :class="{ 'harmonica-panel__hole--active': isActive(hole) }"
            :x="(centers[i] ?? 0) - slotW * 0.32"
            :y="model.holeRow.y"
            :width="slotW * 0.64"
            :height="model.holeRow.height"
            rx="4"
            :fill="holeFill(hole)"
            stroke="#000"
            stroke-opacity="0.35"
            stroke-width="1"
          />
          <text
            :x="centers[i]"
            :y="model.holeRow.y + model.holeRow.height + 14"
            text-anchor="middle"
            fill="#5c4a6a"
            font-size="10"
            font-weight="600"
            opacity="0.7"
          >
            {{ hole.index }}
          </text>
        </g>
      </svg>
    </div>
  </div>
</template>

<style scoped>
.harmonica-panel {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 148px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: crosshair;
  user-select: none;
  touch-action: none;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.55), transparent 60%),
    linear-gradient(180deg, #f7f0e8 0%, #ebe4dc 100%);
  border-radius: 16px;
}

.harmonica-panel--disabled {
  cursor: wait;
  opacity: 0.72;
  pointer-events: none;
}

.harmonica-panel__mouth {
  position: absolute;
  left: 50%;
  top: 18%;
  bottom: 22%;
  transform: translateX(-50%);
  border: 2px solid #e03131;
  border-radius: 6px;
  background: rgba(224, 49, 49, 0.1);
  pointer-events: none;
  z-index: 2;
  box-sizing: border-box;
}

.harmonica-panel__instrument {
  width: 92%;
  max-width: 100%;
  transition: transform 0.05s linear;
  will-change: transform;
  z-index: 1;
}

.harmonica-panel__svg {
  width: 100%;
  height: auto;
  display: block;
  overflow: visible;
}

.harmonica-panel__hole--active {
  filter: drop-shadow(0 0 6px rgba(255, 120, 80, 0.65));
}
</style>
