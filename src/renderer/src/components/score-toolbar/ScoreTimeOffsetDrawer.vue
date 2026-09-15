<script setup lang="ts">
import { TimeOffsetEditor } from '@deciphony/extensions/dr-time-offset'
import type { MusicScore } from '@deciphony/renderer'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  SCORE_TIME_OFFSET_PROP,
  SCORE_TIME_OFFSET_PROP_OPTIONS,
  type ScoreTimeOffsetProp
} from '@renderer/constant/scoreTimeOffset'
import {
  displayAudioName,
  listAudiosFromDatabase,
  toPlayableAudioUrl,
  type AudioListItem
} from '@renderer/utils/fileHelper/audioFile'

type ScoreCustomData = Record<string, unknown> & {
  vocalPerformanceId?: number | null
  accompanimentId?: number | null
}

const props = defineProps<{
  musicScore: MusicScore
}>()

const visible = defineModel<boolean>({ default: false })

const { t } = useI18n()

const timePropName = ref<ScoreTimeOffsetProp>(SCORE_TIME_OFFSET_PROP.accompaniment)
const pxPerSecond = ref(80)
const sampleRate = ref(44100)
const audioId = ref<number | null>(null)
const audioList = ref<AudioListItem[]>([])
const audioLoading = ref(false)

function ensureScoreData(): ScoreCustomData {
  const score = props.musicScore as MusicScore & { data?: ScoreCustomData }
  if (!score.data || typeof score.data !== 'object') {
    score.data = {}
  }
  return score.data
}

function readBoundAudioId(key: 'vocalPerformanceId' | 'accompanimentId'): number | null {
  const raw = ensureScoreData()[key]
  return typeof raw === 'number' && Number.isFinite(raw) ? raw : null
}

function writeBoundAudioId(key: 'vocalPerformanceId' | 'accompanimentId', id: number | null) {
  const data = ensureScoreData()
  if (id == null) {
    delete data[key]
  } else {
    data[key] = id
  }
}

const vocalPerformanceId = computed<number | null>({
  get: () => readBoundAudioId('vocalPerformanceId'),
  set: (id) => writeBoundAudioId('vocalPerformanceId', id)
})

const accompanimentId = computed<number | null>({
  get: () => readBoundAudioId('accompanimentId'),
  set: (id) => writeBoundAudioId('accompanimentId', id)
})

const audioUrl = computed(() => {
  if (audioId.value == null) return ''
  const item = audioList.value.find((a) => a.id === audioId.value)
  return item ? toPlayableAudioUrl(item.url) : ''
})

const timePropOptions = computed(() =>
  SCORE_TIME_OFFSET_PROP_OPTIONS.map((opt) => ({
    value: opt.value,
    label: t(opt.labelKey)
  }))
)

async function refreshAudioList() {
  audioLoading.value = true
  try {
    audioList.value = await listAudiosFromDatabase()
    if (audioId.value != null && !audioList.value.some((a) => a.id === audioId.value)) {
      audioId.value = null
    }
  } finally {
    audioLoading.value = false
  }
}

watch(visible, (open) => {
  if (open) void refreshAudioList()
})
</script>

<template>
  <el-drawer
    v-model="visible"
    :title="t('editor.timeOffset.title')"
    direction="btt"
    size="92%"
    destroy-on-close
    class="score-time-offset-drawer"
  >
    <div class="score-time-offset">
      <div class="score-time-offset__controls">
        <label class="score-time-offset__field">
          <span>{{ t('editor.timeOffset.timeProp') }}</span>
          <el-select v-model="timePropName" class="score-time-offset__select">
            <el-option
              v-for="opt in timePropOptions"
              :key="opt.value"
              :label="opt.label"
              :value="opt.value"
            />
          </el-select>
        </label>

        <label class="score-time-offset__field">
          <span>{{ t('editor.timeOffset.pxPerSecond') }}</span>
          <el-input-number
            v-model="pxPerSecond"
            :min="20"
            :max="400"
            :step="10"
            controls-position="right"
            class="score-time-offset__number"
          />
        </label>

        <label class="score-time-offset__field">
          <span>{{ t('editor.timeOffset.sampleRate') }}</span>
          <el-input-number
            v-model="sampleRate"
            :min="8000"
            :max="96000"
            :step="1000"
            controls-position="right"
            class="score-time-offset__number"
          />
        </label>

        <label class="score-time-offset__field score-time-offset__field--grow">
          <span>{{ t('editor.timeOffset.selectAudio') }}</span>
          <el-select
            v-model="audioId"
            class="score-time-offset__select score-time-offset__select--audio"
            filterable
            clearable
            :loading="audioLoading"
            :placeholder="t('editor.timeOffset.audioPlaceholder')"
          >
            <el-option
              v-for="item in audioList"
              :key="item.id"
              :label="displayAudioName(item.name)"
              :value="item.id"
            />
          </el-select>
        </label>
      </div>

      <div class="score-time-offset__controls">
        <label class="score-time-offset__field score-time-offset__field--grow">
          <span>{{ t('editor.timeOffset.bindVocal') }}</span>
          <el-select
            v-model="vocalPerformanceId"
            class="score-time-offset__select score-time-offset__select--audio"
            filterable
            clearable
            :loading="audioLoading"
            :placeholder="t('editor.timeOffset.audioPlaceholder')"
          >
            <el-option
              v-for="item in audioList"
              :key="`vocal-${item.id}`"
              :label="displayAudioName(item.name)"
              :value="item.id"
            />
          </el-select>
        </label>

        <label class="score-time-offset__field score-time-offset__field--grow">
          <span>{{ t('editor.timeOffset.bindAccompaniment') }}</span>
          <el-select
            v-model="accompanimentId"
            class="score-time-offset__select score-time-offset__select--audio"
            filterable
            clearable
            :loading="audioLoading"
            :placeholder="t('editor.timeOffset.audioPlaceholder')"
          >
            <el-option
              v-for="item in audioList"
              :key="`acc-${item.id}`"
              :label="displayAudioName(item.name)"
              :value="item.id"
            />
          </el-select>
        </label>
      </div>

      <TimeOffsetEditor
        v-if="visible"
        class="score-time-offset__editor"
        :audio-url="audioUrl"
        :music-score="props.musicScore"
        :px-per-second="pxPerSecond"
        :sample-rate="sampleRate"
        :time-prop-name="timePropName"
      />
    </div>
  </el-drawer>
</template>

<style scoped>
.score-time-offset {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-height: 0;
  height: 100%;
  box-sizing: border-box;
}

.score-time-offset__controls {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 16px;
  align-items: flex-end;
  flex-shrink: 0;
}

.score-time-offset__field {
  display: inline-flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--el-text-color-regular);
}

.score-time-offset__field--grow {
  flex: 1 1 220px;
  min-width: 180px;
}

.score-time-offset__select {
  width: 140px;
}

.score-time-offset__select--audio {
  width: 100%;
  min-width: 180px;
}

.score-time-offset__number {
  width: 132px;
}

.score-time-offset__editor {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
</style>

<!-- drawer 默认 teleport 到 body，scoped 打不到；补全高度并吃掉 TimeOffsetEditor 内 420px 上限造成的空白 -->
<style>
.score-time-offset-drawer.el-drawer {
  display: flex;
  flex-direction: column;
}

.score-time-offset-drawer .el-drawer__body {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-sizing: border-box;
}

.score-time-offset-drawer .score-time-offset {
  flex: 1 1 auto;
  min-height: 0;
}

.score-time-offset-drawer .score-time-offset__editor.dr-time-offset,
.score-time-offset-drawer .dr-time-offset {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.score-time-offset-drawer .dr-time-offset__scroll {
  flex: 1 1 auto;
  min-height: 0;
  max-height: none;
}
</style>
