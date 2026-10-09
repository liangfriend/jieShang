<script lang="ts" setup>
import { ElMessage } from 'element-plus'
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import BackButton from '@renderer/components/BackButton.vue'
import type { PuffFrame } from '@deciphony/puff'
import {
  PICCOLO_COLLECTION_ID,
  PICCOLO_MAX_VOLUME,
  PICCOLO_MODELS,
  PICCOLO_MODEL_LIST,
  PICCOLO_REGISTER_HYSTERESIS,
  PICCOLO_SWITCH_RELEASE_SEC,
  loadPiccoloPrefs,
  piccoloRegisterStarts,
  savePiccoloPrefs,
  type PiccoloBreathMode,
  type PiccoloFacing,
  type PiccoloModelId
} from '@renderer/constant/piccolo'
import {
  fingeringNoteJianpu,
  fingeringNoteMidi,
  matchFingering,
  type FingerHoleState
} from '@renderer/constant/fingering'
import { DEFAULT_TONE_COLOR_COLLECTION_ID } from '@renderer/utils/collection/toneColorUsage'
import { usePlayStore } from '@renderer/store/play.store'
import { usePuffBreath } from '@renderer/utils/usePuffBreath'
import { midiToNoteName, noteNameToNoteString } from '@renderer/utils/noteNameDisplay'
import PiccoloPanel from './PiccoloPanel.vue'
import InstrumentScorePanel from './InstrumentScorePanel.vue'

defineOptions({ name: 'PiccoloSimView' })

const { t } = useI18n()
const playStore = usePlayStore()

const prefs = loadPiccoloPrefs()
const guideVisible = ref(false)
const modelId = ref<PiccoloModelId>(prefs.modelId)
const facing = ref<PiccoloFacing>(prefs.facing)
const breathMode = ref<PiccoloBreathMode>(prefs.breathMode)
const toneReady = ref(false)
const model = computed(() => PICCOLO_MODELS[modelId.value])
const keyMap = computed(() => model.value.keys[facing.value])

const spaceHeld = ref(false)
/** 同一指法多个八度时，当前气压所在的分段（0 = 最低） */
const registerIndex = ref(0)
const soundingMidi = ref<number | null>(null)

const breath = usePuffBreath(onPuffFrame)

/** 键盘按住的全按 / 半按孔位下标 */
const fullHeld = ref<Set<number>>(new Set())
const halfHeld = ref<Set<number>>(new Set())
/** 鼠标按住的孔位 */
const pointerHeld = ref<Map<number, FingerHoleState>>(new Map())

const holeStates = computed<FingerHoleState[]>(() =>
  Array.from({ length: model.value.chart.holeCount }, (_, i) => {
    if (fullHeld.value.has(i) || pointerHeld.value.get(i) === 'c') return 'c'
    if (halfHeld.value.has(i) || pointerHeld.value.get(i) === 'h') return 'h'
    return 'o'
  })
)

const matches = computed(() => {
  const chart = model.value.chart
  return matchFingering(chart, holeStates.value.join('')).map((note) => {
    const midi = fingeringNoteMidi(chart, note)
    return {
      key: `${note.octave}-${note.solfege}-${note.sharp}`,
      midi,
      jianpu: fingeringNoteJianpu(note),
      name: noteNameToNoteString(midiToNoteName(midi)),
      register: t(`instrumentSim.piccolo.registers.${registerKey(note.octave)}`)
    }
  })
})

function registerKey(octave: number): 'low' | 'middle' | 'high' | 'highest' {
  if (octave < 0) return 'low'
  if (octave === 0) return 'middle'
  if (octave === 1) return 'high'
  return 'highest'
}

function withIndex(set: Set<number>, index: number, on: boolean): Set<number> {
  const next = new Set(set)
  if (on) next.add(index)
  else next.delete(index)
  return next
}

/** KeyboardEvent.code → 孔位 */
function lookupKey(code: string): { index: number; half: boolean } | null {
  if (!code.startsWith('Key')) return null
  const letter = code.slice(3).toLowerCase()
  const full = keyMap.value.full.indexOf(letter)
  if (full >= 0) return { index: full, half: false }
  const half = keyMap.value.half.indexOf(letter)
  if (half >= 0) return { index: half, half: true }
  return null
}

/** 只读输入框（如非搜索下拉）不拦截快捷键 */
function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  if (el instanceof HTMLInputElement) return !el.readOnly
  return el.isContentEditable || el.tagName === 'TEXTAREA'
}

const blowing = computed(() =>
  breathMode.value === 'mic' ? breath.blowing.value : spaceHeld.value
)

/** 气压条上的分段刻度（候选音多于 1 个时） */
const registerMarks = computed(() => piccoloRegisterStarts(matches.value.length).slice(1))

const targetMidi = computed(() => {
  if (!toneReady.value || !blowing.value) return null
  const list = matches.value
  if (!list.length) return null
  return list[Math.min(registerIndex.value, list.length - 1)]!.midi
})

/** 气压 0 → 1 按 PICCOLO_REGISTER_WIDTHS 分段，越急越高；离开当前段超过迟滞量才换段 */
function pickRegister(pressure: number, count: number, prev: number): number {
  if (count <= 1) return 0
  const starts = piccoloRegisterStarts(count)
  const p = Math.min(Math.max(pressure, 0), 1)
  let raw = 0
  starts.forEach((start, i) => {
    if (p >= start) raw = i
  })
  if (prev === raw || prev < 0 || prev >= count) return raw
  const lo = starts[prev]! - PICCOLO_REGISTER_HYSTERESIS
  const hi = (starts[prev + 1] ?? 1) + PICCOLO_REGISTER_HYSTERESIS
  return p >= lo && p < hi ? prev : raw
}

function onPuffFrame(frame: PuffFrame) {
  if (breathMode.value !== 'mic' || !frame.isBlowing) return
  const p = Math.min(1, frame.pressure)
  registerIndex.value = pickRegister(p, matches.value.length, registerIndex.value)
  playStore.setLiveMasterVolume(p * PICCOLO_MAX_VOLUME)
}

async function startNote(midi: number) {
  soundingMidi.value = midi
  await playStore.triggerNote(midi, { holdUntilRelease: true, attack: 0.02, peakVolume: 1 })
  if (soundingMidi.value !== midi) playStore.releaseNote(midi, { immediate: true })
}

function stopNote(immediate: boolean) {
  const midi = soundingMidi.value
  soundingMidi.value = null
  if (midi == null) return
  playStore.releaseNote(
    midi,
    immediate ? { immediate: true } : { release: PICCOLO_SWITCH_RELEASE_SEC }
  )
}

watch(targetMidi, (next, prev) => {
  if (next === prev) return
  if (next == null) {
    // 吹气已结束、气压接近 0，直接掐断，避免还原总音量后尾音突然变响
    stopNote(true)
    return
  }
  stopNote(false)
  void startNote(next)
})

// 吹气期间无论有没有对应的音都会改总音量，结束时统一还原，免得曲谱播放音量卡在低位
watch(blowing, (on) => {
  if (!on && breathMode.value === 'mic') playStore.restoreMasterVolume()
})

watch(matches, (list) => {
  const p = breathMode.value === 'mic' ? breath.pressure.value : 0
  registerIndex.value = pickRegister(p, list.length, Math.min(registerIndex.value, list.length - 1))
})

async function startMic() {
  try {
    await breath.start()
  } catch {
    if (!disposed) ElMessage.warning(t('instrumentSim.piccolo.micFailed'))
  }
}

watch(breathMode, (mode) => {
  stopNote(true)
  playStore.restoreMasterVolume()
  spaceHeld.value = false
  registerIndex.value = 0
  if (mode === 'mic') void startMic()
  else breath.stop()
})

function onKeyDown(ev: KeyboardEvent) {
  if (ev.ctrlKey || ev.metaKey || ev.altKey || isTypingTarget(ev.target)) return
  if (ev.code === 'Space' && breathMode.value === 'space') {
    ev.preventDefault()
    if (!ev.repeat) spaceHeld.value = true
    return
  }
  const hit = lookupKey(ev.code)
  if (!hit) return
  ev.preventDefault()
  if (ev.repeat) return
  if (hit.half) halfHeld.value = withIndex(halfHeld.value, hit.index, true)
  else fullHeld.value = withIndex(fullHeld.value, hit.index, true)
}

function onKeyUp(ev: KeyboardEvent) {
  if (ev.code === 'Space' && breathMode.value === 'space') {
    ev.preventDefault()
    spaceHeld.value = false
    return
  }
  const hit = lookupKey(ev.code)
  if (!hit) return
  if (hit.half) halfHeld.value = withIndex(halfHeld.value, hit.index, false)
  else fullHeld.value = withIndex(fullHeld.value, hit.index, false)
}

function clearHeld() {
  fullHeld.value = new Set()
  halfHeld.value = new Set()
  pointerHeld.value = new Map()
  spaceHeld.value = false
}

function onHolePointer(index: number, state: FingerHoleState | null) {
  const next = new Map(pointerHeld.value)
  if (state) next.set(index, state)
  else next.delete(index)
  pointerHeld.value = next
}

watch([modelId, facing], () => clearHeld())

watch([modelId, facing, breathMode], () => {
  savePiccoloPrefs({
    modelId: modelId.value,
    facing: facing.value,
    breathMode: breathMode.value
  })
})

let disposed = false

onMounted(async () => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('keyup', onKeyUp)
  window.addEventListener('blur', clearHeld)
  if (breathMode.value === 'mic') void startMic()
  try {
    await playStore.init()
    // 初始化期间已离开：别在卸载还原默认音色之后再把短笛音色设回去
    if (disposed) return
    await playStore.setCollectionToneColor(PICCOLO_COLLECTION_ID)
    toneReady.value = true
  } catch {
    if (!disposed) ElMessage.warning(t('instrumentSim.locked'))
  }
})

onUnmounted(() => {
  disposed = true
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('keyup', onKeyUp)
  window.removeEventListener('blur', clearHeld)
  breath.stop()
  stopNote(true)
  playStore.restoreMasterVolume()
  void playStore.setCollectionToneColor(DEFAULT_TONE_COLOR_COLLECTION_ID)
})
</script>

<template>
  <div class="piccolo-sim">
    <header class="piccolo-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="piccolo-sim__title">{{ t('instrumentSim.piccolo.title') }}</h1>
      <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
    </header>

    <section class="piccolo-sim__top">
      <div class="piccolo-sim__stage">
        <PiccoloPanel
          :hole-states="holeStates"
          :full-keys="keyMap.full"
          :half-keys="keyMap.half"
          :flipped="facing === 'right'"
          @hole-pointer="onHolePointer"
        />
      </div>
      <div class="piccolo-sim__note">
        <p class="piccolo-sim__note-title">{{ t('instrumentSim.piccolo.currentNote') }}</p>
        <template v-if="matches.length">
          <div
            v-for="m in matches"
            :key="m.key"
            class="piccolo-sim__note-item"
            :class="{ 'piccolo-sim__note-item--sounding': soundingMidi === m.midi }"
          >
            <span class="piccolo-sim__jianpu">{{ m.jianpu }}</span>
            <span class="piccolo-sim__name">{{ m.name }}</span>
            <span class="piccolo-sim__register">{{ m.register }}</span>
          </div>
          <p v-if="matches.length > 1" class="piccolo-sim__note-tip">
            {{ t('instrumentSim.piccolo.overblowTip') }}
          </p>
        </template>
        <p v-else class="piccolo-sim__note-empty">{{ t('instrumentSim.piccolo.noMatch') }}</p>
        <div v-if="breathMode === 'mic'" class="piccolo-sim__meter">
          <span class="piccolo-sim__meter-label">{{ t('instrumentSim.piccolo.pressure') }}</span>
          <div class="piccolo-sim__meter-track">
            <div
              class="piccolo-sim__meter-fill"
              :class="{ 'piccolo-sim__meter-fill--on': blowing }"
              :style="{ width: `${Math.min(1, breath.pressure.value) * 100}%` }"
            />
            <div
              v-for="mark in registerMarks"
              :key="mark"
              class="piccolo-sim__meter-threshold"
              :style="{ left: `${mark * 100}%` }"
            />
          </div>
        </div>
      </div>
    </section>

    <InstrumentScorePanel>
      <div class="piccolo-sim__row">
        <span class="piccolo-sim__label">{{ t('instrumentSim.piccolo.model') }}</span>
        <el-select v-model="modelId" class="piccolo-sim__select" size="small">
          <el-option
            v-for="m in PICCOLO_MODEL_LIST"
            :key="m.id"
            :label="t(`instrumentSim.piccolo.models.${m.labelKey}`)"
            :value="m.id"
          />
        </el-select>
      </div>
      <div class="piccolo-sim__row">
        <span class="piccolo-sim__label">{{ t('instrumentSim.piccolo.facing') }}</span>
        <el-radio-group v-model="facing" size="small">
          <el-radio-button value="left">{{ t('instrumentSim.piccolo.facingLeft') }}</el-radio-button>
          <el-radio-button value="right">{{ t('instrumentSim.piccolo.facingRight') }}</el-radio-button>
        </el-radio-group>
      </div>
      <div class="piccolo-sim__row">
        <span class="piccolo-sim__label">{{ t('instrumentSim.piccolo.breathMode') }}</span>
        <el-switch
          v-model="breathMode"
          size="small"
          active-value="mic"
          inactive-value="space"
          :active-text="t('instrumentSim.piccolo.breathMic')"
          :inactive-text="t('instrumentSim.piccolo.breathSpace')"
        />
      </div>
      <p v-if="breathMode === 'mic'" class="piccolo-sim__hint">
        {{ t(`instrumentSim.piccolo.micStatus.${breath.status.value}`) }}
        <el-button
          v-if="breath.status.value === 'error'"
          link
          type="primary"
          size="small"
          @click="startMic"
        >
          {{ t('instrumentSim.piccolo.micRetry') }}
        </el-button>
      </p>
      <p class="piccolo-sim__hint">
        {{
          t('instrumentSim.piccolo.playHint', {
            full: keyMap.full.join(' ').toUpperCase(),
            half: keyMap.half.join(' ').toUpperCase()
          })
        }}
      </p>
      <p class="piccolo-sim__hint">
        {{
          breathMode === 'mic'
            ? t('instrumentSim.piccolo.micHint')
            : t('instrumentSim.piccolo.spaceHint')
        }}
      </p>
    </InstrumentScorePanel>

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.piccolo.guideTitle')" width="520px">
      <p class="piccolo-sim__guide">{{ t('instrumentSim.piccolo.guideBody') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.piccolo-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fffaf0 0%, #f0f6ee 55%, #eef3ff 100%);
  box-sizing: border-box;
}

.piccolo-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(140, 160, 120, 0.28);
  background: rgba(255, 253, 246, 0.92);
  flex-shrink: 0;
}

.piccolo-sim__title {
  margin: 0;
  flex: 1;
  font-size: 17px;
  font-weight: 700;
  color: #4a5a48;
}

.piccolo-sim__top {
  flex-shrink: 0;
  height: 30vh;
  min-height: 180px;
  max-height: 280px;
  padding: 12px 12px 4px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 200px;
  gap: 12px;
  box-sizing: border-box;
}

.piccolo-sim__stage,
.piccolo-sim__note {
  border-radius: 16px;
  min-height: 0;
}

.piccolo-sim__stage {
  padding: 8px 16px;
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255, 255, 255, 0.55), transparent 60%),
    linear-gradient(180deg, #f7f0e8 0%, #ebe4dc 100%);
}

.piccolo-sim__note {
  padding: 12px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  overflow: auto;
  border: 1px solid rgba(140, 160, 120, 0.28);
  background: rgba(255, 255, 255, 0.86);
}

.piccolo-sim__note-title {
  margin: 0;
  font-size: 12px;
  color: #6a7a8a;
}

.piccolo-sim__note-item {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.piccolo-sim__note-item--sounding .piccolo-sim__jianpu,
.piccolo-sim__note-item--sounding .piccolo-sim__name {
  color: #e8590c;
}

.piccolo-sim__meter {
  margin-top: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.piccolo-sim__meter-label {
  font-size: 12px;
  color: #6a7a8a;
}

.piccolo-sim__meter-track {
  position: relative;
  height: 8px;
  border-radius: 4px;
  background: rgba(120, 140, 160, 0.18);
  overflow: hidden;
}

.piccolo-sim__meter-fill {
  height: 100%;
  background: #a0b4c8;
  transition: width 0.05s linear;
}

.piccolo-sim__meter-fill--on {
  background: #e8590c;
}

.piccolo-sim__meter-threshold {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 2px;
  margin-left: -1px;
  background: #5c4a6a;
}

.piccolo-sim__jianpu {
  min-width: 36px;
  font-size: 26px;
  font-weight: 700;
  color: #3a6ea5;
  line-height: 1.3;
}

.piccolo-sim__name {
  font-size: 15px;
  font-weight: 600;
  color: #4a5568;
}

.piccolo-sim__register {
  font-size: 12px;
  color: #8a7a98;
}

.piccolo-sim__note-tip,
.piccolo-sim__note-empty {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.45;
}

.piccolo-sim__row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.piccolo-sim__label {
  flex-shrink: 0;
  width: 72px;
  font-size: 12px;
  color: #6a7a8a;
}

.piccolo-sim__select {
  flex: 1;
  min-width: 0;
}

.piccolo-sim__hint {
  margin: 0;
  font-size: 12px;
  color: #8a7a98;
  line-height: 1.45;
}

.piccolo-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: #4a5568;
  white-space: pre-line;
}
</style>
