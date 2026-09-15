<script lang="ts" setup>
import { computed } from 'vue'
import {
  OCTAVE_BLACK_AFTER_WHITE_INDEX,
  OCTAVE_BLACK_KEYS,
  OCTAVE_WHITE_KEYS,
  octaveKeyLabel,
  type OctavePianoKeyState,
  type OctavePianoLabelMode
} from '@renderer/constant/absolutePitchTest'

defineOptions({ name: 'OctavePiano' })

const props = withDefaults(
  defineProps<{
    /** 琴键状态覆盖（按 num 合并） */
    keyStates?: OctavePianoKeyState[]
    /** 文本类型：音名 / 唱名 / 数字；none 时不显示文本 */
    labelMode?: OctavePianoLabelMode | 'none'
    width?: string | number
    height?: string | number
    disabled?: boolean
  }>(),
  {
    keyStates: () => [],
    labelMode: 'noteName',
    width: '100%',
    height: '160px',
    disabled: false
  }
)

const emit = defineEmits<{
  select: [num: number]
}>()

const stateMap = computed(() => {
  const map = new Map<number, OctavePianoKeyState>()
  for (const item of props.keyStates ?? []) {
    map.set(item.num, item)
  }
  return map
})

const rootStyle = computed(() => ({
  width: typeof props.width === 'number' ? `${props.width}px` : props.width,
  height: typeof props.height === 'number' ? `${props.height}px` : props.height
}))

function isBlack(num: number) {
  return OCTAVE_BLACK_KEYS.includes(num as (typeof OCTAVE_BLACK_KEYS)[number])
}

function keyStyle(num: number) {
  const state = stateMap.value.get(num)
  const black = isBlack(num)
  return {
    color: state?.color ?? (black ? '#f8fafc' : '#5c4a6a'),
    borderColor: state?.border ?? (black ? '#111827' : '#ffffff')
  }
}

function keyLabel(num: number) {
  if (props.labelMode === 'none') return ''
  return octaveKeyLabel(num, props.labelMode)
}

function onSelect(num: number) {
  if (props.disabled) return
  emit('select', num)
}

const blackKeys = computed(() =>
  OCTAVE_BLACK_KEYS.map((num) => ({
    num,
    afterWhiteIndex: OCTAVE_BLACK_AFTER_WHITE_INDEX[num] ?? 0
  }))
)
</script>

<template>
  <div class="octave-piano" :class="{ 'octave-piano--disabled': disabled }" :style="rootStyle">
    <div class="octave-piano__whites">
      <button
        v-for="num in OCTAVE_WHITE_KEYS"
        :key="`w-${num}`"
        type="button"
        class="octave-piano__key octave-piano__key--white"
        :style="keyStyle(num)"
        :disabled="disabled"
        @click="onSelect(num)"
      >
        <span class="octave-piano__label">{{ keyLabel(num) }}</span>
      </button>
    </div>

    <div class="octave-piano__blacks" aria-hidden="false">
      <button
        v-for="item in blackKeys"
        :key="`b-${item.num}`"
        type="button"
        class="octave-piano__key octave-piano__key--black"
        :style="{
          ...keyStyle(item.num),
          left: `calc((100% / 7) * ${item.afterWhiteIndex + 1} - (100% / 7) * 0.32)`
        }"
        :disabled="disabled"
        @click="onSelect(item.num)"
      >
        <span class="octave-piano__label">{{ keyLabel(item.num) }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
.octave-piano {
  position: relative;
  box-sizing: border-box;
  user-select: none;
}

.octave-piano--disabled {
  opacity: 0.92;
}

.octave-piano__whites {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  height: 100%;
  gap: 2px;
}

.octave-piano__blacks {
  position: absolute;
  inset: 0 0 auto 0;
  height: 62%;
  pointer-events: none;
}

.octave-piano__key {
  box-sizing: border-box;
  border-style: solid;
  border-width: 2px;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding-bottom: 8px;
  cursor: pointer;
  font-weight: 700;
}

.octave-piano__key:disabled {
  cursor: default;
}

.octave-piano__key--white {
  position: relative;
  z-index: 1;
  height: 100%;
  border-radius: 0 0 8px 8px;
  background: linear-gradient(180deg, #ffffff 0%, #f3f4f6 100%);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.08);
}

.octave-piano__key--black {
  position: absolute;
  top: 0;
  z-index: 2;
  width: calc(100% / 7 * 0.64);
  height: 100%;
  pointer-events: auto;
  border-radius: 0 0 6px 6px;
  background: linear-gradient(180deg, #374151 0%, #111827 100%);
  box-shadow: 0 2px 0 rgba(0, 0, 0, 0.35);
}

.octave-piano__label {
  font-size: clamp(10px, 1.8vw, 13px);
  line-height: 1;
  pointer-events: none;
}

.octave-piano__key--black .octave-piano__label {
  padding-bottom: 2px;
  font-size: clamp(9px, 1.5vw, 11px);
}
</style>
