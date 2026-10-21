<script setup lang="ts">
import { EditPen, VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import type { MusicScore, MusicScoreTypeEnum } from '@deciphony/renderer'
import { storeToRefs } from 'pinia'
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import VerticalDragSlider from '@renderer/components/VerticalDragSlider.vue'
import { hasGrandStaffSingleStaffMismatch } from '@deciphony/extensions/score-util'
import {
  scorePlaybackKey,
  scorePlayRangeKey,
  scoreScrollFollowKey
} from '@renderer/utils/scorePagePlayback'
import {
  PLAY_BPM_MAX,
  PLAY_BPM_MIN,
  PLAY_VOLUME_MAX,
  PLAY_VOLUME_MIN
} from '@renderer/constant/play'
import {
  PLAY_SOURCE,
  PLAY_SOURCE_OPTIONS,
  type PlaySource
} from '@renderer/constant/playSource'
import { SCORE_TIME_OFFSET_PROP } from '@renderer/constant/scoreTimeOffset'
import { usePlayStore } from '@renderer/store/play.store'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import {
  getAudioFromDatabase,
  toPlayableAudioUrl
} from '@renderer/utils/fileHelper/audioFile'
import { createAudioTimeHighlight } from '@renderer/utils/scorePagePlayback/createAudioTimeHighlight'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import ScoreNotationTypeSelector from './ScoreNotationTypeSelector.vue'
import ScoreTransposeControl from './ScoreTransposeControl.vue'
import ScoreSemitoneShiftButtons from './ScoreSemitoneShiftButtons.vue'
import ScoreToneColorAdjuster from './ScoreToneColorAdjuster.vue'
import ScoreMarkSelector from './ScoreMarkSelector.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'
import type { ScoreMarkValue } from '@renderer/utils/scoreMark'
import type { KeySignatureTypeEnum } from '@deciphony/renderer'
import { isFixedToneColorScore, isPlayOnlyMusicScore } from '@renderer/utils/isTabNotation'

type ScoreCustomData = Record<string, unknown> & {
  vocalPerformanceId?: number | null
  accompanimentId?: number | null
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const playbackMaybe = inject(scorePlaybackKey)
if (!playbackMaybe) {
  throw new Error('PlayModeToolbar requires scorePlayback from play.vue')
}
const playback = playbackMaybe
const scrollFollow = inject(scoreScrollFollowKey, null)
const rangeSelect = inject(scorePlayRangeKey, null)
const playStore = usePlayStore()
const audioStore = useAudioPlayerStore()
const { volume, bpm } = storeToRefs(playStore)
let lastAudioScrollNoteId = ''

const props = defineProps<{
  musicScore: MusicScore
  notationType: MusicScoreTypeEnum
  notationTypeDisabled?: boolean
  currentKey: KeySignatureTypeEnum
  transposeDisabled?: boolean
  mark: ScoreMarkValue
}>()

const emit = defineEmits<{
  'notation-type-change': [value: MusicScoreTypeEnum]
  transpose: [payload: { toKey: KeySignatureTypeEnum }]
  'semitone-shift': [semitones: 1 | -1]
  'update:mark': [value: ScoreMarkValue]
}>()

const playSource = ref<PlaySource>(PLAY_SOURCE.score)
const audioLoading = ref(false)

const activePanel = ref<'volume' | 'bpm' | null>(null)

const volumeLabel = computed(() => `${Math.round(volume.value * 100)}%`)
const bpmLabel = computed(() => `${Math.round(bpm.value)}`)

const isScoreSource = computed(() => playSource.value === PLAY_SOURCE.score)
const isPlayOnlyScore = computed(() => isPlayOnlyMusicScore(props.musicScore))
const isFixedToneColor = computed(() => isFixedToneColorScore(props.musicScore))
const singleLineModeDisabled = computed(() => isPlayOnlyScore.value)
const notationControlsDisabled = computed(
  () => props.notationTypeDisabled || !isScoreSource.value || isPlayOnlyScore.value
)

function timePropForSource(source: PlaySource): string {
  if (source === PLAY_SOURCE.vocal) return SCORE_TIME_OFFSET_PROP.vocalPerformance
  if (source === PLAY_SOURCE.accompaniment) return SCORE_TIME_OFFSET_PROP.accompaniment
  return ''
}

const audioTimeHighlight = createAudioTimeHighlight({
  getMusicScore: () => props.musicScore,
  getTimeProp: () => timePropForSource(playSource.value),
  highlight: {
    addNoteHighlight: (noteId) => playback.addNoteHighlight?.(noteId),
    removeNoteHighlight: (noteId) => playback.removeNoteHighlight?.(noteId),
    clearHighlight: () => playback.clearNoteHighlight?.()
  }
})

function resetAudioHighlight() {
  audioTimeHighlight.reset()
  lastAudioScrollNoteId = ''
}

function followAudioHighlightIds(ids: string[]) {
  const first = ids[0]?.trim()
  if (!first || first === lastAudioScrollNoteId) return
  lastAudioScrollNoteId = first
  scrollFollow?.followPlayingNote(first)
}

function readBoundAudioId(key: 'vocalPerformanceId' | 'accompanimentId'): number | null {
  const score = props.musicScore as MusicScore & { data?: ScoreCustomData }
  const data = score.data
  if (!data || typeof data !== 'object') return null
  const raw = data[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

const vocalPerformanceId = computed(() => readBoundAudioId('vocalPerformanceId'))
const accompanimentId = computed(() => readBoundAudioId('accompanimentId'))

const vocalEnabled = computed(() => vocalPerformanceId.value != null)
const accompanimentEnabled = computed(() => accompanimentId.value != null)

const scorePlaybackActive = computed(
  () => playback.playbackState.value !== 'stopped' || playback.countingIn.value
)

const sourceSelectDisabled = computed(() => {
  if (audioLoading.value) return true
  if (isScoreSource.value) return scorePlaybackActive.value
  return audioStore.playbackState !== 'stopped'
})

const playDisabled = computed(() =>
  isScoreSource.value ? playback.playDisabled.value : audioStore.playDisabled
)
const pauseDisabled = computed(() =>
  isScoreSource.value ? playback.pauseDisabled.value : audioStore.pauseDisabled
)
const stopDisabled = computed(() =>
  isScoreSource.value ? playback.stopDisabled.value : audioStore.stopDisabled
)

function stopAll() {
  playback.handleStop()
  audioStore.stop()
  resetAudioHighlight()
  scrollFollow?.resetScroll()
}

async function loadBoundAudio(audioId: number) {
  audioLoading.value = true
  try {
    const row = await getAudioFromDatabase(audioId)
    if (!row) throw new Error(t('play.messages.boundAudioMissing'))
    const url = toPlayableAudioUrl(row.url)
    if (!url) throw new Error(t('play.messages.boundAudioMissing'))
    await audioStore.setAudio(audioId, url)
    audioStore.setVolume(volume.value)
  } finally {
    audioLoading.value = false
  }
}

async function onPlaySourceChange(next: PlaySource) {
  stopAll()
  playSource.value = next
  if (next !== PLAY_SOURCE.score) rangeSelect?.end()
  if (next === PLAY_SOURCE.score) return

  const id =
    next === PLAY_SOURCE.vocal ? vocalPerformanceId.value : accompanimentId.value
  if (id == null) {
    playSource.value = PLAY_SOURCE.score
    ElMessage.warning(t('play.messages.boundAudioMissing'))
    return
  }

  try {
    await loadBoundAudio(id)
    audioTimeHighlight.prepare()
  } catch (error) {
    playSource.value = PLAY_SOURCE.score
    ElMessage.error(error instanceof Error ? error.message : t('play.messages.audioLoadFailed'))
  }
}

function toggleRangeSelect() {
  if (!rangeSelect) return
  if (rangeSelect.active.value) rangeSelect.end()
  else rangeSelect.start()
}

async function onPlay() {
  if (isScoreSource.value) {
    if (rangeSelect?.active.value && !rangeSelect.complete.value) {
      ElMessage.warning(t('play.range.incomplete'))
      return
    }
    resetAudioHighlight()
    await playback.handlePlay()
    return
  }
  // ?????????????+ ?? map ?? stop ?? 0
  if (audioStore.playbackState === 'stopped') {
    audioTimeHighlight.prepare()
  }
  if (!audioTimeHighlight.hasTimedSlots()) {
    ElMessage.warning(
      playSource.value === PLAY_SOURCE.vocal
        ? t('play.messages.vocalTimeOffsetMissing')
        : t('play.messages.accompanimentTimeOffsetMissing')
    )
  }
  audioStore.setVolume(volume.value)
  await audioStore.play()
}

function onPause() {
  if (isScoreSource.value) {
    playback.handlePause()
    return
  }
  audioStore.pause()
}

function onStop() {
  if (isScoreSource.value) {
    playback.handleStop()
    resetAudioHighlight()
    return
  }
  audioStore.stop()
  resetAudioHighlight()
  scrollFollow?.resetScroll()
}

function onVolumeChange(value: number) {
  playStore.setVolume(value)
  if (!isScoreSource.value) audioStore.setVolume(value)
}

/** ?? data ????id ??????????*/
watch(
  [vocalPerformanceId, accompanimentId],
  () => {
    if (playSource.value === PLAY_SOURCE.vocal && !vocalEnabled.value) {
      stopAll()
      playSource.value = PLAY_SOURCE.score
    }
    if (playSource.value === PLAY_SOURCE.accompaniment && !accompanimentEnabled.value) {
      stopAll()
      playSource.value = PLAY_SOURCE.score
    }
  }
)

function togglePanel(panel: 'volume' | 'bpm') {
  activePanel.value = activePanel.value === panel ? null : panel
}

function formatVolume(value: number) {
  return `${Math.round(value * 100)}%`
}

function formatBpm(value: number) {
  return `${Math.round(value)}`
}

function onDocumentPointerDown(event: PointerEvent) {
  const target = event.target as HTMLElement
  if (!target.closest('.score-toolbar__adjuster')) {
    activePanel.value = null
  }
}

onMounted(() => {
  document.addEventListener('pointerdown', onDocumentPointerDown)
  playSource.value = PLAY_SOURCE.score
  audioStore.setOnProgress((current) => {
    if (playSource.value === PLAY_SOURCE.score) return
    followAudioHighlightIds(audioTimeHighlight.syncAtTime(current))
  })
  audioStore.setOnEnd(() => {
    resetAudioHighlight()
    scrollFollow?.resetScroll()
  })
})

onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onDocumentPointerDown)
  audioStore.setOnProgress(null)
  audioStore.setOnEnd(null)
  stopAll()
})

function switchToEdit() {
  stopAll()
  activePanel.value = null
  router.replace({
    name: 'edit',
    query: buildScoreRouteQuery(route)
  })
}

function goSingleLineMode(name: 'practice' | 'forBeginner' | 'singing') {
  if (isPlayOnlyMusicScore(props.musicScore)) {
    ElMessage.warning(t('play.messages.playOnlyModeUnavailable'))
    return
  }
  if (hasGrandStaffSingleStaffMismatch(props.musicScore)) {
    ElMessage.warning(t('play.messages.grandStaffMismatch'))
    return
  }

  stopAll()
  activePanel.value = null
  router.push({
    name,
    query: buildScoreRouteQuery(route)
  })
}

function goPractice() {
  goSingleLineMode('practice')
}

function goForBeginner() {
  goSingleLineMode('forBeginner')
}

function goSinging() {
  goSingleLineMode('singing')
}
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/" />
    </template>
    <template #center>
      <button type="button" class="score-toolbar__btn" @click="switchToEdit">
        <el-icon><EditPen /></el-icon>
        <span>{{ t('play.toolbar.editMode') }}</span>
      </button>
      <el-select
        :model-value="playSource"
        class="score-toolbar__source"
        size="small"
        :disabled="sourceSelectDisabled"
        @update:model-value="onPlaySourceChange"
      >
        <el-option
          v-for="opt in PLAY_SOURCE_OPTIONS"
          :key="opt.value"
          :label="t(opt.labelKey)"
          :value="opt.value"
          :disabled="
            (opt.value === PLAY_SOURCE.vocal && !vocalEnabled) ||
            (opt.value === PLAY_SOURCE.accompaniment && !accompanimentEnabled)
          "
        />
      </el-select>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="playDisabled || audioLoading"
        @click="onPlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>{{ t('play.toolbar.play') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="pauseDisabled"
        @click="onPause"
      >
        <el-icon><VideoPause /></el-icon>
        <span>{{ t('play.toolbar.pause') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="stopDisabled"
        @click="onStop"
      >
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>{{ t('play.toolbar.stop') }}</span>
      </button>
      <button
        v-if="rangeSelect"
        type="button"
        class="score-toolbar__btn"
        :class="{ 'score-toolbar__btn--accent': rangeSelect.active.value }"
        :disabled="!isScoreSource"
        :title="t('play.range.tooltip')"
        @click="toggleRangeSelect"
      >
        <span>{{ t('play.range.title') }}</span>
      </button>
      <div class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('volume')">
          {{ t('play.toolbar.volume') }} {{ volumeLabel }}
        </button>
        <div v-if="activePanel === 'volume'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatVolume"
            :label="t('play.toolbar.volume')"
            :max="PLAY_VOLUME_MAX"
            :min="PLAY_VOLUME_MIN"
            :model-value="volume"
            :step="0.01"
            @update:model-value="onVolumeChange"
          />
        </div>
      </div>
      <div v-if="isScoreSource" class="score-toolbar__adjuster">
        <button type="button" class="score-toolbar__btn" @click="togglePanel('bpm')">
          {{ t('play.toolbar.bpm') }} {{ bpmLabel }}
        </button>
        <div v-if="activePanel === 'bpm'" class="score-toolbar__popup" @pointerdown.stop>
          <VerticalDragSlider
            :format="formatBpm"
            :label="t('play.toolbar.bpm')"
            :max="PLAY_BPM_MAX"
            :min="PLAY_BPM_MIN"
            :model-value="bpm"
            :step="1"
            @update:model-value="playStore.setBpm"
          />
        </div>
      </div>
      <ScoreToneColorAdjuster
        v-if="isScoreSource && !isFixedToneColor"
        score-option
        :disabled="scorePlaybackActive"
      />
      <ScoreNotationTypeSelector
        v-if="!isPlayOnlyScore"
        :model-value="notationType"
        :disabled="notationControlsDisabled"
        @change="emit('notation-type-change', $event)"
      />
      <ScoreTransposeControl
        v-if="!isPlayOnlyScore"
        :current-key="currentKey"
        :disabled="transposeDisabled || notationControlsDisabled"
        @transpose="emit('transpose', $event)"
      />
      <ScoreSemitoneShiftButtons
        v-if="!isPlayOnlyScore"
        :disabled="transposeDisabled || notationControlsDisabled"
        @shift="emit('semitone-shift', $event)"
      />
      <ScoreMarkSelector
        v-if="!isPlayOnlyScore"
        :model-value="mark"
        @update:model-value="emit('update:mark', $event)"
      />
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="singleLineModeDisabled"
        @click="goPractice"
      >
        <span>{{ t('play.toolbar.practiceMode') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="singleLineModeDisabled"
        @click="goForBeginner"
      >
        <span>{{ t('play.toolbar.beginnerMode') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="singleLineModeDisabled"
        @click="goSinging"
      >
        <span>{{ t('play.toolbar.singingMode') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>
</template>

<style scoped>
.score-toolbar__stop-icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}

.score-toolbar__source {
  width: 96px;
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
</style>
