<script lang="ts" setup>
import type { MusicScore, VDom } from '@deciphony/renderer'
import musicScoreVue from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { MusicScoreTypeEnum } from '@deciphony/renderer'
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
  getPlaySequence,
  getScoreSnapshot,
  loadSequence,
  pause,
  play,
  playMap,
  playedMap,
  setBpm,
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
import {
  ScoreNoteHeadOverlay,
  type ScoreNoteHeadOverlayApi
} from '@renderer/components/scoreNoteHeadOverlay'
import { PLAY_SOURCE, type PlaySource } from '@renderer/constant/playSource'
import { loadScoreFromRoute } from '@renderer/utils/scoreRoute'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { applySingleLineModeScoreHeight } from '@renderer/utils/singleLineModeScoreLayout'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import { toPlaySequence } from '@renderer/utils/scorePagePlayback'
import { createAudioTimeHighlight } from '@renderer/utils/scorePagePlayback/createAudioTimeHighlight'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { usePlayStore } from '@renderer/store/play.store'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import {
  canSelectSingingSource,
  probeSingingSourceAvailabilitySync,
  resolveSingingAudio
} from '@renderer/utils/singing/resolveSingingAudio'
import {
  sequenceEndUnit256,
  toTuneJudgeSequence
} from '@renderer/utils/singing/toTuneJudgeSequence'
import {
  mapTuneJudgeStateToNoteResult,
  noteIdFromTuneJudgeData
} from '@renderer/utils/singing/mapTuneJudgeNoteState'
import { SCORE_TIME_OFFSET_PROP } from '@renderer/constant/scoreTimeOffset'
import empty from '@renderer/template/empty'

defineOptions({ name: 'SingingModeView' })

const PRACTICE_MEASURE_WIDTH = 200

const { t } = useI18n()
const route = useRoute()
const globalLoading = useGlobalLoadingStore()
const playStore = usePlayStore()
const audioStore = useAudioPlayerStore()

const musicScoreData = ref(JSON.parse(JSON.stringify(empty)) as MusicScore)
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const { initAfterLoad, applyDisplayType } = usePlayScoreNotationDisplay(musicScoreData, displayType)
const lyricsBundle = createScoreLyricsExtension('show')
const scoreSlotConfig = lyricsBundle.slotConfig

const scoreScrollRef = ref<HTMLElement | null>(null)
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const scoreOverlayRef = ref<ScoreNoteHeadOverlayApi | null>(null)
const vDomList = ref<VDom[]>([])

const playSource = ref<PlaySource>(PLAY_SOURCE.score)
const vocalEnabled = ref(false)
const accompanimentEnabled = ref(false)
const judgeSeq = ref<Sequence>([])
const detecting = ref(false)
const countingDown = ref(false)
const resultVisible = ref(false)
const liveMidi = ref<number | null>(null)
const detectStartTimeMs = ref(0)
const nowMs = ref(performance.now())
let rafId = 0
let ending = false
let lastScrollNoteId = ''
let scoreProgressSubId: string | null = null
const appliedResultNoteIds = new Set<string>()

type TrackBar = { midi: number; start: number; end: number }
type PlayedLayer = 'raw' | 'fixed' | 'absorbed'

const emptyScoreSnap = (): TuneJudgeScoreSnapshot => ({
  real: { pitchScore: 0, rhythmScore: 0, completenessScore: 0 },
  total: { pitchScore: 0, rhythmScore: 0, completenessScore: 0 }
})

const scoreSnap = ref<TuneJudgeScoreSnapshot>(emptyScoreSnap())
const playedTrackMode = ref<PlayedLayer>('fixed')
const playMapState = ref<Map<number, number[][]>>(new Map())
const playedMapsByLayer = ref<Record<PlayedLayer, Map<number, number[][]>>>({
  raw: new Map(),
  fixed: new Map(),
  absorbed: new Map()
})

const scoreCanvasWidth = computed(() => musicScoreData.value.width ?? 0)
const scoreCanvasHeight = computed(() => musicScoreData.value.height ?? 0)
const bpm = computed(() => musicScoreData.value.bpm ?? 120)
const seqEndUnit = computed(() => sequenceEndUnit256(judgeSeq.value))
const isScoreSource = computed(() => playSource.value === PLAY_SOURCE.score)

const playHl = drPlayHighlight({
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null,
  getBpm: () => bpm.value
})
const scoreExtensions = [...lyricsBundle.extensions, playHl]

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const findScoreElementByVDom = (node: VDom) => musicScoreRef.value?.findElementByVDom(node) ?? null

const audioTimeHighlight = createAudioTimeHighlight({
  getMusicScore: () => musicScoreData.value,
  getTimeProp: () => {
    if (playSource.value === PLAY_SOURCE.vocal) return SCORE_TIME_OFFSET_PROP.vocalPerformance
    if (playSource.value === PLAY_SOURCE.accompaniment) return SCORE_TIME_OFFSET_PROP.accompaniment
    return ''
  },
  highlight: {
    addNoteHighlight: (noteId) => playHl.addNoteHighlight(noteId),
    removeNoteHighlight: (noteId) => playHl.removeNoteHighlight(noteId),
    clearHighlight: () => playHl.clearHighlight()
  }
})

const notationTypeDisabled = computed(() => detecting.value || countingDown.value)
const sourceSelectDisabled = computed(() => detecting.value || countingDown.value)
const startDisabled = computed(() => judgeSeq.value.length === 0 || countingDown.value)

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

function secondsToUnit256(seconds: number, bpmVal: number): number {
  return (seconds * 64 * bpmVal) / 60
}

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
  lastScrollNoteId = ''
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
    playHl.handleProgressStart(payload)
    if (payload.start && payload.note_id) {
      lastScrollNoteId = payload.note_id
      scrollToPlayingNote.scrollToHorizontalCenter(payload.note_id)
    }
  })
}

function bindAudioHighlightFromPlayer() {
  audioTimeHighlight.prepare()
  audioStore.setOnProgress((current) => {
    audioTimeHighlight.syncAtTime(current)
    // 跟滚：用当前序列里落在该秒附近的音符
    const unit = secondsToUnit256(current, bpm.value)
    for (const item of judgeSeq.value) {
      if (unit >= item.playTime && unit < item.playTime + item.duration) {
        const id = noteIdFromTuneJudgeData(item.data)
        if (id && id !== lastScrollNoteId) {
          lastScrollNoteId = id
          scrollToPlayingNote.scrollToHorizontalCenter(id)
        }
        break
      }
    }
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
  const seq = toTuneJudgeSequence(musicScoreData.value, playSource.value, bpm.value)
  judgeSeq.value = seq
  setBpm(bpm.value)
  loadSequence(seq)
  syncPlayMapFromJudge()
  syncPlayedMapsFromJudge()
  scoreSnap.value = getScoreSnapshot()
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
  if (countingDown.value) {
    countingDown.value = false
    return
  }
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
  closeTuneJudge()
  syncNoteResultsFromJudge()
  scoreSnap.value = getScoreSnapshot()
  syncPlayedMapsFromJudge()
  resultVisible.value = true
  ending = false
}

async function beginDetectSession() {
  reloadJudgeSequence()
  appliedResultNoteIds.clear()
  scoreOverlayRef.value?.clearResults()
  clearScoreHighlight()
  scrollToPlayingNote.resetScroll()
  startTuneJudge()
  await activeContext()
  detectStartTimeMs.value = performance.now()
  nowMs.value = detectStartTimeMs.value
  detecting.value = true
  await Promise.all([play(), startReferencePlayback()])
  cancelAnimationFrame(rafId)
  rafId = requestAnimationFrame(tick)
}

async function onStart() {
  if (detecting.value || countingDown.value) return
  if (!judgeSeq.value.length) {
    ElMessage.warning(t('singing.messages.noSequence'))
    return
  }
  countingDown.value = true
}

async function onCountdownComplete() {
  if (!countingDown.value) return
  countingDown.value = false
  try {
    await beginDetectSession()
  } catch (e) {
    detecting.value = false
    stopReferencePlayback()
    clearScoreHighlight()
    closeTuneJudge()
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

function handleRenderMusicScore(list: VDom[]) {
  vDomList.value = list
  playHl.on?.renderMusicScore?.(list)
  scoreOverlayRef.value?.onRenderMusicScore(list)
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
        liveMidi.value = data.realMidi > 0 ? data.realMidi : null
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
})
</script>

<template>
  <div class="singing-page">
    <section
      ref="scoreScrollRef"
      class="singing-page__score hidden-scrollbar"
      :style="{ maxHeight: `${scoreCanvasHeight + 20}px` }"
    >
      <div
        class="singing-page__score-stack"
        :style="{ width: `${scoreCanvasWidth}px`, height: `${scoreCanvasHeight}px` }"
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

    <SingingModeToolbar
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      :play-source="playSource"
      :source-select-disabled="sourceSelectDisabled"
      :vocal-enabled="vocalEnabled"
      :accompaniment-enabled="accompanimentEnabled"
      :detecting="detecting || countingDown"
      :start-disabled="startDisabled"
      @notation-type-change="onNotationTypeChange"
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
  overflow: auto;
  padding: 12px 16px 0;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.singing-page__score-stack {
  position: relative;
  flex-shrink: 0;
}

.singing-page__score-svg {
  display: block;
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
</style>
