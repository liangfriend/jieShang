<script setup lang="ts">
import type { MusicScore } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SLUR_STYLE_PREFERENCE_VALUES,
  applyScoreSlurStyle,
  readScoreSlurStyle,
  type SlurStylePreference
} from '@renderer/views/editor/editHelper/renderEditSlurProperties'

defineOptions({ name: 'SlurStyleSwitch' })

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

const style = computed({
  get: () => readScoreSlurStyle(score.value),
  set: (value: SlurStylePreference) => applyScoreSlurStyle(score.value, value)
})
</script>

<template>
  <div class="slur-style-switch" :class="{ 'slur-style-switch--disabled': disabled }">
    <span class="slur-style-switch__label">{{ t('editor.toolbar.slurStyle') }}</span>
    <el-radio-group v-model="style" :disabled="disabled" size="small">
      <el-radio-button v-for="value in SLUR_STYLE_PREFERENCE_VALUES" :key="value" :value="value">
        {{ t(`editor.slur.styleValue.${value}`) }}
      </el-radio-button>
    </el-radio-group>
  </div>
</template>

<style scoped>
.slur-style-switch {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 2px 4px 2px 10px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  background: rgba(255, 255, 255, 0.72);
  user-select: none;
}

.slur-style-switch--disabled {
  opacity: 0.6;
}

.slur-style-switch__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.slur-style-switch :deep(.el-radio-button__inner) {
  padding: 4px 10px;
}

.slur-style-switch :deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 999px 0 0 999px;
}

.slur-style-switch :deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 0 999px 999px 0;
}

.slur-style-switch :deep(.el-radio-button.is-active .el-radio-button__inner) {
  background-color: #ff8fb8;
  border-color: #ff8fb8;
  box-shadow: -1px 0 0 0 #ff8fb8;
}
</style>
