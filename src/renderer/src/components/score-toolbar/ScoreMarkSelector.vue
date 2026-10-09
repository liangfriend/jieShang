<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SCORE_MARK_FLUTE_KEYS,
  SCORE_MARK_NONE,
  SCORE_MARK_XIAO_KEYS,
  formatMarkKey,
  type ScoreMarkValue
} from '@renderer/utils/scoreMark'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    modelValue: ScoreMarkValue
    disabled?: boolean
  }>(),
  { disabled: false }
)

const emit = defineEmits<{
  'update:modelValue': [value: ScoreMarkValue]
}>()

const activePanel = ref(false)

function fluteKeyLabel(key: string): string {
  if (key === 'G') return t('play.mark.fluteLowG')
  if (key === 'highG') return t('play.mark.fluteHighG')
  return formatMarkKey(key)
}

function labelOf(value: ScoreMarkValue): string {
  if (value === SCORE_MARK_NONE) return t('play.mark.none')
  const [type, key = ''] = value.split(':')
  return type === 'xiao'
    ? t('play.mark.xiaoKey', { key: formatMarkKey(key) })
    : t('play.mark.fluteKey', { key: fluteKeyLabel(key) })
}

const currentLabel = computed(() => labelOf(props.modelValue))

function togglePanel() {
  if (props.disabled) return
  activePanel.value = !activePanel.value
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-mark__adjuster')) activePanel.value = false
}

onMounted(() => document.addEventListener('pointerdown', onDocumentPointerDown))
onBeforeUnmount(() => document.removeEventListener('pointerdown', onDocumentPointerDown))

function onSelectChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as ScoreMarkValue
  if (value !== props.modelValue) emit('update:modelValue', value)
  activePanel.value = false
}
</script>

<template>
  <div class="score-mark__adjuster">
    <button
      type="button"
      class="score-toolbar__btn score-mark__btn"
      :disabled="disabled"
      @click="togglePanel"
    >
      {{ t('play.mark.label') }} {{ currentLabel }}
    </button>
    <div v-if="activePanel" class="score-toolbar__popup score-mark__popup" @pointerdown.stop>
      <label class="score-mark__field">
        <span class="score-mark__field-label">{{ t('play.mark.label') }}</span>
        <select class="score-mark__select" :value="modelValue" :disabled="disabled" @change="onSelectChange">
          <option :value="SCORE_MARK_NONE">{{ t('play.mark.none') }}</option>
          <optgroup :label="t('play.mark.xiaoGroup')">
            <option v-for="key in SCORE_MARK_XIAO_KEYS" :key="key" :value="`xiao:${key}`">
              {{ labelOf(`xiao:${key}`) }}
            </option>
          </optgroup>
          <optgroup :label="t('play.mark.fluteGroup')">
            <option v-for="key in SCORE_MARK_FLUTE_KEYS" :key="key" :value="`flute:${key}`">
              {{ labelOf(`flute:${key}`) }}
            </option>
          </optgroup>
        </select>
      </label>
    </div>
  </div>
</template>

<style scoped>
.score-mark__adjuster {
  position: relative;
}

.score-mark__btn {
  min-width: 96px;
}

.score-toolbar__popup {
  position: absolute;
  bottom: calc(100% + 10px);
  left: 50%;
  z-index: 40;
  padding: 12px 14px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 14px;
  background: rgba(255, 248, 251, 0.98);
  box-shadow: 0 8px 28px rgba(200, 140, 180, 0.22);
  transform: translateX(-50%);
}

.score-mark__popup {
  min-width: 180px;
}

.score-mark__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-mark__field-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.score-mark__select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 8px;
  background: #fff;
  color: #5c4a6a;
  font-size: 13px;
}

.score-mark__select:focus {
  outline: none;
  border-color: #ff8fba;
}

.score-mark__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
