<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { PLAY_BPM_MAX, PLAY_BPM_MIN } from '@renderer/constant/play'
import { useBeginnerSettingsStore } from '@renderer/store/beginnerSettings.store'

defineOptions({ name: 'BeginnerSettingsDialog' })

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const settings = useBeginnerSettingsStore()
const { coverMidiBox, metronomeVolume, bpm, metronomeDuringPlay, staffEnabled } =
  storeToRefs(settings)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const metronomeVolumePercent = computed({
  get: () => Math.round(metronomeVolume.value * 100),
  set: (value: number) => (metronomeVolume.value = value / 100)
})
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('beginner.settings.title')"
    width="520px"
    class="practice-settings-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <p class="practice-settings-dialog__desc">{{ t('beginner.settings.desc') }}</p>

    <el-form label-position="top" class="practice-settings-form">
      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('beginner.settings.display') }}</h3>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>{{ t('beginner.settings.coverMidiBox') }}</span>
            <small>{{ t('beginner.settings.coverMidiBoxHint') }}</small>
          </div>
          <el-switch v-model="coverMidiBox" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('beginner.settings.metronome') }}</h3>
        <el-form-item :label="t('beginner.settings.metronomeVolume')">
          <el-slider v-model="metronomeVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item :label="t('beginner.settings.bpm')">
          <el-input-number v-model="bpm" :min="PLAY_BPM_MIN" :max="PLAY_BPM_MAX" :step="1" />
        </el-form-item>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>{{ t('beginner.settings.metronomeDuringPlay') }}</span>
          </div>
          <el-switch v-model="metronomeDuringPlay" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('beginner.settings.staffSelection') }}</h3>
        <p class="practice-settings-section__hint">{{ t('beginner.settings.staffSelectionHint') }}</p>
        <div v-if="staffEnabled.length" class="practice-settings-staff-list">
          <div
            v-for="(_, index) in staffEnabled"
            :key="index"
            class="practice-settings-row practice-settings-row--staff"
          >
            <span>{{ t('beginner.settings.singleStaff', { n: index + 1 }) }}</span>
            <el-switch v-model="staffEnabled[index]" />
          </div>
        </div>
        <p v-else class="practice-settings-empty">{{ t('beginner.settings.noSingleStaff') }}</p>
      </section>
    </el-form>

    <template #footer>
      <button type="button" class="practice-settings-dialog__btn" @click="visible = false">
        {{ t('common.gotIt') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.practice-settings-dialog__desc {
  margin: 0 0 12px;
  font-size: 13px;
  color: #9a8aa8;
}

.practice-settings-form {
  max-height: min(62vh, 480px);
  overflow-y: auto;
  padding-right: 4px;
}

.practice-settings-section {
  padding: 14px 0;
  border-bottom: 1px dashed rgba(255, 184, 208, 0.35);
}

.practice-settings-section:last-child {
  border-bottom: none;
}

.practice-settings-section__title {
  margin: 0 0 10px;
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.practice-settings-section__hint,
.practice-settings-empty {
  margin: 0 0 10px;
  font-size: 12px;
  color: #9a8aa8;
}

.practice-settings-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 8px 0;
}

.practice-settings-row__label {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-width: 0;
}

.practice-settings-row__label span {
  font-size: 13px;
  font-weight: 600;
  color: #5c4a6a;
}

.practice-settings-row__label small {
  font-size: 12px;
  color: #9a8aa8;
}

.practice-settings-row--staff {
  padding: 6px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.55);
}

.practice-settings-staff-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.practice-settings-dialog__btn {
  padding: 8px 22px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 184, 208, 0.45), rgba(201, 184, 255, 0.45));
  color: #5c4a6a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.practice-settings-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.practice-settings-form :deep(.el-form-item__label) {
  font-size: 13px;
  font-weight: 600;
  color: #5c4a6a;
}
</style>

<style>
.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.cute-dialog .el-dialog__header {
  padding: 20px 24px 8px;
}

.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}

.cute-dialog .el-dialog__body {
  padding: 8px 24px 12px;
}

.cute-dialog .el-dialog__footer {
  padding: 8px 24px 20px;
}
</style>
