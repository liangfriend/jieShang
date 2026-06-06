<script setup lang="ts">
import { EditPen, VideoPlay } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

const route = useRoute()
const router = useRouter()

function switchToPlay() {
  router.replace({
    name: 'play',
    query: buildScoreRouteQuery(route)
  })
}
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/" />
    </template>
    <template #center>
      <button type="button" class="score-toolbar__btn" @click="switchToPlay">
        <el-icon><VideoPlay /></el-icon>
        <span>播放模式</span>
      </button>
    </template>
  </ScoreToolbarShell>
</template>
