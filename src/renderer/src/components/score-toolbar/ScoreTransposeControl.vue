<script setup lang="ts">
import { KeySignatureTypeEnum } from '@deciphony/renderer'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { resolveKeySignatureLabel } from '@renderer/i18n/helpers'
import { SCORE_KEY_SIGNATURE_OPTIONS } from '@renderer/utils/scoreNotationTransfer'

const { t } = useI18n()

const props = withDefaults(
  defineProps<{
    /** 用于判断目标调是否与当前相同；不在 UI 展示 */
    currentKey: KeySignatureTypeEnum
    variant?: 'inline' | 'toolbar'
    disabled?: boolean
  }>(),
  {
    variant: 'toolbar',
    disabled: false
  }
)

const emit = defineEmits<{
  transpose: [payload: { toKey: KeySignatureTypeEnum }]
}>()

const activePanel = ref(false)
const toKey = ref(props.currentKey)

watch(
  () => props.currentKey,
  (key) => {
    toKey.value = key
  }
)

function togglePanel() {
  if (props.disabled) return
  if (!activePanel.value) {
    toKey.value = props.currentKey
  }
  activePanel.value = !activePanel.value
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-transpose__adjuster')) {
    activePanel.value = false
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

function onApply() {
  if (props.disabled) return
  if (toKey.value === props.currentKey) return
  emit('transpose', { toKey: toKey.value })
  activePanel.value = false
}
</script>

<template>
  <div
    class="score-transpose__adjuster"
    :class="{
      'score-transpose__adjuster--inline': variant === 'inline',
      'score-transpose__adjuster--toolbar': variant === 'toolbar'
    }"
  >
    <template v-if="variant === 'toolbar'">
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--stable"
        :disabled="disabled"
        @click="togglePanel"
      >
        {{ t('editor.toolbar.transpose') }}
      </button>
      <div v-if="activePanel" class="score-toolbar__popup score-transpose__popup" @pointerdown.stop>
        <div class="score-transpose__field">
          <span class="score-transpose__field-label">{{ t('editor.toolbar.targetKey') }}</span>
          <select v-model="toKey" class="score-transpose__select" :disabled="disabled">
            <option v-for="key in SCORE_KEY_SIGNATURE_OPTIONS" :key="`to-${key}`" :value="key">
              {{ resolveKeySignatureLabel(key) }}
            </option>
          </select>
        </div>
        <button
          type="button"
          class="score-transpose__apply"
          :disabled="disabled || toKey === currentKey"
          @click="onApply"
        >
          {{ t('editor.toolbar.applyTranspose') }}
        </button>
      </div>
    </template>

    <template v-else>
      <div class="score-transpose__inline">
        <span class="score-transpose__inline-label">{{ t('editor.toolbar.transpose') }}</span>
        <select
          v-model="toKey"
          class="score-transpose__select score-transpose__select--inline"
          :disabled="disabled"
          :title="t('editor.toolbar.targetKey')"
        >
          <option v-for="key in SCORE_KEY_SIGNATURE_OPTIONS" :key="`to-inline-${key}`" :value="key">
            {{ resolveKeySignatureLabel(key) }}
          </option>
        </select>
        <el-button
          class="toolbar-btn"
          size="small"
          :disabled="disabled || toKey === currentKey"
          @click="onApply"
        >
          {{ t('editor.toolbar.applyTranspose') }}
        </el-button>
      </div>
    </template>
  </div>
</template>

<style scoped>
.score-transpose__adjuster--toolbar {
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
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.score-toolbar__btn--stable {
  min-width: 108px;
}

.score-transpose__popup {
  min-width: 200px;
}

.score-transpose__field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.score-transpose__field-label,
.score-transpose__inline-label {
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
}

.score-transpose__select {
  width: 100%;
  padding: 6px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 8px;
  background: #fff;
  color: #5c4a6a;
  font-size: 13px;
}

.score-transpose__select--inline {
  min-width: 96px;
  width: auto;
}

.score-transpose__select:focus {
  outline: none;
  border-color: #ff8fba;
}

.score-transpose__select:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.score-transpose__apply {
  padding: 6px 12px;
  border: 1px solid rgba(255, 143, 186, 0.65);
  border-radius: 8px;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.score-transpose__apply:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.score-transpose__inline {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}
</style>
