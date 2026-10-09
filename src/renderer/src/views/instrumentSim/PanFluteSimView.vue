<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import {
  PAN_FLUTE_COLLECTION_ID,
  PAN_FLUTE_MODELS,
  PAN_FLUTE_MODEL_LIST,
  PAN_FLUTE_SMOOTH_ENVELOPE,
  loadPanFlutePrefs,
  savePanFlutePrefs,
  type PanFluteModelId
} from '@renderer/constant/panFlute'
import { DEFAULT_TONE_COLOR_COLLECTION_ID } from '@renderer/utils/collection/toneColorUsage'
import { usePlayStore } from '@renderer/store/play.store'
import { useSimHeldNotes } from '@renderer/utils/useSimHeldNotes'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'
import PanFlutePanel from './PanFlutePanel.vue'
import InstrumentScorePanel from './InstrumentScorePanel.vue'

defineOptions({ name: 'PanFluteSimView' })

const { t } = useI18n()
const playStore = usePlayStore()

const prefs = loadPanFlutePrefs()
const guideVisible = ref(false)
const modelId = ref<PanFluteModelId>(prefs.modelId)
const smoothEnvelope = ref(prefs.smoothEnvelope)
const toneReady = ref(false)
const activeMidi = ref<number | null>(null)

const model = computed(() => PAN_FLUTE_MODELS[modelId.value])
const notes = useSimHeldNotes(() => (smoothEnvelope.value ? PAN_FLUTE_SMOOTH_ENVELOPE : null))

const statusText = computed(() => {
  if (!toneReady.value) return t('instrumentSim.panFlute.toneLoading')
  if (activeMidi.value == null) return t('instrumentSim.panFlute.idle')
  return t('instrumentSim.panFlute.blowing', {
    note: noteNameToNoteString(midiToNoteName(activeMidi.value))
  })
})

function onActive(midi: number | null) {
  const prev = activeMidi.value
  activeMidi.value = midi
  if (prev != null && prev !== midi) notes.release(prev)
  if (midi != null && midi !== prev) void notes.press(midi)
}

watch([modelId, smoothEnvelope], () => {
  notes.releaseAll()
  activeMidi.value = null
  savePanFlutePrefs({ modelId: modelId.value, smoothEnvelope: smoothEnvelope.value })
})

let disposed = false

onMounted(async () => {
  try {
    await playStore.init()
    // 初始化期间已离开：别在卸载还原默认音色之后再把排箫音色设回去
    if (disposed) return
    await playStore.setCollectionToneColor(PAN_FLUTE_COLLECTION_ID)
    toneReady.value = true
  } catch {
    if (!disposed) ElMessage.warning(t('instrumentSim.locked'))
  }
})

onUnmounted(() => {
  disposed = true
  notes.releaseAll()
  void playStore.setCollectionToneColor(DEFAULT_TONE_COLOR_COLLECTION_ID)
})
</script>

<template>
  <div class="pan-flute-sim">
    <header class="pan-flute-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="pan-flute-sim__title">{{ t('instrumentSim.panFlute.title') }}</h1>
      <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
    </header>

    <section class="pan-flute-sim__top">
      <PanFlutePanel :model="model" :disabled="!toneReady" @active="onActive" />
      <p class="pan-flute-sim__status">{{ statusText }}</p>
    </section>

    <InstrumentScorePanel single-line>
      <div class="pan-flute-sim__row">
        <span class="pan-flute-sim__label">{{ t('instrumentSim.panFlute.model') }}</span>
        <el-select v-model="modelId" class="pan-flute-sim__select" size="small">
          <el-option
            v-for="m in PAN_FLUTE_MODEL_LIST"
            :key="m.id"
            :label="t(`instrumentSim.panFlute.models.${m.labelKey}`)"
            :value="m.id"
          />
        </el-select>
      </div>
      <div class="pan-flute-sim__row">
        <span class="pan-flute-sim__label">{{ t('instrumentSim.smoothEnvelope') }}</span>
        <el-switch v-model="smoothEnvelope" size="small" />
      </div>
      <p class="pan-flute-sim__hint">{{ t('instrumentSim.panFlute.toneLocked') }}</p>
    </InstrumentScorePanel>

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.panFlute.guideTitle')" width="520px">
      <p class="pan-flute-sim__guide">{{ t('instrumentSim.panFlute.guideBody') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.pan-flute-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fff8ee 0%, #f3efe4 55%, #eef5ff 100%);
  box-sizing: border-box;
}

.pan-flute-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(160, 130, 90, 0.28);
  background: rgba(255, 252, 246, 0.92);
  flex-shrink: 0;
}

.pan-flute-sim__title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #5a4a38;
}

.pan-flute-sim__top {
  flex-shrink: 0;
  height: 56vh;
  min-height: 260px;
  padding: 12px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
}

.pan-flute-sim__status {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #7a6a58;
  min-height: 1.2em;
}

.pan-flute-sim__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pan-flute-sim__label {
  flex-shrink: 0;
  width: 72px;
  font-size: 12px;
  color: #6a7a8a;
}

.pan-flute-sim__select {
  flex: 1;
  min-width: 0;
}

.pan-flute-sim__hint {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.45;
}

.pan-flute-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4a5568;
  white-space: pre-line;
}
</style>
