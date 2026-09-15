<script setup lang="ts">
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import type { MusicScoreTypeEnum } from '@deciphony/renderer'
import {
  PLAY_SOURCE,
  PLAY_SOURCE_OPTIONS,
  type PlaySource
} from '@renderer/constant/playSource'
import ScoreNotationTypeSelector from './ScoreNotationTypeSelector.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'

const props = defineProps<{
  notationType: MusicScoreTypeEnum
  notationTypeDisabled?: boolean
  playSource: PlaySource
  sourceSelectDisabled?: boolean
  vocalEnabled?: boolean
  accompanimentEnabled?: boolean
  detecting: boolean
  startDisabled?: boolean
}>()

const emit = defineEmits<{
  'notation-type-change': [value: MusicScoreTypeEnum]
  'play-source-change': [value: PlaySource]
  start: []
  stop: []
}>()

const { t } = useI18n()

const playSourceModel = computed({
  get: () => props.playSource,
  set: (v: PlaySource) => emit('play-source-change', v)
})
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/play" />
    </template>
    <template #center>
      <el-select
        v-model="playSourceModel"
        class="score-toolbar__source"
        size="small"
        :disabled="sourceSelectDisabled || detecting"
      >
        <el-option
          v-for="opt in PLAY_SOURCE_OPTIONS"
          :key="opt.value"
          :label="t(opt.labelKey)"
          :value="opt.value"
          :disabled="
            (opt.value === PLAY_SOURCE.vocal && !vocalEnabled) ||
            (opt.value === PLAY_SOURCE.accompaniment && !accompanimentEnabled)
          "
        />
      </el-select>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="detecting || startDisabled"
        @click="emit('start')"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>{{ t('singing.toolbar.start') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="!detecting"
        @click="emit('stop')"
      >
        <el-icon><VideoPause /></el-icon>
        <span>{{ t('singing.toolbar.stop') }}</span>
      </button>
      <ScoreNotationTypeSelector
        :model-value="notationType"
        :disabled="notationTypeDisabled || detecting"
        @change="emit('notation-type-change', $event)"
      />
    </template>
  </ScoreToolbarShell>
</template>

<style scoped>
.score-toolbar__source {
  width: 96px;
}
</style>
