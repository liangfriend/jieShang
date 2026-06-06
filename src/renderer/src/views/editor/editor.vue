<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { MusicScoreComponentExpose } from '@renderer/utils/editHelper/useRenderEdit'
import {
  AddGrandStaffButton,
  AddNoteStatePanel,
  EditSlotSdButtons,
  GhostNotePreview,
  PropertyPanel,
  SlurDragHandles,
  VoltaDragHandles,
  useRenderEdit
} from '@renderer/utils/editHelper'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import { exportSjToDisk, importSjFromDisk, saveScoreToDatabase } from '@renderer/utils/fileHelper'
import ScoreModeToolbar from '@renderer/components/ScoreModeToolbar.vue'
import { loadScoreFromRoute, resolveScoreId, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import '@renderer/styles/editor-cute.css'
import empty from '@renderer/template/empty'

const route = useRoute()
const router = useRouter()
const scoreId = computed(() => resolveScoreId(route.query.scoreId))

const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const musicScoreRef = ref<MusicScoreComponentExpose | null>(null)
const fileBusy = ref(false)

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

async function handleImportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const result = await importSjFromDisk()
    if (!result) return
    musicScoreData.value = result.musicScore
    clearSelection()
    ElMessage.success(`已导入 ${result.fileName}`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    fileBusy.value = false
  }
}

async function handleExportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const ok = await exportSjToDisk(musicScoreData.value)
    if (ok) ElMessage.success('曲谱已导出')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导出失败')
  } finally {
    fileBusy.value = false
  }
}

async function handleSaveScore() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const saved = await saveScoreToDatabase(musicScoreData.value, scoreId.value)
    if (!scoreId.value) {
      await router.replace({
        name: 'edit',
        query: { scoreId: String(saved.id) }
      })
    }
    ElMessage.success('曲谱已保存')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    fileBusy.value = false
  }
}

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

onMounted(async () => {
  console.log('chicken')
  window.addEventListener('keydown', onKeyDown)
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    musicScoreData.value = loaded
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div class="score-page editor-cute">
    <header class="editor-top-bar">
      <AddNoteStatePanel v-model="addNoteState" class="editor-top-bar__note" />
      <div class="editor-top-bar__files">
        <el-button class="toolbar-btn" :disabled="fileBusy" size="small" @click="handleImportSj">
          导入 sj
        </el-button>
        <el-button class="toolbar-btn" :disabled="fileBusy" size="small" @click="handleExportSj">
          导出 sj
        </el-button>
        <el-button
          class="toolbar-btn toolbar-btn--save"
          :disabled="fileBusy"
          size="small"
          type="primary"
          @click="handleSaveScore"
        >
          保存
        </el-button>
      </div>
    </header>

    <div class="editor-body">
      <div ref="scoreRootRef" class="score-page__main">
        <div class="score-page__stack">
          <musicScoreVue
            ref="musicScoreRef"
            class="score-page__svg"
            :data="musicScoreData"
            :slot-config="SCORE_SLOT_CONFIG"
            skin-name="default"
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
              <TitleSlot mode="edit" :music-score="musicScoreData" :node="node" />
            </template>
            <template #g-d="{ node }">
              <AddGrandStaffButton :node="node" />
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
              <GhostNotePreview
                :measure-id="selectedItem?.measure?.id"
                :node="node"
                :preview="activeGhostPreview"
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

    <ScoreModeToolbar mode="edit" />
  </div>
</template>

<style scoped>
.score-page {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: var(--ec-bottom-bar-h, 56px);
  box-sizing: border-box;
}

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

.editor-top-bar__files {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
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

.toolbar-btn {
  --el-button-bg-color: rgba(255, 255, 255, 0.85);
  --el-button-border-color: rgba(255, 184, 208, 0.5);
  --el-button-text-color: var(--ec-text);
  --el-button-hover-bg-color: rgba(255, 214, 232, 0.85);
  --el-button-hover-border-color: var(--ec-pink-deep);
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
