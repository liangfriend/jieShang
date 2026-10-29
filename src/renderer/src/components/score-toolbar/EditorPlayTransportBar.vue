<script setup lang="ts">
import { VideoPause, VideoPlay } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { computed, inject } from 'vue'
import { useI18n } from 'vue-i18n'
import { scorePlaybackKey, scorePlayRangeKey } from '@renderer/utils/scorePagePlayback'

defineOptions({ name: 'EditorPlayTransportBar' })

const { t } = useI18n()
const playbackMaybe = inject(scorePlaybackKey)
const rangeSelect = inject(scorePlayRangeKey, null)

if (!playbackMaybe) {
  throw new Error('EditorPlayTransportBar requires scorePlayback from editor play mode')
}
const playback = playbackMaybe

const playDisabled = computed(() => playback.playDisabled.value)
const pauseDisabled = computed(() => playback.pauseDisabled.value)
const stopDisabled = computed(() => playback.stopDisabled.value)

function toggleRangeSelect() {
  if (!rangeSelect) return
  if (rangeSelect.active.value) rangeSelect.end()
  else rangeSelect.start()
}

async function onPlay() {
  if (rangeSelect?.active.value && !rangeSelect.complete.value) {
    ElMessage.warning(t('play.range.incomplete'))
    return
  }
  await playback.handlePlay()
}

function onPause() {
  playback.handlePause()
}

function onStop() {
  playback.handleStop()
}
</script>

<template>
  <div class="editor-play-transport">
    <button
      type="button"
      class="editor-play-transport__btn editor-play-transport__btn--accent"
      :disabled="playDisabled"
      @click="onPlay"
    >
      <el-icon><VideoPlay /></el-icon>
      <span>{{ t('play.toolbar.play') }}</span>
    </button>
    <button
      type="button"
      class="editor-play-transport__btn"
      :disabled="pauseDisabled"
      @click="onPause"
    >
      <el-icon><VideoPause /></el-icon>
      <span>{{ t('play.toolbar.pause') }}</span>
    </button>
    <button
      type="button"
      class="editor-play-transport__btn"
      :disabled="stopDisabled"
      @click="onStop"
    >
      <span class="editor-play-transport__stop" aria-hidden="true" />
      <span>{{ t('play.toolbar.stop') }}</span>
    </button>
    <button
      v-if="rangeSelect"
      type="button"
      class="editor-play-transport__btn"
      :class="{ 'editor-play-transport__btn--accent': rangeSelect.active.value }"
      :title="t('play.range.tooltip')"
      @click="toggleRangeSelect"
    >
      <span>{{ t('play.range.title') }}</span>
    </button>
  </div>
</template>

<style scoped>
.editor-play-transport {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
}

.editor-play-transport__btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.9);
  color: #5c4a6a;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.editor-play-transport__btn:hover:not(:disabled) {
  border-color: rgba(255, 143, 184, 0.85);
  background: #fff;
}

.editor-play-transport__btn:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.editor-play-transport__btn--accent {
  border-color: transparent;
  background: linear-gradient(90deg, #ff8fb8, #c9b8ff);
  color: #fff;
}

.editor-play-transport__stop {
  width: 10px;
  height: 10px;
  border-radius: 2px;
  background: currentColor;
}
</style>
