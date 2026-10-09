<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import {
  KALIMBA_COLLECTION_ID,
  KALIMBA_MODELS,
  KALIMBA_MODEL_LIST,
  KALIMBA_SMOOTH_ENVELOPE,
  loadKalimbaPrefs,
  saveKalimbaPrefs,
  type KalimbaModelId
} from '@renderer/constant/kalimba'
import { DEFAULT_TONE_COLOR_COLLECTION_ID } from '@renderer/utils/collection/toneColorUsage'
import { usePlayStore } from '@renderer/store/play.store'
import { useSimHeldNotes } from '@renderer/utils/useSimHeldNotes'
import KalimbaPanel from './KalimbaPanel.vue'
import InstrumentScorePanel from './InstrumentScorePanel.vue'

defineOptions({ name: 'KalimbaSimView' })

const { t } = useI18n()
const playStore = usePlayStore()

const prefs = loadKalimbaPrefs()
const guideVisible = ref(false)
const modelId = ref<KalimbaModelId>(prefs.modelId)
const smoothEnvelope = ref(prefs.smoothEnvelope)
const toneReady = ref(false)

const model = computed(() => KALIMBA_MODELS[modelId.value])
const notes = useSimHeldNotes(() => (smoothEnvelope.value ? KALIMBA_SMOOTH_ENVELOPE : null))

const keyToMidi = computed(() => new Map(model.value.tines.map((tine) => [tine.key, tine.midi])))

/** 只读输入框（如非搜索下拉）不拦截快捷键 */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  if (el instanceof HTMLInputElement) return !el.readOnly
  return el.isContentEditable || el.tagName === 'TEXTAREA'
}

/** KeyboardEvent.code → midi */
function lookupKey(code: string): number | undefined {
  if (!code.startsWith('Key')) return undefined
  return keyToMidi.value.get(code.slice(3).toLowerCase())
}

function onKeyDown(ev: KeyboardEvent) {
  if (!toneReady.value) return
  if (ev.ctrlKey || ev.metaKey || ev.altKey || isTypingTarget(ev.target)) return
  const midi = lookupKey(ev.code)
  if (midi == null) return
  ev.preventDefault()
  if (ev.repeat) return
  void notes.press(midi)
}

function onKeyUp(ev: KeyboardEvent) {
  const midi = lookupKey(ev.code)
  if (midi != null) notes.release(midi)
}

watch([modelId, smoothEnvelope], () => {
  notes.releaseAll()
  saveKalimbaPrefs({ modelId: modelId.value, smoothEnvelope: smoothEnvelope.value })
})

let disposed = false

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', notes.releaseAll)
  try {
    await playStore.init()
    // 初始化期间已离开：别在卸载还原默认音色之后再把卡林巴音色设回去
    if (disposed) return
    await playStore.setCollectionToneColor(KALIMBA_COLLECTION_ID)
    toneReady.value = true
  } catch {
    if (!disposed) ElMessage.warning(t('instrumentSim.locked'))
  }
})

onUnmounted(() => {
  disposed = true
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', notes.releaseAll)
  notes.releaseAll()
  void playStore.setCollectionToneColor(DEFAULT_TONE_COLOR_COLLECTION_ID)
})
</script>

<template>
  <div class="kalimba-sim">
    <header class="kalimba-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="kalimba-sim__title">{{ t('instrumentSim.kalimba.title') }}</h1>
      <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
    </header>

    <section class="kalimba-sim__top">
      <KalimbaPanel
        :model="model"
        :active-midis="notes.held.value"
        :disabled="!toneReady"
        @press="notes.press"
        @release="notes.release"
      />
      <p class="kalimba-sim__status">
        {{ toneReady ? t('instrumentSim.kalimba.idle') : t('instrumentSim.kalimba.toneLoading') }}
      </p>
    </section>

    <InstrumentScorePanel>
      <div class="kalimba-sim__row">
        <span class="kalimba-sim__label">{{ t('instrumentSim.kalimba.model') }}</span>
        <el-select v-model="modelId" class="kalimba-sim__select" size="small">
          <el-option
            v-for="m in KALIMBA_MODEL_LIST"
            :key="m.id"
            :label="t(`instrumentSim.kalimba.models.${m.labelKey}`)"
            :value="m.id"
          />
        </el-select>
      </div>
      <div class="kalimba-sim__row">
        <span class="kalimba-sim__label">{{ t('instrumentSim.smoothEnvelope') }}</span>
        <el-switch v-model="smoothEnvelope" size="small" />
      </div>
      <p class="kalimba-sim__hint">{{ t('instrumentSim.kalimba.toneLocked') }}</p>
    </InstrumentScorePanel>

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.kalimba.guideTitle')" width="520px">
      <p class="kalimba-sim__guide">{{ t('instrumentSim.kalimba.guideBody') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.kalimba-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fff6ee 0%, #f5ede4 55%, #eef3ff 100%);
  box-sizing: border-box;
}

.kalimba-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(160, 120, 80, 0.28);
  background: rgba(255, 252, 246, 0.92);
  flex-shrink: 0;
}

.kalimba-sim__title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #5a4a38;
}

.kalimba-sim__top {
  flex-shrink: 0;
  height: 42vh;
  min-height: 240px;
  padding: 12px 12px 4px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  box-sizing: border-box;
}

.kalimba-sim__status {
  margin: 0;
  text-align: center;
  font-size: 12px;
  color: #7a6a58;
  min-height: 1.2em;
}

.kalimba-sim__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.kalimba-sim__label {
  flex-shrink: 0;
  width: 72px;
  font-size: 12px;
  color: #6a7a8a;
}

.kalimba-sim__select {
  flex: 1;
  min-width: 0;
}

.kalimba-sim__hint {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.45;
}

.kalimba-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4a5568;
  white-space: pre-line;
}
</style>
