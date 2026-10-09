<script lang="ts" setup>
defineProps<{
  label: string
  /** 控件较宽（多列按钮组、滑条）时标签放上方 */
  stacked?: boolean
}>()
</script>

<template>
  <div class="panel-field" :class="{ 'panel-field--stacked': stacked }">
    <span class="panel-field__label">{{ label }}</span>
    <div class="panel-field__control">
      <slot />
    </div>
  </div>
</template>

<style scoped>
.panel-field {
  display: grid;
  grid-template-columns: 64px minmax(0, 1fr);
  align-items: center;
  gap: 8px;
}

.panel-field--stacked {
  grid-template-columns: minmax(0, 1fr);
  gap: 6px;
}

.panel-field__label {
  font-size: 12px;
  font-weight: 600;
  color: #606266;
  line-height: 1.3;
}

.panel-field__control {
  min-width: 0;
}

.panel-field__control :deep(.el-select),
.panel-field__control :deep(.el-input-number) {
  width: 100%;
}
</style>
