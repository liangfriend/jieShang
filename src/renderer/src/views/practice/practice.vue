<script lang="ts" setup>
import type { MusicScore, VDom } from 'deciphony-renderer'
import type { PlaySequence } from 'deciphony-player'
import musicScoreVue from 'deciphony-renderer'
import { onBeforeUnmount, onMounted, provide, ref, computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import { PracticeModeToolbar } from '@renderer/components/score-toolbar'
import PianoWaterfall from '@renderer/components/pianoWaterfall.vue'
import VirtualPiano from '@renderer/components/virtualPiano.vue'
import {
  scorePlaybackKey,
  toPerformSequence,
  toPlaySequence,
  useScorePagePlayback,
  type PerformSequence,
  type PianoWaterfallPlaybackExpose
} from '@renderer/utils/scorePagePlayback'
import type { NoteScoreResult } from '@renderer/types/types'
import { mergeGrandStaff } from '@renderer/dr-extensions/scoreUtil'
import type {
  MusicScoreHighlightExpose,
  PlayHighlightProgressData
} from '@renderer/dr-extensions/dr-play-highlight'
import { usePlayStore } from '@renderer/store/play.store'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { usePracticeSettingsStore } from '@renderer/store/practiceSettings.store'
import { NOTE_RESULT_COLOR } from '@renderer/constant/practice'
import { loadScoreFromRoute, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { practiceContextKey } from '@renderer/views/practice/practiceContext'
import { createPracticeNoteResultHighlight } from '@renderer/views/practice/practiceNoteResultHighlight'
import { createPracticeStaffDim } from '@renderer/views/practice/practiceStaffDim'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import empty from '@renderer/template/empty'

/** 练习模式瀑布流 / 虚拟钢琴共用 midi 范围（88 键） */
const PRACTICE_MIDI_RANGE = { min: 21, max: 108 } as const

/** 瀑布流区域高度 */
const PRACTICE_WATERFALL_HEIGHT = '100%'

/** 虚拟钢琴高度（比教学白板更紧凑） */
const PRACTICE_PIANO_HEIGHT = '96px'

/** 练习模式曲谱固定高度 */
const PRACTICE_SCORE_HEIGHT = 300

/** 每个小节对应的曲谱宽度 */
const PRACTICE_MEASURE_WIDTH = 200

const route = useRoute()
const playStore = usePlayStore()
const metronomeStore = useMetronomeStore()
const settings = usePracticeSettingsStore()
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

const maxStaffCount = computed(() => {
  let max = 0
  for (const grandStaff of musicScoreData.value.grandStaffs ?? []) {
    max = Math.max(max, grandStaff.staves?.length ?? 0)
  }
  return max
})

const scoreScrollRef = ref<HTMLElement | null>(null)
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const pianoWaterfallRef = ref<PianoWaterfallPlaybackExpose | null>(null)
const performSequence = ref<PerformSequence>({})
const playSequence = ref<PlaySequence>([])
const practiceBpm = ref(120)
const vDomList = ref<VDom[]>([])

const noteResultHighlight = createPracticeNoteResultHighlight({
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const staffDim = createPracticeStaffDim({
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null
})

let scrollProgressSubId: string | null = null

const playback = useScorePagePlayback(musicScoreData, {
  musicScoreRef,
  waterfallRef: pianoWaterfallRef,
  getPlaySequence: () => playSequence.value,
  countIn: () => metronomeStore.playCountIn(),
  onPlayStarted: () => {
    if (settings.metronomeDuringPlay) void metronomeStore.startLoop()
  },
  onPlaybackPaused: () => metronomeStore.stop(),
  onPlaybackStopped: () => {
    metronomeStore.stop()
    scrollToPlayingNote.resetScroll()
  },
  onClearPlayData: () => noteResultHighlight.clearAll()
})

provide(scorePlaybackKey, playback)

const noteResultColor = NOTE_RESULT_COLOR

watch(
  () => settings.scoreVolume,
  (value) => playStore.setVolume(value)
)
watch(
  () => settings.bpm,
  (value) => {
    playStore.setBpm(value)
    metronomeStore.setBpm(value)
    practiceBpm.value = value
    performSequence.value = toPerformSequence(playSequence.value, value)
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
    if (enabled) noteResultHighlight.showAll()
    else noteResultHighlight.hideAll()
  }
)

provide(practiceContextKey, {
  maxStaffCount,
  bpm: practiceBpm
})

/** 音符评分回调：通过 noteInfo id 定位曲谱 DOM，按结果加 filter */
function handleNoteScore(
  result: NoteScoreResult,
  realScore: number,
  totalScore: number,
  info: any
) {
  void realScore
  void totalScore
  if (!settings.showNoteResult) return
  noteResultHighlight.applyNoteResult(info, result)
}

function handleRenderMusicScore(list: VDom[]) {
  vDomList.value = list
  playback.handleRenderMusicScore?.(list)
  noteResultHighlight.rebindAfterRender()
  staffDim.rebindAfterRender()
}

function countPracticeMeasures(score: MusicScore): number {
  const staff = score.grandStaffs[0]?.staves[0]
  return Math.max(1, staff?.measures.length ?? 1)
}

/** 从曲谱首小节解析拍号字符串（如 '4_4' → '4/4'），并取 beatUnit（分母） */
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

/** 进入练习模式：同步谱子 bpm / beatUnit / timeSignature 给节拍器 */
function syncMetronome(score: MusicScore, bpm: number) {
  const { timeSignature, beatUnit } = resolveTimeSignature(score)
  metronomeStore.syncScore({ bpm, beatUnit, timeSignature })
}

function applyPracticeScoreLayout(score: MusicScore) {
  const measureCount = countPracticeMeasures(score)
  score.width = measureCount * PRACTICE_MEASURE_WIDTH
  score.height = PRACTICE_SCORE_HEIGHT
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) {
    grandStaff.uSpace = 0
  }
}

function rebuildPracticeSequences(score: MusicScore) {
  const bpm = settings.bpm
  practiceBpm.value = bpm
  const passSingleStaffIndex = settings.disabledStaffIndexes
  playSequence.value = toPlaySequence(score, { passSingleStaffIndex })
  performSequence.value = toPerformSequence(playSequence.value, bpm)
  syncMetronome(score, bpm)
  staffDim.sync(score, passSingleStaffIndex)
  if (playback.playbackState.value === 'stopped') {
    playStore.setPlaySequence(playSequence.value)
  }
}

watch(
  maxStaffCount,
  (count) => settings.initStaffEnabled(count),
  { immediate: true }
)

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
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    const cloned = JSON.parse(JSON.stringify(loaded))
    mergeGrandStaff(cloned)
    applyPracticeScoreLayout(cloned)
    musicScoreData.value = cloned
  } else {
    applyPracticeScoreLayout(musicScoreData.value)
  }

  await playStore.restorePlaybackDefaults(musicScoreData.value)
  // 设置面板初值与曲谱默认对齐后再重建序列，避免 BPM 与瀑布流不同步
  settings.bpm = playStore.bpm
  settings.scoreVolume = playStore.volume
  metronomeStore.setVolume(settings.metronomeVolume)
  rebuildPracticeSequences(musicScoreData.value)

  scrollProgressSubId = playback.subscribeProgressStart((_progress, data) => {
    scrollToPlayingNote.handleProgressStart(data as PlayHighlightProgressData)
  })
})

onBeforeUnmount(() => {
  if (scrollProgressSubId) playback.unsubscribeProgressStart(scrollProgressSubId)
  playback.handleStop()
  metronomeStore.stop()
  noteResultHighlight.clearAll()
  staffDim.clearAll()
})
</script>

<template>
  <div class="practice-page">
    <section ref="scoreScrollRef" class="practice-page__score hidden-scrollbar">
      <musicScoreVue
        ref="musicScoreRef"
        class="practice-page__score-svg"
        :data="musicScoreData"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
        @renderMusicScore="handleRenderMusicScore"
      />
    </section>

    <section class="practice-page__stats">
      <span class="practice-page__stat">音符总数 {{ pianoWaterfallRef?.stats?.total ?? 0 }}</span>
      <span class="practice-page__stat">漏弹 {{ pianoWaterfallRef?.stats?.miss ?? 0 }}</span>
      <span class="practice-page__stat">弹早 {{ pianoWaterfallRef?.stats?.early ?? 0 }}</span>
      <span class="practice-page__stat">弹晚 {{ pianoWaterfallRef?.stats?.late ?? 0 }}</span>
      <span class="practice-page__stat">及格 {{ pianoWaterfallRef?.stats?.pass ?? 0 }}</span>
      <span class="practice-page__stat">优秀 {{ pianoWaterfallRef?.stats?.good ?? 0 }}</span>
      <span class="practice-page__stat">完美 {{ pianoWaterfallRef?.stats?.perfect ?? 0 }}</span>
      <span class="practice-page__stat practice-page__stat--score">
        实时分 {{ (pianoWaterfallRef?.stats?.realScore ?? 0).toFixed(1) }}
      </span>
      <span class="practice-page__stat practice-page__stat--score">
        总分 {{ (pianoWaterfallRef?.stats?.totalScore ?? 0).toFixed(1) }}
      </span>
    </section>

    <section class="practice-page__waterfall">
      <PianoWaterfall
        ref="pianoWaterfallRef"
        class="practice-page__waterfall-inner"
        layout-mode="fillParent"
        :height="PRACTICE_WATERFALL_HEIGHT"
        :midi="PRACTICE_MIDI_RANGE"
        :perform-sequence="performSequence"
        :bpm="practiceBpm"
        :baseLineBottom="100"
        :prepare-time="0"
        :columnHeightConstant="0.1"
        :highlight-policy="settings.highlightPolicy"
        :show-note-result="settings.showNoteResult"
        :result-color-map="noteResultColor"
        @score="handleNoteScore"
      />

      <div v-if="settings.coverWaterfall" class="practice-page__waterfall-cover">
        <span class="practice-page__waterfall-cover-emoji">🎵</span>
        <span class="practice-page__waterfall-cover-text">凭听觉练习吧</span>
      </div>
    </section>

    <section class="practice-page__piano">
      <VirtualPiano
        class="practice-page__piano-inner"
        layout-mode="fillParent"
        :height="PRACTICE_PIANO_HEIGHT"
        :midi="PRACTICE_MIDI_RANGE"
        pitch-notation="None"
      />
    </section>

    <PracticeModeToolbar />
  </div>
</template>

<style scoped>
.practice-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  padding-bottom: 72px;
  background: #fff8fb;
  overflow: hidden;
}

.practice-page__score {
  flex-shrink: 0;
  max-height: 216px;
  overflow: auto;
  padding: 12px 16px 8px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.25);
}

.practice-page__score-svg {
  flex-shrink: 0;
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
  flex-shrink: 0;
  flex: 1;
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

.practice-page__waterfall-inner {
  width: 100%;
  height: 100%;
}

.practice-page__piano {
  flex-shrink: 0;
  height: 96px;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.72);
}

.practice-page__piano-inner {
  width: 100%;
  height: 100%;
}
</style>
