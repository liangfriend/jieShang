<script setup lang="ts">
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'StructureEditSwitch' })

const { t } = useI18n()

withDefaults(
  defineProps<{
    disabled?: boolean
    /** 不传时为「结构按钮」 */
    label?: string
  }>(),
  {
    disabled: false,
    label: undefined
  }
)

/** 编辑区显隐开关（结构按钮、歌词区等）；默认开启 */
const enabled = defineModel<boolean>({ default: true })
</script>

<template>
  <label class="structure-edit" :class="{ 'structure-edit--disabled': disabled }">
    <span class="structure-edit__label">{{ label ?? t('editor.toolbar.structureEdit') }}</span>
    <el-switch v-model="enabled" :disabled="disabled" size="small" />
  </label>
</template>

<style scoped>
.structure-edit {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 4px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  user-select: none;
}

.structure-edit--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.structure-edit__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.structure-edit :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #ff8fb8;
  border-color: #ff8fb8;
}
</style>
