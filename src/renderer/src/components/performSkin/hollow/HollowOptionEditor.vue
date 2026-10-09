<script lang="ts" setup>
import { Delete, Plus } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  createDefaultHollowOption,
  HOLLOW_FLOW_PERIOD_PX,
  HOLLOW_GRADIENT_MAX_STOPS,
  HOLLOW_GRADIENT_MIN_STOPS,
  hollowFlowPxPerMs,
  hollowGlowK,
  parseHollowOption,
  sortedHollowStops,
  type HollowOption
} from './option'

const props = defineProps<{
  collectionId: number
  option: string | null | undefined
}>()

const emit = defineEmits<{
  saved: [option: string]
}>()

const { t } = useI18n()

const draft = ref<HollowOption>(parseHollowOption(props.option))
const saving = ref(false)

watch(
  () => [props.collectionId, props.option] as const,
  () => {
    draft.value = parseHollowOption(props.option)
  }
)

const serialized = computed(() => JSON.stringify(normalize(draft.value)))
const dirty = computed(
  () => serialized.value !== JSON.stringify(normalize(parseHollowOption(props.option)))
)
const previewStyle = computed(() => {
  const stops = sortedHollowStops(draft.value.gradientStops)
  // 正向 + 反向各走一遍色标，平铺后首尾相接，与演奏时的流动渐变一致
  const forward = stops.map((s) => `${s.color} ${s.offset / 2}%`)
  const backward = [...stops].reverse().map((s) => `${s.color} ${100 - s.offset / 2}%`)
  const flow = hollowFlowPxPerMs(draft.value.flowSpeed)
  const glow = hollowGlowK(draft.value.glowStrength)
  return {
    backgroundImage: `linear-gradient(90deg, ${[...forward, ...backward].join(', ')})`,
    backgroundSize: `${HOLLOW_FLOW_PERIOD_PX}px 100%`,
    '--hollow-flow-period': `${HOLLOW_FLOW_PERIOD_PX}px`,
    animationDuration: flow > 0 ? `${HOLLOW_FLOW_PERIOD_PX / flow}ms` : '0s',
    animationPlayState: flow > 0 ? 'running' : 'paused',
    boxShadow: glow > 0 ? `0 0 ${(4 * glow).toFixed(1)}px ${stops[0]!.color}` : 'none'
  }
})

function normalize(option: HollowOption): HollowOption {
  return { ...option, gradientStops: sortedHollowStops(option.gradientStops) }
}

function handleColorChange(index: number, color: string | null) {
  if (!color) return
  draft.value.gradientStops[index]!.color = color.toUpperCase()
}

function addStop() {
  const stops = sortedHollowStops(draft.value.gradientStops)
  if (stops.length >= HOLLOW_GRADIENT_MAX_STOPS) return
  let gapIndex = 0
  let gap = -1
  for (let i = 1; i < stops.length; i++) {
    const d = stops[i]!.offset - stops[i - 1]!.offset
    if (d > gap) {
      gap = d
      gapIndex = i
    }
  }
  const left = stops[gapIndex - 1]!
  const right = stops[gapIndex]!
  stops.splice(gapIndex, 0, {
    color: left.color,
    offset: Math.round((left.offset + right.offset) / 2)
  })
  draft.value.gradientStops = stops
}

function removeStop(index: number) {
  if (draft.value.gradientStops.length <= HOLLOW_GRADIENT_MIN_STOPS) return
  draft.value.gradientStops.splice(index, 1)
}

function resetDefault() {
  draft.value = createDefaultHollowOption()
}

async function save() {
  saving.value = true
  try {
    const option = serialized.value
    const res = await window.api.collection.update(props.collectionId, { option })
    if (!res?.success) throw new Error()
    draft.value = parseHollowOption(option)
    emit('saved', option)
    ElMessage.success(t('collection.option.saveSuccess'))
  } catch {
    ElMessage.error(t('collection.option.saveFailed'))
  } finally {
    saving.value = false
  }
}
</script>

<template>
  <section class="hollow-option">
    <h3 class="hollow-option__title">{{ t('collection.option.title') }}</h3>

    <div class="hollow-option__preview">
      <div class="hollow-option__preview-bar" :style="previewStyle" />
    </div>

    <div class="hollow-option__label">{{ t('collection.option.gradient') }}</div>
    <div
      v-for="(stop, index) in draft.gradientStops"
      :key="index"
      class="hollow-option__stop"
    >
      <el-color-picker
        :model-value="stop.color"
        size="small"
        @update:model-value="handleColorChange(index, $event)"
      />
      <el-input-number
        v-model="stop.offset"
        :min="0"
        :max="100"
        :step="5"
        size="small"
        controls-position="right"
        class="hollow-option__offset"
        :aria-label="t('collection.option.stopOffset')"
      />
      <span class="hollow-option__percent">%</span>
      <el-button
        size="small"
        text
        :icon="Delete"
        :title="t('collection.option.removeStop')"
        :disabled="draft.gradientStops.length <= HOLLOW_GRADIENT_MIN_STOPS"
        @click="removeStop(index)"
      />
    </div>
    <el-button
      size="small"
      :icon="Plus"
      class="hollow-option__add"
      :disabled="draft.gradientStops.length >= HOLLOW_GRADIENT_MAX_STOPS"
      @click="addStop"
    >
      {{ t('collection.option.addStop') }}
    </el-button>

    <div class="hollow-option__label">{{ t('collection.option.flowSpeed') }}</div>
    <el-slider
      v-model="draft.flowSpeed"
      :min="0"
      :max="100"
      size="small"
      class="hollow-option__slider"
    />

    <div class="hollow-option__label">{{ t('collection.option.glowStrength') }}</div>
    <el-slider
      v-model="draft.glowStrength"
      :min="0"
      :max="100"
      size="small"
      class="hollow-option__slider"
    />

    <div class="hollow-option__actions">
      <el-button size="small" @click="resetDefault">{{ t('collection.option.reset') }}</el-button>
      <el-button size="small" type="primary" :loading="saving" :disabled="!dirty" @click="save">
        {{ t('collection.option.save') }}
      </el-button>
    </div>
  </section>
</template>

<style scoped>
.hollow-option {
  width: 100%;
  margin-bottom: 14px;
  text-align: left;
}

.hollow-option__title {
  margin: 0 0 8px;
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.hollow-option__preview {
  padding: 12px 10px;
  border-radius: 8px;
  background: #000;
  margin-bottom: 10px;
  overflow: hidden;
}

.hollow-option__preview-bar {
  height: 10px;
  border-radius: 3px;
  background-repeat: repeat-x;
  animation: hollow-option-flow linear infinite;
}

@keyframes hollow-option-flow {
  from {
    background-position-x: 0;
  }
  to {
    background-position-x: var(--hollow-flow-period);
  }
}

.hollow-option__label {
  margin: 8px 0 4px;
  font-size: 12px;
  color: #6b566f;
}

/* 滑块拉到两端时按钮热区有一半伸出滑轨，留出边距避免撑出横向滚动条 */
.hollow-option__slider {
  box-sizing: border-box;
  padding: 0 10px;
}

.hollow-option__stop {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
}

.hollow-option__offset {
  width: 92px;
}

.hollow-option__percent {
  font-size: 12px;
  color: #a8899c;
}

.hollow-option__add {
  margin-bottom: 4px;
}

.hollow-option__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 10px;
}
</style>
