<script lang="ts" setup>
import type { VDom } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { deleteGrandStaffFromSlot } from '../renderEditSlotActions'
import {
  DELETE_GRAND_STAFF_BTN_H,
  DELETE_GRAND_STAFF_BTN_W,
  deleteGrandStaffBtnX,
  deleteGrandStaffBtnY
} from '../renderEditSlotLayout'

const props = defineProps<{ node: VDom }>()

const { t } = useI18n()

const transform = computed(
  () => `translate(${deleteGrandStaffBtnX(props.node)}, ${deleteGrandStaffBtnY(props.node)})`
)

const canDelete = computed(() => (props.node.slotData?.musicScore.grandStaffs.length ?? 0) > 1)

function onClick() {
  if (!canDelete.value) return
  const slot = props.node.slotData
  if (slot) deleteGrandStaffFromSlot(slot)
}
</script>

<template>
  <g
    :class="['delete-grand-staff-btn', { 'delete-grand-staff-btn--disabled': !canDelete }]"
    :transform="transform"
    @click.stop="onClick"
    @pointerdown.stop
    @pointerup.stop
  >
    <rect
      :height="DELETE_GRAND_STAFF_BTN_H"
      :width="DELETE_GRAND_STAFF_BTN_W"
      fill="#FFBDBD"
      rx="10"
      ry="10"
      stroke="#F56C6C"
      stroke-width="1.2"
    />
    <circle cx="11" cy="10" fill="#fff" opacity="0.92" r="6.5" />
    <line
      stroke="#F56C6C"
      stroke-linecap="round"
      stroke-width="1.6"
      x1="8"
      x2="14"
      y1="10"
      y2="10"
    />
    <text
      dominant-baseline="middle"
      fill="#8B3333"
      font-size="11"
      font-weight="500"
      text-anchor="middle"
      x="44"
      y="10.5"
      >{{ t('editor.staff.grandStaff') }}
    </text>
  </g>
</template>

<style scoped>
.delete-grand-staff-btn {
  cursor: pointer;
  transition: filter 0.15s ease;
}

.delete-grand-staff-btn:hover {
  filter: brightness(1.06) drop-shadow(0 2px 5px rgba(245, 108, 108, 0.45));
}

.delete-grand-staff-btn--disabled {
  cursor: not-allowed;
  opacity: 0.45;
}

.delete-grand-staff-btn--disabled:hover {
  filter: none;
}
</style>
