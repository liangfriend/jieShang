<script setup lang="ts">
import type { MusicScore, SingleStaff } from '@deciphony/renderer'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  DEFAULT_STAFF_VOLUME,
  MAX_STAFF_VOLUME,
  ensureStaffVolume,
  readStaffVolume,
  sameRowStaves,
  writeStaffVolume
} from './staffRow'

defineOptions({ name: 'StaffVolumeDialog' })

/** 目标单谱表；置 null 关闭弹窗 */
const staff = defineModel<SingleStaff | null>({ required: true })
const props = defineProps<{ musicScore: MusicScore }>()

const { t } = useI18n()
const volume = ref(DEFAULT_STAFF_VOLUME)

const visible = computed({
  get: () => staff.value != null,
  set: (open: boolean) => {
    if (!open) staff.value = null
  }
})

watch(
  staff,
  (target) => {
    if (!target) return
    for (const item of sameRowStaves(props.musicScore, target)) ensureStaffVolume(item)
    volume.value = readStaffVolume(target)
  },
  { immediate: true }
)

function confirm() {
  const target = staff.value
  if (!target) return
  // 输入框清空时 el-input-number 给出 null
  const value = Number.isFinite(volume.value) ? Math.round(volume.value) : DEFAULT_STAFF_VOLUME
  for (const item of sameRowStaves(props.musicScore, target)) writeStaffVolume(item, value)
  staff.value = null
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.staffVolumeDialog.title')"
    width="440px"
    class="staff-volume-dialog cute-dialog"
    append-to-body
    align-center
  >
    <p class="staff-volume-dialog__hint">{{ t('editor.staffVolumeDialog.hint') }}</p>
    <div class="staff-volume-dialog__row">
      <el-slider v-model="volume" :min="0" :max="MAX_STAFF_VOLUME" :step="1" class="staff-volume-dialog__slider" />
      <el-input-number
        v-model="volume"
        :min="0"
        :max="MAX_STAFF_VOLUME"
        :step="5"
        :precision="0"
        size="small"
        controls-position="right"
        class="staff-volume-dialog__input"
      />
    </div>

    <template #footer>
      <button
        type="button"
        class="staff-volume-dialog__btn"
        :disabled="volume === DEFAULT_STAFF_VOLUME"
        @click="volume = DEFAULT_STAFF_VOLUME"
      >
        {{ t('editor.staffVolumeDialog.reset') }}
      </button>
      <button type="button" class="staff-volume-dialog__btn staff-volume-dialog__btn--primary" @click="confirm">
        {{ t('editor.staffVolumeDialog.confirm') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.staff-volume-dialog__hint {
  margin: 0 0 14px;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.staff-volume-dialog__row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 4px;
}

.staff-volume-dialog__slider {
  flex: 1;
}

.staff-volume-dialog__input {
  width: 96px;
}

.staff-volume-dialog__slider :deep(.el-slider__bar) {
  background-color: #ff8fb8;
}

.staff-volume-dialog__slider :deep(.el-slider__button) {
  border-color: #ff8fb8;
}

.staff-volume-dialog__btn {
  margin-left: 8px;
  padding: 8px 18px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.85);
  color: #8a5a72;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}

.staff-volume-dialog__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.staff-volume-dialog__btn--primary {
  border-color: rgba(201, 184, 255, 0.65);
  background: linear-gradient(135deg, rgba(255, 214, 232, 0.95), rgba(230, 220, 255, 0.95));
  color: #5c4a6a;
}
</style>

<style>
.staff-volume-dialog.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: rgba(255, 250, 252, 0.97);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 12px 40px rgba(120, 90, 140, 0.18);
}

.staff-volume-dialog.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}
</style>
