<script lang="ts" setup>
import {
  DEFAULT_SLUR_THICKNESS,
  SLUR_THICKNESS_MAX,
  SLUR_THICKNESS_MIN,
} from '../renderEditSlurProperties'
import { useI18n } from 'vue-i18n'

defineProps<{
  modelValue: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const { t } = useI18n()
</script>

<template>
  <div class="slur-thickness">
    <div class="slur-thickness__label">{{ t('editor.slur.thickness') }}</div>
    <el-input-number
      :model-value="modelValue"
      :min="SLUR_THICKNESS_MIN"
      :max="SLUR_THICKNESS_MAX"
      :step="1"
      size="small"
      controls-position="right"
      @update:model-value="emit('update:modelValue', $event ?? DEFAULT_SLUR_THICKNESS)"
    />
  </div>
</template>

<style scoped>
.slur-thickness {
  margin-bottom: 8px;
}

.slur-thickness__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.slur-thickness :deep(.el-input-number) {
  width: 100%;
}
</style>
