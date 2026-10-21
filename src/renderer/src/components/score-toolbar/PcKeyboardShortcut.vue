<script setup lang="ts">
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import FloatingPanel from '../FloatingPanel.vue'
import DsKeyboard from '../ds-keyboard/DsKeyboard.vue'
import { KeyCodeEnum } from '@renderer/types/enum'
import { usePcKeyboardStore } from '@renderer/store/pcKeyboard.store'
import {
  PC_KEY_NOTES,
  PC_KEYBOARD_OCTAVE_MAX,
  PC_KEYBOARD_OCTAVE_MIN,
  pcKeyLabelHtml,
  type PcKeyboardSide
} from '@renderer/utils/pcKeyboardPiano'
import { usePcKeyboardPiano } from '@renderer/utils/usePcKeyboardPiano'
import './score-toolbar.css'

/** 工具栏「快捷键」按钮：页面挂载期间电脑键盘即可弹琴，按钮只负责显示键位弹窗 */
const { t } = useI18n()

const settings = usePcKeyboardStore()
const { letterOctave, numpadOctave } = storeToRefs(settings)
const { activeCodes, shiftHeld } = usePcKeyboardPiano()

const open = ref(false)
const buttonRef = ref<HTMLButtonElement | null>(null)

function sideOctave(side: PcKeyboardSide) {
  return side === 'letter' ? letterOctave.value : numpadOctave.value
}

const keyConfig = computed(() =>
  [...PC_KEY_NOTES].map(([code, note]) => ({
    code: code as KeyCodeEnum,
    showText: pcKeyLabelHtml(note, sideOctave(note.side), shiftHeld.value)
  }))
)

const octaveForms = computed(() => [
  {
    side: 'letter' as const,
    label: t('pcKeyboard.letterOctave'),
    value: letterOctave.value,
    hint: t('pcKeyboard.letterHint', { note: `C${4 + letterOctave.value}` }),
    set: settings.setLetterOctave
  },
  {
    side: 'numpad' as const,
    label: t('pcKeyboard.numpadOctave'),
    value: numpadOctave.value,
    hint: t('pcKeyboard.numpadHint', { note: `C${4 + numpadOctave.value}` }),
    set: settings.setNumpadOctave
  }
])

function formatOctave(value: number) {
  return value > 0 ? `+${value}` : String(value)
}
</script>

<template>
  <button
    ref="buttonRef"
    type="button"
    class="score-toolbar__btn"
    :class="{ 'score-toolbar__btn--active': open }"
    @click="open = !open"
  >
    {{ t('pcKeyboard.button') }}
  </button>
  <FloatingPanel
    v-if="open"
    :title="t('pcKeyboard.title')"
    position-key="pcKeyboard"
    :anchor="buttonRef"
    @close="open = false"
  >
    <DsKeyboard
      class="pc-keyboard__keys"
      width="900px"
      height="250px"
      :active-codes="activeCodes"
      :config="keyConfig"
    />
    <div class="pc-keyboard__forms">
      <div v-for="form in octaveForms" :key="form.side" class="pc-keyboard__form">
        <span class="pc-keyboard__label">{{ form.label }}</span>
        <div class="pc-keyboard__stepper">
          <button
            type="button"
            :disabled="form.value <= PC_KEYBOARD_OCTAVE_MIN"
            @click="form.set(form.value - 1)"
          >
            −
          </button>
          <span class="pc-keyboard__value">{{ formatOctave(form.value) }}</span>
          <button
            type="button"
            :disabled="form.value >= PC_KEYBOARD_OCTAVE_MAX"
            @click="form.set(form.value + 1)"
          >
            +
          </button>
        </div>
        <span class="pc-keyboard__hint">{{ form.hint }}</span>
      </div>
    </div>
    <p class="pc-keyboard__tip">{{ t('pcKeyboard.tip') }}</p>
  </FloatingPanel>
</template>

<style scoped>
.pc-keyboard__keys :deep(.pc-key) {
  position: relative;
  display: inline-block;
  color: #5c4a6a;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 15px;
  font-weight: 700;
  line-height: 1;
}

.pc-keyboard__keys :deep(.pc-key--out) {
  opacity: 0.3;
}

.pc-keyboard__keys :deep(.pc-key__sharp) {
  margin-right: 1px;
  font-size: 10px;
  vertical-align: top;
}

.pc-keyboard__keys :deep(.pc-key__dots) {
  position: absolute;
  left: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1px;
  transform: translateX(-50%);
}

.pc-keyboard__keys :deep(.pc-key__dots:first-child) {
  bottom: 100%;
  margin-bottom: 1px;
}

.pc-keyboard__keys :deep(.pc-key__dots:last-child) {
  top: 100%;
  margin-top: 1px;
}

.pc-keyboard__keys :deep(.pc-key__dots i) {
  display: block;
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: currentColor;
}

.pc-keyboard__forms {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin-top: 12px;
}

.pc-keyboard__form {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 12px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 12px;
  background: #fff;
}

.pc-keyboard__label {
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
}

.pc-keyboard__stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}

.pc-keyboard__stepper button {
  width: 26px;
  height: 26px;
  padding: 0;
  border: 1px solid rgba(201, 184, 255, 0.75);
  border-radius: 8px;
  background: rgba(246, 239, 255, 0.9);
  color: #5c4a6a;
  font-size: 16px;
  line-height: 24px;
  cursor: pointer;
}

.pc-keyboard__stepper button:hover:not(:disabled) {
  background: rgba(201, 184, 255, 0.4);
}

.pc-keyboard__stepper button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.pc-keyboard__value {
  min-width: 26px;
  text-align: center;
  font-size: 14px;
  font-weight: 700;
  color: #2f6b45;
  font-variant-numeric: tabular-nums;
}

.pc-keyboard__hint {
  font-size: 12px;
  color: #8a7699;
}

.pc-keyboard__tip {
  margin: 10px 0 0;
  font-size: 12px;
  color: #8a7699;
}
</style>
