<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { GAME_DIFFICULTY_OPTIONS } from '@renderer/constant/gameSettings'
import { useGameSettingsStore } from '@renderer/store/gameSettings.store'

defineOptions({ name: 'HomeSettingsDialog' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const settings = useGameSettingsStore()
const { difficulty } = storeToRefs(settings)

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})
</script>

<template>
  <el-dialog
    v-model="visible"
    title="设置"
    width="420px"
    class="home-settings-dialog cute-dialog"
    append-to-body
    align-center
  >
    <el-form label-position="top" class="home-settings-form">
      <section class="home-settings-section">
        <h3 class="home-settings-section__title">游戏</h3>
        <p class="home-settings-section__hint">影响音符切切等模式的出题与判定（后续接入）</p>
        <el-radio-group v-model="difficulty" class="home-settings-difficulty">
          <label
            v-for="opt in GAME_DIFFICULTY_OPTIONS"
            :key="opt.value"
            class="home-settings-difficulty__item"
          >
            <el-radio :label="opt.value">
              <span class="home-settings-difficulty__label">{{ opt.label }}</span>
              <small>{{ opt.desc }}</small>
            </el-radio>
          </label>
        </el-radio-group>
      </section>
    </el-form>

    <template #footer>
      <button type="button" class="home-settings-dialog__btn" @click="visible = false">
        完成
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

.home-settings-section__title {
  margin: 0 0 6px;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
}

.home-settings-section__hint {
  margin: 0 0 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.home-settings-difficulty {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}

.home-settings-difficulty__item {
  display: block;
  padding: 12px 14px;
  border-radius: 14px;
  border: 2px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 255, 255, 0.72);
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    background 0.15s ease;
}

.home-settings-difficulty__item:hover {
  border-color: rgba(255, 143, 184, 0.55);
  background: rgba(255, 248, 251, 0.95);
}

.home-settings-difficulty__item :deep(.el-radio) {
  align-items: flex-start;
  height: auto;
  white-space: normal;
}

.home-settings-difficulty__item :deep(.el-radio__label) {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding-left: 8px;
  line-height: 1.45;
  color: #5c4a6a;
}

.home-settings-difficulty__label {
  font-size: 14px;
  font-weight: 700;
}

.home-settings-difficulty__item small {
  font-size: 12px;
  color: #9a8aa8;
  font-weight: 400;
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
