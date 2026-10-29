<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import type { MusicScoreHighlightExpose } from '@deciphony/extensions/dr-play-highlight'
import type { PlayHighlightProgressData } from '@deciphony/extensions/dr-play-highlight'
import { MusicScoreTypeEnum, type VDom } from '@deciphony/renderer'
import { computed, nextTick, onBeforeUnmount, onMounted, onUnmounted, provide, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  exportMidiToDisk,
  exportMusicXmlToDisk,
  exportSjToDisk,
  importMidiFromDisk,
  importMusicXmlFromDisk,
  importSjFromDisk,
  resolveScoreName,
  saveScoreToDatabase
} from '@renderer/utils/fileHelper'
import { createEmptyWork } from '@renderer/utils/fileHelper/workFile'
import { EDIT_NEW_WORK_TEMP_ID } from '@renderer/constant/work'
import type { ScoreToWorkSettings } from '@renderer/utils/work/scoreToWork'
import ScoreToWorkDialog from '@renderer/views/editor/ScoreToWorkDialog.vue'
import LyricsMatchPanel from '@renderer/views/editor/LyricsMatchPanel.vue'
import {
  DrumLegalNotesDialog,
  EditorMenuBar,
  EditorNoticeDialog,
  NotationTypeConvertDialog,
  PianoRecordDrawer,
  QuickNumberNotationDrawer,
  ScoreImageImportDialog,
  ScoreLayoutControl,
  ScoreTimeOffsetDrawer
} from '@renderer/components/score-toolbar'
import {
  applyScoreSlurStyle,
  readScoreSlurStyle,
  type SlurStylePreference
} from '@renderer/views/editor/editHelper/renderEditSlurProperties'
import {
  applyShowInstrumentName,
  readShowInstrumentName
} from '@renderer/utils/scoreSpacingDefaults'
import { useMidiStore } from '@renderer/store/midi.store'
import {
  applyMusicScoreInPlace,
  initEditorScoreFromRoute,
  loadScoreFromRoute,
  resolveEditorTempId,
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
import { standardModeEnabled } from '@renderer/views/editor/editHelper/renderEditStandardMode'
import {
  loadRhythmPatternMode,
  saveRhythmPatternMode,
  type RhythmPatternMode
} from '@renderer/views/editor/editHelper/renderEditRhythmPattern'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { usePlayStore } from '@renderer/store/play.store'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import { BUILTIN_COLLECTION_SEED_IDS } from '@renderer/constant/collectionSeedIds'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useScoreEditHistory } from '@renderer/utils/useScoreEditHistory'
import { isFixedToneColorScore, isPlayOnlyMusicScore } from '@renderer/utils/isTabNotation'
import {
  scorePlaybackKey,
  scorePlayRangeKey,
  scoreScrollFollowKey,
  usePlayRangeSelect,
  useScorePagePlayback
} from '@renderer/utils/scorePagePlayback'
import type { RenderMusicScoreHandler } from '@renderer/utils/scorePagePlayback/types'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import {
  createScoreMarkExtension,
  SCORE_MARK_NONE,
  scoreMarkExtraHeight,
  type ScoreMarkValue
} from '@renderer/utils/scoreMark'
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
const scoreToWorkVisible = ref(false)
/** 结构按钮开关：小节/谱表结构按钮（播放模式只遮罩显示，不改此偏好） */
const structureEditEnabled = ref(true)
/** 歌词开关：歌词区 */
const lyricsEditEnabled = ref(true)
/** 编辑页内播放模式（仅菜单切换；进入曲谱默认编辑，无 mode=play） */
const isPlayMode = ref(route.query.mode === 'play')
const scoreMark = ref<ScoreMarkValue>(SCORE_MARK_NONE)
const lyricsMatchVisible = ref(false)
const playMusicScoreRef = shallowRef<MusicScoreHighlightExpose | null>(null)
const playScoreRootRef = shallowRef<HTMLElement | null>(null)
const playVDomList = shallowRef<VDom[]>([])
const audioPlayerStore = useAudioPlayerStore()
const playStore = usePlayStore()

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => playScoreRootRef.value,
  getVDomList: () => playVDomList.value,
  findElementByVDom: (node) => playMusicScoreRef.value?.findElementByVDom(node) ?? null,
  getMusicScore: () => musicScoreData.value
})

const rangeSelect = usePlayRangeSelect({ musicScoreRef: playMusicScoreRef })
const playback = useScorePagePlayback(musicScoreData, {
  musicScoreRef: playMusicScoreRef,
  onPlaybackStopped: () => scrollToPlayingNote.resetScroll(),
  getPlayRange: () => rangeSelect.getRange()
})

provide(scorePlaybackKey, playback)
provide(scorePlayRangeKey, rangeSelect)
provide(scoreScrollFollowKey, scrollToPlayingNote)

const markUnavailable = computed(() => isPlayOnlyMusicScore(musicScoreData.value))
const markExtension = computed(() =>
  markUnavailable.value ? null : createScoreMarkExtension(scoreMark.value)
)
const playExtensions = computed(() => [
  ...(markExtension.value ? [markExtension.value] : []),
  rangeSelect.extension
])
const playRenderScore = computed(() => {
  if (!isPlayMode.value) return null
  const score = musicScoreData.value
  const extra = scoreMarkExtraHeight(score, markExtension.value)
  return extra ? { ...score, height: score.height + extra } : score
})

const rangeHint = computed(() => {
  if (!rangeSelect.startNoteId.value) return t('play.range.pickStart')
  if (!rangeSelect.endNoteId.value) return t('play.range.pickEnd')
  return t('play.range.ready')
})

function syncPlayRefs() {
  playMusicScoreRef.value =
    (workspaceRef.value?.getMusicScoreRef?.() as MusicScoreHighlightExpose | null) ?? null
  playScoreRootRef.value = workspaceRef.value?.getScoreRootEl?.() ?? null
}

async function setPlayMode(next: boolean) {
  if (isPlayMode.value === next) return
  if (next) {
    workspaceRef.value?.clearSelection()
    lyricsMatchVisible.value = false
    rangeSelect.end()
    isPlayMode.value = true
    await nextTick()
    syncPlayRefs()
    await playStore.restorePlaybackDefaults(musicScoreData.value, { preferScoreToneColor: true })
  } else {
    playback.handleStop()
    rangeSelect.end()
    scoreMark.value = SCORE_MARK_NONE
    isPlayMode.value = false
    void playStore.resetCollectionToneColorToDefault()
  }
  const query = { ...route.query } as Record<string, string | string[]>
  if (next) query.mode = 'play'
  else delete query.mode
  await router.replace({ name: 'edit', query })
}

function onWorkspaceScoreRendered(list: VDom[], info?: unknown) {
  playVDomList.value = list
  const handler = playback.handleRenderMusicScore
  if (!handler || info === undefined) return
  handler(list, info as Parameters<RenderMusicScoreHandler>[1])
}

function togglePlayMode() {
  void setPlayMode(!isPlayMode.value)
}

watch(
  () => route.query.mode,
  (mode) => {
    const wantPlay = mode === 'play'
    if (wantPlay !== isPlayMode.value) void setPlayMode(wantPlay)
  }
)

watch(notationWorkspaceKey, () => {
  void nextTick(syncPlayRefs)
})

watch(isPlayMode, () => {
  void nextTick(syncPlayRefs)
})
const menuBarAnchorRef = ref<HTMLElement | null>(null)
const scoreLayoutControlRef = ref<InstanceType<typeof ScoreLayoutControl> | null>(null)
function toggleLyricsMatch() {
  lyricsMatchVisible.value = !lyricsMatchVisible.value
  if (lyricsMatchVisible.value) lyricsEditEnabled.value = true
}
const rhythmPatternMode = ref<RhythmPatternMode>(loadRhythmPatternMode())
watch(rhythmPatternMode, saveRhythmPatternMode)
const notationConvertDialogRef = ref<InstanceType<typeof NotationTypeConvertDialog> | null>(null)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const globalLoading = useGlobalLoadingStore()

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

const linkedStaffMode = computed({
  get: () =>
    musicScoreData.value.grandStaffs.length > 0 &&
    musicScoreData.value.grandStaffs.every((grandStaff) => grandStaff.linkedStaff === true),
  set: (enabled: boolean) => {
    for (const grandStaff of musicScoreData.value.grandStaffs) {
      if (enabled) grandStaff.linkedStaff = true
      else delete grandStaff.linkedStaff
    }
  }
})

const showInstrumentName = computed({
  get: () => readShowInstrumentName(musicScoreData.value),
  set: (enabled: boolean) => applyShowInstrumentName(musicScoreData.value, enabled)
})

const slurStyle = computed({
  get: () => readScoreSlurStyle(musicScoreData.value),
  set: (value: SlurStylePreference) => applyScoreSlurStyle(musicScoreData.value, value)
})

function openLayoutDialog() {
  scoreLayoutControlRef.value?.openDialog()
}

function toggleLinkedStaffMode() {
  linkedStaffMode.value = !linkedStaffMode.value
}

function toggleInstrumentName() {
  showInstrumentName.value = !showInstrumentName.value
}

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

/** 导出为作品：按设置建一个新作品，进作品编辑页后由它按复谱表分页铺曲谱 */
function handleExportWork(settings: ScoreToWorkSettings) {
  const dataStore = useDataStore()
  const score = musicScoreData.value
  dataStore.setTempScore(resolveEditorTempId(route), score)
  const work = createEmptyWork({ name: resolveScoreName(score) })
  work.pages[0]!.width = settings.pageWidth
  work.pages[0]!.height = settings.pageHeight
  dataStore.deleteTempWork(EDIT_NEW_WORK_TEMP_ID)
  dataStore.setTempWork(EDIT_NEW_WORK_TEMP_ID, work)
  const skinId = Number(scoreSkinName.value)
  dataStore.setPendingScoreToWork({
    ...settings,
    musicScore: JSON.parse(JSON.stringify(score)) as MusicScore,
    skinId: Number.isFinite(skinId) && skinId > 0 ? skinId : null
  })
  void router.push({ name: 'workEdit', query: { tempId: EDIT_NEW_WORK_TEMP_ID } })
}

type ImportCommand = 'sj' | 'musicXml' | 'midi' | 'scoreImage'
type ExportCommand = 'sj' | 'musicXmlMs4' | 'musicXmlMs3' | 'midi' | 'work'

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
  else if (command === 'work') scoreToWorkVisible.value = true
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

// 弹窗 / 下拉 / 消息框 teleport 到 body，脱离 .editor-cute，靠 body 类名带上主题色
const EDITOR_THEME_BODY_CLASS = 'editor-cute-theme'
onBeforeUnmount(() => document.body.classList.remove(EDITOR_THEME_BODY_CLASS))

let scrollProgressSubId: string | null = null

onMounted(async () => {
  document.body.classList.add(EDITOR_THEME_BODY_CLASS)
  globalLoading.show(t('common.loading'))
  try {
    const [, loaded] = await Promise.all([waitScoreSkin(), loadScoreFromRoute(route)])
    if (loaded) {
      musicScoreData.value = loaded
      notationWorkspaceKey.value += 1
      scoreEditHistory.reset(loaded)
    }
    await nextTick()
    syncPlayRefs()
    if (isPlayMode.value) {
      await playStore.restorePlaybackDefaults(musicScoreData.value, { preferScoreToneColor: true })
    }
    scrollProgressSubId = playback.subscribeProgressStart((_progress, data) => {
      if (!isPlayMode.value) return
      scrollToPlayingNote.handleProgressStart(data as PlayHighlightProgressData)
    })
  } finally {
    globalLoading.hide()
  }
})

onUnmounted(() => {
  if (scrollProgressSubId) playback.unsubscribeProgressStart(scrollProgressSubId)
  playback.handleStop()
  audioPlayerStore.stop()
  void playStore.resetCollectionToneColorToDefault()
})
</script>

<template>
  <div class="score-page editor-cute">
    <div v-if="isPlayMode && rangeSelect.active.value" class="score-range-bar">
      <span class="score-range-bar__label">{{ t('play.range.title') }}</span>
      <span class="score-range-bar__hint">{{ rangeHint }}</span>
      <button
        type="button"
        class="score-range-bar__btn"
        :disabled="!rangeSelect.startNoteId.value"
        @click="rangeSelect.clear()"
      >
        {{ t('play.range.clear') }}
      </button>
      <button type="button" class="score-range-bar__btn" @click="rangeSelect.end()">
        {{ t('play.range.end') }}
      </button>
    </div>
    <EditorScoreWorkspace
      ref="workspaceRef"
      :key="notationWorkspaceKey"
      v-model="musicScoreData"
      v-model:rhythm-pattern-mode="rhythmPatternMode"
      :play-mode="isPlayMode"
      :structure-edit-enabled="structureEditEnabled"
      :lyrics-edit-enabled="lyricsEditEnabled"
      :play-extensions="playExtensions"
      :play-render-score="playRenderScore"
      @score-rendered="onWorkspaceScoreRendered"
    >
      <template #top-actions>
        <div ref="menuBarAnchorRef" class="editor-menu-host">
          <EditorMenuBar
            :disabled="fileBusy"
            :play-mode="isPlayMode"
            :music-score="musicScoreData"
            :score-mark="scoreMark"
            :structure-edit-enabled="structureEditEnabled"
            :lyrics-edit-enabled="lyricsEditEnabled"
            :standard-mode-enabled="standardModeEnabled"
            :linked-staff-mode="linkedStaffMode"
            :show-instrument-name="showInstrumentName"
            :hide-instrument-name="isFixedToneColor"
            :rhythm-pattern-mode="rhythmPatternMode"
            :slur-style="slurStyle"
            :notation-type="musicScoreData.type"
            :current-key="currentScoreKey"
            :hide-notation-tools="isPlayOnlyScore"
            :show-quick-input="isNumberNotationScore"
            :show-piano-record="isStandardStaffScore"
            :show-legal-notes="isDrumNotationScore"
            @save="handleSaveScore"
            @import="handleImportCommand"
            @export="handleExportCommand"
            @notice="editorNoticeVisible = true"
            @layout="openLayoutDialog"
            @toggle-play-mode="togglePlayMode"
            @update:score-mark="scoreMark = $event"
            @toggle-structure="structureEditEnabled = !structureEditEnabled"
            @toggle-lyrics="lyricsEditEnabled = !lyricsEditEnabled"
            @toggle-standard-mode="standardModeEnabled = !standardModeEnabled"
            @toggle-linked-staff="toggleLinkedStaffMode"
            @toggle-instrument-name="toggleInstrumentName"
            @lyrics-match="toggleLyricsMatch"
            @quick-input="quickInputVisible = true"
            @piano-record="openPianoRecord"
            @legal-notes="openDrumLegalNotes"
            @time-offset="timeOffsetVisible = true"
            @set-rhythm-mode="rhythmPatternMode = $event"
            @set-slur-style="slurStyle = $event"
            @set-notation-type="handleNotationTypeChange"
            @transpose="handleTranspose"
            @semitone-shift="handleSemitoneShift"
          />
          <!-- 布局对话框仍由原组件承载，菜单项只负责打开 -->
          <ScoreLayoutControl
            ref="scoreLayoutControlRef"
            hide-trigger
            :music-score="musicScoreData"
            :disabled="fileBusy || isPlayMode"
          />
        </div>
      </template>
    </EditorScoreWorkspace>

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
    <ScoreToWorkDialog v-model="scoreToWorkVisible" @confirm="handleExportWork" />

    <EditorNoticeDialog v-model="editorNoticeVisible" />
    <DrumLegalNotesDialog v-model="drumLegalNotesVisible" />

    <NotationTypeConvertDialog ref="notationConvertDialogRef" />
    <LyricsMatchPanel
      v-if="lyricsMatchVisible"
      :music-score="musicScoreData"
      :anchor="menuBarAnchorRef"
      @close="lyricsMatchVisible = false"
    />
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

.editor-menu-host {
  position: relative;
  width: 100%;
}

.score-range-bar {
  position: absolute;
  top: 72px;
  left: 50%;
  z-index: 30;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: calc(100% - 32px);
  padding: 6px 8px 6px 12px;
  border: 1px solid rgba(255, 184, 208, 0.6);
  border-radius: 999px;
  background: rgba(255, 248, 251, 0.96);
  box-shadow: 0 6px 18px rgba(200, 140, 180, 0.18);
  box-sizing: border-box;
}

.score-range-bar__label {
  padding: 2px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
}

.score-range-bar__hint {
  font-size: 13px;
  font-weight: 700;
  color: #6b4f8a;
}

.score-range-bar__btn {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: rgba(255, 255, 255, 0.9);
  font-size: 12px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.score-range-bar__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>
