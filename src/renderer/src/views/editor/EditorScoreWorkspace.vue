<script lang="ts" setup>
import musicScoreVue from '@deciphony/renderer'
import { MusicScoreTypeEnum, type MusicScore, type VDom } from '@deciphony/renderer'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useBoxSelect } from '@renderer/views/editor/editHelper/useBoxSelect'
import { deleteMultiSelected } from '@renderer/views/editor/editHelper/renderEditMultiSelect'
import type { MusicScoreComponentExpose } from '@renderer/views/editor/editHelper/useRenderEdit'
import {
  AddNoteStatePanel,
  AddNumberStatePanel,
  EditContextMenu,
  EditSlotGdButtons,
  EditSlotSdButtons,
  GhostNotePreview,
  GhostNumberPreview,
  HorizontalDragHandles,
  MoveDragHandle,
  PropertyPanel,
  SlurDragHandles,
  VerticalDragHandles,
  VoltaDragHandles,
  useRenderEdit
} from '@renderer/views/editor/editHelper'
import AddTabStatePanel from '@renderer/views/editor/editHelper/tab/components/AddTabStatePanel.vue'
import GhostTabPreview from '@renderer/views/editor/editHelper/tab/components/GhostTabPreview.vue'
import AddDrumStatePanel from '@renderer/views/editor/editHelper/drumNotation/components/AddDrumStatePanel.vue'
import GhostDrumPreview from '@renderer/views/editor/editHelper/drumNotation/components/GhostDrumPreview.vue'
import { tabStringCount } from '@deciphony/extensions/dr-edit'
import { isTabNotationType } from '@renderer/utils/isTabNotation'
import type { AddNoteState } from '@renderer/views/editor/editHelper/renderEditAddNoteState'
import {
  OCTAVE_DOT_PRESET_VALUES,
  type AddNumberState
} from '@renderer/views/editor/editHelper/numberNotation/renderEditNumberAddState'
import type { AddTabState } from '@renderer/views/editor/editHelper/tab/renderEditTabAddState'
import type { AddDrumState } from '@renderer/views/editor/editHelper/drumNotation/renderEditDrumAddState'
import {
  addGrandStaffFromSelected,
  addSingleStaffFromSelected,
  appendDrumNoteToSelectedMeasure,
  appendNumberNoteToSelectedMeasure,
  chronaxieForDigit,
  drumAcceptsChronaxie,
  insertMeasureAfterSelected,
  toggleDrumRestKind,
  toggleNoteRestKind,
  toggleTabRestKind
} from '@renderer/views/editor/editHelper/renderEditKeyboardShortcuts'
import { findDrumLegalNoteByShortcut } from '@renderer/utils/drumLegalNotes'
import { TitleSlot } from '@deciphony/extensions/dr-title'
import { LyricsSlot } from '@deciphony/extensions/dr-lyrics'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useMidiStore } from '@renderer/store/midi.store'
import StaffToneColorDialog from '@renderer/views/editor/StaffToneColorDialog.vue'
import { provideEditorSkinPack } from '@renderer/views/editor/editHelper/editorSkin'

const musicScoreData = defineModel<MusicScore>({ required: true })

withDefaults(
  defineProps<{
    /** 显示小节/谱表结构按钮与歌词区；关闭后隐藏控件，插槽高度保留 */
    structureEditEnabled?: boolean
  }>(),
  {
    structureEditEnabled: true
  }
)

const musicScoreRef = ref<MusicScoreComponentExpose | null>(null)
const isNumberNotation = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.NumberNotation
)
const isTabNotation = computed(() => isTabNotationType(musicScoreData.value.type))
const isDrumNotation = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.DrumNotation
)
const tabStrings = computed(() => tabStringCount(musicScoreData.value.type))
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()
provideEditorSkinPack(() =>
  scoreSkinName.value ? scoreSkin.value?.[scoreSkinName.value] : undefined
)
const {
  extensions: scoreExtensions,
  slotProps: lyricsSlotProps,
  slotConfig: scoreSlotConfig,
  titlePadding,
  titleFontFamily
} = createScoreLyricsExtension('edit', musicScoreData)

const {
  scoreRootRef,
  selectedItem,
  addNoteState,
  addTabState,
  addDrumState,
  activeGhostPreview,
  propertyPanelKind,
  isMeasureSelected,
  slurHandlePoints,
  voltaHandlePoints,
  arpeggioHandlePoints,
  strummingHandlePoints,
  pedalHandlePoints,
  pitchHandlePoints,
  lineHandlePoints,
  noteAffiliatedBox,
  relatedMeasureIds,
  handleDrClick,
  handleDrEnter,
  handleDrLeave,
  handleDrDown,
  handleDrUp,
  handleSlurHandleDown,
  handleVoltaHandleDown,
  handleArpeggioHandleDown,
  handleStrummingHandleDown,
  handlePedalHandleDown,
  handlePitchHandleDown,
  handleLineHandleDown,
  handleNoteAffiliatedHandleDown,
  handleTopMove,
  handleTopUp,
  handleDrContextMenu,
  handleTopContextMenu,
  handleRenderMusicScore,
  deleteSelected,
  navigateSelectedMeasure,
  addMidiNote,
  clearSelection,
  contextMenuState,
  closeContextMenu,
  toneColorStaff
} = useRenderEdit(musicScoreData, { musicScoreRef })

const boxSelect = useBoxSelect({
  musicScore: musicScoreData,
  scoreRootRef,
  enabled: () =>
    musicScoreData.value.type === MusicScoreTypeEnum.StandardStaff ||
    musicScoreData.value.type === MusicScoreTypeEnum.NumberNotation,
  clearSelection
})
const { multiSelected, boxRect } = boxSelect

watch(selectedItem, (item) => {
  if (item) boxSelect.clearMultiSelected()
})

function onRenderMusicScore(list: VDom[]) {
  handleRenderMusicScore(list)
  boxSelect.handleRender(list)
}

function onTopUp(event: PointerEvent, vDom: VDom | null) {
  if (boxSelect.isPointerUpSuppressed()) return
  handleTopUp(event, vDom)
}

function onDrClick(event: MouseEvent, vDom: VDom) {
  if (boxSelect.isPointerUpSuppressed()) return
  handleDrClick(event, vDom)
}

const midiStore = useMidiStore()

const ARROW_TO_MEASURE_NAV = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right'
} as const

/** 简谱 Q W E R T Y U 依次对应工具栏八度点 -3 … +3（R 为无八度点） */
const NUMBER_OCTAVE_DOT_KEYS = ['Q', 'W', 'E', 'R', 'T', 'Y', 'U']

/** 仅真正的文本输入吞快捷键；radio/checkbox/button 等工具栏控件不吞 */
function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) return false
  if (target.isContentEditable || target.closest('[contenteditable="true"]')) return true
  if (target instanceof HTMLTextAreaElement) return true
  if (target instanceof HTMLSelectElement) return true
  if (target instanceof HTMLInputElement) {
    const type = (target.type || 'text').toLowerCase()
    return ![
      'radio',
      'checkbox',
      'button',
      'submit',
      'reset',
      'file',
      'image',
      'hidden',
      'range',
      'color'
    ].includes(type)
  }
  return false
}

/** 0：切换音符 / 休止符 */
function toggleAddKind() {
  if (isTabNotation.value) {
    addTabState.value = toggleTabRestKind(addTabState.value as AddTabState)
  } else if (isDrumNotation.value) {
    addDrumState.value = toggleDrumRestKind(addDrumState.value as AddDrumState)
  } else {
    addNoteState.value = toggleNoteRestKind(addNoteState.value as AddNoteState | AddNumberState)
  }
}

/** 1–8：切换添加时值 */
function setAddChronaxie(digit: number) {
  const chronaxie = chronaxieForDigit(digit)
  if (chronaxie == null) return
  if (isTabNotation.value) {
    addTabState.value = { ...(addTabState.value as AddTabState), chronaxie }
  } else if (isDrumNotation.value) {
    if (!drumAcceptsChronaxie(chronaxie)) return
    addDrumState.value = { ...(addDrumState.value as AddDrumState), chronaxie }
  } else {
    addNoteState.value = { ...(addNoteState.value as AddNoteState), chronaxie }
  }
}

/**
 * 数字键、字母键与 / * - 快捷键。
 * 简谱主键盘 1–7 / 0 直接录入音符 / 休止符，时值与音符休止符切换走小键盘；其他谱两排数字键都切时值。
 * 鼓谱 a、b、c… 在选中小节末尾录入对应合法音符（按物理键位判断，输入法中文态也生效）。
 */
function handleEditShortcutKey(event: KeyboardEvent): boolean {
  if (event.ctrlKey || event.metaKey || event.altKey) return false
  const score = musicScoreData.value

  const letter = /^Key([A-Z])$/.exec(event.code)?.[1]
  if (letter && isDrumNotation.value) {
    const legal = findDrumLegalNoteByShortcut(letter)
    if (!legal) return false
    return appendDrumNoteToSelectedMeasure(selectedItem.value, legal, addDrumState.value as AddDrumState)
  }
  if (letter && isNumberNotation.value) {
    const index = NUMBER_OCTAVE_DOT_KEYS.indexOf(letter)
    if (index < 0) return false
    addNoteState.value = {
      ...(addNoteState.value as AddNumberState),
      octaveDot: OCTAVE_DOT_PRESET_VALUES[index]!
    }
    return true
  }

  if (event.key === '/') return insertMeasureAfterSelected(selectedItem.value)
  if (event.key === '*') {
    addSingleStaffFromSelected(selectedItem.value, score)
    return true
  }
  if (event.key === '-') {
    addGrandStaffFromSelected(selectedItem.value, score)
    return true
  }

  if (!/^[0-9]$/.test(event.key)) return false
  const digit = Number(event.key)
  const fromNumpad = event.code.startsWith('Numpad')

  if (isNumberNotation.value && !fromNumpad) {
    if (digit > 7) return false
    appendNumberNoteToSelectedMeasure(
      selectedItem.value,
      digit as 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7,
      addNoteState.value as AddNumberState
    )
    return true
  }

  if (digit === 0) toggleAddKind()
  else if (digit <= 8) setAddChronaxie(digit)
  else return false
  return true
}

function onKeyDown(event: KeyboardEvent) {
  if (event.defaultPrevented) return
  if (isEditableTarget(event.target)) return

  if (event.key === 'Escape') {
    if (multiSelected.value.length) {
      boxSelect.clearMultiSelected()
      event.preventDefault()
      event.stopPropagation()
      return
    }
    if (selectedItem.value) {
      clearSelection()
      event.preventDefault()
      event.stopPropagation()
    }
    return
  }

  if (handleEditShortcutKey(event)) {
    event.preventDefault()
    event.stopPropagation()
    return
  }

  const navDir = ARROW_TO_MEASURE_NAV[event.key as keyof typeof ARROW_TO_MEASURE_NAV]
  if (navDir) {
    // 始终拦截方向键，避免焦点在时值/音符类型 radio 上时切换选项
    navigateSelectedMeasure(navDir)
    event.preventDefault()
    event.stopPropagation()
    return
  }

  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (multiSelected.value.length) {
    deleteMultiSelected(musicScoreData.value, multiSelected.value)
    boxSelect.clearMultiSelected()
    event.preventDefault()
    event.stopPropagation()
    return
  }
  if (deleteSelected()) {
    event.preventDefault()
    event.stopPropagation()
  }
}

function onMidiMessage(event: MIDIMessageEvent) {
  const data = event.data
  if (!data || data.length < 2) return
  const command = data[0]! & 0xf0
  const note = data[1]!
  const velocity = data.length > 2 ? data[2]! : 0
  if (command === 0x90 && velocity > 0) {
    addMidiNote(note)
  }
}

onMounted(async () => {
  // capture：整页优先于顶部 radio / 按钮，避免焦点落在工具栏后快捷键失效
  window.addEventListener('keydown', onKeyDown, true)
  await midiStore.init()
  midiStore.addMessageListener(onMidiMessage)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown, true)
  midiStore.removeMessageListener(onMidiMessage)
})

const hasAffiliatedHandles = computed(() =>
  Boolean(
    slurHandlePoints.value ||
      voltaHandlePoints.value ||
      arpeggioHandlePoints.value ||
      strummingHandlePoints.value ||
      pedalHandlePoints.value ||
      pitchHandlePoints.value ||
      lineHandlePoints.value ||
      noteAffiliatedBox.value
  )
)

/** 五线谱/简谱/Tab addNoteState 形态不同，用 computed 桥接 v-model */
const addNoteStateModel = computed<any>({
  get: () => addNoteState.value,
  set: (value) => {
    addNoteState.value = value
  }
})

const addTabStateModel = computed<any>({
  get: () => addTabState.value,
  set: (value) => {
    addTabState.value = value
  }
})

const addDrumStateModel = computed<any>({
  get: () => addDrumState.value,
  set: (value) => {
    addDrumState.value = value
  }
})

defineExpose({ clearSelection, clearMultiSelected: boxSelect.clearMultiSelected })
</script>

<template>
  <header class="editor-top-bar">
    <div class="editor-top-bar__note">
      <AddTabStatePanel
        v-if="isTabNotation"
        v-model="addTabStateModel"
        :string-count="tabStrings"
      />
      <AddDrumStatePanel
        v-else-if="isDrumNotation"
        v-model="addDrumStateModel"
      />
      <AddNumberStatePanel
        v-else-if="isNumberNotation"
        v-model="addNoteStateModel"
      />
      <AddNoteStatePanel v-else v-model="addNoteStateModel" />
    </div>
    <div class="editor-top-bar__actions">
      <slot name="top-actions" />
    </div>
  </header>

  <div class="editor-body">
    <div ref="scoreRootRef" class="score-page__main" @pointerdown="boxSelect.handleAreaDown">
      <div class="score-page__stack">
        <musicScoreVue
          v-if="scoreSkin"
          :key="scoreSkinName"
          ref="musicScoreRef"
          class="score-page__svg"
          :data="musicScoreData"
          :slot-config="scoreSlotConfig"
          :extensions="scoreExtensions"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          @renderMusicScore="onRenderMusicScore"
          @dr-click="onDrClick"
          @dr-down="handleDrDown"
          @dr-enter="handleDrEnter"
          @dr-leave="handleDrLeave"
          @dr-up="handleDrUp"
          @dr-contextmenu="handleDrContextMenu"
          @top-down="boxSelect.handleTopDown"
          @top-move="handleTopMove"
          @top-up="onTopUp"
          @top-contextmenu="handleTopContextMenu"
        >
          <template #t="{ node }">
            <TitleSlot
              mode="edit"
              :music-score="musicScoreData"
              :node="node"
              :padding-left="titlePadding.left"
              :padding-right="titlePadding.right"
              :font-family="titleFontFamily"
            />
          </template>
          <template #g-d="{ node }">
            <!-- 宿主 #g-d 会覆盖扩展默认槽，需手动挂 LyricsSlot，扩展仍负责 slotConfig / vDom -->
            <LyricsSlot
              v-if="structureEditEnabled"
              :music-score="musicScoreData"
              :node="node"
              v-bind="lyricsSlotProps"
            />
            <EditSlotGdButtons v-if="structureEditEnabled" :node="node" />
          </template>
          <template #s-d="{ node }">
            <EditSlotSdButtons
              v-if="structureEditEnabled"
              :disabled="isMeasureSelected"
              :node="node"
            />
          </template>
          <template #m="{ node }">
            <rect
              v-if="selectedItem?.measure?.id === node.slotData?.measure?.id"
              class="measure-selection-frame dr-selected-highlight"
              :height="node.h"
              :width="node.w"
              fill="white"
              fill-opacity="0.01"
              pointer-events="none"
            />
            <rect
              v-else-if="
                node.slotData?.measure?.id
                  && relatedMeasureIds.includes(node.slotData.measure.id)
              "
              class="measure-related-frame dr-related-highlight"
              :height="node.h"
              :width="node.w"
              fill="rgba(103, 194, 58, 0.18)"
              pointer-events="none"
            />
            <GhostTabPreview
              v-if="isTabNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostDrumPreview
              v-else-if="isDrumNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostNumberPreview
              v-else-if="isNumberNotation"
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
            <GhostNotePreview
              v-else
              :measure-id="selectedItem?.measure?.id"
              :node="node"
              :preview="activeGhostPreview as any"
            />
          </template>
        </musicScoreVue>
        <svg
          v-if="hasAffiliatedHandles"
          class="score-page__affiliated-drag-layer"
          :height="musicScoreData.height"
          :viewBox="`0 0 ${musicScoreData.width} ${musicScoreData.height}`"
          :width="musicScoreData.width"
          xmlns="http://www.w3.org/2000/svg"
        >
          <SlurDragHandles
            v-if="slurHandlePoints"
            :handles="slurHandlePoints"
            :vertical-control="isNumberNotation"
            @handle-down="handleSlurHandleDown"
          />
          <VerticalDragHandles
            v-if="arpeggioHandlePoints"
            :handles="arpeggioHandlePoints"
            @handle-down="handleArpeggioHandleDown"
          />
          <VerticalDragHandles
            v-if="strummingHandlePoints"
            :handles="strummingHandlePoints"
            @handle-down="handleStrummingHandleDown"
          />
          <HorizontalDragHandles
            v-if="pedalHandlePoints"
            :handles="pedalHandlePoints"
            @handle-down="handlePedalHandleDown"
          />
          <HorizontalDragHandles
            v-if="pitchHandlePoints"
            :handles="pitchHandlePoints"
            @handle-down="handlePitchHandleDown"
          />
          <HorizontalDragHandles
            v-if="lineHandlePoints"
            :handles="lineHandlePoints"
            @handle-down="handleLineHandleDown"
          />
          <MoveDragHandle
            v-if="noteAffiliatedBox"
            :box="noteAffiliatedBox"
            @handle-down="handleNoteAffiliatedHandleDown"
          />
          <VoltaDragHandles
            v-if="voltaHandlePoints"
            :handles="voltaHandlePoints"
            @handle-down="handleVoltaHandleDown"
          />
        </svg>
        <svg
          v-if="boxRect"
          class="score-page__box-select-layer"
          :height="musicScoreData.height"
          :viewBox="`0 0 ${musicScoreData.width} ${musicScoreData.height}`"
          :width="musicScoreData.width"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect
            class="score-page__box-select-rect"
            :x="boxRect.x"
            :y="boxRect.y"
            :width="boxRect.w"
            :height="boxRect.h"
            rx="2"
          />
        </svg>
      </div>
    </div>

    <PropertyPanel
      :kind="propertyPanelKind"
      :selected="selectedItem"
      :multi-notes="multiSelected"
      @multi-deleted="boxSelect.clearMultiSelected()"
    />

    <EditContextMenu
      v-if="contextMenuState.open && contextMenuState.items.length"
      :x="contextMenuState.x"
      :y="contextMenuState.y"
      :items="contextMenuState.items"
      @close="closeContextMenu"
    />

    <StaffToneColorDialog v-model="toneColorStaff" :music-score="musicScoreData" />
  </div>
</template>

<style scoped>
.editor-top-bar {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px 16px;
  padding: 8px 12px;
  flex-shrink: 0;
  background: var(--ec-card);
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  box-shadow: var(--ec-shadow);
}

.editor-top-bar__note {
  flex: 1 1 0;
  min-width: 0;
}

.editor-top-bar__actions {
  flex: 0 1 520px;
  min-width: 220px;
  max-width: 560px;
}

.editor-top-bar :deep(.add-note-state) {
  padding: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.editor-body {
  display: flex;
  flex: 1;
  min-height: 0;
}

.score-page__main {
  min-width: 0;
  overflow: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  box-sizing: border-box;
}

.score-page__stack {
  position: relative;
}

.score-page__affiliated-drag-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.score-page__affiliated-drag-layer :deep(.slur-drag-handles__square),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__circle),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.slur-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__square),
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__center),
.score-page__affiliated-drag-layer :deep(.vertical-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.vertical-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.horizontal-drag-handles__end),
.score-page__affiliated-drag-layer :deep(.horizontal-drag-handles__middle),
.score-page__affiliated-drag-layer :deep(.move-drag-handle) {
  pointer-events: all;
}

:deep(.dr-hover-highlight) {
  filter: drop-shadow(0 0 3px rgba(64, 158, 255, 0.9)) brightness(1.12);
}

:deep(.dr-selected-highlight) {
  filter: drop-shadow(0 0 4px rgba(255, 152, 0, 0.95)) brightness(1.14);
}

:deep(.dr-selected-highlight[data-tag='noteHead']),
:deep(.dr-selected-highlight[data-tag='noteNumber']),
:deep(.dr-selected-highlight[data-tag='tabNoteNumber']),
:deep(.dr-selected-highlight[data-tag='arpeggio']),
:deep(.dr-selected-highlight[data-tag='strumming']) {
  cursor: ns-resize;
}

:deep(.dr-drum-voice-dim) {
  opacity: 0.3;
}

:deep(.dr-related-highlight) {
  filter: drop-shadow(0 0 4px rgba(103, 194, 58, 0.95)) brightness(1.12);
}

:deep(.dr-multi-selected-highlight) {
  filter: drop-shadow(0 0 1px rgba(124, 77, 255, 1)) drop-shadow(0 0 3px rgba(155, 109, 255, 0.85));
}

.score-page__box-select-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: visible;
}

.score-page__box-select-rect {
  fill: rgba(155, 109, 255, 0.12);
  stroke: rgba(124, 77, 255, 0.85);
  stroke-width: 1;
  stroke-dasharray: 4 3;
}
</style>
