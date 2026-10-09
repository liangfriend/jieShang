<script lang="ts" setup>
import { computed } from 'vue'
import type { FingerHoleState } from '@renderer/constant/fingering'

const props = defineProps<{
  /** 下标 0 = 最靠近吹孔 */
  holeStates: FingerHoleState[]
  fullKeys: string[]
  halfKeys: string[]
  /** 笛头朝右：整支笛子水平翻转 */
  flipped?: boolean
}>()

const emit = defineEmits<{
  /** 鼠标按住孔位：左键全按、右键半按；state 为 null 表示松开 */
  holePointer: [index: number, state: FingerHoleState | null]
}>()

const VIEW_W = 1000
const VIEW_H = 150
const BODY_Y = 48
const BODY_H = 44
const HOLE_R = 13
const BLOW_X = 150
const MEMBRANE_X = 250

const holeXs = computed(() => {
  const n = props.holeStates.length
  const start = 420
  const step = 64
  // 上三孔 / 下三孔之间留出一段手距
  return Array.from({ length: n }, (_, i) => start + i * step + (i >= n / 2 ? 36 : 0))
})

const holeCy = BODY_Y + BODY_H / 2

const bodyTransform = computed(() =>
  props.flipped ? `translate(${VIEW_W} 0) scale(-1 1)` : undefined
)

/** 文字不随笛身镜像，只换位置 */
function labelX(x: number | undefined): number {
  const v = x ?? 0
  return props.flipped ? VIEW_W - v : v
}

function onPointerDown(ev: PointerEvent, index: number) {
  if (ev.button !== 0 && ev.button !== 2) return
  ev.preventDefault()
  ;(ev.currentTarget as Element).setPointerCapture?.(ev.pointerId)
  emit('holePointer', index, ev.button === 0 ? 'c' : 'h')
}

function onPointerUp(index: number) {
  emit('holePointer', index, null)
}
</script>

<template>
  <div class="piccolo-panel" @contextmenu.prevent>
    <svg class="piccolo-panel__svg" :viewBox="`0 0 ${VIEW_W} ${VIEW_H}`" role="img">
      <defs>
        <linearGradient id="piccolo-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stop-color="#f3dfb0" />
          <stop offset="45%" stop-color="#e2bf7c" />
          <stop offset="100%" stop-color="#a97c3c" />
        </linearGradient>
      </defs>

      <g :transform="bodyTransform">
        <rect
          x="40"
          :y="BODY_Y"
          :width="VIEW_W - 80"
          :height="BODY_H"
          rx="20"
          fill="url(#piccolo-body)"
          stroke="#8a6230"
          stroke-width="1.5"
        />
        <!-- 缠线装饰 -->
        <g fill="#7a3a28" opacity="0.8">
          <rect x="70" :y="BODY_Y" width="10" :height="BODY_H" />
          <rect x="88" :y="BODY_Y" width="4" :height="BODY_H" />
          <rect :x="VIEW_W - 92" :y="BODY_Y" width="4" :height="BODY_H" />
          <rect :x="VIEW_W - 80" :y="BODY_Y" width="10" :height="BODY_H" />
        </g>

        <ellipse :cx="BLOW_X" :cy="holeCy" rx="15" ry="11" fill="#2a1a0a" />
        <ellipse :cx="MEMBRANE_X" :cy="holeCy" rx="11" ry="9" fill="#f6f0e0" stroke="#8a6230" />

        <g
          v-for="(state, i) in holeStates"
          :key="i"
          class="piccolo-panel__hole"
          @pointerdown="onPointerDown($event, i)"
          @pointerup="onPointerUp(i)"
          @pointercancel="onPointerUp(i)"
        >
          <circle :cx="holeXs[i]" :cy="holeCy" :r="HOLE_R + 8" fill="transparent" />
          <circle :cx="holeXs[i]" :cy="holeCy" :r="HOLE_R" fill="#2a1a0a" />
          <circle
            v-if="state === 'c'"
            :cx="holeXs[i]"
            :cy="holeCy"
            :r="HOLE_R + 3"
            class="piccolo-panel__finger"
          />
          <path
            v-else-if="state === 'h'"
            :d="`M ${holeXs[i]! - HOLE_R - 3} ${holeCy} A ${HOLE_R + 3} ${HOLE_R + 3} 0 0 1 ${holeXs[i]! + HOLE_R + 3} ${holeCy} Z`"
            class="piccolo-panel__finger"
          />
        </g>
      </g>

      <g v-for="(_, i) in holeStates" :key="`label-${i}`" class="piccolo-panel__labels">
        <text
          :x="labelX(holeXs[i])"
          :y="BODY_Y + BODY_H + 22"
          text-anchor="middle"
          class="piccolo-panel__key"
        >
          {{ fullKeys[i]?.toUpperCase() }} / {{ halfKeys[i]?.toUpperCase() }}
        </text>
        <text
          :x="labelX(holeXs[i])"
          :y="BODY_Y - 10"
          text-anchor="middle"
          class="piccolo-panel__index"
        >
          {{ holeStates.length - i }}
        </text>
      </g>
    </svg>
  </div>
</template>

<style scoped>
.piccolo-panel {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  user-select: none;
  touch-action: none;
}

.piccolo-panel__svg {
  width: 100%;
  max-height: 100%;
  display: block;
}

.piccolo-panel__hole {
  cursor: pointer;
}

.piccolo-panel__labels {
  pointer-events: none;
}

.piccolo-panel__finger {
  fill: #f2a7a0;
  stroke: #c86a60;
  stroke-width: 1.5;
}

.piccolo-panel__key {
  font-size: 14px;
  font-weight: 700;
  fill: #5c4a6a;
}

.piccolo-panel__index {
  font-size: 11px;
  font-weight: 600;
  fill: #8a7a68;
}
</style>
