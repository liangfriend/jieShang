<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import type { MusicScore } from 'deciphony-renderer'
import { onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import ScoreModeToolbar from '@renderer/components/ScoreModeToolbar.vue'
import { initMusicScoreFromRoute, loadScoreTemplate, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'

const route = useRoute()
const musicScoreData = reactive(loadScoreTemplate('empty'))

onMounted(async () => {
  await initMusicScoreFromRoute(route, musicScoreData)
})
</script>

<template>
  <div class="score-page">
    <div class="score-page__main">
      <musicScoreVue
        class="score-page__svg"
        :data="musicScoreData"
        :slot-config="SCORE_SLOT_CONFIG"
        skin-name="default"
      >
        <template #t="{ node }">
          <TitleSlot mode="show" :music-score="musicScoreData" :node="node" />
        </template>
      </musicScoreVue>
    </div>
    <ScoreModeToolbar mode="play" />
  </div>
</template>

<style scoped>
.score-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 64px;
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
