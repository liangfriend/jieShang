<script lang="ts" setup generic="T extends string | number">
import { computed } from 'vue'
import type { PanelSegmentedOption } from './types'

const props = withDefaults(
  defineProps<{
    modelValue: T | null | undefined
    options: PanelSegmentedOption<T>[]
    /** 每行列数；缺省按选项数，最多 4 列 */
    columns?: number
  }>(),
  {
    columns: undefined
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: T]
}>()

const cols = computed(() => props.columns ?? Math.min(Math.max(props.options.length, 1), 4))
</script>

<template>
  <div
    class="panel-seg"
    role="radiogroup"
    :style="{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }"
  >
    <button
      v-for="opt in options"
      :key="String(opt.value)"
      type="button"
      role="radio"
      class="panel-seg__item"
      :class="{ 'is-active': opt.value === modelValue }"
      :aria-checked="opt.value === modelValue"
      :disabled="opt.disabled"
      :title="opt.title ?? opt.label"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.panel-seg {
  display: grid;
  gap: 4px;
}

.panel-seg__item {
  min-width: 0;
  height: 26px;
  padding: 0 4px;
  overflow: hidden;
  font-size: 12px;
  line-height: 24px;
  white-space: nowrap;
  text-overflow: ellipsis;
  color: #606266;
  cursor: pointer;
  background: #fff;
  border: 1px solid #dcdfe6;
  border-radius: 6px;
  transition:
    color 0.15s,
    background-color 0.15s,
    border-color 0.15s;
}

.panel-seg__item:hover:not(:disabled, .is-active) {
  color: var(--el-color-primary);
  border-color: var(--el-color-primary-light-5);
}

.panel-seg__item.is-active {
  color: #fff;
  background: var(--el-color-primary);
  border-color: var(--el-color-primary);
}

.panel-seg__item:disabled {
  color: #c0c4cc;
  cursor: not-allowed;
  background: #f5f7fa;
}
</style>
