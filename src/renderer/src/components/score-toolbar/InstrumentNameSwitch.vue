<script setup lang="ts">
import type { MusicScore } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  applyShowInstrumentName,
  readShowInstrumentName
} from '@renderer/utils/scoreSpacingDefaults'

defineOptions({ name: 'InstrumentNameSwitch' })

const { t } = useI18n()

withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const score = defineModel<MusicScore>({ required: true })

const showInstrumentName = computed({
  get: () => readShowInstrumentName(score.value),
  set: (enabled: boolean) => applyShowInstrumentName(score.value, enabled)
})
</script>

<template>
  <label class="instrument-name-switch" :class="{ 'instrument-name-switch--disabled': disabled }">
    <span class="instrument-name-switch__label">{{ t('editor.toolbar.showInstrumentName') }}</span>
    <el-switch v-model="showInstrumentName" :disabled="disabled" size="small" />
  </label>
</template>

<style scoped>
.instrument-name-switch {
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

.instrument-name-switch--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.instrument-name-switch__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.instrument-name-switch :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #ff8fb8;
  border-color: #ff8fb8;
}
</style>
