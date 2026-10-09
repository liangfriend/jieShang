<script lang="ts" setup>
import type { PanelTab } from './types'

defineProps<{
  modelValue: string
  tabs: PanelTab[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div class="panel-tabs">
    <div class="panel-tabs__nav" role="tablist">
      <button
        v-for="tab in tabs"
        :key="tab.name"
        type="button"
        role="tab"
        class="panel-tabs__tab"
        :class="{ 'is-active': tab.name === modelValue }"
        :aria-selected="tab.name === modelValue"
        @click="emit('update:modelValue', tab.name)"
      >
        {{ tab.label }}
        <span v-if="tab.badge" class="panel-tabs__badge">{{ tab.badge }}</span>
      </button>
    </div>
    <slot :name="modelValue" />
  </div>
</template>

<style scoped>
.panel-tabs__nav {
  display: flex;
  gap: 4px;
  margin-bottom: 10px;
  padding: 3px;
  border-radius: 10px;
  background: rgba(201, 184, 255, 0.22);
}

.panel-tabs__tab {
  flex: 1 1 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 28px;
  font-size: 12px;
  font-weight: 600;
  color: #8a7a9a;
  cursor: pointer;
  background: transparent;
  border: none;
  border-radius: 8px;
  transition:
    color 0.15s,
    background-color 0.15s;
}

.panel-tabs__tab:hover {
  color: #5c4a6a;
}

.panel-tabs__tab.is-active {
  color: #5c4a6a;
  background: #fff;
  box-shadow: 0 1px 3px rgba(92, 74, 106, 0.15);
}

.panel-tabs__badge {
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  font-size: 10px;
  line-height: 16px;
  color: #fff;
  background: #e88fb0;
  border-radius: 8px;
}
</style>
