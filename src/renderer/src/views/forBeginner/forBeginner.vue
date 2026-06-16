<script lang="ts" setup>
import type { MusicScore, VDom } from 'deciphony-renderer'
import type { PlaySequence } from 'deciphony-player'
import musicScoreVue from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, onBeforeUnmount, onMounted, provide, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { BeginnerModeToolbar } from '@renderer/components/score-toolbar'
import PianoMidiBox from '@renderer/components/pianoMidiBoxCanvas.vue'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import { mergeGrandStaff } from '@renderer/dr-extensions/scoreUtil'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { useBeginnerSettingsStore } from '@renderer/store/beginnerSettings.store'
import { usePlayStore } from '@renderer/store/play.store'
import { resolvePlayBpm } from '@renderer/constant/play'
import { loadScoreFromRoute } from '@renderer/utils/scoreRoute'
import {
  toMidiBoxSequence,
  toPlaySequence,
  type MidiBoxSequence
} from '@renderer/utils/scorePagePlayback'
import {
  beginnerPlaybackKey,
  useBeginnerPlayback,
  type PianoMidiBoxExpose
} from '@renderer/views/forBeginner/beginnerPlayback'
import { createPracticeStaffDim } from '@renderer/views/practice/practiceStaffDim'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import {
  createBeginnerNoteProgressHighlight,
  type MidiBoxBatchPayload
} from '@renderer/views/forBeginner/beginnerNoteProgressHighlight'
import type { MusicScoreHighlightExpose } from '@renderer/dr-extensions/dr-play-highlight'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import empty from '@renderer/template/empty'

const MIDI_RANGE = { min: 21, max: 108 } as const
const MIDI_BOX_HEIGHT = '100%'
const PIANO_HEIGHT = '96px'
const SCORE_HEIGHT = 300
const MEASURE_WIDTH = 200

const route = useRoute()
const playStore = usePlayStore()
const metronomeStore = useMetronomeStore()
const settings = useBeginnerSettingsStore()
const musicScoreData = ref<MusicScore>(JSON.parse(JSON.stringify(empty)))
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()
const { initAfterLoad, applyDisplayType } = usePlayScoreNotationDisplay(musicScoreData, displayType)

const maxStaffCount = computed(() => {
  let max = 0
  for (const grandStaff of musicScoreData.value.grandStaffs ?? []) {
    max = Math.max(max, grandStaff.staves?.length ?? 0)
  }
  return max
})

const scoreScrollRef = ref<HTMLElement | null>(null)
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const pianoMidiBoxRef = ref<PianoMidiBoxExpose | null>(null)
const playSequence = ref<PlaySequence>([])
const midiBoxSequence = ref<MidiBoxSequence>({})
const vDomList = ref<VDom[]>([])

const staffDim = createPracticeStaffDim({
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const noteProgressHighlight = createBeginnerNoteProgressHighlight({
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const hasMidiBoxSequence = computed(() =>
  Object.values(midiBoxSequence.value).some((items) => items.length > 0)
)

const playback = useBeginnerPlayback({
  midiBoxRef: pianoMidiBoxRef,
  countIn: () => metronomeStore.playCountIn(),
  onPlayStarted: () => {
    if (settings.metronomeDuringPlay) void metronomeStore.startLoop()
  },
  onPlaybackStopped: () => {
    metronomeStore.stop()
    noteProgressHighlight.clearAll()
    scrollToPlayingNote.resetScroll()
  },
  hasSequence: () => hasMidiBoxSequence.value
})

provide(beginnerPlaybackKey, playback)

const notationTypeDisabled = computed(
  () => playback.playbackState.value !== 'stopped' || playback.countingIn.value
)

watch(
  () => settings.metronomeVolume,
  (value) => metronomeStore.setVolume(value)
)
watch(
  () => settings.bpm,
  (value) => {
    metronomeStore.setBpm(value)
    syncMetronome(musicScoreData.value, value)
  }
)

watch(
  () => playStore.volume,
  (value) => {
    if (value <= 0) playStore.releaseAllHeldNotes()
  }
)

async function onPianoKeyDown(midi: number) {
  if (playStore.volume <= 0) return
  await playStore.ensureCollectionToneColorInitialized()
  void playStore.triggerNote(midi)
}

function onPianoKeyUp(midi: number) {
  playStore.releaseNote(midi)
}

function handleRenderMusicScore(list: VDom[]) {
  vDomList.value = list
  staffDim.rebindAfterRender()
  noteProgressHighlight.rebindAfterRender()
}

function handleMidiBoxProgressReset() {
  noteProgressHighlight.clearAll()
}

function handleMidiBoxBatchComplete(payload: MidiBoxBatchPayload) {
  noteProgressHighlight.markBatchDone(payload.notes)
}

function handleMidiBoxBatchActive(payload: MidiBoxBatchPayload) {
  if (payload.batchIndex < 0 || payload.notes.length === 0) {
    noteProgressHighlight.setCurrentBatch([])
    return
  }
  noteProgressHighlight.setCurrentBatch(payload.notes)
  const noteId = payload.notes[0]?.info
  if (noteId != null) scrollToPlayingNote.scrollToHorizontalCenter(String(noteId))
}

function countMeasures(score: MusicScore): number {
  const staff = score.grandStaffs[0]?.staves[0]
  return Math.max(1, staff?.measures.length ?? 1)
}

function resolveTimeSignature(score: MusicScore): { timeSignature: string; beatUnit: number } {
  let raw: string | undefined
  for (const grandStaff of score.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      const type = staff.measures?.[0]?.timeSignature_f?.type as string | undefined
      if (type) {
        raw = type
        break
      }
    }
    if (raw) break
  }
  const normalized = (raw ?? '4_4').replace('_', '/')
  const denominator = Number(normalized.split('/')[1]) || 4
  return { timeSignature: normalized, beatUnit: denominator }
}

function syncMetronome(score: MusicScore, bpm: number) {
  const { timeSignature, beatUnit } = resolveTimeSignature(score)
  metronomeStore.syncScore({ bpm, beatUnit, timeSignature })
}

function applyScoreLayout(score: MusicScore) {
  const measureCount = countMeasures(score)
  score.width = measureCount * MEASURE_WIDTH
  score.height = SCORE_HEIGHT
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) {
    grandStaff.uSpace = 0
  }
}

function prepareBeginnerScore(score: MusicScore) {
  const cloned = JSON.parse(JSON.stringify(score)) as MusicScore
  mergeGrandStaff(cloned)
  applyScoreLayout(cloned)
  return cloned
}

function onNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === displayType.value) return

  playback.handleStop()

  try {
    applyDisplayType(targetType)
    musicScoreData.value = prepareBeginnerScore(musicScoreData.value)
    noteProgressHighlight.clearAll()
    rebuildSequences(musicScoreData.value)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '曲谱类型切换失败')
  }
}

function rebuildSequences(score: MusicScore) {
  const passSingleStaffIndex = settings.disabledStaffIndexes
  playSequence.value = toPlaySequence(score, { passSingleStaffIndex })
  midiBoxSequence.value = toMidiBoxSequence(playSequence.value)
  syncMetronome(score, settings.bpm)
  staffDim.sync(score, passSingleStaffIndex)
}

watch(
  maxStaffCount,
  (count) => settings.initStaffEnabled(count),
  { immediate: true }
)

watch(
  () => settings.staffEnabled,
  () => rebuildSequences(musicScoreData.value),
  { deep: true }
)

onMounted(async () => {
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    initAfterLoad(loaded)
    musicScoreData.value = prepareBeginnerScore(musicScoreData.value)
  } else {
    applyScoreLayout(musicScoreData.value)
  }

  await playStore.restorePlaybackDefaults(musicScoreData.value)
  settings.bpm = resolvePlayBpm(musicScoreData.value.bpm)
  metronomeStore.setVolume(settings.metronomeVolume)
  rebuildSequences(musicScoreData.value)
})

onBeforeUnmount(() => {
  playback.handleStop()
  metronomeStore.stop()
  playStore.releaseAllHeldNotes()
  staffDim.clearAll()
  noteProgressHighlight.clearAll()
})

function handleMidiBoxFinished() {
  playback.handleMidiBoxFinished()
}
</script>

<template>
  <div class="beginner-page">
    <section ref="scoreScrollRef" class="beginner-page__score hidden-scrollbar">
      <musicScoreVue
        ref="musicScoreRef"
        class="beginner-page__score-svg"
        :data="musicScoreData"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
        @renderMusicScore="handleRenderMusicScore"
      />
    </section>

    <section class="beginner-page__midi-box">
      <PianoMidiBox
        ref="pianoMidiBoxRef"
        class="beginner-page__midi-box-inner"
        layout-mode="fillParent"
        :height="MIDI_BOX_HEIGHT"
        :midi="MIDI_RANGE"
        :perform-sequence="midiBoxSequence"
        :base-line-bottom="100"
        :fall-duration="0.1"
        @progress-reset="handleMidiBoxProgressReset"
        @batch-complete="handleMidiBoxBatchComplete"
        @batch-active="handleMidiBoxBatchActive"
        @finished="handleMidiBoxFinished"
      />

      <div v-if="settings.coverMidiBox" class="beginner-page__midi-box-cover">
        <span class="beginner-page__midi-box-cover-emoji">🎵</span>
        <span class="beginner-page__midi-box-cover-text">凭听觉练习吧</span>
      </div>
    </section>

    <section class="beginner-page__piano">
      <VirtualPiano
        class="beginner-page__piano-inner"
        layout-mode="fillParent"
        :height="PIANO_HEIGHT"
        :midi="MIDI_RANGE"
        pitch-notation="None"
        @key-down="onPianoKeyDown"
        @key-up="onPianoKeyUp"
      />
    </section>

    <BeginnerModeToolbar
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      @notation-type-change="onNotationTypeChange"
    />
  </div>
</template>

<style scoped>
.beginner-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff8fb;
  overflow: hidden;
}

.beginner-page__score {
  flex-shrink: 0;
  max-height: 216px;
  overflow: auto;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.beginner-page__score-svg {
  flex-shrink: 0;
}

.beginner-page__midi-box {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 184, 208, 0.15);
  background: rgba(255, 255, 255, 0.72);
}

.beginner-page__midi-box-inner {
  width: 100%;
  height: 100%;
}

.beginner-page__midi-box-cover {
  position: absolute;
  inset: 0;
  z-index: 5;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 209, 232, 0.95), rgba(201, 184, 255, 0.92)),
    #ffd1e8;
}

.beginner-page__midi-box-cover-emoji {
  font-size: 56px;
}

.beginner-page__midi-box-cover-text {
  font-size: 16px;
  font-weight: 700;
  color: #7a5a86;
}

.beginner-page__piano {
  flex-shrink: 0;
  height: 96px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
}

.beginner-page__piano-inner {
  width: 100%;
  height: 100%;
}
</style>
