<script lang="ts" setup>
import type {VDom} from 'deciphony-renderer'
import {computed} from 'vue'
import {addSingleStaffFromSlot} from '../renderEditSlotActions'
import {
  ADD_SINGLE_STAFF_BTN_H,
  ADD_SINGLE_STAFF_BTN_W,
  addSingleStaffBtnX,
  addSingleStaffBtnY,
} from '../renderEditSlotLayout'

const props = defineProps<{ node: VDom; disabled?: boolean }>()

const transform = computed(
  () => `translate(${addSingleStaffBtnX(props.node)}, ${addSingleStaffBtnY(props.node)})`,
)

function onClick() {
  if (props.disabled) return
  const slot = props.node.slotData
  if (slot) addSingleStaffFromSlot(slot)
}
</script>

<template>
  <g
    :class="['add-single-staff-btn', { 'add-single-staff-btn--disabled': disabled }]"
    :transform="transform"
    @click.stop="onClick"
    @pointerdown.stop
    @pointerup.stop
  >
    <rect
      :height="ADD_SINGLE_STAFF_BTN_H"
      :width="ADD_SINGLE_STAFF_BTN_W"
      fill="#B7D7FF"
      rx="10"
      ry="10"
      stroke="#8FABFF"
      stroke-width="1.2"
    />
    <line stroke="#5B7FD6" stroke-linecap="round" stroke-width="1.6" x1="10" x2="10" y1="5.5" y2="12"/>
    <polyline
      fill="none"
      points="7,10 10,13.5 13,10"
      stroke="#5B7FD6"
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="1.6"
    />
  </g>
</template>

<style scoped>
.add-single-staff-btn {
  cursor: pointer;
  transition: filter 0.15s ease;
}

.add-single-staff-btn:hover {
  filter: brightness(1.06) drop-shadow(0 2px 5px rgba(143, 171, 255, 0.45));
}

.add-single-staff-btn--disabled {
  cursor: not-allowed;
  opacity: 0.45;
  pointer-events: none;
}

.add-single-staff-btn--disabled:hover {
  filter: none;
}
</style>
