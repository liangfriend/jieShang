<script setup lang="ts">
import { Delete, Hide, Headset, Setting, VideoPause, VideoPlay, View } from '@element-plus/icons-vue'
import { computed, inject, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import { scorePlaybackKey } from '@renderer/utils/scorePagePlayback'
import { usePracticeSettingsStore } from '@renderer/store/practiceSettings.store'
import type { KeySignatureTypeEnum, MusicScoreTypeEnum } from '@deciphony/renderer'
import { practiceContextKey } from '@renderer/views/practice/practiceContext'
import ScoreNotationTypeSelector from './ScoreNotationTypeSelector.vue'
import ScoreTransposeControl from './ScoreTransposeControl.vue'
import ScoreSemitoneShiftButtons from './ScoreSemitoneShiftButtons.vue'
import ScoreToolbarShell from './ScoreToolbarShell.vue'
import ScoreToneColorAdjuster from './ScoreToneColorAdjuster.vue'
import PracticeSettingsDialog from './PracticeSettingsDialog.vue'

defineProps<{
  notationType: MusicScoreTypeEnum
  notationTypeDisabled?: boolean
  currentKey: KeySignatureTypeEnum
  transposeDisabled?: boolean
}>()

const emit = defineEmits<{
  'notation-type-change': [value: MusicScoreTypeEnum]
  transpose: [payload: { toKey: KeySignatureTypeEnum }]
  'semitone-shift': [semitones: 1 | -1]
}>()

const { t } = useI18n()
const settings = usePracticeSettingsStore()

const playback = inject(scorePlaybackKey)

if (!playback) {
  throw new Error('PracticeModeToolbar requires scorePlayback from practice.vue')
}

const practice = inject(practiceContextKey)
if (!practice) {
  throw new Error('PracticeModeToolbar requires practiceContext from practice.vue')
}

const {
  playbackState,
  countingIn,
  playDisabled,
  pauseDisabled,
  stopDisabled,
  handlePlay,
  handlePause,
  handleStop,
  handleClearPlayData
} = playback

const { demoSession, handleToggleDemo } = practice

const settingsVisible = ref(false)

const settingsDisabled = computed(
  () => playbackState.value !== 'stopped' || countingIn.value || demoSession.value
)
const toneColorDisabled = settingsDisabled
const clearDisabled = computed(() => countingIn.value || demoSession.value)
const practicePlayDisabled = computed(() => playDisabled.value || demoSession.value)
const practicePauseDisabled = computed(() => pauseDisabled.value || demoSession.value)
const demoDisabled = computed(
  () => !demoSession.value && (countingIn.value || playbackState.value !== 'stopped')
)

function openSettings() {
  if (settingsDisabled.value) return
  settingsVisible.value = true
}

function clearPlayData() {
  if (clearDisabled.value) return
  handleClearPlayData?.()
}
</script>

<template>
  <ScoreToolbarShell>
    <template #left>
      <BackButton fallback="/play" />
    </template>
    <template #center>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="settingsDisabled"
        @click="openSettings"
      >
        <el-icon><Setting /></el-icon>
        <span>{{ t('practice.toolbar.settings') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn score-toolbar__btn--accent"
        :disabled="practicePlayDisabled"
        @click="handlePlay"
      >
        <el-icon><VideoPlay /></el-icon>
        <span>{{ t('practice.toolbar.play') }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="demoDisabled"
        @click="handleToggleDemo"
      >
        <el-icon><Headset /></el-icon>
        <span>{{
          demoSession ? t('practice.toolbar.stopDemo') : t('practice.toolbar.demoPlay')
        }}</span>
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="practicePauseDisabled"
        @click="handlePause"
      >
        <el-icon><VideoPause /></el-icon>
        <span>{{ t('practice.toolbar.pause') }}</span>
      </button>
      <button type="button" class="score-toolbar__btn" :disabled="stopDisabled" @click="handleStop">
        <span class="score-toolbar__stop-icon" aria-hidden="true" />
        <span>{{ t('practice.toolbar.stop') }}</span>
      </button>
      <ScoreToneColorAdjuster :disabled="toneColorDisabled" score-option />
      <ScoreNotationTypeSelector
        :model-value="notationType"
        :disabled="notationTypeDisabled"
        @change="emit('notation-type-change', $event)"
      />
      <ScoreTransposeControl
        :current-key="currentKey"
        :disabled="transposeDisabled || notationTypeDisabled"
        @transpose="emit('transpose', $event)"
      />
      <ScoreSemitoneShiftButtons
        :disabled="transposeDisabled || notationTypeDisabled"
        @shift="emit('semitone-shift', $event)"
      />
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="clearDisabled"
        @click="clearPlayData"
      >
        <el-icon><Delete /></el-icon>
        <span>{{ t('practice.toolbar.clearPlayData') }}</span>
      </button>
      <button type="button" class="score-toolbar__btn" @click="settings.hideScore = !settings.hideScore">
        <el-icon>
          <View v-if="settings.hideScore" />
          <Hide v-else />
        </el-icon>
        <span>{{ settings.hideScore ? t('practice.toolbar.showScore') : t('practice.toolbar.hideScore') }}</span>
      </button>
    </template>
  </ScoreToolbarShell>

  <PracticeSettingsDialog v-model="settingsVisible" />
</template>

<style scoped>
.score-toolbar__stop-icon {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}
</style>
