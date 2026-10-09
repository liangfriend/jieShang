<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { ArrowDown } from '@element-plus/icons-vue'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import ScoreNotationTypeSelector from '@renderer/components/score-toolbar/ScoreNotationTypeSelector.vue'
import ScoreTransposeControl from '@renderer/components/score-toolbar/ScoreTransposeControl.vue'
import ScoreSemitoneShiftButtons from '@renderer/components/score-toolbar/ScoreSemitoneShiftButtons.vue'
import {
  exportMidiToDisk,
  exportMusicXmlToDisk,
  exportSjToDisk,
  importMidiFromDisk,
  importMusicXmlFromDisk,
  importSjFromDisk,
  saveScoreToDatabase
} from '@renderer/utils/fileHelper'
import { DrumLegalNotesDialog, EditModeToolbar, EditorNoticeDialog, InstrumentNameSwitch, LinkedStaffModeSwitch, NotationTypeConvertDialog, PianoRecordDrawer, QuickNumberNotationDrawer, ScoreImageImportDialog, ScoreLayoutControl, ScoreTimeOffsetDrawer, StructureEditSwitch } from '@renderer/components/score-toolbar'
import { useMidiStore } from '@renderer/store/midi.store'
import {
  applyMusicScoreInPlace,
  initEditorScoreFromRoute,
  loadScoreFromRoute,
  resolveScoreId
} from '@renderer/utils/scoreRoute'
import { CUR_PLAY_SCORE_TEMP_ID } from '@renderer/constant'
import { useDataStore } from '@renderer/store/data.store'
import {
  convertScoreNotationType,
  resolveScoreKeySignature,
  shiftScoreBySemitones,
  transposeScoreNotation
} from '@renderer/utils/scoreNotationTransfer'
import type { KeySignatureTypeEnum, MusicScore } from '@deciphony/renderer'
import EditorScoreWorkspace from '@renderer/views/editor/EditorScoreWorkspace.vue'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { usePlayStore } from '@renderer/store/play.store'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useScoreEditHistory } from '@renderer/utils/useScoreEditHistory'
import { isFixedToneColorScore, isPlayOnlyMusicScore } from '@renderer/utils/isTabNotation'
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
const drumLegalNotesVisible = ref(false)
const timeOffsetVisible = ref(false)
const quickInputVisible = ref(false)
const pianoRecordVisible = ref(false)
const scoreImageVisible = ref(false)
/** 结构按钮开关：小节/谱表结构按钮 + 歌词区 */
const structureEditEnabled = ref(true)
const notationConvertDialogRef = ref<InstanceType<typeof NotationTypeConvertDialog> | null>(null)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const globalLoading = useGlobalLoadingStore()
const playStore = usePlayStore()

function clearSelection() {
  workspaceRef.value?.clearSelection()
}

const scoreEditHistory = useScoreEditHistory(musicScoreData, {
  // 撤销/恢复整谱替换对象，框选项会指向旧对象
  onRestored: () => workspaceRef.value?.clearMultiSelected()
})

const currentScoreKey = computed(() => resolveScoreKeySignature(musicScoreData.value))
const isPlayOnlyScore = computed(() => isPlayOnlyMusicScore(musicScoreData.value))
const isFixedToneColor = computed(() => isFixedToneColorScore(musicScoreData.value))
const isNumberNotationScore = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.NumberNotation
)
const isDrumNotationScore = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.DrumNotation
)
const isStandardStaffScore = computed(
  () => musicScoreData.value.type === MusicScoreTypeEnum.StandardStaff
)
const midiStore = useMidiStore()

async function openPianoRecord() {
  if (fileBusy.value) return
  await midiStore.init()
  if (!midiStore.supported) {
    ElMessage.warning(t('editor.pianoRecord.midiUnsupported'))
    return
  }
  if (!midiStore.hasConnectedInput) {
    ElMessage.warning(t('editor.pianoRecord.needMidi'))
    return
  }
  // 编辑区选中小节时 MIDI 会直接往小节里加音，录制期间不能让它也收音
  clearSelection()
  pianoRecordVisible.value = true
}

async function handlePianoRecordSync(score: MusicScore) {
  const confirmed = await notationConvertDialogRef.value?.open({
    title: t('editor.pianoRecord.syncConfirmTitle'),
    message: t('editor.pianoRecord.syncConfirmMessage')
  })
  if (!confirmed) return

  try {
    applyMusicScoreInPlace(musicScoreData.value, score)
    notationWorkspaceKey.value += 1
    clearSelection()
    pianoRecordVisible.value = false
    ElMessage.success(t('editor.pianoRecord.synced'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.pianoRecord.syncFailed'))
  }
}
async function openDrumLegalNotes() {
  if (fileBusy.value) return
  try {
    await globalLoading.run(t('play.toneColor.loading'), async () => {
      await playStore.waitReady()
      // 编辑页未走播放缓存时需灌入打击乐；已缓存则跳过
      await playStore.loadToneColorById(BUILTIN_COLLECTION_SEED_IDS.toneColor.打击乐)
    })
    drumLegalNotesVisible.value = true
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('editor.drumLegalNotes.toneLoadFailed')
    )
  }
}

async function handleQuickInputSync(score: MusicScore) {
  const confirmed = await notationConvertDialogRef.value?.open({
    title: t('editor.quickInput.syncConfirmTitle'),
    message: t('editor.quickInput.syncConfirmMessage')
  })
  if (!confirmed) return

  try {
    applyMusicScoreInPlace(musicScoreData.value, score)
    notationWorkspaceKey.value += 1
    clearSelection()
    quickInputVisible.value = false
    ElMessage.success(t('editor.quickInput.synced'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.quickInput.syncFailed'))
  }
}

async function handleNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (isPlayOnlyScore.value) return
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

async function handleTranspose(payload: { toKey: KeySignatureTypeEnum }) {
  if (payload.toKey === currentScoreKey.value) {
    ElMessage.info(t('editor.messages.transposeSameKey'))
    return
  }

  const confirmed = await notationConvertDialogRef.value?.open({
    title: t('editor.transposeDialog.title'),
    message: t('editor.transposeDialog.message')
  })
  if (!confirmed) return

  try {
    const transposed = transposeScoreNotation(musicScoreData.value, { toKey: payload.toKey })
    applyMusicScoreInPlace(musicScoreData.value, transposed)
    notationWorkspaceKey.value += 1
    clearSelection()
    ElMessage.success(t('editor.messages.transposed'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.transposeFailed'))
  }
}

function handleSemitoneShift(semitones: 1 | -1) {
  try {
    const shifted = shiftScoreBySemitones(musicScoreData.value, semitones)
    applyMusicScoreInPlace(musicScoreData.value, shifted)
    notationWorkspaceKey.value += 1
    clearSelection()
    ElMessage.success(
      semitones > 0 ? t('editor.messages.semitoneRaised') : t('editor.messages.semitoneLowered')
    )
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('editor.messages.semitoneShiftFailed')
    )
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

async function handleExportMusicXml(target: 'ms4' | 'ms3' = 'ms4') {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.exporting'), async () => {
      const ok = await exportMusicXmlToDisk(musicScoreData.value, target)
      if (ok) ElMessage.success(t('editor.messages.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.exportMusicXmlFailed'))
  } finally {
    fileBusy.value = false
  }
}

async function handleImportMidi() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.importing'), async () => {
      const result = await importMidiFromDisk()
      if (!result) return
      applyMusicScoreInPlace(musicScoreData.value, result.musicScore)
      notationWorkspaceKey.value += 1
      clearSelection()
      ElMessage.success(t('editor.messages.importSuccess', { fileName: result.fileName }))
      const warnings = [...new Set(result.warnings)]
      if (warnings.length) {
        ElMessage.warning({
          message: t('editor.messages.importMidiWarnings', { detail: warnings.slice(0, 3).join('?') }),
          duration: 6000
        })
      }
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.importMidiFailed'))
  } finally {
    fileBusy.value = false
  }
}

function handleScoreImageGenerated(payload: {
  musicScore: MusicScore
  pageCount: number
  warningCount: number
}) {
  applyMusicScoreInPlace(musicScoreData.value, payload.musicScore)
  notationWorkspaceKey.value += 1
  clearSelection()
  if (payload.warningCount) {
    ElMessage.warning({
      message: t('editor.messages.scoreImageGeneratedWithWarnings', {
        pages: payload.pageCount,
        n: payload.warningCount
      }),
      duration: 6000
    })
  } else {
    ElMessage.success(t('editor.messages.scoreImageGenerated', { pages: payload.pageCount }))
  }
}

async function handleExportMidi() {
  if (fileBusy.value) return
  fileBusy.value = true
  try {
    await globalLoading.run(t('common.exporting'), async () => {
      const ok = await exportMidiToDisk(musicScoreData.value)
      if (ok) ElMessage.success(t('editor.messages.exportSuccess'))
    })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.exportMidiFailed'))
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

type ImportCommand = 'sj' | 'musicXml' | 'midi' | 'scoreImage'
type ExportCommand = 'sj' | 'musicXmlMs4' | 'musicXmlMs3' | 'midi'

function handleImportCommand(command: ImportCommand) {
  if (command === 'sj') void handleImportSj()
  else if (command === 'musicXml') void handleImportMusicXml()
  else if (command === 'midi') void handleImportMidi()
  else scoreImageVisible.value = true
}

function handleExportCommand(command: ExportCommand) {
  if (command === 'sj') void handleExportSj()
  else if (command === 'musicXmlMs4') void handleExportMusicXml('ms4')
  else if (command === 'musicXmlMs3') void handleExportMusicXml('ms3')
  else void handleExportMidi()
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
      scoreEditHistory.reset(loaded)
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
      :structure-edit-enabled="structureEditEnabled"
    >
      <template #top-actions>
        <div class="editor-top-bar__files">
          <div class="editor-top-bar__files-group">
            <ScoreLayoutControl :music-score="musicScoreData" :disabled="fileBusy" />
            <StructureEditSwitch v-model="structureEditEnabled" :disabled="fileBusy" />
            <LinkedStaffModeSwitch v-model="musicScoreData" :disabled="fileBusy" />
            <InstrumentNameSwitch
              v-if="!isFixedToneColor"
              v-model="musicScoreData"
              :disabled="fileBusy"
            />
            <ScoreNotationTypeSelector
              v-if="!isPlayOnlyScore"
              :model-value="musicScoreData.type"
              variant="inline"
              :disabled="fileBusy"
              @change="handleNotationTypeChange"
            />
            <ScoreTransposeControl
              v-if="!isPlayOnlyScore"
              :current-key="currentScoreKey"
              variant="inline"
              :disabled="fileBusy"
              @transpose="handleTranspose"
            />
            <ScoreSemitoneShiftButtons
              v-if="!isPlayOnlyScore"
              variant="inline"
              :disabled="fileBusy"
              @shift="handleSemitoneShift"
            />
          </div>
          <div class="editor-top-bar__files-group">
            <el-button
              v-if="isNumberNotationScore"
              class="toolbar-btn"
              :disabled="fileBusy"
              size="small"
              @click="quickInputVisible = true"
            >
              {{ t('editor.toolbar.quickInput') }}
            </el-button>
            <el-button
              v-if="isStandardStaffScore"
              class="toolbar-btn"
              :disabled="fileBusy"
              size="small"
              @click="openPianoRecord"
            >
              {{ t('editor.toolbar.pianoRecord') }}
            </el-button>
            <el-button
              v-if="isDrumNotationScore"
              class="toolbar-btn"
              size="small"
              :disabled="fileBusy"
              @click="openDrumLegalNotes"
            >
              {{ t('editor.toolbar.legalNotes') }}
            </el-button>
            <el-button class="toolbar-btn" size="small" @click="editorNoticeVisible = true">
              {{ t('editor.toolbar.notice') }}
            </el-button>
            <el-dropdown
              trigger="click"
              :disabled="fileBusy"
              @command="handleImportCommand"
            >
              <el-button class="toolbar-btn" :disabled="fileBusy" size="small">
                {{ t('editor.toolbar.import') }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sj">{{ t('editor.toolbar.formatSj') }}</el-dropdown-item>
                  <el-dropdown-item command="musicXml">
                    {{ t('editor.toolbar.formatMusicXml') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="midi">{{ t('editor.toolbar.formatMidi') }}</el-dropdown-item>
                  <el-dropdown-item command="scoreImage" divided>
                    {{ t('editor.toolbar.scoreImage') }}
                  </el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
            <el-dropdown
              trigger="click"
              :disabled="fileBusy"
              @command="handleExportCommand"
            >
              <el-button class="toolbar-btn" :disabled="fileBusy" size="small">
                {{ t('editor.toolbar.export') }}
                <el-icon class="el-icon--right"><ArrowDown /></el-icon>
              </el-button>
              <template #dropdown>
                <el-dropdown-menu>
                  <el-dropdown-item command="sj">{{ t('editor.toolbar.formatSj') }}</el-dropdown-item>
                  <el-dropdown-item command="musicXmlMs4">
                    {{ t('editor.toolbar.formatMusicXmlMs4') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="musicXmlMs3">
                    {{ t('editor.toolbar.formatMusicXmlMs3') }}
                  </el-dropdown-item>
                  <el-dropdown-item command="midi">{{ t('editor.toolbar.formatMidi') }}</el-dropdown-item>
                </el-dropdown-menu>
              </template>
            </el-dropdown>
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
        </div>
      </template>
    </EditorScoreWorkspace>

    <EditModeToolbar @open-time-offset="timeOffsetVisible = true" />

    <ScoreTimeOffsetDrawer v-model="timeOffsetVisible" :music-score="musicScoreData" />

    <QuickNumberNotationDrawer
      v-model="quickInputVisible"
      :music-score="musicScoreData"
      :skin="scoreSkin"
      :skin-name="scoreSkinName"
      @sync="handleQuickInputSync"
    />

    <PianoRecordDrawer
      v-model="pianoRecordVisible"
      :music-score="musicScoreData"
      :skin="scoreSkin"
      :skin-name="scoreSkinName"
      @sync="handlePianoRecordSync"
    />

    <ScoreImageImportDialog v-model="scoreImageVisible" @generated="handleScoreImageGenerated" />

    <EditorNoticeDialog v-model="editorNoticeVisible" />
    <DrumLegalNotesDialog v-model="drumLegalNotesVisible" />

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
  flex-direction: column;
  align-items: flex-end;
  gap: 6px;
  width: 100%;
}

.editor-top-bar__files-group {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-end;
  align-items: center;
  gap: 6px;
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
