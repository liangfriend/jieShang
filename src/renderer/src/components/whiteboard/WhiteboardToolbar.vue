<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import VerticalDragSlider from '@renderer/components/VerticalDragSlider.vue'
import { KeySignatureTypeEnum } from '@deciphony/renderer'
import {
  WHITEBOARD_CLEF_OPTIONS,
  WHITEBOARD_KEY_COUNT_OPTIONS,
  WHITEBOARD_KEY_HEIGHT_MAX,
  WHITEBOARD_KEY_HEIGHT_MIN,
  WHITEBOARD_NOTE_BPM_MAX,
  WHITEBOARD_NOTE_BPM_MIN,
  WHITEBOARD_PITCH_NOTATION_OPTIONS,
  WHITEBOARD_STAFF_MODE_OPTIONS,
  WHITEBOARD_WHITE_KEY_WIDTH_MAX,
  WHITEBOARD_WHITE_KEY_WIDTH_MIN,
  WHITEBOARD_WIDTH_TYPE_OPTIONS,
  resolveWhiteboardClefLabel,
  resolveWhiteboardKeyCountLabel,
  resolveWhiteboardKeySignatureLabel,
  resolveWhiteboardPitchNotationLabel,
  resolveWhiteboardStaffModeLabel,
  resolveWhiteboardWidthTypeLabel,
  type WhiteboardClef,
  type WhiteboardKeyCount,
  type WhiteboardPitchNotation,
  type WhiteboardStaffMode,
  type WhiteboardWidthType
} from '@renderer/constant/whiteboard'
import {
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN
} from '@renderer/constant/play'
import { usePlayStore } from '@renderer/store/play.store'
import { useWhiteboardStore } from '@renderer/store/whiteboard.store'
import ScoreToneColorAdjuster from '@renderer/components/score-toolbar/ScoreToneColorAdjuster.vue'
import CircleOfFifthsPanel from './CircleOfFifthsPanel.vue'
import PcKeyboardShortcut from '../score-toolbar/PcKeyboardShortcut.vue'
import '../score-toolbar/score-toolbar.css'

type ActivePanel =
  | 'keyCount'
  | 'keyHeight'
  | 'widthType'
  | 'whiteKeyWidth'
  | 'pitchNotation'
  | 'volume'
  | 'staffMode'
  | 'targetClef'
  | 'noteBpm'
  | null

const emit = defineEmits<{
  clearNotes: []
  changeKeySignature: [KeySignatureTypeEnum]
}>()

const { t } = useI18n()

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
  autoClearEnabled,
  targetClef,
  staffMode,
  noteInputBpm,
  keySignature,
  isCustomWidth
} = storeToRefs(whiteboardStore)

const { volume } = storeToRefs(playStore)

const activePanel = ref<ActivePanel>(null)
const circleOfFifthsOpen = ref(false)
const keySignatureBtnRef = ref<HTMLButtonElement | null>(null)

const keyCountLabel = computed(() => resolveWhiteboardKeyCountLabel(keyCount.value))
const widthTypeLabel = computed(() => resolveWhiteboardWidthTypeLabel(widthType.value))
const pitchNotationLabel = computed(() => resolveWhiteboardPitchNotationLabel(pitchNotation.value))
const volumeLabel = computed(() => `${Math.round(volume.value * 100)}%`)
const targetClefLabel = computed(() => resolveWhiteboardClefLabel(targetClef.value))
const staffModeLabel = computed(() => resolveWhiteboardStaffModeLabel(staffMode.value))
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

function onStaffModeChange(event: Event) {
  const value = (event.target as HTMLSelectElement).value as WhiteboardStaffMode
  whiteboardStore.setStaffMode(value)
}

function onKeySignatureSelect(value: KeySignatureTypeEnum) {
  if (value === keySignature.value) return
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
          {{ t('whiteboard.toolbar.keys') }} {{ keyCountLabel }}
        </button>
        <div v-if="activePanel === 'keyCount'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">{{ t('whiteboard.toolbar.keyCount') }}</span>
            <select class="whiteboard-toolbar__select" :value="keyCount" @change="onKeyCountChange">
              <option v-for="item in WHITEBOARD_KEY_COUNT_OPTIONS" :key="item.value" :value="item.value">
                {{ resolveWhiteboardKeyCountLabel(item.value) }}
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
          {{ t('whiteboard.toolbar.height') }} {{ formatPx(keyHeight) }}
        </button>
        <div v-if="activePanel === 'keyHeight'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatPx"
            :label="t('whiteboard.toolbar.keyHeight')"
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
          {{ t('whiteboard.toolbar.width') }} {{ widthTypeLabel }}
        </button>
        <div v-if="activePanel === 'widthType'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">{{ t('whiteboard.toolbar.widthType') }}</span>
            <select class="whiteboard-toolbar__select" :value="widthType" @change="onWidthTypeChange">
              <option v-for="item in WHITEBOARD_WIDTH_TYPE_OPTIONS" :key="item.value" :value="item.value">
                {{ resolveWhiteboardWidthTypeLabel(item.value) }}
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
          {{ t('whiteboard.toolbar.whiteKeyWidthShort') }} {{ formatPx(whiteKeyWidth) }}
        </button>
        <div v-if="activePanel === 'whiteKeyWidth' && isCustomWidth" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatPx"
            :label="t('whiteboard.toolbar.whiteKeyWidth')"
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
          {{ t('whiteboard.toolbar.pitchName') }} {{ pitchNotationLabel }}
        </button>
        <div v-if="activePanel === 'pitchNotation'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">{{ t('whiteboard.toolbar.pitchNotation') }}</span>
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
                {{ resolveWhiteboardPitchNotationLabel(item.value) }}
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
          {{ t('whiteboard.toolbar.volume') }} {{ volumeLabel }}
        </button>
        <div v-if="activePanel === 'volume'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatVolume"
            :label="t('whiteboard.toolbar.volume')"
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
        {{ t('whiteboard.toolbar.group') }}
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': chordBoxEnabled }"
        @click="whiteboardStore.toggleChordBox()"
      >
        {{ t('whiteboard.toolbar.chordSlider') }}
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': intervalRulerEnabled }"
        @click="whiteboardStore.toggleIntervalRuler()"
      >
        {{ t('whiteboard.toolbar.intervalSlider') }}
      </button>

      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': addNoteEnabled }"
        @click="whiteboardStore.toggleAddNote()"
      >
        {{ t('whiteboard.toolbar.addNote') }}
      </button>

      <button
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--active': autoClearEnabled }"
        @click="whiteboardStore.toggleAutoClear()"
      >
        {{ t('whiteboard.toolbar.autoClear') }}
      </button>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          @click="togglePanel('staffMode')"
        >
          {{ t('whiteboard.toolbar.staffMode') }} {{ staffModeLabel }}
        </button>
        <div v-if="activePanel === 'staffMode'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">{{ t('whiteboard.toolbar.staffMode') }}</span>
            <select class="whiteboard-toolbar__select" :value="staffMode" @change="onStaffModeChange">
              <option v-for="mode in WHITEBOARD_STAFF_MODE_OPTIONS" :key="mode" :value="mode">
                {{ resolveWhiteboardStaffModeLabel(mode) }}
              </option>
            </select>
          </div>
        </div>
      </div>

      <div class="score-toolbar__adjuster">
        <button
          type="button"
          class="score-toolbar__btn whiteboard-toolbar__btn--stable"
          :disabled="staffMode !== 'triple'"
          @click="togglePanel('targetClef')"
        >
          {{ t('whiteboard.toolbar.clef') }} {{ targetClefLabel }}
        </button>
        <div v-if="activePanel === 'targetClef'" class="score-toolbar__popup" @pointerdown.stop>
          <div class="whiteboard-toolbar__field">
            <span class="whiteboard-toolbar__field-label">{{ t('whiteboard.toolbar.targetClef') }}</span>
            <select class="whiteboard-toolbar__select" :value="targetClef" @change="onTargetClefChange">
              <option v-for="item in WHITEBOARD_CLEF_OPTIONS" :key="item.value" :value="item.value">
                {{ resolveWhiteboardClefLabel(item.value) }}
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
          {{ t('whiteboard.toolbar.bpm') }} {{ formatBpm(noteInputBpm) }}
        </button>
        <div v-if="activePanel === 'noteBpm'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatBpm"
            :label="t('whiteboard.toolbar.noteBpm')"
            :max="WHITEBOARD_NOTE_BPM_MAX"
            :min="WHITEBOARD_NOTE_BPM_MIN"
            :model-value="noteInputBpm"
            :step="1"
            @update:model-value="whiteboardStore.setNoteInputBpm"
          />
        </div>
      </div>

      <button
        ref="keySignatureBtnRef"
        type="button"
        class="score-toolbar__btn whiteboard-toolbar__btn--stable"
        :class="{ 'score-toolbar__btn--active': circleOfFifthsOpen }"
        @click="circleOfFifthsOpen = !circleOfFifthsOpen"
      >
        {{ t('whiteboard.toolbar.keySignature') }} {{ keySignatureLabel }}
      </button>
      <CircleOfFifthsPanel
        v-if="circleOfFifthsOpen"
        :anchor="keySignatureBtnRef"
        :model-value="keySignature"
        @update:model-value="onKeySignatureSelect"
        @close="circleOfFifthsOpen = false"
      />
      <PcKeyboardShortcut />

      <button type="button" class="score-toolbar__btn" @click="onClearNotes">
        {{ t('whiteboard.toolbar.clearNotes') }}
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
