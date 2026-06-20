<script setup lang="ts">
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { SCORE_NOTATION_TYPE_OPTIONS, resolveScoreNotationTypeLabel } from '@renderer/constant/scoreNotationType'

const props = withDefaults(
  defineProps<{
    modelValue: MusicScoreTypeEnum
    variant?: 'inline' | 'toolbar'
    disabled?: boolean
  }>(),
  {
    variant: 'toolbar',
    disabled: false
  }
)

const emit = defineEmits<{
  'update:modelValue': [value: MusicScoreTypeEnum]
  change: [value: MusicScoreTypeEnum]
}>()

const activePanel = ref(false)

const typeLabel = computed(() => resolveScoreNotationTypeLabel(props.modelValue))

function togglePanel() {
  if (props.disabled) return
  activePanel.value = !activePanel.value
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-notation-type__adjuster')) {
    activePanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

function parseType(raw: string): MusicScoreTypeEnum | null {
  const value = Number(raw)
  if (!Number.isFinite(value)) return null
  if (!SCORE_NOTATION_TYPE_OPTIONS.some((item) => item.value === value)) return null
  return value as MusicScoreTypeEnum
}

function onSelectChange(event: Event) {
  const select = event.target as HTMLSelectElement
  const targetType = parseType(select.value)
  // 先还原显示，等父级确认后再通过 modelValue 更新
  select.value = String(props.modelValue)
  if (targetType == null || targetType === props.modelValue) return
  emit('change', targetType)
  activePanel.value = false
}
</script>

<template>
  <div
    class="score-notation-type__adjuster"
    :class="{
      'score-notation-type__adjuster--inline': variant === 'inline',
      'score-notation-type__adjuster--toolbar': variant === 'toolbar'
    }"
  >
    <template v-if="variant === 'toolbar'">
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--stable"
        :disabled="disabled"
        @click="togglePanel"
      >
        曲谱类型 {{ typeLabel }}
      </button>
      <div v-if="activePanel" class="score-toolbar__popup score-notation-type__popup" @pointerdown.stop>
        <div class="score-notation-type__field">
          <span class="score-notation-type__field-label">曲谱类型</span>
          <select
            class="score-notation-type__select"
            :value="modelValue"
            :disabled="disabled"
            @change="onSelectChange"
          >
            <option v-for="item in SCORE_NOTATION_TYPE_OPTIONS" :key="item.value" :value="item.value">
              {{ item.label }}
            </option>
          </select>
        </div>
      </div>
    </template>

    <template v-else>
      <label class="score-notation-type__inline">
        <span class="score-notation-type__inline-label">曲谱类型</span>
        <select
          class="score-notation-type__select score-notation-type__select--inline"
          :value="modelValue"
          :disabled="disabled"
          @change="onSelectChange"
        >
          <option v-for="item in SCORE_NOTATION_TYPE_OPTIONS" :key="item.value" :value="item.value">
            {{ item.label }}
          </option>
        </select>
      </label>
    </template>
  </div>
</template>

<style scoped>
.score-notation-type__adjuster--toolbar {
  position: relative;
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

.score-toolbar__btn--stable {
  min-width: 108px;
}

.score-notation-type__popup {
  min-width: 180px;
}

.score-notation-type__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-notation-type__field-label,
.score-notation-type__inline-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.score-notation-type__select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 8px;
  background: #fff;
  color: #5c4a6a;
  font-size: 13px;
}

.score-notation-type__select--inline {
  min-width: 96px;
  width: auto;
}

.score-notation-type__select:focus {
  outline: none;
  border-color: #ff8fba;
}

.score-notation-type__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.score-notation-type__inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}
</style>
