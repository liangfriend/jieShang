<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import musicScoreVue from '@deciphony/renderer'
import type { MusicScore, VDom } from '@deciphony/renderer'
import { mergeGrandStaff } from '@deciphony/extensions/score-util'
import type {
  MusicScoreHighlightExpose,
  PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import { searchScoresFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper/scoreFile'
import { usePlayStore } from '@renderer/store/play.store'
import { useScorePagePlayback } from '@renderer/utils/scorePagePlayback/useScorePagePlayback'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { applySingleLineModeScoreHeight } from '@renderer/utils/singleLineModeScoreLayout'
import { useSingleLineScoreCenter } from '@renderer/utils/singleLineScoreCenter'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import {
  createScoreSmoothScroll,
  sequenceToSmoothScrollTimeline
} from '@renderer/utils/scoreSmoothScroll'
import { toPlaySequence, unit256ToMs } from '@renderer/utils/scorePagePlayback'
import emptyScore from '@renderer/template/empty'

const props = defineProps<{
  /** 单行模式（与练习模式一致）：合并复谱表、横向铺开，跟随播放横向滚动 */
  singleLine?: boolean
}>()

/** 单行模式下每小节宽度 */
const SINGLE_LINE_MEASURE_WIDTH = 200

const { t } = useI18n()
const playStore = usePlayStore()
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()

const scoreOptions = ref<Array<{ id: number; name: string }>>([])
const selectedScoreId = ref<number | null>(null)
const musicScore = ref<MusicScore>(prepareScore(cloneEmpty()))
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const scoreScrollRef = ref<HTMLElement | null>(null)
const vDomList = ref<VDom[]>([])
const scoreCenter = useSingleLineScoreCenter(() =>
  scoreScrollRef.value?.querySelector<SVGSVGElement>(':scope > svg')
)

const playback = useScorePagePlayback(musicScore, {
  musicScoreRef,
  onPlaybackStopped: () => {
    smoothScroll.stop()
    scrollFollow.resetScroll()
  }
})

const findElementByVDom = (node: VDom) => musicScoreRef.value?.findElementByVDom(node) ?? null

const scrollFollow = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom,
  getMusicScore: () => musicScore.value
})

const smoothScroll = createScoreSmoothScroll({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom,
  getMusicScore: () => musicScore.value,
  getTimeline: () => sequenceToSmoothScrollTimeline(toPlaySequence(musicScore.value)),
  isPlaying: () => playback.playbackState.value === 'playing',
  getUnitsPerMs: () => 1 / unit256ToMs(1, playStore.bpm, playStore.beatUnit)
})

let progressSubId: string | null = null

function onPlay() {
  if (props.singleLine) smoothScroll.prepare()
  void playback.handlePlay()
}

function cloneEmpty(): MusicScore {
  return JSON.parse(JSON.stringify(emptyScore)) as MusicScore
}

function prepareScore(score: MusicScore): MusicScore {
  if (!props.singleLine) return score
  mergeGrandStaff(score)
  const measures = score.grandStaffs[0]?.staves[0]?.measures.length ?? 1
  score.width = Math.max(1, measures) * SINGLE_LINE_MEASURE_WIDTH
  applySingleLineModeScoreHeight(score)
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) grandStaff.uSpace = 0
  return score
}

function handleRenderMusicScore(list: VDom[]) {
  vDomList.value = list
  playback.handleRenderMusicScore?.(list)
  if (props.singleLine) scoreCenter.recenter()
}

// 快速切曲或加载中离开页面时，丢弃过期的加载结果，避免改动全局播放参数
let loadEpoch = 0

async function onScoreChange(id: number | null) {
  const current = ++loadEpoch
  selectedScoreId.value = id
  playback.handleStop()
  if (id == null) {
    musicScore.value = prepareScore(cloneEmpty())
    return
  }
  const res = await window.api.score.get(id)
  if (current !== loadEpoch) return
  if (!res.success || !res.data?.data) {
    ElMessage.error(t('editor.messages.scoreLoadFailed'))
    return
  }
  const loaded = parseScoreJson(res.data.data)
  await playStore.restorePlaybackDefaults(loaded, { resetToneColor: false })
  if (current !== loadEpoch) return
  musicScore.value = prepareScore(loaded)
}

onMounted(async () => {
  progressSubId = playback.subscribeProgressStart((_progress, data) => {
    if (props.singleLine) smoothScroll.handleProgressStart(data as PlayHighlightProgressData)
    else scrollFollow.handleProgressStart(data as PlayHighlightProgressData)
  })
  const [, list] = await Promise.all([waitScoreSkin(), searchScoresFromDatabase('')])
  scoreOptions.value = list.map((s) => ({ id: s.id, name: s.name }))
})

onBeforeUnmount(() => {
  loadEpoch++
  if (progressSubId) playback.unsubscribeProgressStart(progressSubId)
})

defineExpose({ stop: () => playback.handleStop() })
</script>

<template>
  <div class="sim-score-panel">
    <section class="sim-score-panel__score">
      <div
        ref="scoreScrollRef"
        class="sim-score-panel__score-scroll hidden-scrollbar"
        :class="{
          'sim-score-panel__score-scroll--single': singleLine,
          'score-scroll-locked': playback.playbackState.value !== 'stopped'
        }"
      >
        <musicScoreVue
          v-if="scoreSkin"
          :key="scoreSkinName"
          ref="musicScoreRef"
          :data="musicScore"
          :skin="scoreSkin"
          :skin-name="scoreSkinName"
          :style="singleLine ? { transform: `translateY(${scoreCenter.offsetY.value}px)` } : undefined"
          @renderMusicScore="handleRenderMusicScore"
        />
      </div>
    </section>

    <aside class="sim-score-panel__tools">
      <div class="sim-score-panel__row">
        <span class="sim-score-panel__label">{{ t('instrumentSim.score.selectScore') }}</span>
        <el-select
          :model-value="selectedScoreId"
          clearable
          filterable
          size="small"
          class="sim-score-panel__select"
          :placeholder="t('instrumentSim.score.noScore')"
          @update:model-value="onScoreChange"
        >
          <el-option v-for="item in scoreOptions" :key="item.id" :label="item.name" :value="item.id" />
        </el-select>
      </div>

      <div class="sim-score-panel__row sim-score-panel__row--btns">
        <el-button
          type="primary"
          size="small"
          :disabled="playback.playDisabled.value || !selectedScoreId"
          @click="onPlay"
        >
          {{ t('instrumentSim.score.play') }}
        </el-button>
        <el-button
          size="small"
          :disabled="playback.pauseDisabled.value"
          @click="playback.handlePause()"
        >
          {{ t('instrumentSim.score.pause') }}
        </el-button>
        <el-button
          size="small"
          :disabled="playback.stopDisabled.value"
          @click="playback.handleStop()"
        >
          {{ t('instrumentSim.score.stop') }}
        </el-button>
      </div>

      <slot />
    </aside>
  </div>
</template>

<style scoped>
.sim-score-panel {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 12px;
  padding: 8px 12px 12px;
  box-sizing: border-box;
}

.sim-score-panel__score,
.sim-score-panel__tools {
  border-radius: 16px;
  border: 1px solid rgba(120, 160, 200, 0.28);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(140, 160, 190, 0.12);
  min-height: 0;
}

.sim-score-panel__score {
  overflow: hidden;
}

.sim-score-panel__score-scroll {
  height: 100%;
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
}

.sim-score-panel__score-scroll:not(.sim-score-panel__score-scroll--single) > :deep(svg) {
  margin-inline: auto;
}

.sim-score-panel__score-scroll--single {
  display: flex;
  align-items: center;
  overflow-y: hidden;
}

.sim-score-panel__score-scroll--single > :deep(svg) {
  flex-shrink: 0;
  overflow: visible;
}

.sim-score-panel__tools {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  overflow: auto;
}

.sim-score-panel__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.sim-score-panel__row--btns {
  flex-wrap: wrap;
}

.sim-score-panel__label {
  flex-shrink: 0;
  width: 72px;
  font-size: 12px;
  color: #6a7a8a;
}

.sim-score-panel__select {
  flex: 1;
  min-width: 0;
}
</style>
