<script setup lang="ts">
import type { MusicScore } from 'deciphony-renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'LinkedStaffModeSwitch' })

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    disabled?: boolean
  }>(),
  {
    disabled: false
  }
)

const score = defineModel<MusicScore>({ required: true })

const linkedStaffMode = computed({
  get: () =>
    score.value.grandStaffs.length > 0 &&
    score.value.grandStaffs.every((grandStaff) => grandStaff.linkedStaff === true),
  set: (enabled: boolean) => {
    for (const grandStaff of score.value.grandStaffs) {
      if (enabled) grandStaff.linkedStaff = true
      else delete grandStaff.linkedStaff
    }
  }
})
</script>

<template>
  <label class="linked-staff-mode" :class="{ 'linked-staff-mode--disabled': disabled }">
    <span class="linked-staff-mode__label">{{ t('editor.toolbar.linkedStaffMode') }}</span>
    <el-switch v-model="linkedStaffMode" :disabled="disabled" size="small" />
  </label>
</template>

<style scoped>
.linked-staff-mode {
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

.linked-staff-mode--disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.linked-staff-mode__label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  white-space: nowrap;
}

.linked-staff-mode :deep(.el-switch.is-checked .el-switch__core) {
  background-color: #ff8fb8;
  border-color: #ff8fb8;
}
</style>
