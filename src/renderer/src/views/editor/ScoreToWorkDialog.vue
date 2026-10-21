<script lang="ts" setup>
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  findStandardSizeId,
  STANDARD_SIZE_GROUPS,
  STANDARD_SIZES,
  type StandardSize
} from '@renderer/constant/workPageSizes'
import {
  defaultScoreWidth,
  loadScoreToWorkSettings,
  PAGE_SIZE_MAX,
  PAGE_SIZE_MIN,
  saveScoreToWorkSettings,
  type ScoreToWorkSettings
} from '@renderer/utils/work/scoreToWork'

defineOptions({ name: 'ScoreToWorkDialog' })

const props = defineProps<{ modelValue: boolean }>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  confirm: [settings: ScoreToWorkSettings]
}>()

const { t } = useI18n()

const pageWidth = ref(0)
const pageHeight = ref(0)
const scoreWidth = ref(0)
const topMargin = ref(0)
const standardSizeId = ref('')

const visible = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v)
})

const topMarginMax = computed(() => Math.max(0, Math.floor(pageHeight.value / 2) - 1))

function standardSizeLabel(size: StandardSize): string {
  const orientation = size.orientation ? ` ${t(`work.settingsDialog.${size.orientation}`)}` : ''
  return `${size.name}${orientation} (${size.width} × ${size.height})`
}

watch(
  () => props.modelValue,
  (open) => {
    if (!open) return
    const saved = loadScoreToWorkSettings()
    pageWidth.value = saved.pageWidth
    pageHeight.value = saved.pageHeight
    scoreWidth.value = Math.min(saved.scoreWidth, saved.pageWidth)
    topMargin.value = saved.topMargin
    standardSizeId.value = findStandardSizeId(saved.pageWidth, saved.pageHeight)
  },
  { immediate: true }
)

function onStandardSizeChange(id: string) {
  const size = STANDARD_SIZES.find((s) => s.id === id)
  if (!size) return
  const keepDefaultWidth = scoreWidth.value === defaultScoreWidth(pageWidth.value)
  pageWidth.value = size.width
  pageHeight.value = size.height
  scoreWidth.value = keepDefaultWidth ? defaultScoreWidth(size.width) : Math.min(scoreWidth.value, size.width)
}

watch([pageWidth, pageHeight], ([width, height]) => {
  standardSizeId.value = findStandardSizeId(width, height)
  if (scoreWidth.value > width) scoreWidth.value = width
  if (topMargin.value > topMarginMax.value) topMargin.value = topMarginMax.value
})

async function onConfirm() {
  ;(document.activeElement as HTMLElement | null)?.blur?.()
  await nextTick()
  const settings: ScoreToWorkSettings = {
    pageWidth: Math.round(pageWidth.value),
    pageHeight: Math.round(pageHeight.value),
    scoreWidth: Math.round(Math.min(scoreWidth.value, pageWidth.value)),
    topMargin: Math.round(Math.min(topMargin.value, topMarginMax.value))
  }
  saveScoreToWorkSettings(settings)
  emit('confirm', settings)
  visible.value = false
}
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.scoreToWork.title')"
    width="520px"
    class="cute-dialog"
    append-to-body
    align-center
  >
    <div class="score-to-work">
      <div class="score-to-work__row">
        <span class="score-to-work__label">{{ t('editor.scoreToWork.template') }}</span>
        <el-select
          :model-value="standardSizeId"
          class="score-to-work__select"
          :placeholder="t('editor.scoreToWork.custom')"
          @update:model-value="onStandardSizeChange"
        >
          <el-option-group
            v-for="group in STANDARD_SIZE_GROUPS"
            :key="group"
            :label="t(`work.settingsDialog.standardGroup.${group}`)"
          >
            <el-option
              v-for="size in STANDARD_SIZES.filter((s) => s.group === group)"
              :key="size.id"
              :label="standardSizeLabel(size)"
              :value="size.id"
            />
          </el-option-group>
        </el-select>
      </div>

      <div class="score-to-work__row">
        <span class="score-to-work__label">{{ t('editor.scoreToWork.pageSize') }}</span>
        <el-input-number
          v-model="pageWidth"
          class="score-to-work__input"
          :min="PAGE_SIZE_MIN"
          :max="PAGE_SIZE_MAX"
          :step="1"
          controls-position="right"
        />
        <span class="score-to-work__times">×</span>
        <el-input-number
          v-model="pageHeight"
          class="score-to-work__input"
          :min="PAGE_SIZE_MIN"
          :max="PAGE_SIZE_MAX"
          :step="1"
          controls-position="right"
        />
      </div>

      <div class="score-to-work__row">
        <span class="score-to-work__label">{{ t('editor.scoreToWork.scoreWidth') }}</span>
        <el-input-number
          v-model="scoreWidth"
          class="score-to-work__input"
          :min="PAGE_SIZE_MIN"
          :max="pageWidth"
          :step="10"
          controls-position="right"
        />
      </div>

      <div class="score-to-work__row">
        <span class="score-to-work__label">{{ t('editor.scoreToWork.topMargin') }}</span>
        <el-input-number
          v-model="topMargin"
          class="score-to-work__input"
          :min="0"
          :max="topMarginMax"
          :step="4"
          controls-position="right"
        />
      </div>

      <p class="score-to-work__hint">{{ t('editor.scoreToWork.hint') }}</p>
    </div>

    <template #footer>
      <el-button @click="visible = false">{{ t('common.cancel') }}</el-button>
      <el-button type="primary" @click="onConfirm">{{ t('common.confirm') }}</el-button>
    </template>
  </el-dialog>
</template>

<style scoped>
.score-to-work {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.score-to-work__row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.score-to-work__label {
  flex-shrink: 0;
  min-width: 84px;
  font-size: 13px;
  font-weight: 700;
  color: #8a5a72;
}

.score-to-work__select {
  width: 260px;
}

.score-to-work__input {
  width: 120px;
}

.score-to-work__times {
  font-weight: 800;
  color: #9a8aa8;
}

.score-to-work__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}
</style>
