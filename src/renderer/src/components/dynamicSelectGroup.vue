<script lang="ts" setup>
import { computed, ref, watch } from 'vue'

interface Option {
  [key: string]: any
}

function deepGet(obj: any, path: string): any {
  if (obj == null || !path) return undefined
  return path.split('.').reduce((current, key) => {
    return current == null ? undefined : current[key]
  }, obj)
}

const props = withDefaults(
  defineProps<{
    modelValue: (string | number)[]
    options: Option[]
    labelField?: string
    valueField?: string
    allowAdd?: boolean
    allowRemove?: boolean
    min?: number
    max?: number
    placeholder?: string
    selectWidth?: string
    defaultNewValue?: string | number | null | undefined
  }>(),
  {
    labelField: 'label',
    valueField: 'value',
    allowAdd: true,
    allowRemove: true,
    min: 1,
    max: Infinity,
    placeholder: '请选择',
    selectWidth: '16rem',
    // 默认为 null，可被覆盖
    defaultNewValue: null
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: (string | number | null)[]): void
  (
    e: 'change',
    value: (string | number | null)[],
    index: number,
    action: 'add' | 'remove' | 'select'
  ): void
}>()

const getOptionLabel = (item: Option) => deepGet(item, props.labelField)
const getOptionValue = (item: Option) => deepGet(item, props.valueField)

const itemsLength = computed(() => props.modelValue.length)

// ✅ 使用 shallowRef + 数组替换策略
const internalValues = ref<(string | number)[]>([])

// 外部 modelValue 变化 → 同步 internalValues
watch(
  () => props.modelValue,
  (newVal) => {
    if (Array.isArray(newVal)) {
      internalValues.value = [...newVal] // 完全替换
    }
  },
  { immediate: true }
)

// 内部变化同步回父组件（必须通过 emit）
const updateInternalValue = (index: number, value: string | number) => {
  const newValue = [...props.modelValue] // 基于最新的 props 更新
  if (index < newValue.length) {
    newValue[index] = value
    emit('update:modelValue', newValue) // 触发父级更新
    emit('change', newValue, index, 'select')
  }
}

const addItem = () => {
  if (itemsLength.value >= props.max) return
  const newValue = [...props.modelValue, props.defaultNewValue]
  emit('update:modelValue', newValue)
  emit('change', newValue, itemsLength.value, 'add')
}

const removeItem = (index: number) => {
  if (itemsLength.value <= props.min) return
  const newValue = props.modelValue.filter((_, i) => i !== index)
  emit('update:modelValue', newValue)
  emit('change', newValue, index, 'remove')
}
</script>

<template>
  <div class="dynamic-select-group">
    <div v-for="(selectedValue, index) in modelValue" :key="index" class="select-item">
      <el-select
        :model-value="selectedValue"
        :placeholder="placeholder"
        :style="{ width: selectWidth }"
        @update:model-value="updateInternalValue(index, $event)"
      >
        <el-option :value="defaultNewValue" label="无"></el-option>
        <el-option
          v-for="item in options"
          :key="getOptionValue(item)"
          :label="getOptionLabel(item)"
          :value="getOptionValue(item)"
        />
      </el-select>

      <el-button
        v-if="allowRemove && itemsLength > min"
        plain
        size="small"
        style="margin-left: 8px"
        type="danger"
        @click="removeItem(index)"
      >
        删除
      </el-button>
    </div>

    <el-button
      v-if="allowAdd && itemsLength < max"
      plain
      size="small"
      style="margin-top: 8px"
      type="primary"
      @click="addItem"
    >
      添加选项
    </el-button>
  </div>
</template>
