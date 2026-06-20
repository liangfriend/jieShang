<script setup lang="ts">
import { VideoPlay } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

const { t } = useI18n()
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
        <span>{{ t('editor.toolbar.playMode') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>
</template>
