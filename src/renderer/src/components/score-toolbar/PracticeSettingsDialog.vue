<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import type { PracticeDifficulty } from '@renderer/constant/practice'
import { NOTE_RESULT_LEGEND_STYLE } from '@renderer/constant/practice'
import { PLAY_BPM_MAX, PLAY_BPM_MIN } from '@renderer/constant/play'
import { resolveNoteResultLabel } from '@renderer/i18n/helpers'
import { usePracticeSettingsStore } from '@renderer/store/practiceSettings.store'
import type { NoteScoreResult } from '@renderer/types/types'

defineOptions({ name: 'PracticeSettingsDialog' })

const { t } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const settings = usePracticeSettingsStore()
const {
  showNoteResult,
  coverWaterfall,
  scoreVolume,
  metronomeVolume,
  bpm,
  metronomeDuringPlay,
  difficulty,
  staffEnabled
} = storeToRefs(settings)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

/** 音量用 0~100 展示，存储为 0~1 */
const scoreVolumePercent = computed({
  get: () => Math.round(scoreVolume.value * 100),
  set: (value: number) => (scoreVolume.value = value / 100)
})
const metronomeVolumePercent = computed({
  get: () => Math.round(metronomeVolume.value * 100),
  set: (value: number) => (metronomeVolume.value = value / 100)
})

const difficultyValues: PracticeDifficulty[] = ['beginner', 'intermediate', 'master']

const difficultyOptions = computed(() =>
  difficultyValues.map((value) => ({
    value,
    label: t(`settings.practice.difficulty.${value}`),
    desc: t(`settings.practice.difficulty.${value}Desc`)
  }))
)

const noteColorLegend = computed(() =>
  (Object.keys(NOTE_RESULT_LEGEND_STYLE) as NoteScoreResult[]).map((key) => ({
    key,
    label: resolveNoteResultLabel(key),
    style: NOTE_RESULT_LEGEND_STYLE[key]
  }))
)

const appendixOpen = ref(false)
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('practice.settings.title')"
    width="560px"
    class="practice-settings-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <p class="practice-settings-dialog__desc">{{ t('practice.settings.desc') }}</p>

    <el-form label-position="top" class="practice-settings-form">
      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('practice.settings.display') }}</h3>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>{{ t('practice.settings.showNoteResult') }}</span>
            <small>{{ t('practice.settings.showNoteResultHint') }}</small>
          </div>
          <el-switch v-model="showNoteResult" />
        </div>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>{{ t('practice.settings.coverWaterfall') }}</span>
            <small>{{ t('practice.settings.coverWaterfallHint') }}</small>
          </div>
          <el-switch v-model="coverWaterfall" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('practice.settings.volumeAndSpeed') }}</h3>
        <el-form-item :label="t('practice.settings.scoreVolume')">
          <el-slider v-model="scoreVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item :label="t('practice.settings.metronomeVolume')">
          <el-slider v-model="metronomeVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item :label="t('practice.settings.bpm')">
          <el-input-number v-model="bpm" :min="PLAY_BPM_MIN" :max="PLAY_BPM_MAX" :step="1" />
        </el-form-item>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>{{ t('practice.settings.metronomeDuringPlay') }}</span>
          </div>
          <el-switch v-model="metronomeDuringPlay" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('practice.settings.staffSelection') }}</h3>
        <p class="practice-settings-section__hint">{{ t('practice.settings.staffSelectionHint') }}</p>
        <div v-if="staffEnabled.length" class="practice-settings-staff-list">
          <div
            v-for="(_, index) in staffEnabled"
            :key="index"
            class="practice-settings-row practice-settings-row--staff"
          >
            <span>{{ t('practice.settings.singleStaff', { n: index + 1 }) }}</span>
            <el-switch v-model="staffEnabled[index]" />
          </div>
        </div>
        <p v-else class="practice-settings-empty">{{ t('practice.settings.noSingleStaff') }}</p>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">{{ t('practice.settings.difficulty') }}</h3>
        <el-radio-group v-model="difficulty" class="practice-settings-difficulty">
          <el-radio
            v-for="opt in difficultyOptions"
            :key="opt.value"
            :value="opt.value"
            border
            class="practice-settings-difficulty__item"
          >
            <span class="practice-settings-difficulty__label">{{ opt.label }}</span>
            <small>{{ opt.desc }}</small>
          </el-radio>
        </el-radio-group>
      </section>

      <section class="practice-settings-section practice-settings-section--appendix">
        <button
          type="button"
          class="practice-settings-appendix-toggle"
          @click="appendixOpen = !appendixOpen"
        >
          <span>{{ t('practice.settings.appendix') }}</span>
          <span class="practice-settings-appendix-toggle__arrow" :class="{ open: appendixOpen }"
            >›</span
          >
        </button>
        <div v-show="appendixOpen" class="practice-settings-appendix">
          <div class="practice-settings-legend">
            <p class="practice-settings-legend__title">{{ t('practice.settings.noteColors') }}</p>
            <ul>
              <li v-for="item in noteColorLegend" :key="item.key">
                <span class="practice-settings-legend__dot" :style="{ background: item.style }" />
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
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
  max-height: min(62vh, 520px);
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

.practice-settings-difficulty {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.practice-settings-difficulty__item {
  width: 100%;
  height: auto;
  margin: 0 !important;
  padding: 10px 14px;
  border-radius: 14px !important;
}

.practice-settings-difficulty__item :deep(.el-radio__label) {
  display: flex;
  flex-direction: column;
  gap: 2px;
  white-space: normal;
  line-height: 1.35;
}

.practice-settings-difficulty__label {
  font-weight: 700;
  color: #5c4a6a;
}

.practice-settings-difficulty__item small {
  font-size: 12px;
  color: #9a8aa8;
}

.practice-settings-appendix-toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 8px 0;
  border: none;
  background: none;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.practice-settings-appendix-toggle__arrow {
  display: inline-block;
  transition: transform 0.2s ease;
  font-size: 18px;
  color: #c9b8ff;
}

.practice-settings-appendix-toggle__arrow.open {
  transform: rotate(90deg);
}

.practice-settings-appendix {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding-bottom: 4px;
}

.practice-settings-legend__title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.practice-settings-legend ul {
  margin: 0;
  padding: 0;
  list-style: none;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.practice-settings-legend li {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: #5c4a6a;
}

.practice-settings-legend__dot {
  width: 12px;
  height: 12px;
  border-radius: 999px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
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

@media (max-width: 520px) {
  .practice-settings-appendix {
    grid-template-columns: 1fr;
  }
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
