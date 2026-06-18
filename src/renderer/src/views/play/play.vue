<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import { ElMessage } from 'element-plus'
import { MusicScoreTypeEnum } from 'deciphony-renderer'
import { computed, onMounted, provide, ref } from 'vue'
import { useRoute } from 'vue-router'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import type { MusicScoreHighlightExpose } from '@renderer/dr-extensions/dr-play-highlight'
import { PlayModeToolbar } from '@renderer/components/score-toolbar'
import { scorePlaybackKey, useScorePagePlayback } from '@renderer/utils/scorePagePlayback'
import { usePlayStore } from '@renderer/store/play.store'
import { loadScoreFromRoute, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import { usePlayScoreNotationDisplay } from '@renderer/utils/usePlayScoreNotationDisplay'
import { useGlobalLoadingStore } from '@renderer/store/globalLoading.store'
import empty from '@renderer/template/empty'

const route = useRoute()
const playStore = usePlayStore()
const globalLoading = useGlobalLoadingStore()
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))
const musicScoreRef = ref<MusicScoreHighlightExpose | null>(null)
const displayType = ref<MusicScoreTypeEnum>(MusicScoreTypeEnum.StandardStaff)
const { skin: scoreSkin, skinName: scoreSkinName, waitScoreSkin } = useScoreSkin()
const playback = useScorePagePlayback(musicScoreData, { musicScoreRef })
const { initAfterLoad, applyDisplayType } = usePlayScoreNotationDisplay(musicScoreData, displayType)

const notationTypeDisabled = computed(
  () => playback.playbackState.value !== 'stopped' || playback.countingIn.value
)

provide(scorePlaybackKey, playback)

function onNotationTypeChange(targetType: MusicScoreTypeEnum) {
  if (targetType === displayType.value) return

  playback.handleStop()

  try {
    applyDisplayType(targetType)
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : '曲谱类型切换失败')
  }
}

onMounted(async () => {
  globalLoading.show('加载中…')
  try {
    const [, loaded] = await Promise.all([waitScoreSkin(), loadScoreFromRoute(route)])
    if (loaded) {
      initAfterLoad(loaded)
    }
    await playStore.restorePlaybackDefaults(musicScoreData.value)
  } finally {
    globalLoading.hide()
  }
})
</script>

<template>
  <div class="score-page">
    <div class="score-page__main">
      <musicScoreVue
        v-if="scoreSkin"
        :key="scoreSkinName"
        ref="musicScoreRef"
        class="score-page__svg"
        :data="musicScoreData"
        :slot-config="SCORE_SLOT_CONFIG"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
        @renderMusicScore="playback.handleRenderMusicScore"
      >
        <template #t="{ node }">
          <TitleSlot
            mode="show"
            :music-score="musicScoreData"
            :node="node"
            :slot-config="SCORE_SLOT_CONFIG"
          />
        </template>
      </musicScoreVue>
    </div>
    <PlayModeToolbar
      :music-score="musicScoreData"
      :notation-type="displayType"
      :notation-type-disabled="notationTypeDisabled"
      @notation-type-change="onNotationTypeChange"
    />
  </div>
</template>

<style scoped>
.score-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}

.score-page__main {
  flex: 1;
  min-width: 0;
  overflow: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.score-page__svg {
  flex-shrink: 0;
}
</style>
