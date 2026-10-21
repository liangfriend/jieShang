<script lang="ts" setup>
import {computed} from 'vue'
import type {HorizontalHandleKind} from '../renderEditHorizontalDrag'
import type {SlurHandleKind, SlurHandlePoints} from '../renderEditSlurDrag'
import HorizontalDragHandles from './HorizontalDragHandles.vue'

const props = withDefaults(
  defineProps<{
    handles: SlurHandlePoints
    /** 五线谱月牙有控制点；简谱两端弧+横线不展示控制点 */
    showControl?: boolean
    /** 简谱：同踏板拖拽框，左右端控 x，中间点上下平移（control） */
    verticalControl?: boolean
  }>(),
  {showControl: true, verticalControl: false},
)

const emit = defineEmits<{
  'handle-down': [handle: SlurHandleKind, event: PointerEvent]
}>()

const HANDLE_SIZE = 8
const HANDLE_RADIUS = 4
const END_SIZE = 8
const MIDDLE_W = 10
const MIDDLE_H = 14

const horizontalHandles = computed(() => ({
  start: props.handles.start,
  end: props.handles.end,
  middle: props.handles.control,
}))

/** 简谱分裂连音线：前后两段各一个上下把手 */
const splitMiddles = computed(() => {
  const {controlStart, controlEnd} = props.handles
  if (!props.verticalControl || !controlStart || !controlEnd) return null
  return [
    {kind: 'controlStart' as const, point: controlStart},
    {kind: 'controlEnd' as const, point: controlEnd},
  ]
})

function onHandleDown(handle: SlurHandleKind, event: PointerEvent) {
  event.stopPropagation()
  emit('handle-down', handle, event)
}

function onHorizontalHandleDown(handle: HorizontalHandleKind, event: PointerEvent) {
  emit('handle-down', handle === 'middle' ? 'control' : handle, event)
}
</script>

<template>
  <g v-if="splitMiddles" class="slur-drag-handles">
    <rect
      class="slur-drag-handles__end"
      :height="END_SIZE"
      :width="END_SIZE"
      :x="handles.start.x - END_SIZE / 2"
      :y="handles.start.y - END_SIZE / 2"
      @pointerdown="onHandleDown('start', $event)"
    />
    <g
      v-for="m in splitMiddles"
      :key="m.kind"
      class="slur-drag-handles__middle"
      :transform="`translate(${m.point.x}, ${m.point.y})`"
      @pointerdown="onHandleDown(m.kind, $event)"
    >
      <rect
        class="slur-drag-handles__middle-box"
        :height="MIDDLE_H"
        :width="MIDDLE_W"
        :x="-MIDDLE_W / 2"
        :y="-MIDDLE_H / 2"
      />
      <polygon class="slur-drag-handles__arrow" points="0,-8 -3.5,-3 3.5,-3"/>
      <polygon class="slur-drag-handles__arrow" points="0,8 -3.5,3 3.5,3"/>
    </g>
    <rect
      class="slur-drag-handles__end"
      :height="END_SIZE"
      :width="END_SIZE"
      :x="handles.end.x - END_SIZE / 2"
      :y="handles.end.y - END_SIZE / 2"
      @pointerdown="onHandleDown('end', $event)"
    />
  </g>
  <HorizontalDragHandles
    v-else-if="verticalControl"
    :handles="horizontalHandles"
    @handle-down="onHorizontalHandleDown"
  />
  <g v-else class="slur-drag-handles">
    <rect
      class="slur-drag-handles__square"
      :height="HANDLE_SIZE"
      :width="HANDLE_SIZE"
      :x="handles.start.x - HANDLE_SIZE / 2"
      :y="handles.start.y - HANDLE_SIZE / 2"
      @pointerdown="onHandleDown('start', $event)"
    />
    <circle
      v-if="showControl"
      class="slur-drag-handles__circle"
      :cx="handles.control.x"
      :cy="handles.control.y"
      :r="HANDLE_RADIUS"
      @pointerdown="onHandleDown('control', $event)"
    />
    <rect
      class="slur-drag-handles__square"
      :height="HANDLE_SIZE"
      :width="HANDLE_SIZE"
      :x="handles.end.x - HANDLE_SIZE / 2"
      :y="handles.end.y - HANDLE_SIZE / 2"
      @pointerdown="onHandleDown('end', $event)"
    />
  </g>
</template>

<style scoped>
.slur-drag-handles__square {
  fill: #fff;
  stroke: var(--ec-pink-strong, #f0709f);
  stroke-width: 1.5;
  cursor: move;
}

.slur-drag-handles__circle {
  fill: #fff;
  stroke: #e6a23c;
  stroke-width: 1.5;
  cursor: move;
}

.slur-drag-handles__end {
  fill: #fff;
  stroke: var(--ec-pink-strong, #f0709f);
  stroke-width: 1.5;
  cursor: ew-resize;
}

.slur-drag-handles__middle {
  cursor: ns-resize;
}

.slur-drag-handles__middle-box {
  fill: #fff;
  stroke: #67c23a;
  stroke-width: 1.5;
}

.slur-drag-handles__arrow {
  fill: #67c23a;
  stroke: #529b2e;
  stroke-width: 0.5;
}
</style>
