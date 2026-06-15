<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getNoteSliceSlotRect } from '@renderer/views/noteSlice/noteSliceGridLayout'
import { NOTE_SLICE_HEAL_EFFECT_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  slotIndex: number
}>()

const active = ref(false)
const playToken = ref(0)

const rect = computed(() => getNoteSliceSlotRect(props.slotIndex))
const centerX = computed(() => rect.value.x + rect.value.width / 2)
const centerY = computed(() => rect.value.y + rect.value.height / 2)
const burstRadius = computed(() => Math.min(rect.value.width, rect.value.height) * 0.34)

const healEffectDuration = `${NOTE_SLICE_HEAL_EFFECT_MS}ms`

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
    class="note-slice-slot-heal-effect"
    :data-generation="playToken"
    :transform="`translate(${centerX}, ${centerY})`"
    @animationend="onEffectEnd"
  >
    <circle class="note-slice-slot-heal-effect__pulse" :r="burstRadius * 0.3" />
    <circle class="note-slice-slot-heal-effect__ring note-slice-slot-heal-effect__ring--inner" r="10" />
    <circle class="note-slice-slot-heal-effect__ring note-slice-slot-heal-effect__ring--outer" r="14" />
    <path
      class="note-slice-slot-heal-effect__cross note-slice-slot-heal-effect__cross--vertical"
      :d="`M0 ${-burstRadius * 0.42} L0 ${burstRadius * 0.42}`"
    />
    <path
      class="note-slice-slot-heal-effect__cross note-slice-slot-heal-effect__cross--horizontal"
      :d="`M${-burstRadius * 0.42} 0 L${burstRadius * 0.42} 0`"
    />
    <circle
      v-for="sparkIndex in 6"
      :key="sparkIndex"
      class="note-slice-slot-heal-effect__spark"
      :transform="`rotate(${(360 / 6) * (sparkIndex - 1)}) translate(${burstRadius * 0.55}, 0)`"
      r="5"
    />
  </g>
</template>

<style scoped>
.note-slice-slot-heal-effect {
  pointer-events: none;
  animation: note-slice-heal-pop v-bind(healEffectDuration) ease-out forwards;
}

.note-slice-slot-heal-effect__pulse {
  fill: rgba(120, 255, 170, 0.8);
  animation: note-slice-heal-pulse v-bind(healEffectDuration) ease-out forwards;
}

.note-slice-slot-heal-effect__ring {
  fill: none;
  stroke-width: 7;
  animation: note-slice-heal-ring v-bind(healEffectDuration) ease-out forwards;
}

.note-slice-slot-heal-effect__ring--inner {
  stroke: rgba(96, 240, 150, 0.95);
}

.note-slice-slot-heal-effect__ring--outer {
  stroke: rgba(180, 255, 210, 0.75);
  animation-delay: 40ms;
}

.note-slice-slot-heal-effect__cross {
  fill: none;
  stroke: rgba(220, 255, 235, 0.95);
  stroke-width: 8;
  stroke-linecap: round;
  animation: note-slice-heal-cross v-bind(healEffectDuration) ease-out forwards;
}

.note-slice-slot-heal-effect__cross--horizontal {
  animation-delay: 30ms;
}

.note-slice-slot-heal-effect__spark {
  fill: rgba(170, 255, 200, 0.95);
  animation: note-slice-heal-spark v-bind(healEffectDuration) ease-out forwards;
}

@keyframes note-slice-heal-pop {
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

@keyframes note-slice-heal-pulse {
  0% {
    r: 8;
    opacity: 0.9;
  }
  40% {
    r: 44;
    opacity: 0.5;
  }
  100% {
    r: 72;
    opacity: 0;
  }
}

@keyframes note-slice-heal-ring {
  0% {
    r: 10;
    opacity: 0.95;
  }
  100% {
    r: 84;
    opacity: 0;
  }
}

@keyframes note-slice-heal-cross {
  0% {
    opacity: 0;
    stroke-width: 4;
  }
  20% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    stroke-width: 10;
  }
}

@keyframes note-slice-heal-spark {
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
