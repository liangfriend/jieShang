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
        <div class="home-settings-difficulty-row">
          <span class="home-settings-difficulty-row__label">街机/无限模式难度：</span>
          <el-radio-group v-model="difficulty" class="home-settings-difficulty">
            <el-radio
              v-for="opt in GAME_DIFFICULTY_OPTIONS"
              :key="opt.value"
              :value="opt.value"
            >
              {{ opt.label }}
            </el-radio>
          </el-radio-group>
        </div>
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
