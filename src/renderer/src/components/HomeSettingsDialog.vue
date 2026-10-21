<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { Reading } from '@element-plus/icons-vue'
import { GAME_DIFFICULTY_OPTIONS } from '@renderer/constant/gameSettings'
import { LOCALE_OPTIONS, type AppLocale } from '@renderer/i18n/locale'
import { resolveGameDifficultyLabel } from '@renderer/i18n/helpers'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'
import { useLocaleStore } from '@renderer/store/locale.store'

defineOptions({ name: 'HomeSettingsDialog' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const { t } = useI18n()
const router = useRouter()
const settings = useGameSettingsStore()
const localeStore = useLocaleStore()
const { difficulty, notationMode, noteBlockSoundVolume } = storeToRefs(settings)
const { locale } = storeToRefs(localeStore)

/** switch 开启 = 简谱，关闭 = 线谱 */
const isJianpuNotation = computed({
  get: () => notationMode.value === 'jianpu',
  set: (value: boolean) => {
    settings.setNotationMode(value ? 'jianpu' : 'staff')
  }
})

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const noteBlockSoundVolumePercent = computed({
  get: () => Math.round(noteBlockSoundVolume.value * 100),
  set: (value: number) => {
    noteBlockSoundVolume.value = value / 100
  }
})

function onLocaleChange(value: AppLocale) {
  localeStore.setLocale(value)
}

function openManual() {
  visible.value = false
  router.push({ name: 'manual' })
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('settings.title')"
    width="420px"
    class="home-settings-dialog cute-dialog"
    append-to-body
    align-center
  >
    <el-form label-position="top" class="home-settings-form">
      <section class="home-settings-section">
        <el-form-item :label="t('settings.language.label')">
          <el-radio-group :model-value="locale" @change="onLocaleChange">
            <el-radio v-for="opt in LOCALE_OPTIONS" :key="opt.value" :value="opt.value">
              {{ t(opt.labelKey) }}
            </el-radio>
          </el-radio-group>
        </el-form-item>
      </section>

      <section class="home-settings-section">
        <div class="home-settings-difficulty-row">
          <span class="home-settings-difficulty-row__label">{{ t('settings.gameDifficulty.label') }}</span>
          <el-radio-group v-model="difficulty" class="home-settings-difficulty">
            <el-radio
              v-for="opt in GAME_DIFFICULTY_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ resolveGameDifficultyLabel(opt.value) }}
            </el-radio>
          </el-radio-group>
        </div>
      </section>

      <section class="home-settings-section">
        <div class="home-settings-difficulty-row">
          <span class="home-settings-difficulty-row__label">{{ t('settings.gameNotation.label') }}</span>
          <el-switch
            v-model="isJianpuNotation"
            class="home-settings-notation-switch"
            inline-prompt
            :active-text="t('settings.gameNotation.jianpu')"
            :inactive-text="t('settings.gameNotation.staff')"
          />
        </div>
      </section>

      <section class="home-settings-section">
        <el-form-item :label="t('settings.noteBlockSound.label')">
          <el-slider v-model="noteBlockSoundVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
      </section>

      <section class="home-settings-section">
        <button type="button" class="home-settings-manual" @click="openManual">
          <el-icon class="home-settings-manual__icon"><Reading /></el-icon>
          <span class="home-settings-manual__text">
            <span class="home-settings-manual__title">{{ t('manual.entry') }}</span>
            <span class="home-settings-manual__desc">{{ t('manual.entryDesc') }}</span>
          </span>
        </button>
      </section>
    </el-form>

    <template #footer>
      <button type="button" class="home-settings-dialog__btn" @click="visible = false">
        {{ t('common.done') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.home-settings-form {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.home-settings-difficulty-row {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.home-settings-difficulty-row__label {
  font-size: 14px;
  font-weight: 600;
  color: #5c4a6a;
  white-space: nowrap;
}

.home-settings-difficulty {
  display: flex;
  flex-wrap: nowrap;
  gap: 16px;
}

.home-settings-difficulty :deep(.el-radio) {
  margin-right: 0;
  height: auto;
}

.home-settings-difficulty :deep(.el-radio__label) {
  padding-left: 6px;
  font-size: 14px;
  font-weight: 600;
  color: #5c4a6a;
}

.home-settings-notation-switch {
  --el-switch-on-color: #c9b8ff;
  --el-switch-off-color: #ff8fb8;
}

.home-settings-manual {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  padding: 12px 14px;
  border: 2px solid rgba(201, 184, 255, 0.55);
  border-radius: 16px;
  background: linear-gradient(90deg, rgba(255, 240, 246, 0.9), rgba(243, 235, 255, 0.9));
  color: #5c4a6a;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.home-settings-manual:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 18px rgba(201, 184, 255, 0.35);
}

.home-settings-manual__icon {
  flex-shrink: 0;
  font-size: 24px;
  color: #a58bff;
}

.home-settings-manual__text {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.home-settings-manual__title {
  font-size: 14px;
  font-weight: 700;
}

.home-settings-manual__desc {
  font-size: 12px;
  color: #9a8aa8;
}

.home-settings-dialog__btn {
  min-width: 96px;
  padding: 8px 20px;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}
</style>

<style>
.home-settings-dialog.cute-dialog .el-dialog__footer {
  padding: 0 24px 20px;
  text-align: center;
}
</style>
