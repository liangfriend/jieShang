<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import musicScoreVue from '@deciphony/renderer'
import type { MusicScore } from '@deciphony/renderer'
import BackButton from '@renderer/components/BackButton.vue'
import {
  DEFAULT_HARMONICA_MODEL_ID,
  HARMONICA_COLLECTION_ID,
  HARMONICA_MODEL_LIST,
  getHarmonicaModel,
  loadHarmonicaPrefs,
  saveHarmonicaPrefs,
  type HarmonicaBreath,
  type HarmonicaModelId
} from '@renderer/constant/harmonica'
import { searchScoresFromDatabase, parseScoreJson } from '@renderer/utils/fileHelper/scoreFile'
import { usePlayStore } from '@renderer/store/play.store'
import { useScorePagePlayback } from '@renderer/utils/scorePagePlayback/useScorePagePlayback'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import emptyScore from '@renderer/template/empty'
import HarmonicaPanel from './HarmonicaPanel.vue'

defineOptions({ name: 'HarmonicaSimView' })

const { t } = useI18n()
const playStore = usePlayStore()
const { waitScoreSkin } = useScoreSkin()

const prefs = loadHarmonicaPrefs()
const guideVisible = ref(false)
const modelId = ref<HarmonicaModelId>(prefs.modelId || DEFAULT_HARMONICA_MODEL_ID)
const mouthHoles = ref(prefs.mouthHoles)
const breath = ref<HarmonicaBreath | null>(null)
const soundingMidis = ref<number[]>([])
const toneReady = ref(false)

const scoreOptions = ref<Array<{ id: number; name: string }>>([])
const selectedScoreId = ref<number | null>(null)
const musicScore = ref<MusicScore>(JSON.parse(JSON.stringify(emptyScore)) as MusicScore)
const musicScoreRef = ref<{
  findElementByVDom: (node: unknown) => SVGElement | null
} | null>(null)

const model = computed(() => getHarmonicaModel(modelId.value))

const scorePlayback = useScorePagePlayback(musicScore, {
  musicScoreRef
})

async function refreshScores() {
  const list = await searchScoresFromDatabase('')
  scoreOptions.value = list.map((s) => ({ id: s.id, name: s.name }))
}

async function onScoreChange(id: number | null) {
  selectedScoreId.value = id
  scorePlayback.handleStop()
  if (id == null) {
    musicScore.value = JSON.parse(JSON.stringify(emptyScore)) as MusicScore
    return
  }
  const res = await window.api.score.get(id)
  if (!res.success || !res.data?.data) {
    ElMessage.error(t('editor.messages.scoreLoadFailed'))
    return
  }
  musicScore.value = parseScoreJson(res.data.data)
  await playStore.restorePlaybackDefaults(musicScore.value)
}

function persistPrefs() {
  saveHarmonicaPrefs({
    modelId: modelId.value,
    mouthHoles: mouthHoles.value
  })
}

watch(modelId, (id) => {
  const m = getHarmonicaModel(id)
  if (mouthHoles.value < 0.5) mouthHoles.value = m.defaultMouthHoles
  playStore.releaseAllHeldNotes()
  soundingMidis.value = []
  persistPrefs()
})

watch(mouthHoles, () => {
  persistPrefs()
})

async function syncSound(midis: number[]) {
  const next = new Set(midis)
  const prev = new Set(soundingMidis.value)
  for (const m of prev) {
    if (!next.has(m)) playStore.releaseNote(m)
  }
  for (const m of next) {
    if (!prev.has(m)) await playStore.triggerNote(m)
  }
  soundingMidis.value = midis
}

function onActiveMidis(midis: number[]) {
  void syncSound(midis)
}

function onBreath(next: HarmonicaBreath | null) {
  breath.value = next
}

onMounted(async () => {
  // 尽早锁口琴音色，与其它初始化并行，避免抢跑 ensure 灌钢琴
  const toneTask = (async () => {
    await playStore.init()
    await playStore.setCollectionToneColor(HARMONICA_COLLECTION_ID)
  })()

  void Promise.all([waitScoreSkin(), refreshScores()])

  try {
    await toneTask
    toneReady.value = true
  } catch {
    ElMessage.warning(t('instrumentSim.locked'))
  }
})

onUnmounted(() => {
  playStore.releaseAllHeldNotes()
  scorePlayback.handleStop()
})
</script>

<template>
  <div class="harmonica-sim">
    <header class="harmonica-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="harmonica-sim__title">{{ t('instrumentSim.harmonica.title') }}</h1>
      <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
    </header>

    <section class="harmonica-sim__top">
      <HarmonicaPanel
        :model="model"
        :mouth-holes="mouthHoles"
        :disabled="!toneReady"
        @active-midis="onActiveMidis"
        @breath="onBreath"
      />
      <p class="harmonica-sim__breath">
        {{
          !toneReady
            ? t('instrumentSim.harmonica.toneLoading')
            : breath === 'blow'
              ? t('instrumentSim.harmonica.blowing')
              : breath === 'draw'
                ? t('instrumentSim.harmonica.drawing')
                : t('instrumentSim.harmonica.idle')
        }}
      </p>
    </section>

    <div class="harmonica-sim__bottom">
      <section class="harmonica-sim__score">
        <div class="harmonica-sim__score-scroll">
          <musicScoreVue ref="musicScoreRef" :data="musicScore" />
        </div>
      </section>

      <aside class="harmonica-sim__tools">
        <div class="harmonica-sim__row">
          <span class="harmonica-sim__label">{{ t('instrumentSim.harmonica.selectScore') }}</span>
          <el-select
            :model-value="selectedScoreId"
            clearable
            filterable
            class="harmonica-sim__select"
            :placeholder="t('instrumentSim.harmonica.noScore')"
            @update:model-value="onScoreChange"
          >
            <el-option
              v-for="item in scoreOptions"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            />
          </el-select>
        </div>

        <div class="harmonica-sim__row harmonica-sim__row--btns">
          <el-button
            type="primary"
            size="small"
            :disabled="scorePlayback.playDisabled.value || !selectedScoreId"
            @click="scorePlayback.handlePlay()"
          >
            {{ t('instrumentSim.harmonica.play') }}
          </el-button>
          <el-button
            size="small"
            :disabled="scorePlayback.pauseDisabled.value"
            @click="scorePlayback.handlePause()"
          >
            {{ t('instrumentSim.harmonica.pause') }}
          </el-button>
          <el-button
            size="small"
            :disabled="scorePlayback.stopDisabled.value"
            @click="scorePlayback.handleStop()"
          >
            {{ t('instrumentSim.harmonica.stop') }}
          </el-button>
        </div>

        <div class="harmonica-sim__row">
          <span class="harmonica-sim__label">{{ t('instrumentSim.harmonica.model') }}</span>
          <el-select v-model="modelId" class="harmonica-sim__select" size="small">
            <el-option
              v-for="m in HARMONICA_MODEL_LIST"
              :key="m.id"
              :label="t(`instrumentSim.harmonica.models.${m.labelKey}`)"
              :value="m.id"
            />
          </el-select>
        </div>

        <div class="harmonica-sim__row">
          <span class="harmonica-sim__label">{{ t('instrumentSim.harmonica.mouthSize') }}</span>
          <el-input-number
            v-model="mouthHoles"
            :min="0.5"
            :max="8"
            :step="0.5"
            size="small"
            controls-position="right"
          />
        </div>

        <p class="harmonica-sim__hint">{{ t('instrumentSim.harmonica.toneLocked') }}</p>
        <p class="harmonica-sim__hint">{{ t('instrumentSim.harmonica.playHint') }}</p>
      </aside>
    </div>

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.harmonica.guideTitle')" width="520px">
      <p class="harmonica-sim__guide">{{ t('instrumentSim.harmonica.guideBody') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.harmonica-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fff8f2 0%, #eef5ff 55%, #f3ebff 100%);
  box-sizing: border-box;
}

.harmonica-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(120, 160, 200, 0.28);
  background: rgba(255, 252, 248, 0.92);
  flex-shrink: 0;
}

.harmonica-sim__title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #4a5568;
}

.harmonica-sim__top {
  flex-shrink: 0;
  padding: 12px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 180px;
  height: 28vh;
  max-height: 260px;
}

.harmonica-sim__breath {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #7a6a88;
  min-height: 1.2em;
}

.harmonica-sim__bottom {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 280px);
  gap: 12px;
  padding: 8px 12px 12px;
  box-sizing: border-box;
}

.harmonica-sim__score,
.harmonica-sim__tools {
  border-radius: 16px;
  border: 1px solid rgba(120, 160, 200, 0.28);
  background: rgba(255, 255, 255, 0.82);
  box-shadow: 0 8px 24px rgba(140, 160, 190, 0.12);
  min-height: 0;
}

.harmonica-sim__score {
  overflow: hidden;
}

.harmonica-sim__score-scroll {
  height: 100%;
  overflow: auto;
  padding: 8px;
  box-sizing: border-box;
}

.harmonica-sim__tools {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.harmonica-sim__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.harmonica-sim__row--btns {
  flex-wrap: wrap;
}

.harmonica-sim__label {
  flex-shrink: 0;
  width: 72px;
  font-size: 12px;
  color: #6a7a8a;
}

.harmonica-sim__select {
  flex: 1;
  min-width: 0;
}

.harmonica-sim__hint {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.45;
}

.harmonica-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4a5568;
}
</style>
