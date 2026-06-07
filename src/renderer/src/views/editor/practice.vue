<script lang="ts" setup>
import type { MusicScore } from 'deciphony-renderer'
import musicScoreVue from 'deciphony-renderer'
import { onBeforeUnmount, onMounted, provide, ref } from 'vue'
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
import { mergeGrandStaff } from '@renderer/dr-extensions/scoreUtil'
import type { MusicScoreHighlightExpose } from '@renderer/dr-extensions/dr-play-highlight'
import { resolvePlayBpm } from '@renderer/constant/play'
import { usePlayStore } from '@renderer/store/play.store'
import { loadScoreFromRoute, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
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
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const pianoWaterfallRef = ref<PianoWaterfallPlaybackExpose | null>(null)
const performSequence = ref<PerformSequence>({})
const practiceBpm = ref(120)
const playback = useScorePagePlayback(musicScoreData, {
  musicScoreRef,
  waterfallRef: pianoWaterfallRef
})

provide(scorePlaybackKey, playback)

function countPracticeMeasures(score: MusicScore): number {
  const staff = score.grandStaffs[0]?.staves[0]
  return Math.max(1, staff?.measures.length ?? 1)
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

function buildPracticePerformSequence(score: MusicScore) {
  const bpm = resolvePlayBpm(score.bpm)
  practiceBpm.value = bpm
  performSequence.value = toPerformSequence(toPlaySequence(score), bpm)
}

onMounted(async () => {
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    const cloned = JSON.parse(JSON.stringify(loaded))
    mergeGrandStaff(cloned)
    applyPracticeScoreLayout(cloned)
    musicScoreData.value = cloned
    buildPracticePerformSequence(cloned)
  } else {
    applyPracticeScoreLayout(musicScoreData.value)
    buildPracticePerformSequence(musicScoreData.value)
  }

  await playStore.restorePlaybackDefaults(musicScoreData.value)
})

onBeforeUnmount(() => {
  playStore.stop()
  pianoWaterfallRef.value?.stop()
})
</script>

<template>
  <div class="practice-page">
    <section class="practice-page__score">
      <musicScoreVue
        ref="musicScoreRef"
        class="practice-page__score-svg"
        :data="musicScoreData"
        skin-name="default"
        @renderMusicScore="playback.handleRenderMusicScore"
      />
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
      />
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

.practice-page__waterfall {
  flex-shrink: 0;
  flex: 1;
  overflow: hidden;
  border-bottom: 1px solid rgba(255, 184, 208, 0.15);
  background: rgba(255, 255, 255, 0.72);
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
