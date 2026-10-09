<script lang="ts" setup>
import type { MusicScore, VDom } from '@deciphony/renderer'
import type { PlaySequence } from '@deciphony/player'
import musicScoreVue from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import { nextTick, onBeforeUnmount, onMounted, provide, ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { PracticeModeToolbar } from '@renderer/components/score-toolbar'
import PianoWaterfall from '@renderer/components/pianoWaterfallCanvas.vue'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import {
  scorePlaybackKey,
  toPerformSequence,
  toPlaySequence,
  unit256ToMs,
  useScorePagePlayback,
  type PerformSequence,
  type PianoWaterfallPlaybackExpose
} from '@renderer/utils/scorePagePlayback'
import type { NoteScoreResult } from '@renderer/types/types'
import { mergeGrandStaff } from '@deciphony/extensions/score-util'
import type {
  MusicScoreHighlightExpose,
  PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import { createScoreNoteFillMarker } from '@renderer/utils/scoreNoteFillMarker'
import { usePlayStore } from '@renderer/store/play.store'
import { useMidiStore } from '@renderer/store/midi.store'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { usePracticeSettingsStore } from '@renderer/store/practiceSettings.store'
import { NOTE_RESULT_COLOR } from '@renderer/constant/practice'
import { loadScoreFromRoute } from '@renderer/utils/scoreRoute'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { applySingleLineModeScoreHeight } from '@renderer/utils/singleLineModeScoreLayout'
import { useSingleLineScoreCenter } from '@renderer/utils/singleLineScoreCenter'
import { practiceContextKey } from '@renderer/views/practice/practiceContext'
import { createPracticeStaffDim } from '@renderer/views/practice/practiceStaffDim'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import {
  createScoreSmoothScroll,
  sequenceToSmoothScrollTimeline
} from '@renderer/utils/scoreSmoothScroll'
import { applyScoreShiftWheelScroll } from '@renderer/utils/scoreShiftWheelScroll'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { useVirtualPianoSkin } from '@renderer/utils/collection/useVirtualPianoSkin'
import { usePerformSkin } from '@renderer/components/performSkin/usePerformSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import { resolveScoreKeySignature } from '@renderer/utils/scoreNotationTransfer'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { resolveScoreTimeSignature } from '@renderer/utils/scoreTimeSignature'
import { toBeatUnitBpm } from '@renderer/constant/play'
import empty from '@renderer/template/empty'

/** 练习模式瀑布流 / 虚拟钢琴共用 midi 范围（88 键） */
const PRACTICE_MIDI_RANGE = { min: 21, max: 108 } as const

/** 瀑布流区域高度 */
const PRACTICE_WATERFALL_HEIGHT = '100%'

/** 虚拟钢琴区域高度（占页面 15%，组件内铺满该区域） */
const PRACTICE_PIANO_SECTION_HEIGHT = '15%'
const PRACTICE_PIANO_HEIGHT = '100%'

/** 每个小节对应的曲谱宽度 */
const PRACTICE_MEASURE_WIDTH = 200

/** 演示播放倒计时（毫秒），同时作为瀑布流预备时间，倒计时结束时首音落到基准线 */
const DEMO_COUNT_IN_MS = 3000

const { t } = useI18n()
const route = useRoute()
const playStore = usePlayStore()
const midiStore = useMidiStore()
const metronomeStore = useMetronomeStore()
const settings = usePracticeSettingsStore()
const globalLoading = useGlobalLoadingStore()
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const { pianoSkin, virtualPianoSkinId, waitVirtualPianoSkin } = useVirtualPianoSkin()
const { performSkinReady, performSkinId, waitPerformSkin } = usePerformSkin()
const { initAfterLoad, applyDisplayType, applyTranspose, applySemitoneShift } =
  usePlayScoreNotationDisplay(musicScoreData, displayType)
const { extensions: scoreExtensions, slotConfig: scoreSlotConfig } =
  createScoreLyricsExtension('show', musicScoreData, { showTitle: false })

const maxStaffCount = computed(() => {
  let max = 0
  for (const grandStaff of musicScoreData.value.grandStaffs ?? []) {
    max = Math.max(max, grandStaff.staves?.length ?? 0)
  }
  return max
})

const scoreScrollRef = ref<HTMLElement | null>(null)
const scoreStackRef = ref<HTMLElement | null>(null)
const scoreCenter = useSingleLineScoreCenter(
  () => scoreStackRef.value?.querySelector<SVGSVGElement>(':scope > svg')
)
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const pianoWaterfallRef = ref<PianoWaterfallPlaybackExpose | null>(null)
const performSequence = ref<PerformSequence>({})
const playSequence = ref<PlaySequence>([])
const practiceBpm = ref(120)
const demoSession = ref(false)
const demoCountdown = ref(0)
/** 演示按住的键 → 按音符时值到点松开的定时器 */
const demoReleaseTimers = new Map<number, ReturnType<typeof setTimeout>>()
let demoCountInAbort: AbortController | null = null
/** 瀑布流时间整体延后：练习用预备拍一小节；演示用 3 秒倒计时 */
const countInPrepareMs = computed(() =>
  demoSession.value ? DEMO_COUNT_IN_MS : metronomeStore.getCountInDurationMs()
)
const vDomList = ref<VDom[]>([])

const scoreCanvasWidth = computed(() => musicScoreData.value.width ?? 0)
const scoreCanvasHeight = computed(() => musicScoreData.value.height ?? 0)

const findScoreElementByVDom = (node: VDom) => musicScoreRef.value?.findElementByVDom(node) ?? null

const staffDim = createPracticeStaffDim({
  getVDomList: () => vDomList.value,
  findElementByVDom: findScoreElementByVDom
})

const noteMarker = createScoreNoteFillMarker({ findElementByVDom: findScoreElementByVDom })

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: findScoreElementByVDom,
  getMusicScore: () => musicScoreData.value
})

const smoothScroll = createScoreSmoothScroll({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: findScoreElementByVDom,
  getMusicScore: () => musicScoreData.value,
  getTimeline: () => sequenceToSmoothScrollTimeline(playSequence.value),
  isPlaying: () => playback.playbackState.value === 'playing',
  getUnitsPerMs: () => 1 / unit256ToMs(1, playStore.bpm, playStore.beatUnit)
})

let scrollProgressSubId: string | null = null
let demoProgressStartSubId: string | null = null

const playback = useScorePagePlayback(musicScoreData, {
  musicScoreRef,
  waterfallRef: pianoWaterfallRef,
  getPlaySequence: () => playSequence.value,
  countIn: () => {
    smoothScroll.prepare()
    return demoSession.value ? waitDemoCountIn() : metronomeStore.playCountIn()
  },
  onPlayStarted: () => {
    if (demoSession.value) return
    if (settings.metronomeDuringPlay) void metronomeStore.startLoop()
  },
  onPlaybackPaused: () => {
    releaseDemoKeys()
    metronomeStore.stop()
  },
  onPlaybackStopped: () => {
    demoCountInAbort?.abort()
    demoCountdown.value = 0
    demoSession.value = false
    releaseDemoKeys()
    metronomeStore.stop()
    smoothScroll.stop()
    scrollToPlayingNote.resetScroll()
  },
  onClearPlayData: () => noteMarker.clearResults()
})

provide(scorePlaybackKey, playback)

const notationTypeDisabled = computed(
  () =>
    playback.playbackState.value !== 'stopped' ||
    playback.countingIn.value ||
    demoSession.value
)
const currentScoreKey = computed(() => resolveScoreKeySignature(musicScoreData.value))

const noteResultColor = NOTE_RESULT_COLOR

watch(
  () => settings.scoreVolume,
  (value) => playStore.setVolume(value)
)
watch(
  () => settings.bpm,
  (value) => {
    playStore.setBpm(value)
    practiceBpm.value = value
    performSequence.value = toPerformSequence(playSequence.value, value, playStore.beatUnit)
    syncMetronome(musicScoreData.value, value)
  }
)
watch(
  () => settings.metronomeVolume,
  (value) => metronomeStore.setVolume(value)
)
watch(
  () => settings.showNoteResult,
  (enabled) => {
    noteMarker.setResultsVisible(enabled)
  }
)

provide(practiceContextKey, {
  maxStaffCount,
  bpm: practiceBpm,
  demoSession,
  demoCountdown,
  handleToggleDemo
})

function playItemForProgressData(data: unknown) {
  const noteId = (data as { note_id?: string } | null)?.note_id
  if (!noteId) return null
  const item = playSequence.value.find((it) => it.id === noteId || it.data?.note_id === noteId)
  if (!item || item.midi <= 0 || item.duration <= 0) return null
  return item
}

function releaseDemoKeys() {
  for (const [midi, timer] of demoReleaseTimers) {
    clearTimeout(timer)
    midiStore.dispatchVirtualNote(midi, false)
  }
  demoReleaseTimers.clear()
}

/**
 * 松键按音符时值定时，不用播放器的 progressEnd：
 * 它在音频采样播完时才触发，采样比音符短会提前、同音连弹时释音尾巴会把后一个音一起松掉。
 */
function onDemoNoteStart(_progress: number, data: unknown) {
  if (!demoSession.value) return
  const item = playItemForProgressData(data)
  if (!item) return
  const midi = item.midi
  const prevTimer = demoReleaseTimers.get(midi)
  if (prevTimer != null) {
    clearTimeout(prevTimer)
    midiStore.dispatchVirtualNote(midi, false)
  }
  midiStore.dispatchVirtualNote(midi, true)
  const holdMs = unit256ToMs(item.duration, practiceBpm.value, playStore.beatUnit)
  demoReleaseTimers.set(
    midi,
    setTimeout(() => {
      demoReleaseTimers.delete(midi)
      midiStore.dispatchVirtualNote(midi, false)
    }, holdMs)
  )
}

async function waitDemoCountIn() {
  demoCountInAbort?.abort()
  const abort = new AbortController()
  demoCountInAbort = abort
  const started = performance.now()
  try {
    while (!abort.signal.aborted) {
      const left = DEMO_COUNT_IN_MS - (performance.now() - started)
      if (left <= 0) break
      demoCountdown.value = Math.max(1, Math.ceil(left / 1000))
      await new Promise<void>((resolve) => setTimeout(resolve, Math.min(80, left)))
    }
  } finally {
    if (demoCountInAbort === abort) demoCountdown.value = 0
  }
}

async function handleToggleDemo() {
  if (demoSession.value || playback.countingIn.value || playback.playbackState.value !== 'stopped') {
    playback.handleStop()
    return
  }
  demoSession.value = true
  await nextTick()
  await playback.handlePlay()
  if (playback.playbackState.value === 'stopped' && !playback.countingIn.value) {
    demoSession.value = false
    demoCountdown.value = 0
  }
}

/** 音符评分回调：给音符填充评分颜色 */
function handleNoteScore(
  result: NoteScoreResult,
  realScore: number,
  totalScore: number,
  info: any
) {
  void realScore
  void totalScore
  if (!settings.showNoteResult) return
  noteMarker.setNoteResult(info, result)
}

function handleRenderMusicScore(list: VDom[]) {
  vDomList.value = list
  playback.handleRenderMusicScore?.(list)
  noteMarker.onRenderMusicScore(list)
  staffDim.rebindAfterRender()
  scoreCenter.recenter()
}

/** 停止态 Shift+滚轮：横向浏览曲谱（方便查看练习结果） */
function onScoreWheel(event: WheelEvent) {
  applyScoreShiftWheelScroll(
    scoreScrollRef.value,
    event,
    playback.playbackState.value === 'stopped' && !playback.countingIn.value
  )
}

function countPracticeMeasures(score: MusicScore): number {
  const staff = score.grandStaffs[0]?.staves[0]
  return Math.max(1, staff?.measures.length ?? 1)
}

/** 节拍器跟拍号分母；settings/playStore.bpm 为四分音符基准 */
function syncMetronome(score: MusicScore, quarterBpm: number) {
  const { timeSignature, beatUnit } = resolveScoreTimeSignature(score)
  metronomeStore.syncScore({
    bpm: toBeatUnitBpm(quarterBpm, beatUnit),
    beatUnit,
    timeSignature
  })
}

function applyPracticeScoreLayout(score: MusicScore) {
  const measureCount = countPracticeMeasures(score)
  score.width = measureCount * PRACTICE_MEASURE_WIDTH
  applySingleLineModeScoreHeight(score)
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) {
    grandStaff.uSpace = 0
  }
}

function preparePracticeScore(score: MusicScore) {
  const cloned = JSON.parse(JSON.stringify(score)) as MusicScore
  mergeGrandStaff(cloned)
  applyPracticeScoreLayout(cloned)
  return cloned
}

function onNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === displayType.value) return

  playback.handleStop()

  try {
    applyDisplayType(targetType)
    musicScoreData.value = preparePracticeScore(musicScoreData.value)
    noteMarker.clearResults()
    rebuildPracticeSequences(musicScoreData.value)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('practice.messages.notationTypeSwitchFailed'))
  }
}

function onTranspose(payload: { toKey: KeySignatureTypeEnum }) {
  if (payload.toKey === currentScoreKey.value) {
    ElMessage.info(t('editor.messages.transposeSameKey'))
    return
  }
  playback.handleStop()
  try {
    applyTranspose(payload)
    musicScoreData.value = preparePracticeScore(musicScoreData.value)
    noteMarker.clearResults()
    rebuildPracticeSequences(musicScoreData.value)
    ElMessage.success(t('editor.messages.transposed'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.transposeFailed'))
  }
}

function onSemitoneShift(semitones: 1 | -1) {
  playback.handleStop()
  try {
    applySemitoneShift(semitones)
    musicScoreData.value = preparePracticeScore(musicScoreData.value)
    noteMarker.clearResults()
    rebuildPracticeSequences(musicScoreData.value)
    ElMessage.success(
      semitones > 0 ? t('editor.messages.semitoneRaised') : t('editor.messages.semitoneLowered')
    )
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('editor.messages.semitoneShiftFailed')
    )
  }
}

function rebuildPracticeSequences(score: MusicScore) {
  const bpm = settings.bpm
  practiceBpm.value = bpm
  const passSingleStaffIndex = settings.disabledStaffIndexes
  playSequence.value = toPlaySequence(score, { passSingleStaffIndex })
  syncMetronome(score, bpm)
  performSequence.value = toPerformSequence(playSequence.value, bpm, playStore.beatUnit)
  staffDim.sync(score, passSingleStaffIndex)
  if (playback.playbackState.value === 'stopped') {
    playStore.setPlaySequence(playSequence.value)
  }
}

watch(maxStaffCount, (count) => settings.initStaffEnabled(count), { immediate: true })

watch(
  () => settings.staffEnabled,
  () => rebuildPracticeSequences(musicScoreData.value),
  { deep: true }
)

watch(
  () => playStore.collectionToneColorId,
  () => {
    if (playback.playbackState.value === 'stopped') {
      rebuildPracticeSequences(musicScoreData.value)
    }
  }
)

onMounted(async () => {
  globalLoading.show(t('common.loading'))
  try {
    const [, , , , loaded] = await Promise.all([
      waitScoreSkin(),
      waitVirtualPianoSkin(),
      waitPerformSkin(),
      playStore.waitReady(),
      loadScoreFromRoute(route)
    ])
    if (loaded) {
      initAfterLoad(loaded)
      musicScoreData.value = preparePracticeScore(musicScoreData.value)
    } else {
      applyPracticeScoreLayout(musicScoreData.value)
    }

    await playStore.restorePlaybackDefaults(musicScoreData.value)
    settings.bpm = playStore.bpm
    settings.scoreVolume = playStore.volume
    metronomeStore.setVolume(settings.metronomeVolume)
    rebuildPracticeSequences(musicScoreData.value)

    scrollProgressSubId = playback.subscribeProgressStart((_progress, data) => {
      smoothScroll.handleProgressStart(data as PlayHighlightProgressData)
    })
    demoProgressStartSubId = playStore.subscribeProgressStart(onDemoNoteStart)
  } finally {
    globalLoading.hide()
  }
})

onBeforeUnmount(() => {
  if (scrollProgressSubId) playback.unsubscribeProgressStart(scrollProgressSubId)
  if (demoProgressStartSubId) playStore.unsubscribeProgressStart(demoProgressStartSubId)
  releaseDemoKeys()
  playback.handleStop()
  metronomeStore.stop()
  noteMarker.clearAll()
  staffDim.clearAll()
})
</script>

<template>
  <div class="practice-page">
    <section
      ref="scoreScrollRef"
      :class="[
        'practice-page__score',
        'hidden-scrollbar',
        {
          'practice-page__score--hidden': settings.hideScore,
          'score-scroll-locked':
            playback.playbackState.value !== 'stopped' || playback.countingIn.value
        }
      ]"
      :style="{ maxHeight: settings.hideScore ? '0px' : `${scoreCanvasHeight + 21}px` }"
      @wheel="onScoreWheel"
    >
      <div
        ref="scoreStackRef"
        class="practice-page__score-stack"
        :style="{
          width: `${scoreCanvasWidth}px`,
          height: `${scoreCanvasHeight}px`,
          transform: `translateY(${scoreCenter.offsetY.value}px)`
        }"
      >
        <musicScoreVue
          v-if="scoreSkin"
          :key="scoreSkinName"
          ref="musicScoreRef"
          class="practice-page__score-svg"
          :data="musicScoreData"
          :slot-config="scoreSlotConfig"
          :extensions="scoreExtensions"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          @renderMusicScore="handleRenderMusicScore"
        />
      </div>
    </section>

    <section class="practice-page__stats">
      <span class="practice-page__stat">
        {{ t('practice.stats.totalNotes') }} {{ pianoWaterfallRef?.stats?.total ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.miss') }} {{ pianoWaterfallRef?.stats?.miss ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.early') }} {{ pianoWaterfallRef?.stats?.early ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.late') }} {{ pianoWaterfallRef?.stats?.late ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.pass') }} {{ pianoWaterfallRef?.stats?.pass ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.good') }} {{ pianoWaterfallRef?.stats?.good ?? 0 }}
      </span>
      <span class="practice-page__stat">
        {{ t('practice.result.perfect') }} {{ pianoWaterfallRef?.stats?.perfect ?? 0 }}
      </span>
      <span class="practice-page__stat practice-page__stat--score">
        {{ t('practice.stats.realScore') }} {{ (pianoWaterfallRef?.stats?.realScore ?? 0).toFixed(1) }}
      </span>
      <span class="practice-page__stat practice-page__stat--score">
        {{ t('practice.stats.totalScore') }} {{ (pianoWaterfallRef?.stats?.totalScore ?? 0).toFixed(1) }}
      </span>
    </section>

    <section class="practice-page__waterfall">
      <PianoWaterfall
        v-if="performSkinReady"
        :key="performSkinId ?? 'default'"
        ref="pianoWaterfallRef"
        class="practice-page__waterfall-inner"
        layout-mode="fillParent"
        :height="PRACTICE_WATERFALL_HEIGHT"
        :midi="PRACTICE_MIDI_RANGE"
        :perform-sequence="performSequence"
        :bpm="practiceBpm"
        :baseLineBottom="100"
        :prepare-time="countInPrepareMs"
        :columnHeightConstant="0.1"
        :highlight-policy="settings.highlightPolicy"
        :show-note-result="settings.showNoteResult"
        :result-color-map="noteResultColor"
        @score="handleNoteScore"
      />

      <div v-if="settings.coverWaterfall" class="practice-page__waterfall-cover">
        <span class="practice-page__waterfall-cover-emoji">🎵</span>
        <span class="practice-page__waterfall-cover-text">{{ t('practice.coverText') }}</span>
      </div>
      <div v-if="demoCountdown > 0" class="practice-page__demo-countdown" aria-live="polite">
        {{ demoCountdown }}
      </div>
    </section>

    <section class="practice-page__piano">
      <VirtualPiano
        v-if="pianoSkin"
        :key="virtualPianoSkinId ?? 'default'"
        class="practice-page__piano-inner"
        layout-mode="fillParent"
        :height="PRACTICE_PIANO_HEIGHT"
        :midi="PRACTICE_MIDI_RANGE"
        pitch-notation="None"
      />
    </section>

    <PracticeModeToolbar
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      :current-key="currentScoreKey"
      :transpose-disabled="notationTypeDisabled"
      @notation-type-change="onNotationTypeChange"
      @transpose="onTranspose"
      @semitone-shift="onSemitoneShift"
    />
  </div>
</template>

<style scoped>
.practice-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff8fb;
  overflow: hidden;
}

.practice-page__score {
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.practice-page__score--hidden {
  padding: 0;
  border-bottom: none;
}

.practice-page__score-stack {
  position: relative;
  flex-shrink: 0;
}

.practice-page__score-svg {
  flex-shrink: 0;
  display: block;
  overflow: visible;
}

.practice-page__stats {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  align-items: center;
  padding: 8px 16px;
  font-size: 13px;
  color: #8a5a72;
  background: rgba(255, 248, 252, 0.9);
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.practice-page__stat {
  white-space: nowrap;
}

.practice-page__stat--score {
  font-weight: 600;
  color: #d6336c;
}

.practice-page__waterfall {
  position: relative;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 184, 208, 0.15);
  background: rgba(255, 255, 255, 0.72);
}

.practice-page__waterfall-cover {
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
  color: #fff;
}

.practice-page__waterfall-cover-emoji {
  font-size: 56px;
}

.practice-page__waterfall-cover-text {
  font-size: 16px;
  font-weight: 700;
  color: #7a5a86;
}

.practice-page__demo-countdown {
  position: absolute;
  inset: 0;
  z-index: 6;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  font-size: 96px;
  font-weight: 800;
  color: #d6336c;
  text-shadow: 0 4px 18px rgba(255, 255, 255, 0.9);
}

.practice-page__waterfall-inner {
  width: 100%;
  height: 100%;
}

.practice-page__piano {
  flex-shrink: 0;
  height: v-bind(PRACTICE_PIANO_SECTION_HEIGHT);
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
}

.practice-page__piano-inner {
  width: 100%;
  height: 100%;
}
</style>
