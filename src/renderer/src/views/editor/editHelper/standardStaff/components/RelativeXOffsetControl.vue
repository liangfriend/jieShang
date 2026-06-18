<script lang="ts" setup>
import {
  RELATIVE_X_OFFSET_MAX,
  RELATIVE_X_OFFSET_MIN,
} from '../renderEditFrameProperties'

defineProps<{
  modelValue: number
  /** 嵌在属性区块内（如谱号、变音符号下方），与上方控件拉开间距 */
  nested?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()
</script>

<template>
  <section class="relative-x-offset" :class="{'relative-x-offset--nested': nested}">
    <div class="relative-x-offset__label">横向偏移</div>
    <el-slider
      class="relative-x-offset__slider"
      :model-value="modelValue"
      :min="RELATIVE_X_OFFSET_MIN"
      :max="RELATIVE_X_OFFSET_MAX"
      :step="1"
      :show-tooltip="true"
      @update:model-value="emit('update:modelValue', $event)"
    />
    <div class="relative-x-offset__axis">
      <span>{{ RELATIVE_X_OFFSET_MIN }}</span>
      <span class="relative-x-offset__center">0</span>
      <span>{{ RELATIVE_X_OFFSET_MAX }}</span>
    </div>
  </section>
</template>

<style scoped>
.relative-x-offset {
  margin-bottom: 14px;
}

.relative-x-offset--nested {
  margin-top: 12px;
  margin-bottom: 0;
}

.relative-x-offset__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.relative-x-offset__slider {
  padding: 0 4px;
}

.relative-x-offset__axis {
  display: flex;
  justify-content: space-between;
  margin-top: 2px;
  font-size: 11px;
  color: #c0c4cc;
}

.relative-x-offset__center {
  color: #909399;
  font-weight: 600;
}
</style>
