<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import {
  SCORE_GD_SLOT_H_MAX,
  SCORE_GD_SLOT_H_MIN,
  SCORE_GD_SLOT_H_STEP,
  scoreGdSlotHeight
} from '@renderer/utils/scoreGdSlotHeight'

defineOptions({ name: 'GdSlotHeightControl' })

const { t } = useI18n()

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)
</script>

<template>
  <label class="gd-slot-height" :class="{ 'gd-slot-height--disabled': disabled }">
    <span class="gd-slot-height__label">{{ t('editor.toolbar.gdSlotHeight') }}</span>
    <el-input-number
      v-model="scoreGdSlotHeight"
      :disabled="disabled"
      :max="SCORE_GD_SLOT_H_MAX"
      :min="SCORE_GD_SLOT_H_MIN"
      :step="SCORE_GD_SLOT_H_STEP"
      controls-position="right"
      size="small"
    />
  </label>
</template>

<style scoped>
.gd-slot-height {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.72);
  user-select: none;
}

.gd-slot-height--disabled {
  opacity: 0.6;
}

.gd-slot-height__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.gd-slot-height :deep(.el-input-number) {
  width: 110px;
}

.gd-slot-height :deep(.el-input-number .el-input__wrapper) {
  padding-left: 8px;
  padding-right: 28px;
}
</style>
