<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScoreNotationTypeSelector from '@renderer/components/score-toolbar/ScoreNotationTypeSelector.vue'
import {
  exportMusicXmlToDisk,
  exportSjToDisk,
  importMusicXmlFromDisk,
  importSjFromDisk,
  saveScoreToDatabase
} from '@renderer/utils/fileHelper'
import { EditModeToolbar, EditorNoticeDialog, LinkedStaffModeSwitch, NotationTypeConvertDialog } from '@renderer/components/score-toolbar'
import {
  applyMusicScoreInPlace,
  initEditorScoreFromRoute,
  loadScoreFromRoute,
  resolveScoreId
} from '@renderer/utils/scoreRoute'
import { CUR_PLAY_SCORE_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import { convertScoreNotationType } from '@renderer/utils/scoreNotationTransfer'
import EditorScoreWorkspace from '@renderer/views/editor/EditorScoreWorkspace.vue'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import '@renderer/styles/editor-cute.css'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const scoreId = computed(() => resolveScoreId(route.query.scoreId))

const musicScoreData = ref(initEditorScoreFromRoute(route))
const notationWorkspaceKey = ref(0)
const workspaceRef = ref<InstanceType<typeof EditorScoreWorkspace> | null>(null)
const fileBusy = ref(false)
const editorNoticeVisible = ref(false)
const notationConvertDialogRef = ref<InstanceType<typeof NotationTypeConvertDialog> | null>(null)
const { waitScoreSkin } = useScoreSkin()
const globalLoading = useGlobalLoadingStore()

function clearSelection() {
  workspaceRef.value?.clearSelection()
}

async function handleNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === musicScoreData.value.type) return

  const confirmed = await notationConvertDialogRef.value?.open()
  if (!confirmed) return

  try {
    const converted = convertScoreNotationType(musicScoreData.value, targetType)
    applyMusicScoreInPlace(musicScoreData.value, converted)
    notationWorkspaceKey.value += 1
    ElMessage.success(t('editor.messages.notationTypeSwitched'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.notationTypeSwitchFailed'))
  }
}

async function handleImportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.importing'), async () => {
      const result = await importSjFromDisk()
      if (!result) return
      applyMusicScoreInPlace(musicScoreData.value, result.musicScore)
      notationWorkspaceKey.value += 1
      clearSelection()
      ElMessage.success(t('editor.messages.importSuccess', { fileName: result.fileName }))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.importFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function handleImportMusicXml() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.importing'), async () => {
      const result = await importMusicXmlFromDisk()
      if (!result) return
      applyMusicScoreInPlace(musicScoreData.value, result.musicScore)
      notationWorkspaceKey.value += 1
      clearSelection()
      ElMessage.success(t('editor.messages.importSuccess', { fileName: result.fileName }))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.importMusicXmlFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function handleExportMusicXml() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.exporting'), async () => {
      const ok = await exportMusicXmlToDisk(musicScoreData.value)
      if (ok) ElMessage.success(t('editor.messages.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.exportMusicXmlFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function handleExportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.exporting'), async () => {
      const ok = await exportSjToDisk(musicScoreData.value)
      if (ok) ElMessage.success(t('editor.messages.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.exportFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function handleSaveScore() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.saving'), async () => {
      const saved = await saveScoreToDatabase(musicScoreData.value, scoreId.value)
      const dataStore = useDataStore()
      dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, musicScoreData.value)
      if (!scoreId.value) {
        await router.replace({
          name: 'edit',
          query: {
            scoreId: String(saved.id),
            tempId: CUR_PLAY_SCORE_TEMP_ID
          }
        })
      }
      ElMessage.success(t('editor.messages.saveSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.saveFailed'))
  } finally {
    fileBusy.value = false
  }
}

onMounted(async () => {
  globalLoading.show(t('common.loading'))
  try {
    const [, loaded] = await Promise.all([waitScoreSkin(), loadScoreFromRoute(route)])
    if (loaded) {
      musicScoreData.value = loaded
      notationWorkspaceKey.value += 1
    }
  } finally {
    globalLoading.hide()
  }
})
</script>

<template>
  <div class="score-page editor-cute">
    <EditorScoreWorkspace
      ref="workspaceRef"
      :key="notationWorkspaceKey"
      v-model="musicScoreData"
    >
      <template #top-actions>
        <div class="editor-top-bar__files">
          <LinkedStaffModeSwitch v-model="musicScoreData" :disabled="fileBusy" />
          <ScoreNotationTypeSelector
            :model-value="musicScoreData.type"
            variant="inline"
            :disabled="fileBusy"
            @change="handleNotationTypeChange"
          />
          <el-button class="toolbar-btn" size="small" @click="editorNoticeVisible = true">
            {{ t('editor.toolbar.notice') }}
          </el-button>
          <el-button
            class="toolbar-btn"
            :disabled="fileBusy"
            size="small"
            @click="handleImportMusicXml"
          >
            {{ t('editor.toolbar.importMusicXml') }}
          </el-button>
          <el-button
            class="toolbar-btn"
            :disabled="fileBusy"
            size="small"
            @click="handleExportMusicXml"
          >
            {{ t('editor.toolbar.exportMusicXml') }}
          </el-button>
          <el-button class="toolbar-btn" :disabled="fileBusy" size="small" @click="handleImportSj">
            {{ t('editor.toolbar.importSj') }}
          </el-button>
          <el-button class="toolbar-btn" :disabled="fileBusy" size="small" @click="handleExportSj">
            {{ t('editor.toolbar.exportSj') }}
          </el-button>
          <el-button
            class="toolbar-btn toolbar-btn--save"
            :disabled="fileBusy"
            size="small"
            type="primary"
            @click="handleSaveScore"
          >
            {{ t('editor.toolbar.save') }}
          </el-button>
        </div>
      </template>
    </EditorScoreWorkspace>

    <EditModeToolbar />

    <EditorNoticeDialog v-model="editorNoticeVisible" />

    <NotationTypeConvertDialog ref="notationConvertDialogRef" />
  </div>
</template>

<style scoped>
.score-page {
  position: relative;
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.editor-top-bar__files {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  flex-wrap: wrap;
}

.toolbar-btn {
  --el-button-bg-color: rgba(255, 255, 255, 0.85);
  --el-button-border-color: rgba(255, 184, 208, 0.5);
  --el-button-text-color: var(--ec-text);
  --el-button-hover-bg-color: rgba(255, 214, 232, 0.85);
  --el-button-hover-border-color: var(--ec-pink-deep);
  --el-button-disabled-bg-color: rgba(255, 255, 255, 0.5);
  --el-button-disabled-border-color: rgba(255, 184, 208, 0.28);
  --el-button-disabled-text-color: var(--ec-text-soft);
}

.toolbar-btn--save {
  --el-button-bg-color: var(--ec-pink-deep);
  --el-button-border-color: var(--ec-pink-deep);
  --el-button-text-color: #fff;
  --el-button-hover-bg-color: #ff7aab;
  --el-button-hover-border-color: #ff7aab;
  --el-button-disabled-bg-color: rgba(255, 143, 184, 0.42);
  --el-button-disabled-border-color: rgba(255, 143, 184, 0.42);
  --el-button-disabled-text-color: rgba(255, 255, 255, 0.82);
}

.toolbar-btn.is-disabled,
.toolbar-btn.is-disabled:hover,
.toolbar-btn--save.is-disabled,
.toolbar-btn--save.is-disabled:hover {
  background-color: var(--el-button-disabled-bg-color);
  border-color: var(--el-button-disabled-border-color);
  color: var(--el-button-disabled-text-color);
}
</style>
