<script lang="ts" setup>
import musicScoreVue from '@deciphony/renderer'
import { ElMessage } from 'element-plus'
import { KeySignatureTypeEnum, MusicScoreTypeEnum, type VDom } from '@deciphony/renderer'
import { computed, defineAsyncComponent, onMounted, onUnmounted, provide, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { TitleSlot } from '@deciphony/extensions/dr-title'
import type {
  MusicScoreHighlightExpose,
  PlayHighlightProgressData
} from '@deciphony/extensions/dr-play-highlight'
import { PlayModeToolbar } from '@renderer/components/score-toolbar'
import {
  scorePlaybackKey,
  scorePlayRangeKey,
  scoreScrollFollowKey,
  usePlayRangeSelect,
  useScorePagePlayback
} from '@renderer/utils/scorePagePlayback'
import type { RenderMusicScoreHandler } from '@renderer/utils/scorePagePlayback/types'
import { createScoreScrollToPlayingNote } from '@renderer/utils/scoreScrollToPlayingNote'
import { usePlayStore } from '@renderer/store/play.store'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import { loadScoreFromRoute } from '@renderer/utils/scoreRoute'
import { createScoreLyricsExtension } from '@renderer/utils/createScoreLyricsExtension'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import { resolveScoreKeySignature } from '@renderer/utils/scoreNotationTransfer'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import { isPlayOnlyMusicScore } from '@renderer/utils/isTabNotation'
import {
  createScoreMarkExtension,
  SCORE_MARK_NONE,
  scoreMarkExtraHeight,
  type ScoreMarkValue
} from '@renderer/utils/scoreMark'
import empty from '@renderer/template/empty'

/** 仅开发模式：生产构建中 import.meta.env.DEV 为 false，组件不会被打包 */
const DevToneColorCacheOverlay = import.meta.env.DEV
  ? defineAsyncComponent(() => import('@renderer/components/dev/DevToneColorCacheOverlay.vue'))
  : null

const { t } = useI18n()
const route = useRoute()
const playStore = usePlayStore()
const audioPlayerStore = useAudioPlayerStore()
const globalLoading = useGlobalLoadingStore()
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const scoreScrollRef = ref<HTMLElement | null>(null)
const vDomList = ref<VDom[]>([])
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()

const scrollToPlayingNote = createScoreScrollToPlayingNote({
  getScrollContainer: () => scoreScrollRef.value,
  getVDomList: () => vDomList.value,
  findElementByVDom: (node) => musicScoreRef.value?.findElementByVDom(node) ?? null,
  getMusicScore: () => musicScoreData.value
})

const rangeSelect = usePlayRangeSelect({ musicScoreRef })
const rangeHint = computed(() => {
  if (!rangeSelect.startNoteId.value) return t('play.range.pickStart')
  if (!rangeSelect.endNoteId.value) return t('play.range.pickEnd')
  return t('play.range.ready')
})

const playback = useScorePagePlayback(musicScoreData, {
  musicScoreRef,
  onPlaybackStopped: () => scrollToPlayingNote.resetScroll(),
  getPlayRange: () => rangeSelect.getRange()
})
const { initAfterLoad, applyDisplayType, applyTranspose, applySemitoneShift } =
  usePlayScoreNotationDisplay(musicScoreData, displayType)
const {
  extensions: scoreExtensions,
  slotConfig: scoreSlotConfig,
  titlePadding,
  titleFontFamily
} = createScoreLyricsExtension('show', musicScoreData)

const scoreMark = ref<ScoreMarkValue>(SCORE_MARK_NONE)
const markUnavailable = computed(() => isPlayOnlyMusicScore(musicScoreData.value))
const markExtension = computed(() =>
  markUnavailable.value ? null : createScoreMarkExtension(scoreMark.value)
)
const playExtensions = computed(() => [
  ...scoreExtensions.value,
  ...(markExtension.value ? [markExtension.value] : []),
  rangeSelect.extension
])
/** 指法图撑高的部分只加在渲染用的浅拷贝上，不写回曲谱（转调会把展示谱同步回原谱） */
const renderScoreData = computed(() => {
  const score = musicScoreData.value
  const extra = scoreMarkExtraHeight(score, markExtension.value)
  return extra ? { ...score, height: score.height + extra } : score
})

const notationTypeDisabled = computed(
  () => playback.playbackState.value !== 'stopped' || playback.countingIn.value
)
const currentScoreKey = computed(() => resolveScoreKeySignature(musicScoreData.value))

provide(scorePlaybackKey, playback)
provide(scorePlayRangeKey, rangeSelect)
provide(scoreScrollFollowKey, scrollToPlayingNote)

let scrollProgressSubId: string | null = null

function handleRenderMusicScore(...[list, info]: Parameters<RenderMusicScoreHandler>) {
  vDomList.value = list
  playback.handleRenderMusicScore?.(list, info)
}

function onNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === displayType.value) return

  playback.handleStop()
  rangeSelect.end()

  try {
    applyDisplayType(targetType)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('play.messages.notationTypeSwitchFailed'))
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
    ElMessage.success(t('editor.messages.transposed'))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('editor.messages.transposeFailed'))
  }
}

function onSemitoneShift(semitones: 1 | -1) {
  playback.handleStop()
  try {
    applySemitoneShift(semitones)
    ElMessage.success(
      semitones > 0 ? t('editor.messages.semitoneRaised') : t('editor.messages.semitoneLowered')
    )
  } catch (error) {
    ElMessage.error(
      error instanceof Error ? error.message : t('editor.messages.semitoneShiftFailed')
    )
  }
}

onMounted(async () => {
  globalLoading.show(t('common.loading'))
  try {
    const [, loaded] = await Promise.all([waitScoreSkin(), loadScoreFromRoute(route)])
    if (loaded) {
      initAfterLoad(loaded)
    }
    await playStore.restorePlaybackDefaults(musicScoreData.value, { preferScoreToneColor: true })
    scrollProgressSubId = playback.subscribeProgressStart((_progress, data) => {
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
  <div class="score-page">
    <div v-if="rangeSelect.active.value" class="score-range-bar">
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
    <div
      ref="scoreScrollRef"
      class="score-page__main"
      :class="{ 'score-page__main--range': rangeSelect.active.value }"
    >
      <musicScoreVue
        v-if="scoreSkin"
        :key="scoreSkinName"
        ref="musicScoreRef"
        class="score-page__svg"
        :data="renderScoreData"
        :slot-config="scoreSlotConfig"
        :extensions="playExtensions"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
        @renderMusicScore="handleRenderMusicScore"
      >
        <template #t="{ node }">
          <TitleSlot
            mode="show"
            :music-score="musicScoreData"
            :node="node"
            :padding-left="titlePadding.left"
            :padding-right="titlePadding.right"
            :font-family="titleFontFamily"
          />
        </template>
      </musicScoreVue>
    </div>
    <PlayModeToolbar
      :music-score="musicScoreData"
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      :current-key="currentScoreKey"
      :transpose-disabled="notationTypeDisabled"
      v-model:mark="scoreMark"
      @notation-type-change="onNotationTypeChange"
      @transpose="onTranspose"
      @semitone-shift="onSemitoneShift"
    />
    <component :is="DevToneColorCacheOverlay" v-if="DevToneColorCacheOverlay" />
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

.score-range-bar {
  position: absolute;
  top: 16px;
  left: 50%;
  z-index: 30;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  max-width: calc(100% - 32px);
  padding: 6px 8px 6px 12px;
  border: 1px solid rgba(201, 184, 255, 0.6);
  border-radius: 999px;
  background: rgba(248, 243, 255, 0.96);
  box-shadow: 0 6px 18px rgba(124, 77, 255, 0.18);
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
  opacity: 0.55;
  cursor: not-allowed;
}

.score-page__main--range :deep([data-tag='noteHead']),
.score-page__main--range :deep([data-tag='noteNumber']),
.score-page__main--range :deep([data-tag='tabNoteNumber']),
.score-page__main--range :deep([data-tag='rest']) {
  cursor: pointer;
}

.score-page__main :deep(.score-range-start:not(.dr-play-highlight)) {
  filter: drop-shadow(0 0 3px rgba(32, 160, 64, 0.95)) drop-shadow(0 0 1px rgba(32, 160, 64, 1));
}

.score-page__main :deep(.score-range-end:not(.dr-play-highlight)) {
  filter: drop-shadow(0 0 3px rgba(64, 128, 255, 0.95)) drop-shadow(0 0 1px rgba(64, 128, 255, 1));
}

.score-page__main
  :deep(
    .score-range-start:not(.dr-play-highlight)
      :is(path, rect, circle, ellipse, polygon, text):not([fill='none'])
  ) {
  fill: #18a058;
}

.score-page__main
  :deep(
    .score-range-end:not(.dr-play-highlight)
      :is(path, rect, circle, ellipse, polygon, text):not([fill='none'])
  ) {
  fill: #2f6bff;
}

.score-page__main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
  box-sizing: border-box;
}

.score-page__svg {
  flex-shrink: 0;
}
</style>
