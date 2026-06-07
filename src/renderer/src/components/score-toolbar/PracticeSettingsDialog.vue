<script setup lang="ts">
import { computed, inject, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { practiceContextKey } from '@renderer/utils/practiceContext'
import { usePracticeSettingsStore } from '@renderer/store/practiceSettings.store'
import { NOTE_RESULT_LABEL, NOTE_RESULT_LEGEND_STYLE } from '@renderer/constant/practice'
import { PLAY_BPM_MAX, PLAY_BPM_MIN } from '@renderer/constant/play'

defineOptions({ name: 'PracticeSettingsDialog' })

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const practiceContext = inject(practiceContextKey)
const settings = usePracticeSettingsStore()
const {
  showNoteResult,
  coverWaterfall,
  scoreVolume,
  metronomeVolume,
  bpm,
  metronomeDuringPlay,
  pianoKeyHint,
  difficulty
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

/** 单谱表开关（暂未接入功能） */
const staffEnabled = ref<boolean[]>([])

watch(
  () => practiceContext?.maxStaffCount.value,
  (count) => {
    staffEnabled.value = Array.from({ length: count ?? 0 }, () => true)
  },
  { immediate: true }
)

const difficultyOptions = [
  { label: '新手', value: 'beginner', desc: '判定窗口较宽，适合入门' },
  { label: '老手', value: 'intermediate', desc: '标准判定，适合日常练习' },
  { label: '大师', value: 'master', desc: '判定严格，挑战极限' }
] as const

const noteColorLegend = (Object.keys(NOTE_RESULT_LABEL) as (keyof typeof NOTE_RESULT_LABEL)[]).map(
  (key) => ({ label: NOTE_RESULT_LABEL[key], style: NOTE_RESULT_LEGEND_STYLE[key] })
)

const keyColorLegend = [
  { label: '下批音符', color: '#ff6b6b' },
  { label: '下下批音符', color: '#5b9dff' },
  { label: '两批重合', color: '#51cf66' }
]

const appendixOpen = ref(false)
</script>

<template>
  <el-dialog
    v-model="visible"
    title="练习设置"
    width="560px"
    class="practice-settings-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <p class="practice-settings-dialog__desc">调整练习体验，功能稍后接入</p>

    <el-form label-position="top" class="practice-settings-form">
      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">显示</h3>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>实时显示音符结果</span>
            <small>弹对、弹早、弹晚、漏弹以不同颜色标注</small>
          </div>
          <el-switch v-model="showNoteResult" />
        </div>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>遮盖瀑布流</span>
            <small>用可爱背景图挡住瀑布流，凭听觉练习</small>
          </div>
          <el-switch v-model="coverWaterfall" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">音量与速度</h3>
        <el-form-item label="曲谱音量">
          <el-slider v-model="scoreVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="节拍器音量">
          <el-slider v-model="metronomeVolumePercent" :min="0" :max="100" show-input />
        </el-form-item>
        <el-form-item label="BPM">
          <el-input-number v-model="bpm" :min="PLAY_BPM_MIN" :max="PLAY_BPM_MAX" :step="1" />
        </el-form-item>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>播放过程开启节拍器</span>
          </div>
          <el-switch v-model="metronomeDuringPlay" />
        </div>
      </section>

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">单谱表</h3>
        <p class="practice-settings-section__hint">关闭后对应谱表与瀑布流音符会变透明</p>
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

      <section class="practice-settings-section">
        <h3 class="practice-settings-section__title">辅助</h3>
        <div class="practice-settings-row">
          <div class="practice-settings-row__label">
            <span>虚拟钢琴按键提示</span>
            <small>下批红色、下下批蓝色、重合绿色</small>
          </div>
          <el-switch v-model="pianoKeyHint" />
        </div>
        <el-form-item label="难度">
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
        </el-form-item>
      </section>

      <section class="practice-settings-section practice-settings-section--appendix">
        <button
          type="button"
          class="practice-settings-appendix-toggle"
          @click="appendixOpen = !appendixOpen"
        >
          <span>附录：颜色含义</span>
          <span class="practice-settings-appendix-toggle__arrow" :class="{ open: appendixOpen }"
            >›</span
          >
        </button>
        <div v-show="appendixOpen" class="practice-settings-appendix">
          <div class="practice-settings-legend">
            <p class="practice-settings-legend__title">音符颜色</p>
            <ul>
              <li v-for="item in noteColorLegend" :key="item.label">
                <span class="practice-settings-legend__dot" :style="{ background: item.style }" />
                {{ item.label }}
              </li>
            </ul>
          </div>
          <div class="practice-settings-legend">
            <p class="practice-settings-legend__title">琴键提示颜色</p>
            <ul>
              <li v-for="item in keyColorLegend" :key="item.label">
                <span class="practice-settings-legend__dot" :style="{ background: item.color }" />
                {{ item.label }}
              </li>
            </ul>
          </div>
        </div>
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
