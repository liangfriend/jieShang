<script lang="ts" setup>
import musicScoreVue from 'deciphony-renderer'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { TitleSlot } from '@renderer/dr-extensions/dr-title'
import { PlayModeToolbar } from '@renderer/components/score-toolbar'
import { loadScoreFromRoute, SCORE_SLOT_CONFIG } from '@renderer/utils/scoreRoute'
import empty from '@renderer/template/empty'

const route = useRoute()
const musicScoreData = ref(JSON.parse(JSON.stringify(empty)))

onMounted(async () => {
  const loaded = await loadScoreFromRoute(route)
  if (loaded) {
    musicScoreData.value = loaded
  }
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
          <TitleSlot
            mode="show"
            :music-score="musicScoreData"
            :node="node"
            :slot-config="SCORE_SLOT_CONFIG"
          />
        </template>
      </musicScoreVue>
    </div>
    <PlayModeToolbar />
  </div>
</template>

<style scoped>
.score-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding-bottom: 72px;
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
