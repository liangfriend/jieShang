<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import type { RhythmPatternMode } from '@renderer/views/editor/editHelper/renderEditRhythmPattern'

defineOptions({ name: 'RhythmPatternModeSwitch' })

const { t } = useI18n()

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const mode = defineModel<RhythmPatternMode>({ required: true })
</script>

<template>
  <div class="rhythm-pattern-mode" :class="{ 'rhythm-pattern-mode--disabled': disabled }">
    <span class="rhythm-pattern-mode__label">{{ t('editor.toolbar.rhythmPatternMode') }}</span>
    <el-radio-group v-model="mode" :disabled="disabled" size="small">
      <el-radio-button value="measure">{{ t('editor.rhythmPattern.modeMeasure') }}</el-radio-button>
      <el-radio-button value="beat">{{ t('editor.rhythmPattern.modeBeat') }}</el-radio-button>
    </el-radio-group>
  </div>
</template>

<style scoped>
.rhythm-pattern-mode {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.72);
  user-select: none;
}

.rhythm-pattern-mode--disabled {
  opacity: 0.6;
}

.rhythm-pattern-mode__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.rhythm-pattern-mode :deep(.el-radio-button__inner) {
  padding: 4px 10px;
}

.rhythm-pattern-mode :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 999px 0 0 999px;
}

.rhythm-pattern-mode :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 999px 999px 0;
}

.rhythm-pattern-mode :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: #ff8fb8;
  border-color: #ff8fb8;
  box-shadow: -1px 0 0 0 #ff8fb8;
}
</style>
