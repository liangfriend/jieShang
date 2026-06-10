<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import { MusicScoreTypeEnum, type MusicScore } from 'deciphony-renderer'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import type { MusicScoreComponentExpose } from '@renderer/views/editor/editHelper/useRenderEdit'
import {
  AddNoteStatePanel,
  AddNumberStatePanel,
  EditSlotGdButtons,
  EditSlotSdButtons,
  GhostNotePreview,
  GhostNumberPreview,
  PropertyPanel,
  SlurDragHandles,
  VoltaDragHandles,
  useRenderEdit
} from '@renderer/views/editor/editHelper'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import { SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'

const musicScoreData = defineModel<MusicScore>({ required: true })

const musicScoreRef = ref<MusicScoreComponentExpose | null>(null)
const isNumberNotation = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.NumberNotation
)
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

const {
  scoreRootRef,
  selectedItem,
  addNoteState,
  activeGhostPreview,
  propertyPanelKind,
  slurHandlePoints,
  voltaHandlePoints,
  handleDrClick,
  handleDrEnter,
  handleDrLeave,
  handleDrDown,
  handleDrUp,
  handleSlurHandleDown,
  handleVoltaHandleDown,
  handleTopMove,
  handleTopUp,
  handleRenderMusicScore,
  deleteSelected,
  clearSelection
} = useRenderEdit(musicScoreData, { musicScoreRef })

function isEditableTarget(target: EventTarget | null) {
  return (
    target instanceof HTMLInputElement ||
    target instanceof HTMLTextAreaElement ||
    target instanceof HTMLSelectElement ||
    (target instanceof HTMLElement && target.isContentEditable)
  )
}

function onKeyDown(event: KeyboardEvent) {
  if (isEditableTarget(event.target)) return

  if (event.key === 'Escape') {
    if (selectedItem.value) {
      clearSelection()
      event.preventDefault()
    }
    return
  }

  if (event.key !== 'Delete' && event.key !== 'Backspace') return
  if (deleteSelected()) {
    event.preventDefault()
  }
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})

defineExpose({ clearSelection })
</script>

<template>
  <header class="editor-top-bar">
    <AddNumberStatePanel
      v-if="isNumberNotation"
      v-model="addNoteState as any"
      class="editor-top-bar__note"
    />
    <AddNoteStatePanel v-else v-model="addNoteState" class="editor-top-bar__note" />
    <slot name="top-actions" />
  </header>

  <div class="editor-body">
    <div ref="scoreRootRef" class="score-page__main">
      <div class="score-page__stack">
        <musicScoreVue
          ref="musicScoreRef"
          class="score-page__svg"
          :data="musicScoreData"
          :slot-config="SCORE_SLOT_CONFIG"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          @renderMusicScore="handleRenderMusicScore"
          @dr-click="handleDrClick"
          @dr-down="handleDrDown"
          @dr-enter="handleDrEnter"
          @dr-leave="handleDrLeave"
          @dr-up="handleDrUp"
          @top-move="handleTopMove"
          @top-up="handleTopUp"
        >
          <template #t="{ node }">
            <TitleSlot
              mode="edit"
              :music-score="musicScoreData"
              :node="node"
              :slot-config="SCORE_SLOT_CONFIG"
            />
          </template>
          <template #g-d="{ node }">
            <EditSlotGdButtons :node="node" />
          </template>
          <template #s-d="{ node }">
            <EditSlotSdButtons :node="node" />
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
            <GhostNumberPreview
              v-if="isNumberNotation"
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
          v-if="slurHandlePoints || voltaHandlePoints"
          class="score-page__affiliated-drag-layer"
          :height="musicScoreData.height"
          :viewBox="`0 0 ${musicScoreData.width} ${musicScoreData.height}`"
          :width="musicScoreData.width"
          xmlns="http://www.w3.org/2000/svg"
        >
          <SlurDragHandles
            v-if="slurHandlePoints"
            :handles="slurHandlePoints"
            @handle-down="handleSlurHandleDown"
          />
          <VoltaDragHandles
            v-if="voltaHandlePoints"
            :handles="voltaHandlePoints"
            @handle-down="handleVoltaHandleDown"
          />
        </svg>
      </div>
    </div>

    <PropertyPanel :kind="propertyPanelKind" :selected="selectedItem" />
  </div>
</template>

<style scoped>
.editor-top-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  min-height: var(--ec-toolbar-h, 52px);
  padding: 8px 16px;
  flex-shrink: 0;
  background: var(--ec-card);
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  box-shadow: var(--ec-shadow);
}

.editor-top-bar__note {
  flex: 1;
  min-width: 0;
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
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__square),
.score-page__affiliated-drag-layer :deep(.volta-drag-handles__center) {
  pointer-events: all;
}

:deep(.dr-hover-highlight) {
  filter: drop-shadow(0 0 3px rgba(64, 158, 255, 0.9)) brightness(1.12);
}

:deep(.dr-selected-highlight) {
  filter: drop-shadow(0 0 4px rgba(255, 152, 0, 0.95)) brightness(1.14);
}

:deep(.dr-selected-highlight[data-tag='noteHead']) {
  cursor: ns-resize;
}

:deep(.dr-related-highlight) {
  filter: drop-shadow(0 0 4px rgba(103, 194, 58, 0.95)) brightness(1.12);
}
</style>
