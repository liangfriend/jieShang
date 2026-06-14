<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getNoteSliceSlotRect } from '@renderer/views/noteSlice/noteSliceGridLayout'
import { NOTE_SLICE_EXPLOSION_EFFECT_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  slotIndex: number
}>()

const active = ref(false)
const playToken = ref(0)

const rect = computed(() => getNoteSliceSlotRect(props.slotIndex))
const centerX = computed(() => rect.value.x + rect.value.width / 2)
const centerY = computed(() => rect.value.y + rect.value.height / 2)
const burstRadius = computed(() => Math.min(rect.value.width, rect.value.height) * 0.38)

/** 供 scoped CSS v-bind 使用的动画时长 */
const explosionEffectDuration = `${NOTE_SLICE_EXPLOSION_EFFECT_MS}ms`

/** 触发一次爆炸特效；动画未结束时再次调用会从头播放 */
function play(): void {
  playToken.value += 1
  active.value = true
}

function onEffectEnd(event: AnimationEvent): void {
  const generation = Number((event.currentTarget as SVGElement).dataset.generation)
  if (generation === playToken.value) {
    active.value = false
  }
}

defineExpose({ play })
</script>

<template>
  <g
    v-if="active"
    :key="playToken"
    class="note-slice-slot-explosion-effect"
    :data-generation="playToken"
    :transform="`translate(${centerX}, ${centerY})`"
    @animationend="onEffectEnd"
  >
    <circle class="note-slice-slot-explosion-effect__flash" :r="burstRadius * 0.35" />
    <circle class="note-slice-slot-explosion-effect__ring note-slice-slot-explosion-effect__ring--inner" r="10" />
    <circle class="note-slice-slot-explosion-effect__ring note-slice-slot-explosion-effect__ring--outer" r="14" />
    <line
      v-for="rayIndex in 8"
      :key="rayIndex"
      class="note-slice-slot-explosion-effect__ray"
      :transform="`rotate(${(360 / 8) * (rayIndex - 1)})`"
      :x1="0"
      :y1="0"
      :x2="burstRadius"
      :y2="0"
    />
  </g>
</template>

<style scoped>
.note-slice-slot-explosion-effect {
  pointer-events: none;
  animation: note-slice-explosion-pop v-bind(explosionEffectDuration) ease-out forwards;
}

.note-slice-slot-explosion-effect__flash {
  fill: rgba(255, 120, 40, 0.85);
  animation: note-slice-explosion-flash v-bind(explosionEffectDuration) ease-out forwards;
}

.note-slice-slot-explosion-effect__ring {
  fill: none;
  stroke-width: 8;
  animation: note-slice-explosion-ring v-bind(explosionEffectDuration) ease-out forwards;
}

.note-slice-slot-explosion-effect__ring--inner {
  stroke: rgba(255, 80, 40, 0.95);
}

.note-slice-slot-explosion-effect__ring--outer {
  stroke: rgba(255, 180, 60, 0.75);
  animation-delay: 40ms;
}

.note-slice-slot-explosion-effect__ray {
  stroke: rgba(255, 220, 120, 0.9);
  stroke-width: 6;
  stroke-linecap: round;
  animation: note-slice-explosion-ray v-bind(explosionEffectDuration) ease-out forwards;
}

@keyframes note-slice-explosion-pop {
  0% {
    opacity: 0;
  }
  8% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes note-slice-explosion-flash {
  0% {
    r: 8;
    opacity: 0.9;
  }
  35% {
    r: 48;
    opacity: 0.55;
  }
  100% {
    r: 80;
    opacity: 0;
  }
}

@keyframes note-slice-explosion-ring {
  0% {
    r: 10;
    opacity: 0.95;
  }
  100% {
    r: 88;
    opacity: 0;
  }
}

@keyframes note-slice-explosion-ray {
  0% {
    opacity: 0;
    stroke-width: 4;
  }
  15% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    stroke-width: 10;
  }
}
</style>
