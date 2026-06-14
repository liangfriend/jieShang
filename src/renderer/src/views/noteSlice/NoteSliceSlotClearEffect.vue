<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getNoteSliceSlotRect } from '@renderer/views/noteSlice/noteSliceGridLayout'
import { NOTE_SLICE_CLEAR_EFFECT_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  slotIndex: number
}>()

const active = ref(false)
const playToken = ref(0)

const rect = computed(() => getNoteSliceSlotRect(props.slotIndex))
const centerX = computed(() => rect.value.x + rect.value.width / 2)
const centerY = computed(() => rect.value.y + rect.value.height / 2)
const slashHalf = computed(() => Math.min(rect.value.width, rect.value.height) * 0.34)

/** 供 scoped CSS v-bind 使用的动画时长 */
const clearEffectDuration = `${NOTE_SLICE_CLEAR_EFFECT_MS}ms`

/** 触发一次清除特效；动画未结束时再次调用会从头播放 */
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
    class="note-slice-slot-clear-effect"
    :data-generation="playToken"
    :transform="`translate(${centerX}, ${centerY})`"
    @animationend="onEffectEnd"
  >
    <circle class="note-slice-slot-clear-effect__ring" r="8" />
    <line
      class="note-slice-slot-clear-effect__slash"
      :x1="-slashHalf"
      :y1="-slashHalf"
      :x2="slashHalf"
      :y2="slashHalf"
    />
    <line
      class="note-slice-slot-clear-effect__slash note-slice-slot-clear-effect__slash--reverse"
      :x1="slashHalf"
      :y1="-slashHalf"
      :x2="-slashHalf"
      :y2="slashHalf"
    />
  </g>
</template>

<style scoped>
.note-slice-slot-clear-effect {
  pointer-events: none;
  animation: note-slice-clear-pop v-bind(clearEffectDuration) ease-out forwards;
}

.note-slice-slot-clear-effect__ring {
  fill: none;
  stroke: rgba(255, 220, 120, 0.95);
  stroke-width: 6;
  animation: note-slice-clear-ring v-bind(clearEffectDuration) ease-out forwards;
}

.note-slice-slot-clear-effect__slash {
  stroke: #fff;
  stroke-width: 7;
  stroke-linecap: round;
  animation: note-slice-clear-slash v-bind(clearEffectDuration) ease-out forwards;
}

.note-slice-slot-clear-effect__slash--reverse {
  animation-delay: 30ms;
}

@keyframes note-slice-clear-pop {
  0% {
    opacity: 0;
  }
  12% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes note-slice-clear-ring {
  0% {
    r: 8;
    opacity: 0.95;
  }
  100% {
    r: 72;
    opacity: 0;
  }
}

@keyframes note-slice-clear-slash {
  0% {
    stroke-width: 4;
    opacity: 0;
  }
  20% {
    opacity: 1;
  }
  100% {
    stroke-width: 10;
    opacity: 0;
  }
}
</style>
