<script lang="ts" setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import PanelField from './panel/PanelField.vue'
import PanelGroup from './panel/PanelGroup.vue'

type Point = { x: number; y: number }
type EndpointGroup = { relativeStartPoint?: Point; relativeEndPoint?: Point }
type EndpointKey = 'relativeStartPoint' | 'relativeEndPoint'

/** 附属符号起止点相对偏移的精确输入；读写 symbol.data 中带起止点的那组几何数据 */
const props = defineProps<{
  symbol: { data?: object }
}>()

const { t } = useI18n()

const group = computed<EndpointGroup | null>(() => {
  for (const value of Object.values(props.symbol.data ?? {})) {
    if (value && typeof value === 'object' && ('relativeStartPoint' in value || 'relativeEndPoint' in value)) {
      return value as EndpointGroup
    }
  }
  return null
})

const rows: { key: EndpointKey; label: string }[] = [
  { key: 'relativeStartPoint', label: 'editor.endpointOffset.start' },
  { key: 'relativeEndPoint', label: 'editor.endpointOffset.end' }
]

function read(key: EndpointKey, axis: 'x' | 'y') {
  return Math.round((group.value?.[key]?.[axis] ?? 0) * 10) / 10
}

function write(key: EndpointKey, axis: 'x' | 'y', value: number | undefined) {
  const target = group.value
  if (!target) return
  const prev = target[key] ?? { x: 0, y: 0 }
  target[key] = { ...prev, [axis]: Number.isFinite(value) ? Number(value) : 0 }
}
</script>

<template>
  <PanelGroup v-if="group" :title="t('editor.endpointOffset.title')">
    <PanelField v-for="row in rows" :key="row.key" :label="t(row.label)">
      <div class="endpoint-offset__row">
        <span class="endpoint-offset__axis">X</span>
        <el-input-number
          :model-value="read(row.key, 'x')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => write(row.key, 'x', v)"
        />
        <span class="endpoint-offset__axis">Y</span>
        <el-input-number
          :model-value="read(row.key, 'y')"
          :step="1"
          :precision="1"
          size="small"
          controls-position="right"
          @update:model-value="(v) => write(row.key, 'y', v)"
        />
      </div>
    </PanelField>
  </PanelGroup>
</template>

<style scoped>
.endpoint-offset__row {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto minmax(0, 1fr);
  align-items: center;
  gap: 4px;
}

.endpoint-offset__axis {
  font-size: 11px;
  font-weight: 700;
  color: #a39ab0;
}

.endpoint-offset__row :deep(.el-input-number) {
  width: 100%;
}
</style>
