<script setup lang="ts">
import { Headset, VideoPlay } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

const emit = defineEmits<{
  'open-time-offset': []
}>()

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
      <button type="button" class="score-toolbar__btn" @click="emit('open-time-offset')">
        <el-icon><Headset /></el-icon>
        <span>{{ t('editor.toolbar.timeOffset') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>
</template>
