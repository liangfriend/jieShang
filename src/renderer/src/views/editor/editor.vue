<script lang="ts" setup>
import { ElMessage, ElMessageBox } from 'element-plus'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ScoreNotationTypeSelector from '@renderer/components/score-toolbar/ScoreNotationTypeSelector.vue'
import {
  exportMusicXmlToDisk,
  exportSjToDisk,
  importMusicXmlFromDisk,
  importSjFromDisk,
  saveScoreToDatabase
} from '@renderer/utils/fileHelper'
import { EditModeToolbar, MusicXmlNoticeDialog } from '@renderer/components/score-toolbar'
import {
  initEditorScoreFromRoute,
  loadScoreFromRoute,
  resolveScoreId,
  resolveTempId
} from '@renderer/utils/scoreRoute'
import { CUR_PLAY_SCORE_TEMP_ID, EDIT_NEW_SCORE_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import { convertScoreNotationType } from '@renderer/utils/scoreNotationTransfer'
import EditorScoreWorkspace from '@renderer/views/editor/EditorScoreWorkspace.vue'
import '@renderer/styles/editor-cute.css'

const route = useRoute()
const router = useRouter()
const scoreId = computed(() => resolveScoreId(route.query.scoreId))

const musicScoreData = ref(initEditorScoreFromRoute(route))
const notationWorkspaceKey = ref(0)
const workspaceRef = ref<InstanceType<typeof EditorScoreWorkspace> | null>(null)
const fileBusy = ref(false)
const musicXmlNoticeVisible = ref(false)

function syncScoreToTemp(score: typeof musicScoreData.value) {
  const dataStore = useDataStore()
  dataStore.setTempScore(CUR_PLAY_SCORE_TEMP_ID, score)

  const tempId = resolveTempId(route.query.tempId)
  if (tempId) {
    dataStore.setTempScore(tempId, score)
  } else if (route.query.template) {
    dataStore.setTempScore(EDIT_NEW_SCORE_TEMP_ID, score)
  }
}

function clearSelection() {
  workspaceRef.value?.clearSelection()
}

async function handleNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === musicScoreData.value.type) return

  try {
    await ElMessageBox.confirm(
      '切换谱子类型只能保证播放信息一致，样式信息会有部分丢失，确定要转换吗？',
      '切换曲谱类型',
      {
        type: 'warning',
        confirmButtonText: '确定',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }

  try {
    const converted = convertScoreNotationType(musicScoreData.value, targetType)
    musicScoreData.value = converted
    notationWorkspaceKey.value += 1
    syncScoreToTemp(converted)
    ElMessage.success('曲谱类型已切换')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '曲谱类型切换失败')
  }
}

async function handleImportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const result = await importSjFromDisk()
    if (!result) return
    musicScoreData.value = result.musicScore
    notationWorkspaceKey.value += 1
    clearSelection()
    ElMessage.success(`已导入 ${result.fileName}`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '导入失败')
  } finally {
    fileBusy.value = false
  }
}

async function handleImportMusicXml() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const result = await importMusicXmlFromDisk()
    if (!result) return
    musicScoreData.value = result.musicScore
    notationWorkspaceKey.value += 1
    syncScoreToTemp(result.musicScore)
    clearSelection()
    ElMessage.success(`已导入 ${result.fileName}`)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'MusicXML 导入失败')
  } finally {
    fileBusy.value = false
  }
}

async function handleExportMusicXml() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const ok = await exportMusicXmlToDisk(musicScoreData.value)
    if (ok) ElMessage.success('导出成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : 'MusicXML 导出失败')
  } finally {
    fileBusy.value = false
  }
}

async function handleExportSj() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    const ok = await exportSjToDisk(musicScoreData.value)
    if (ok) ElMessage.success('导出成功')
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
    ElMessage.success('保存成功')
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '保存失败')
  } finally {
    fileBusy.value = false
  }
}

onMounted(async () => {
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    musicScoreData.value = loaded
    notationWorkspaceKey.value += 1
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
          <ScoreNotationTypeSelector
            :model-value="musicScoreData.type"
            variant="inline"
            :disabled="fileBusy"
            @change="handleNotationTypeChange"
          />
          <el-button class="toolbar-btn" size="small" @click="musicXmlNoticeVisible = true">
            需知
          </el-button>
          <el-button
            class="toolbar-btn"
            :disabled="fileBusy"
            size="small"
            @click="handleImportMusicXml"
          >
            导入 musicxml
          </el-button>
          <el-button
            class="toolbar-btn"
            :disabled="fileBusy"
            size="small"
            @click="handleExportMusicXml"
          >
            导出 musicxml
          </el-button>
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
      </template>
    </EditorScoreWorkspace>

    <EditModeToolbar />

    <MusicXmlNoticeDialog v-model="musicXmlNoticeVisible" />
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
}
</style>
