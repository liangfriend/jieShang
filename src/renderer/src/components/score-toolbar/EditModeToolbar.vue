<script setup lang="ts">
import { EditPen, Headset, VideoPlay } from '@element-plus/icons-vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'

const props = defineProps<{
  playMode?: boolean
}>()

const emit = defineEmits<{
  'open-time-offset': []
  'toggle-play-mode': []
}>()

const { t } = useI18n()
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/" />
    </template>
    <template #center>
      <button type="button" class="score-toolbar__btn" @click="emit('toggle-play-mode')">
        <el-icon>
          <EditPen v-if="props.playMode" />
          <VideoPlay v-else />
        </el-icon>
        <span>
          {{ props.playMode ? t('play.toolbar.editMode') : t('editor.toolbar.playMode') }}
        </span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="props.playMode"
        @click="emit('open-time-offset')"
      >
        <el-icon><Headset /></el-icon>
        <span>{{ t('editor.toolbar.timeOffset') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>
</template>
