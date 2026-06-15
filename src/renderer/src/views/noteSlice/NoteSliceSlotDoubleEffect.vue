<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getNoteSliceSlotRect } from '@renderer/views/noteSlice/noteSliceGridLayout'
import { NOTE_SLICE_DOUBLE_EFFECT_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  slotIndex: number
}>()

const active = ref(false)
const playToken = ref(0)

const rect = computed(() => getNoteSliceSlotRect(props.slotIndex))
const centerX = computed(() => rect.value.x + rect.value.width / 2)
const centerY = computed(() => rect.value.y + rect.value.height / 2)
const burstRadius = computed(() => Math.min(rect.value.width, rect.value.height) * 0.36)

const doubleEffectDuration = `${NOTE_SLICE_DOUBLE_EFFECT_MS}ms`

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
    class="note-slice-slot-double-effect"
    :data-generation="playToken"
    :transform="`translate(${centerX}, ${centerY})`"
    @animationend="onEffectEnd"
  >
    <circle class="note-slice-slot-double-effect__pulse" :r="burstRadius * 0.3" />
    <circle class="note-slice-slot-double-effect__ring note-slice-slot-double-effect__ring--inner" r="10" />
    <circle class="note-slice-slot-double-effect__ring note-slice-slot-double-effect__ring--outer" r="14" />
    <text class="note-slice-slot-double-effect__label" text-anchor="middle" dominant-baseline="middle">
      ×2
    </text>
    <circle
      v-for="sparkIndex in 8"
      :key="sparkIndex"
      class="note-slice-slot-double-effect__spark"
      :transform="`rotate(${(360 / 8) * (sparkIndex - 1)}) translate(${burstRadius * 0.58}, 0)`"
      r="5"
    />
  </g>
</template>

<style scoped>
.note-slice-slot-double-effect {
  pointer-events: none;
  animation: note-slice-double-pop v-bind(doubleEffectDuration) ease-out forwards;
}

.note-slice-slot-double-effect__pulse {
  fill: rgba(255, 210, 80, 0.8);
  animation: note-slice-double-pulse v-bind(doubleEffectDuration) ease-out forwards;
}

.note-slice-slot-double-effect__ring {
  fill: none;
  stroke-width: 7;
  animation: note-slice-double-ring v-bind(doubleEffectDuration) ease-out forwards;
}

.note-slice-slot-double-effect__ring--inner {
  stroke: rgba(255, 190, 60, 0.95);
}

.note-slice-slot-double-effect__ring--outer {
  stroke: rgba(255, 235, 150, 0.8);
  animation-delay: 40ms;
}

.note-slice-slot-double-effect__label {
  font-size: 42px;
  font-weight: 800;
  fill: #fff8dc;
  stroke: rgba(255, 170, 40, 0.9);
  stroke-width: 2;
  paint-order: stroke fill;
  animation: note-slice-double-label v-bind(doubleEffectDuration) ease-out forwards;
}

.note-slice-slot-double-effect__spark {
  fill: rgba(255, 230, 120, 0.95);
  animation: note-slice-double-spark v-bind(doubleEffectDuration) ease-out forwards;
}

@keyframes note-slice-double-pop {
  0% {
    opacity: 0;
  }
  10% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}

@keyframes note-slice-double-pulse {
  0% {
    r: 8;
    opacity: 0.9;
  }
  40% {
    r: 44;
    opacity: 0.55;
  }
  100% {
    r: 76;
    opacity: 0;
  }
}

@keyframes note-slice-double-ring {
  0% {
    r: 10;
    opacity: 0.95;
  }
  100% {
    r: 86;
    opacity: 0;
  }
}

@keyframes note-slice-double-label {
  0% {
    opacity: 0;
    font-size: 24px;
  }
  20% {
    opacity: 1;
    font-size: 46px;
  }
  100% {
    opacity: 0;
    font-size: 54px;
  }
}

@keyframes note-slice-double-spark {
  0% {
    opacity: 0;
    r: 3;
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    r: 8;
  }
}
</style>
