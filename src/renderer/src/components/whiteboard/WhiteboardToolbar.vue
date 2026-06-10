<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import VerticalDragSlider from '@renderer/components/VerticalDragSlider.vue'
import { KeySignatureTypeEnum } from 'deciphony-renderer'
import {
  WHITEBOARD_CLEF_OPTIONS,
  WHITEBOARD_KEY_COUNT_OPTIONS,
  WHITEBOARD_KEY_HEIGHT_MAX,
  WHITEBOARD_KEY_HEIGHT_MIN,
  WHITEBOARD_KEY_SIGNATURE_OPTIONS,
  WHITEBOARD_NOTE_BPM_MAX,
  WHITEBOARD_NOTE_BPM_MIN,
  WHITEBOARD_PITCH_NOTATION_OPTIONS,
  WHITEBOARD_WHITE_KEY_WIDTH_MAX,
  WHITEBOARD_WHITE_KEY_WIDTH_MIN,
  WHITEBOARD_WIDTH_TYPE_OPTIONS,
  resolveWhiteboardClefLabel,
  resolveWhiteboardKeyCountLabel,
  resolveWhiteboardKeySignatureLabel,
  resolveWhiteboardPitchNotationLabel,
  resolveWhiteboardWidthTypeLabel,
  type WhiteboardClef,
  type WhiteboardKeyCount,
  type WhiteboardPitchNotation,
  type WhiteboardWidthType
} from '@renderer/constant/whiteboard'
import {
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN
} from '@renderer/constant/play'
import { usePlayStore } from '@renderer/store/play.store'
import { useWhiteboardStore } from '@renderer/store/whiteboard.store'
import ScoreToneColorAdjuster from '@renderer/components/score-toolbar/ScoreToneColorAdjuster.vue'
import '../score-toolbar/score-toolbar.css'

type ActivePanel =
  | 'keyCount'
  | 'keyHeight'
  | 'widthType'
  | 'whiteKeyWidth'
  | 'pitchNotation'
  | 'volume'
  | 'targetClef'
  | 'noteBpm'
  | 'keySignature'
  | null

const emit = defineEmits<{
  clearNotes: []
  changeKeySignature: [KeySignatureTypeEnum]
}>()

const whiteboardStore = useWhiteboardStore()
const playStore = usePlayStore()

const {
  keyCount,
  keyHeight,
  widthType,
  whiteKeyWidth,
  pitchNotation,
  groupEnabled,
  chordBoxEnabled,
  intervalRulerEnabled,
  addNoteEnabled,
  targetClef,
  noteInputBpm,
  keySignature,
  isCustomWidth
} = storeToRefs(whiteboardStore)

const { volume } = storeToRefs(playStore)

const activePanel = ref<ActivePanel>(null)

const keyCountLabel = computed(() => resolveWhiteboardKeyCountLabel(keyCount.value))
const widthTypeLabel = computed(() => resolveWhiteboardWidthTypeLabel(widthType.value))
const pitchNotationLabel = computed(() => resolveWhiteboardPitchNotationLabel(pitchNotation.value))
const volumeLabel = computed(() => `${Math.round(volume.value * 100)}%`)
const targetClefLabel = computed(() => resolveWhiteboardClefLabel(targetClef.value))
const keySignatureLabel = computed(() => resolveWhiteboardKeySignatureLabel(keySignature.value))

function togglePanel(panel: Exclude<ActivePanel, null>) {
  activePanel.value = activePanel.value === panel ? null : panel
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-toolbar__adjuster')) {
    activePanel.value = null
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
})

function onKeyCountChange(event: Event) {
  const value = Number((event.target as HTMLSelectElement).value) as WhiteboardKeyCount
  whiteboardStore.setKeyCount(value)
}

function onWidthTypeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as WhiteboardWidthType
  whiteboardStore.setWidthType(value)
}

function onPitchNotationChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as WhiteboardPitchNotation
  whiteboardStore.setPitchNotation(value)
}

function onTargetClefChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as WhiteboardClef
  whiteboardStore.setTargetClef(value)
}

function onKeySignatureChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as KeySignatureTypeEnum
  whiteboardStore.setKeySignature(value)
  emit('changeKeySignature', value)
}

function onClearNotes() {
  emit('clearNotes')
}

function formatPx(value: number) {
  return `${Math.round(value)}px`
}

function formatVolume(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatBpm(value: number) {
  return `${Math.round(value)}`
}
</script>

<template>
  <footer class="score-toolbar whiteboard-toolbar">
    <div class="whiteboard-toolbar__side">
      <BackButton fallback="/" />
    </div>

    <div class="whiteboard-toolbar__main">
      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('keyCount')">
          琴键 {{ keyCountLabel }}
        </button>
        <div v-if="activePanel === 'keyCount'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">琴键数量</span>
            <select class="whiteboard-toolbar__select" :value="keyCount" @change="onKeyCountChange">
              <option v-for="item in WHITEBOARD_KEY_COUNT_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('keyHeight')"
        >
          高度 {{ formatPx(keyHeight) }}
        </button>
        <div v-if="activePanel === 'keyHeight'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatPx"
            label="琴键高度"
            :max="WHITEBOARD_KEY_HEIGHT_MAX"
            :min="WHITEBOARD_KEY_HEIGHT_MIN"
            :model-value="keyHeight"
            :step="4"
            @update:model-value="whiteboardStore.setKeyHeight"
          />
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('widthType')">
          宽度 {{ widthTypeLabel }}
        </button>
        <div v-if="activePanel === 'widthType'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">宽度类型</span>
            <select class="whiteboard-toolbar__select" :value="widthType" @change="onWidthTypeChange">
              <option v-for="item in WHITEBOARD_WIDTH_TYPE_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          :disabled="!isCustomWidth"
          @click="togglePanel('whiteKeyWidth')"
        >
          白键宽 {{ formatPx(whiteKeyWidth) }}
        </button>
        <div v-if="activePanel === 'whiteKeyWidth' && isCustomWidth" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatPx"
            label="白键宽度"
            :max="WHITEBOARD_WHITE_KEY_WIDTH_MAX"
            :min="WHITEBOARD_WHITE_KEY_WIDTH_MIN"
            :model-value="whiteKeyWidth"
            :step="1"
            @update:model-value="whiteboardStore.setWhiteKeyWidth"
          />
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('pitchNotation')"
        >
          音名 {{ pitchNotationLabel }}
        </button>
        <div v-if="activePanel === 'pitchNotation'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">音名显示</span>
            <select
              class="whiteboard-toolbar__select"
              :value="pitchNotation"
              @change="onPitchNotationChange"
            >
              <option
                v-for="item in WHITEBOARD_PITCH_NOTATION_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <ScoreToneColorAdjuster />

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('volume')"
        >
          音量 {{ volumeLabel }}
        </button>
        <div v-if="activePanel === 'volume'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatVolume"
            label="音量"
            :max="PLAY_VOLUME_MAX"
            :min="PLAY_VOLUME_MIN"
            :model-value="volume"
            :step="0.01"
            @update:model-value="playStore.setVolume"
          />
        </div>
      </div>

      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': groupEnabled }"
        @click="whiteboardStore.toggleGroup()"
      >
        分组
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': chordBoxEnabled }"
        @click="whiteboardStore.toggleChordBox()"
      >
        和弦滑块
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': intervalRulerEnabled }"
        @click="whiteboardStore.toggleIntervalRuler()"
      >
        音程尺
      </button>

      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': addNoteEnabled }"
        @click="whiteboardStore.toggleAddNote()"
      >
        添加音符
      </button>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('targetClef')"
        >
          谱号 {{ targetClefLabel }}
        </button>
        <div v-if="activePanel === 'targetClef'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">添加到谱号</span>
            <select class="whiteboard-toolbar__select" :value="targetClef" @change="onTargetClefChange">
              <option v-for="item in WHITEBOARD_CLEF_OPTIONS" :key="item.value" :value="item.value">
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('noteBpm')"
        >
          BPM {{ formatBpm(noteInputBpm) }}
        </button>
        <div v-if="activePanel === 'noteBpm'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatBpm"
            label="时值 BPM"
            :max="WHITEBOARD_NOTE_BPM_MAX"
            :min="WHITEBOARD_NOTE_BPM_MIN"
            :model-value="noteInputBpm"
            :step="1"
            @update:model-value="whiteboardStore.setNoteInputBpm"
          />
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('keySignature')"
        >
          调号 {{ keySignatureLabel }}
        </button>
        <div v-if="activePanel === 'keySignature'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">调号</span>
            <select
              class="whiteboard-toolbar__select"
              :value="keySignature"
              @change="onKeySignatureChange"
            >
              <option
                v-for="item in WHITEBOARD_KEY_SIGNATURE_OPTIONS"
                :key="item.value"
                :value="item.value"
              >
                {{ item.label }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <button type="button" class="score-toolbar__btn" @click="onClearNotes">
        清空音符
      </button>
    </div>
  </footer>
</template>

<style scoped>
.whiteboard-toolbar {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 72px;
  padding: 12px 16px calc(12px + env(safe-area-inset-bottom, 0px));
}

.whiteboard-toolbar__side {
  flex-shrink: 0;
  align-self: center;
}

.whiteboard-toolbar__main {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.score-toolbar__adjuster {
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

.score-toolbar__btn--active {
  border-color: rgba(123, 201, 150, 0.75);
  background: linear-gradient(90deg, rgba(200, 240, 208, 0.65), rgba(167, 224, 186, 0.55));
}

.whiteboard-toolbar__btn--stable {
  min-width: 124px;
  box-sizing: border-box;
  justify-content: center;
  font-variant-numeric: tabular-nums;
}

.whiteboard-toolbar__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 120px;
}

.whiteboard-toolbar__field-label {
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
}

.whiteboard-toolbar__select {
  width: 100%;
  padding: 8px 10px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.92);
  color: #5c4a6a;
  font-size: 13px;
  font-weight: 600;
  outline: none;
}

.whiteboard-toolbar__select:focus {
  border-color: rgba(155, 127, 214, 0.85);
  box-shadow: 0 0 0 2px rgba(201, 184, 255, 0.25);
}
</style>
