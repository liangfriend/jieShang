<script setup lang="ts">
import { computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useBeginnerSettingsStore } from '@renderer/store/beginnerSettings.store'
import { PLAY_BPM_MAX, PLAY_BPM_MIN } from '@renderer/constant/play'

defineOptions({ name: 'BeginnerSettingsDialog' })

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
    title="新手模式设置"
    width="520px"
    class="practice-settings-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <p class="practice-settings-dialog__desc">按自己的节奏弹奏彩色 midi 块</p>

    <el-form label-position="top" class="practice-settings-form">
      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">显示</h3>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>遮盖 midi 块</span>
            <small>用可爱背景挡住彩色块，凭听觉练习</small>
          </div>
          <el-switch v-model="coverMidiBox" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">节拍器</h3>
        <el-form-item label="节拍器音量">
          <el-slider v-model="metronomeVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="BPM">
          <el-input-number v-model="bpm" :min="PLAY_BPM_MIN" :max="PLAY_BPM_MAX" :step="1" />
        </el-form-item>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>练习过程开启节拍器</span>
          </div>
          <el-switch v-model="metronomeDuringPlay" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">声部选择</h3>
        <p class="practice-settings-section__hint">关闭后该单谱表会变透明</p>
        <div v-if="staffEnabled.length" class="practice-settings-staff-list">
          <div
            v-for="(_, index) in staffEnabled"
            :key="index"
            class="practice-settings-row practice-settings-row--staff"
          >
            <span>单谱表 {{ index + 1 }}</span>
            <el-switch v-model="staffEnabled[index]" />
          </div>
        </div>
        <p v-else class="practice-settings-empty">当前曲谱暂无单谱表</p>
      </section>
    </el-form>

    <template #footer>
      <button type="button" class="practice-settings-dialog__btn" @click="visible = false">
        知道了
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
