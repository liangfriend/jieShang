<script lang="ts" setup>
import { computed, ref } from 'vue'
import { getNoteSliceSlotRect } from '@renderer/views/noteSlice/noteSliceGridLayout'
import { NOTE_SLICE_FREEZE_EFFECT_MS } from '@renderer/views/noteSlice/noteSliceGameConstants'

const props = defineProps<{
  slotIndex: number
}>()

const active = ref(false)
const playToken = ref(0)

const rect = computed(() => getNoteSliceSlotRect(props.slotIndex))
const centerX = computed(() => rect.value.x + rect.value.width / 2)
const centerY = computed(() => rect.value.y + rect.value.height / 2)
const burstRadius = computed(() => Math.min(rect.value.width, rect.value.height) * 0.36)

const freezeEffectDuration = `${NOTE_SLICE_FREEZE_EFFECT_MS}ms`

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
    class="note-slice-slot-freeze-effect"
    :data-generation="playToken"
    :transform="`translate(${centerX}, ${centerY})`"
    @animationend="onEffectEnd"
  >
    <circle class="note-slice-slot-freeze-effect__pulse" :r="burstRadius * 0.32" />
    <circle class="note-slice-slot-freeze-effect__ring note-slice-slot-freeze-effect__ring--inner" r="10" />
    <circle class="note-slice-slot-freeze-effect__ring note-slice-slot-freeze-effect__ring--outer" r="14" />
    <polygon
      class="note-slice-slot-freeze-effect__crystal"
      :points="`0,${-burstRadius * 0.45} ${burstRadius * 0.22},0 0,${burstRadius * 0.45} ${-burstRadius * 0.22},0`"
    />
    <line
      v-for="rayIndex in 6"
      :key="rayIndex"
      class="note-slice-slot-freeze-effect__ray"
      :transform="`rotate(${(360 / 6) * (rayIndex - 1)})`"
      :x1="0"
      :y1="0"
      :x2="burstRadius * 0.55"
      :y2="0"
    />
  </g>
</template>

<style scoped>
.note-slice-slot-freeze-effect {
  pointer-events: none;
  animation: note-slice-freeze-pop v-bind(freezeEffectDuration) ease-out forwards;
}

.note-slice-slot-freeze-effect__pulse {
  fill: rgba(160, 230, 255, 0.75);
  animation: note-slice-freeze-pulse v-bind(freezeEffectDuration) ease-out forwards;
}

.note-slice-slot-freeze-effect__ring {
  fill: none;
  stroke-width: 7;
  animation: note-slice-freeze-ring v-bind(freezeEffectDuration) ease-out forwards;
}

.note-slice-slot-freeze-effect__ring--inner {
  stroke: rgba(120, 210, 255, 0.95);
}

.note-slice-slot-freeze-effect__ring--outer {
  stroke: rgba(220, 245, 255, 0.8);
  animation-delay: 40ms;
}

.note-slice-slot-freeze-effect__crystal {
  fill: rgba(210, 245, 255, 0.9);
  stroke: rgba(255, 255, 255, 0.95);
  stroke-width: 3;
  animation: note-slice-freeze-crystal v-bind(freezeEffectDuration) ease-out forwards;
}

.note-slice-slot-freeze-effect__ray {
  stroke: rgba(200, 240, 255, 0.9);
  stroke-width: 5;
  stroke-linecap: round;
  animation: note-slice-freeze-ray v-bind(freezeEffectDuration) ease-out forwards;
}

@keyframes note-slice-freeze-pop {
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

@keyframes note-slice-freeze-pulse {
  0% {
    r: 8;
    opacity: 0.9;
  }
  40% {
    r: 42;
    opacity: 0.5;
  }
  100% {
    r: 72;
    opacity: 0;
  }
}

@keyframes note-slice-freeze-ring {
  0% {
    r: 10;
    opacity: 0.95;
  }
  100% {
    r: 84;
    opacity: 0;
  }
}

@keyframes note-slice-freeze-crystal {
  0% {
    opacity: 0;
    transform: scale(0.6);
  }
  20% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(1.2);
  }
}

@keyframes note-slice-freeze-ray {
  0% {
    opacity: 0;
  }
  18% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
}
</style>
