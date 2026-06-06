<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'

const props = withDefaults(
  defineProps<{
    modelValue: number
    min: number
    max: number
    step?: number
    label?: string
    format?: (value: number) => string
  }>(),
  {
    step: 1,
    label: '',
    format: (value: number) => String(Math.round(value * 100) / 100)
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const trackRef = ref<HTMLElement | null>(null)
const dragging = ref(false)

const percent = computed(() => {
  if (props.max === props.min) return 0
  return ((props.modelValue - props.min) / (props.max - props.min)) * 100
})

function clampValue(raw: number) {
  const step = props.step > 0 ? props.step : 1
  const snapped = Math.round(raw / step) * step
  const precision = step < 1 ? String(step).split('.')[1]?.length ?? 2 : 0
  const clamped = Math.min(props.max, Math.max(props.min, snapped))
  return precision > 0 ? Number(clamped.toFixed(precision)) : clamped
}

function valueFromClientY(clientY: number) {
  const track = trackRef.value
  if (!track) return props.modelValue
  const rect = track.getBoundingClientRect()
  const ratio = 1 - (clientY - rect.top) / rect.height
  return clampValue(props.min + ratio * (props.max - props.min))
}

function updateFromPointer(event: PointerEvent) {
  emit('update:modelValue', valueFromClientY(event.clientY))
}

function onTrackPointerDown(event: PointerEvent) {
  dragging.value = true
  trackRef.value?.setPointerCapture(event.pointerId)
  updateFromPointer(event)
}

function onTrackPointerMove(event: PointerEvent) {
  if (!dragging.value) return
  updateFromPointer(event)
}

function endDrag(event: PointerEvent) {
  if (!dragging.value) return
  dragging.value = false
  trackRef.value?.releasePointerCapture(event.pointerId)
}

onBeforeUnmount(() => {
  dragging.value = false
})
</script>

<template>
  <div class="vertical-drag-slider">
    <div v-if="label" class="vertical-drag-slider__label">{{ label }}</div>
    <div class="vertical-drag-slider__value">{{ format(modelValue) }}</div>
    <div
      ref="trackRef"
      class="vertical-drag-slider__track"
      @pointerdown.prevent="onTrackPointerDown"
      @pointermove="onTrackPointerMove"
      @pointerup="endDrag"
      @pointercancel="endDrag"
    >
      <div class="vertical-drag-slider__fill" :style="{ height: `${percent}%` }" />
      <div class="vertical-drag-slider__thumb" :style="{ bottom: `calc(${percent}% - 6px)` }" />
    </div>
  </div>
</template>

<style scoped>
.vertical-drag-slider {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  user-select: none;
}

.vertical-drag-slider__label {
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
}

.vertical-drag-slider__value {
  min-width: 0px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.25);
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
  text-align: center;
}

.vertical-drag-slider__track {
  position: relative;
  width: 10px;
  height: 128px;
  border-radius: 999px;
  background: rgba(201, 184, 255, 0.2);
  border: 1px solid rgba(201, 184, 255, 0.45);
  cursor: ns-resize;
  touch-action: none;
}

.vertical-drag-slider__fill {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  background: linear-gradient(180deg, rgba(255, 184, 208, 0.85), rgba(201, 184, 255, 0.85));
  pointer-events: none;
}

.vertical-drag-slider__thumb {
  position: absolute;
  left: 50%;
  width: 18px;
  height: 18px;
  margin-left: -9px;
  border-radius: 50%;
  border: 2px solid #fff;
  background: #9b7fd6;
  box-shadow: 0 2px 8px rgba(91, 74, 106, 0.25);
  pointer-events: none;
}
</style>
