<script lang="ts" setup>
import type { MusicScore, VDom } from '@deciphony/renderer'
import musicScoreVue from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { mergeGrandStaff } from '@deciphony/extensions/score-util'
import {
  drPlayHighlight,
  type MusicScoreHighlightExpose,
  type PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import {
  activeContext,
  closeTuneJudge,
  getMidiFixedOffset,
  getPlaySequence,
  getScoreSnapshot,
  loadSequence,
  pause,
  play,
  playMap,
  playedMap,
  setBpm,
  setInitialMidiFixedOffset,
  setJudgeConfig,
  setProgressCallback,
  startTuneJudge,
  stop as stopTuneJudge,
  type Sequence,
  type TuneJudgeScoreSnapshot
} from '@deciphony/tune-judge'
import { SingingModeToolbar } from '@renderer/components/score-toolbar'
import SingingWaterfall from '@renderer/components/singing/SingingWaterfall.vue'
import SingingResultDialog from '@renderer/components/singing/SingingResultDialog.vue'
import SingingStartCountdown from '@renderer/components/singing/SingingStartCountdown.vue'
import { SINGING_COUNTDOWN_MS } from '@renderer/constant/singingCountdown'
import {
  SINGING_MIDI_FIXED_OFFSET_MAX,
  SINGING_MIDI_FIXED_OFFSET_MIN,
  loadSingingMidiFixedOffset,
  saveSingingMidiFixedOffset
} from '@renderer/constant/singing'
import {
  ScoreNoteHeadOverlay,
  type ScoreNoteHeadOverlayApi
} from '@renderer/components/scoreNoteHeadOverlay'
import { PLAY_SOURCE, type PlaySource } from '@renderer/constant/playSource'
import { resolvePlayBpm } from '@renderer/constant/play'
import { loadScoreFromRoute } from '@renderer/utils/scoreRoute'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { applySingleLineModeScoreHeight } from '@renderer/utils/singleLineModeScoreLayout'
import { useSingleLineScoreCenter } from '@renderer/utils/singleLineScoreCenter'
import {
  createScoreSmoothScroll,
  sequenceToSmoothScrollTimeline
} from '@renderer/utils/scoreSmoothScroll'
import { toPlaySequence } from '@renderer/utils/scorePagePlayback'
import type { RenderMusicScoreHandler } from '@renderer/utils/scorePagePlayback/types'
import { createAudioTimeHighlight } from '@renderer/utils/scorePagePlayback/createAudioTimeHighlight'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import { resolveScoreKeySignature } from '@renderer/utils/scoreNotationTransfer'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { usePlayStore } from '@renderer/store/play.store'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import {
  canSelectSingingSource,
  probeSingingSourceAvailabilitySync,
  resolveSingingAudio
} from '@renderer/utils/singing/resolveSingingAudio'
import {
  offsetTuneJudgeSequence,
  sequenceEndUnit256,
  secondsToUnit256,
  toTuneJudgeSequence
} from '@renderer/utils/singing/toTuneJudgeSequence'
import {
  mapTuneJudgeStateToNoteResult,
  noteIdFromTuneJudgeData
} from '@renderer/utils/singing/mapTuneJudgeNoteState'
import { SCORE_TIME_OFFSET_PROP } from '@renderer/constant/scoreTimeOffset'
import { buildNoteStaveIndexMap } from '@renderer/utils/staffNotes'
import { createPracticeStaffDim } from '@renderer/views/practice/practiceStaffDim'
import empty from '@renderer/template/empty'

defineOptions({ name: 'SingingModeView' })

/** 演唱只测评第一行单谱表 */
const SINGING_JUDGE_STAFF_INDEX = 0

const PRACTICE_MEASURE_WIDTH = 200

const { t } = useI18n()
const route = useRoute()
const globalLoading = useGlobalLoadingStore()
const playStore = usePlayStore()
const audioStore = useAudioPlayerStore()

const musicScoreData = ref(JSON.parse(JSON.stringify(empty)) as MusicScore)
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const { initAfterLoad, applyDisplayType, applyTranspose, applySemitoneShift } =
  usePlayScoreNotationDisplay(musicScoreData, displayType)
const lyricsBundle = createScoreLyricsExtension('show', musicScoreData, { showTitle: false })
const scoreSlotConfig = lyricsBundle.slotConfig

const scoreScrollRef = ref<HTMLElement | null>(null)
const scoreStackRef = ref<HTMLElement | null>(null)
const scoreCenter = useSingleLineScoreCenter(
  () => scoreStackRef.value?.querySelector<SVGSVGElement>(':scope > svg')
)
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const scoreOverlayRef = ref<ScoreNoteHeadOverlayApi | null>(null)
const vDomList = ref<VDom[]>([])

const playSource = ref<PlaySource>(PLAY_SOURCE.score)
const vocalEnabled = ref(false)
const accompanimentEnabled = ref(false)
const judgeSeq = ref<Sequence>([])
const detecting = ref(false)
const countingDown = ref(false)
const preparingStart = ref(false)
const resultVisible = ref(false)
const liveMidi = ref<number | null>(null)
/** 初始音高偏移（半音），保存后下次演唱从此值起算 */
const initialMidiFixedOffset = ref(loadSingingMidiFixedOffset())
/** 当前生效偏移（含演唱中校准），来自进度回调 */
const liveMidiFixedOffset = ref(initialMidiFixedOffset.value)
const detectStartTimeMs = ref(0)
const nowMs = ref(performance.now())
let rafId = 0
let ending = false
let scoreProgressSubId: string | null = null
const appliedResultNoteIds = new Set<string>()

type TrackBar = { midi: number; start: number; end: number }
type PlayedLayer = 'raw' | 'fixed' | 'absorbed'

const emptyScoreSnap = (): TuneJudgeScoreSnapshot => ({
  real: { pitchScore: 0, rhythmScore: 0, completenessScore: 0 },
  total: { pitchScore: 0, rhythmScore: 0, completenessScore: 0 }
})

const scoreSnap = ref<TuneJudgeScoreSnapshot>(emptyScoreSnap())
const playedTrackMode = ref<PlayedLayer>('absorbed')
const playMapState = ref<Map<number, number[][]>>(new Map())
const playedMapsByLayer = ref<Record<PlayedLayer, Map<number, number[][]>>>({
  raw: new Map(),
  fixed: new Map(),
  absorbed: new Map()
})

const scoreCanvasWidth = computed(() => musicScoreData.value.width ?? 0)
const scoreCanvasHeight = computed(() => musicScoreData.value.height ?? 0)
const bpm = computed(() => resolvePlayBpm(musicScoreData.value))
const seqEndUnit = computed(() => sequenceEndUnit256(judgeSeq.value))
const isScoreSource = computed(() => playSource.value === PLAY_SOURCE.score)

const playHl = drPlayHighlight({
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null,
  getBpm: () => bpm.value
})
const scoreExtensions = computed(() => [...lyricsBundle.extensions.value, playHl])

const smoothScroll = createScoreSmoothScroll({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null,
  getMusicScore: () => musicScoreData.value,
  getTimeline: () => sequenceToSmoothScrollTimeline(judgeSeq.value, noteIdFromTuneJudgeData),
  getTime: () =>
    detecting.value && detectStartTimeMs.value > 0
      ? secondsToUnit256((performance.now() - detectStartTimeMs.value) / 1000, bpm.value)
      : null
})

const findScoreElementByVDom = (node: VDom) => musicScoreRef.value?.findElementByVDom(node) ?? null

const staffDim = createPracticeStaffDim({
  getVDomList: () => vDomList.value,
  findElementByVDom: findScoreElementByVDom
})

const noteStaveIndexMap = computed(() => buildNoteStaveIndexMap(musicScoreData.value))

function isSingingJudgeNoteId(noteId: string | null | undefined): boolean {
  const id = noteId?.trim()
  if (!id) return false
  const stave = noteStaveIndexMap.value.get(id)
  return stave === SINGING_JUDGE_STAFF_INDEX
}

function singingDimStaffIndexes(score: MusicScore): number[] {
  let max = 0
  for (const gs of score.grandStaffs ?? []) {
    max = Math.max(max, gs.staves?.length ?? 0)
  }
  const out: number[] = []
  for (let i = SINGING_JUDGE_STAFF_INDEX + 1; i < max; i++) out.push(i)
  return out
}

function syncSingingStaffDim(score: MusicScore = musicScoreData.value) {
  staffDim.sync(score, singingDimStaffIndexes(score))
}

const audioTimeHighlight = createAudioTimeHighlight({
  getMusicScore: () => musicScoreData.value,
  getTimeProp: () => {
    if (playSource.value === PLAY_SOURCE.vocal) return SCORE_TIME_OFFSET_PROP.vocalPerformance
    if (playSource.value === PLAY_SOURCE.accompaniment) return SCORE_TIME_OFFSET_PROP.accompaniment
    return ''
  },
  highlight: {
    addNoteHighlight: (noteId) => {
      if (!isSingingJudgeNoteId(noteId)) return
      playHl.addNoteHighlight(noteId)
    },
    removeNoteHighlight: (noteId) => playHl.removeNoteHighlight(noteId),
    clearHighlight: () => playHl.clearHighlight()
  }
})

const notationTypeDisabled = computed(() => detecting.value || countingDown.value)
const sourceSelectDisabled = computed(() => detecting.value || countingDown.value)
const startDisabled = computed(
  () => judgeSeq.value.length === 0 || countingDown.value || preparingStart.value
)
const currentScoreKey = computed(() => resolveScoreKeySignature(musicScoreData.value))

function cloneMap(src: Map<number, number[][]>): Map<number, number[][]> {
  return new Map([...src.entries()].map(([k, arr]) => [k, arr.map((s) => [s[0]!, s[1]!])]))
}

function mapToBars(mp: Map<number, number[][]>): TrackBar[] {
  const bars: TrackBar[] = []
  for (const [midi, segs] of mp.entries()) {
    if (midi < 36 || midi > 84) continue
    for (const seg of segs) {
      if (!seg || seg.length < 2) continue
      bars.push({ midi, start: seg[0]!, end: seg[1]! })
    }
  }
  return bars
}

const playBars = computed(() => mapToBars(playMapState.value))
const playedBars = computed(() => mapToBars(playedMapsByLayer.value[playedTrackMode.value]))

const progressUnit = computed(() => {
  if (!detecting.value || detectStartTimeMs.value <= 0) return 0
  const elapsedSec = (nowMs.value - detectStartTimeMs.value) / 1000
  return Math.max(0, secondsToUnit256(elapsedSec, bpm.value))
})

function syncPlayMapFromJudge() {
  playMapState.value = cloneMap(playMap)
}

function syncPlayedMapsFromJudge() {
  playedMapsByLayer.value = {
    raw: cloneMap(playedMap.raw),
    fixed: cloneMap(playedMap.fixed),
    absorbed: cloneMap(playedMap.absorbed)
  }
}

function syncNoteResultsFromJudge() {
  for (const item of getPlaySequence()) {
    const mapped = mapTuneJudgeStateToNoteResult(item.state)
    if (!mapped) continue
    const noteId = noteIdFromTuneJudgeData(item.data)
    if (!noteId || appliedResultNoteIds.has(noteId)) continue
    appliedResultNoteIds.add(noteId)
    scoreOverlayRef.value?.setNoteResult(noteId, mapped)
  }
}

function clearScoreHighlight() {
  playHl.clearHighlight()
  playHl.handlePlaybackStop()
  audioTimeHighlight.reset()
  smoothScroll.stop()
}

function stopReferencePlayback() {
  playStore.stop()
  audioStore.stop()
  if (scoreProgressSubId) {
    playStore.unsubscribeProgressStart(scoreProgressSubId)
    scoreProgressSubId = null
  }
  audioStore.setOnProgress(null)
}

function bindScoreHighlightFromPlayer() {
  if (scoreProgressSubId) {
    playStore.unsubscribeProgressStart(scoreProgressSubId)
    scoreProgressSubId = null
  }
  scoreProgressSubId = playStore.subscribeProgressStart((_progress, data) => {
    const payload = data as PlayHighlightProgressData
    if (!isSingingJudgeNoteId(payload.note_id)) return
    playHl.handleProgressStart(payload)
  })
}

function bindAudioHighlightFromPlayer() {
  audioTimeHighlight.prepare()
  audioStore.setOnProgress((current) => {
    audioTimeHighlight.syncAtTime(current)
  })
}

async function startReferencePlayback() {
  stopReferencePlayback()
  if (isScoreSource.value) {
    await playStore.waitReady()
    playStore.setBpm(bpm.value)
    playStore.setPlaySequence(toPlaySequence(musicScoreData.value))
    bindScoreHighlightFromPlayer()
    await playStore.play()
    return
  }

  const resolved = await resolveSingingAudio({
    route,
    musicScore: musicScoreData.value,
    playSource: playSource.value
  })
  if (!resolved?.url) {
    throw new Error(t('singing.messages.audioMissing'))
  }
  const boundId =
    resolved.source === 'database'
      ? ((musicScoreData.value as MusicScore & { data?: Record<string, unknown> }).data?.[
          playSource.value === PLAY_SOURCE.vocal ? 'vocalPerformanceId' : 'accompanimentId'
        ] as number | undefined) ?? null
      : null
  await audioStore.waitReady()
  await audioStore.setAudio(typeof boundId === 'number' ? boundId : null, resolved.url)
  bindAudioHighlightFromPlayer()
  if (!audioTimeHighlight.hasTimedSlots()) {
    ElMessage.warning(
      playSource.value === PLAY_SOURCE.vocal
        ? t('play.messages.vocalTimeOffsetMissing')
        : t('play.messages.accompanimentTimeOffsetMissing')
    )
  }
  await audioStore.play()
}

function countMeasures(score: MusicScore): number {
  const staff = score.grandStaffs[0]?.staves[0]
  return Math.max(1, staff?.measures.length ?? 1)
}

function applySingingScoreLayout(score: MusicScore) {
  score.width = countMeasures(score) * PRACTICE_MEASURE_WIDTH
  applySingleLineModeScoreHeight(score)
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) {
    grandStaff.uSpace = 0
  }
}

function prepareSingingScore(score: MusicScore) {
  const cloned = JSON.parse(JSON.stringify(score)) as MusicScore
  mergeGrandStaff(cloned)
  applySingingScoreLayout(cloned)
  return cloned
}

function reloadJudgeSequence() {
  const base = toTuneJudgeSequence(musicScoreData.value, playSource.value, bpm.value, {
    singleStaffIndex: SINGING_JUDGE_STAFF_INDEX
  })
  const leadInUnit = secondsToUnit256(SINGING_COUNTDOWN_MS / 1000, bpm.value)
  const seq = offsetTuneJudgeSequence(base, leadInUnit)
  judgeSeq.value = seq
  setBpm(bpm.value)
  loadSequence(seq)
  syncPlayMapFromJudge()
  syncPlayedMapsFromJudge()
  scoreSnap.value = getScoreSnapshot()
  syncSingingStaffDim()
}

async function refreshSourceAvailability() {
  const sync = probeSingingSourceAvailabilitySync({
    route,
    musicScore: musicScoreData.value
  })
  vocalEnabled.value = sync.vocal
  accompanimentEnabled.value = sync.accompaniment
  if (sync.vocal) {
    vocalEnabled.value = await canSelectSingingSource({
      route,
      musicScore: musicScoreData.value,
      playSource: PLAY_SOURCE.vocal
    })
  }
  if (sync.accompaniment) {
    accompanimentEnabled.value = await canSelectSingingSource({
      route,
      musicScore: musicScoreData.value,
      playSource: PLAY_SOURCE.accompaniment
    })
  }
  if (playSource.value === PLAY_SOURCE.vocal && !vocalEnabled.value) {
    playSource.value = PLAY_SOURCE.score
  }
  if (playSource.value === PLAY_SOURCE.accompaniment && !accompanimentEnabled.value) {
    playSource.value = PLAY_SOURCE.score
  }
}

function formatMidiOffset(value: number): string {
  if (value > 0) return `+${value}`
  return String(value)
}

function applyInitialMidiFixedOffset(value = initialMidiFixedOffset.value) {
  const next = saveSingingMidiFixedOffset(value)
  initialMidiFixedOffset.value = next
  setInitialMidiFixedOffset(next)
  if (!detecting.value) {
    liveMidiFixedOffset.value = next
  }
}

function onSaveInitialMidiFixedOffset() {
  applyInitialMidiFixedOffset(initialMidiFixedOffset.value)
  ElMessage.success(t('singing.messages.offsetSaved'))
}

function tick() {
  if (!detecting.value) return
  nowMs.value = performance.now()
  if (!ending && seqEndUnit.value > 0 && progressUnit.value > seqEndUnit.value + 8) {
    void finishDetect(true)
    return
  }
  rafId = requestAnimationFrame(tick)
}

async function finishDetect(_auto: boolean) {
  if (ending) return
  const abortedDuringCountdown = countingDown.value
  countingDown.value = false
  if (!detecting.value) return
  ending = true
  liveMidi.value = null
  detecting.value = false
  cancelAnimationFrame(rafId)
  rafId = 0
  detectStartTimeMs.value = 0
  stopReferencePlayback()
  clearScoreHighlight()
  try {
    stopTuneJudge()
  } catch {
    pause()
  }
  // 结束时刷新当前偏移展示；初始偏移仅由用户手动改/保存
  liveMidiFixedOffset.value = getMidiFixedOffset()
  closeTuneJudge()
  if (abortedDuringCountdown) {
    ending = false
    return
  }
  syncNoteResultsFromJudge()
  scoreSnap.value = getScoreSnapshot()
  syncPlayedMapsFromJudge()
  resultVisible.value = true
  ending = false
}

async function prepareJudge() {
  reloadJudgeSequence()
  appliedResultNoteIds.clear()
  scoreOverlayRef.value?.clearResults()
  clearScoreHighlight()
  setInitialMidiFixedOffset(initialMidiFixedOffset.value)
  liveMidiFixedOffset.value = initialMidiFixedOffset.value
  startTuneJudge()
  await activeContext()
}

async function onStart() {
  if (detecting.value || countingDown.value || preparingStart.value) return
  if (!judgeSeq.value.length) {
    ElMessage.warning(t('singing.messages.noSequence'))
    return
  }
  preparingStart.value = true
  try {
    await prepareJudge()
  } catch (e) {
    closeTuneJudge()
    ElMessage.error(e instanceof Error ? e.message : String(e))
    return
  } finally {
    preparingStart.value = false
  }
  // play() 在首个 await 前同步记下判定起点，画面时钟、倒计时须与之同一时刻起步
  countingDown.value = true
  detectStartTimeMs.value = performance.now()
  nowMs.value = detectStartTimeMs.value
  detecting.value = true
  const judgeStarted = play()
  smoothScroll.start()
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
  try {
    await judgeStarted
  } catch (e) {
    countingDown.value = false
    detecting.value = false
    detectStartTimeMs.value = 0
    cancelAnimationFrame(rafId)
    rafId = 0
    smoothScroll.stop()
    closeTuneJudge()
    ElMessage.error(e instanceof Error ? e.message : String(e))
  }
}

async function onCountdownComplete() {
  if (!countingDown.value) return
  countingDown.value = false
  if (!detecting.value) return
  try {
    await startReferencePlayback()
  } catch (e) {
    detecting.value = false
    stopReferencePlayback()
    clearScoreHighlight()
    closeTuneJudge()
    cancelAnimationFrame(rafId)
    rafId = 0
    detectStartTimeMs.value = 0
    ElMessage.error(e instanceof Error ? e.message : String(e))
  }
}

function onStop() {
  void finishDetect(false)
}

async function onPlaySourceChange(next: PlaySource) {
  if (detecting.value || countingDown.value) return
  playSource.value = next
  reloadJudgeSequence()
}

function onNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === displayType.value || detecting.value || countingDown.value) return
  try {
    applyDisplayType(targetType)
    musicScoreData.value = prepareSingingScore(musicScoreData.value)
    reloadJudgeSequence()
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('singing.messages.notationTypeSwitchFailed')
    )
  }
}

function onTranspose(payload: { toKey: KeySignatureTypeEnum }) {
  if (payload.toKey === currentScoreKey.value || detecting.value || countingDown.value) {
    if (payload.toKey === currentScoreKey.value) {
      ElMessage.info(t('editor.messages.transposeSameKey'))
    }
    return
  }
  try {
    applyTranspose(payload)
    musicScoreData.value = prepareSingingScore(musicScoreData.value)
    reloadJudgeSequence()
    ElMessage.success(t('editor.messages.transposed'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.transposeFailed'))
  }
}

function onSemitoneShift(semitones: 1 | -1) {
  if (detecting.value || countingDown.value) return
  try {
    applySemitoneShift(semitones)
    musicScoreData.value = prepareSingingScore(musicScoreData.value)
    reloadJudgeSequence()
    ElMessage.success(
      semitones > 0 ? t('editor.messages.semitoneRaised') : t('editor.messages.semitoneLowered')
    )
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('editor.messages.semitoneShiftFailed')
    )
  }
}

function handleRenderMusicScore(...[list, info]: Parameters<RenderMusicScoreHandler>) {
  vDomList.value = list
  playHl.on?.renderMusicScore?.(list, info)
  scoreOverlayRef.value?.onRenderMusicScore(list)
  staffDim.rebindAfterRender()
  scoreCenter.recenter()
}

onMounted(async () => {
  globalLoading.show(t('common.loading'))
  try {
    const [, , , loaded] = await Promise.all([
      waitScoreSkin(),
      playStore.waitReady(),
      audioStore.waitReady(),
      loadScoreFromRoute(route)
    ])
    if (loaded) {
      initAfterLoad(loaded)
      musicScoreData.value = prepareSingingScore(musicScoreData.value)
    }
    await playStore.restorePlaybackDefaults(musicScoreData.value)
    await refreshSourceAvailability()
    setJudgeConfig({ pitchScoreElasticity: 3 })
    applyInitialMidiFixedOffset(initialMidiFixedOffset.value)
    reloadJudgeSequence()
    setProgressCallback((data) => {
      playedMapsByLayer.value = {
        raw: cloneMap(data.playedMap.raw),
        fixed: cloneMap(data.playedMap.fixed),
        absorbed: cloneMap(data.playedMap.absorbed)
      }
      scoreSnap.value = {
        real: { ...data.score.real },
        total: { ...data.score.total }
      }
      if (detecting.value) {
        liveMidi.value = data.adsorbedMidi > 0 ? data.adsorbedMidi : null
        liveMidiFixedOffset.value = data.midiFixedOffset
        syncNoteResultsFromJudge()
      }
    })
  } finally {
    globalLoading.hide()
  }
})

onBeforeUnmount(() => {
  setProgressCallback(() => {
    /* teardown */
  })
  cancelAnimationFrame(rafId)
  stopReferencePlayback()
  clearScoreHighlight()
  pause()
  closeTuneJudge()
  scoreOverlayRef.value?.clearAll()
  staffDim.clearAll()
  void playStore.resetCollectionToneColorToDefault()
})
</script>

<template>
  <div class="singing-page">
    <section
      ref="scoreScrollRef"
      class="singing-page__score hidden-scrollbar"
      :class="{ 'score-scroll-locked': detecting || countingDown }"
      :style="{ maxHeight: `${scoreCanvasHeight + 21}px` }"
    >
      <div
        ref="scoreStackRef"
        class="singing-page__score-stack"
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
          class="singing-page__score-svg"
          :data="musicScoreData"
          :slot-config="scoreSlotConfig"
          :extensions="scoreExtensions"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          @renderMusicScore="handleRenderMusicScore"
        />
        <ScoreNoteHeadOverlay
          ref="scoreOverlayRef"
          :width="scoreCanvasWidth"
          :height="scoreCanvasHeight"
          :find-element-by-v-dom="findScoreElementByVDom"
        />
      </div>
    </section>

    <section class="singing-page__meta">
      <span>{{ t('singing.meta.bpm') }} {{ bpm }}</span>
      <span>{{ t('singing.meta.notes') }} {{ judgeSeq.length }}</span>
      <span class="singing-page__meta-offset">
        {{ t('singing.meta.currentOffset') }}
        <strong>{{ formatMidiOffset(liveMidiFixedOffset) }}</strong>
      </span>
      <span v-if="countingDown" class="singing-page__meta-live">{{
        t('singing.meta.countdown')
      }}</span>
      <span v-else-if="detecting" class="singing-page__meta-live">{{
        t('singing.meta.detecting')
      }}</span>
    </section>

    <section class="singing-page__waterfall">
      <SingingWaterfall
        :play-bars="playBars"
        :played-bars="playedBars"
        :progress-unit="progressUnit"
        :live-midi="liveMidi"
        :detecting="detecting"
      />
      <SingingStartCountdown v-if="countingDown" @complete="onCountdownComplete" />
    </section>

    <section class="singing-page__offset-bar">
      <label class="singing-page__offset-label" for="singing-initial-offset">
        {{ t('singing.offset.initial') }}
      </label>
      <el-input-number
        id="singing-initial-offset"
        v-model="initialMidiFixedOffset"
        size="small"
        :min="SINGING_MIDI_FIXED_OFFSET_MIN"
        :max="SINGING_MIDI_FIXED_OFFSET_MAX"
        :step="1"
        :disabled="detecting || countingDown"
        controls-position="right"
      />
      <span class="singing-page__offset-unit">{{ t('singing.offset.semitone') }}</span>
      <el-button
        size="small"
        type="primary"
        plain
        :disabled="detecting || countingDown"
        @click="onSaveInitialMidiFixedOffset"
      >
        {{ t('common.save') }}
      </el-button>
      <span class="singing-page__offset-hint">{{ t('singing.offset.hint') }}</span>
    </section>

    <SingingModeToolbar
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      :current-key="currentScoreKey"
      :transpose-disabled="notationTypeDisabled"
      :play-source="playSource"
      :source-select-disabled="sourceSelectDisabled"
      :vocal-enabled="vocalEnabled"
      :accompaniment-enabled="accompanimentEnabled"
      :detecting="detecting || countingDown"
      :start-disabled="startDisabled"
      @notation-type-change="onNotationTypeChange"
      @transpose="onTranspose"
      @semitone-shift="onSemitoneShift"
      @play-source-change="onPlaySourceChange"
      @start="onStart"
      @stop="onStop"
    />

    <SingingResultDialog v-model="resultVisible" :score="scoreSnap" />
  </div>
</template>

<style scoped>
.singing-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  background: #fff8fb;
  overflow: hidden;
}

.singing-page__score {
  flex-shrink: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 10px 16px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.singing-page__score-stack {
  position: relative;
  flex-shrink: 0;
}

.singing-page__score-svg {
  display: block;
  overflow: visible;
}

.singing-page__meta {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 16px;
  align-items: center;
  padding: 8px 16px;
  font-size: 12px;
  font-weight: 600;
  color: #8a5a72;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.singing-page__meta-live {
  margin-left: auto;
  padding: 2px 10px;
  border-radius: 999px;
  color: #fff;
  background: linear-gradient(90deg, #ff8ab5, #d98cff);
  animation: singing-meta-pulse 1.4s ease-in-out infinite;
}

.singing-page__meta-offset strong {
  margin-left: 4px;
  font-variant-numeric: tabular-nums;
  color: #5c4a6a;
}

@keyframes singing-meta-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.72;
  }
}

.singing-page__waterfall {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 8px 12px 10px;
  box-sizing: border-box;
}

.singing-page__offset-bar {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 10px;
  padding: 8px 16px;
  border-top: 1px solid rgba(255, 184, 208, 0.25);
  background: rgba(255, 248, 251, 0.92);
}

.singing-page__offset-label {
  font-size: 12px;
  font-weight: 700;
  color: #8a5a72;
}

.singing-page__offset-unit {
  font-size: 12px;
  color: #9a8aa8;
}

.singing-page__offset-hint {
  font-size: 11px;
  color: #9a8aa8;
}

.singing-page__offset-bar :deep(.el-input-number) {
  width: 120px;
}
</style>
