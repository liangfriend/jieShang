<script setup lang="ts">
import musicScoreVue, {
  TIME_SIGNATURE_TYPES_ORDERED,
  TimeSignatureTypeEnum,
  getMeasureNoteList,
  getMeasureSlots,
  slotSymbol
} from '@deciphony/renderer'
import type { MusicScore, Skin, VDom } from '@deciphony/renderer'
import {
  createMidiRecorder,
  createPianoScoreWriter,
  type MidiRecordAppendEvent,
  type MidiRecorder
} from '@deciphony/extensions/dr-midi-record'
import { ElMessage } from 'element-plus'
import { computed, nextTick, onBeforeUnmount, ref, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useMidiStore } from '@renderer/store/midi.store'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { toBeatUnitBpm } from '@renderer/constant/play'
import { timeSignatureTypeToPlayer } from '@renderer/utils/scoreTimeSignature'
import { resolveScoreKeySignature } from '@renderer/utils/scoreNotationTransfer'
import { resolveSingleLineModeScoreHeight } from '@renderer/utils/singleLineModeScoreLayout'
import { readScoreSlotHeights } from '@renderer/utils/scoreSpacingDefaults'
import { resolveTimeSignatureLabel } from '@renderer/i18n/helpers'

defineOptions({ name: 'PianoRecordDrawer' })

/** 实时预览：一行高音 + 低音，小节数给足，录制中不再扩行 */
const PREVIEW_MEASURE_COUNT = 1000
const PREVIEW_MEASURE_WIDTH = 200
/** 整行 1000 小节每次重排要几百毫秒，只渲染当前小节附近的一段 */
const VIEW_MEASURE_COUNT = 32
/** 当前小节离窗口右端不足这么多小节时整体右移窗口 */
const VIEW_SHIFT_MARGIN = 10
/** 右移后当前小节前保留的小节数 */
const VIEW_LEAD = 8
/** 同步到编辑区的结果每行小节数 */
const RESULT_MEASURES_PER_LINE = 4
const DEFAULT_BPM = 90

/** 录制容错参数，与 dr-midi-record 默认一致；minRest 单位 unit256（四分 = 64，16 分网格下默认 2 格 = 八分） */
type RecordTolerance = { beatSnap: number; minRest: number; latencyMs: number }
const DEFAULT_TOLERANCE: RecordTolerance = { beatSnap: 0.2, minRest: 32, latencyMs: 0 }
const TOLERANCE_STORAGE_KEY = 'jieShang.pianoRecord.tolerance'
const MIN_REST_OPTIONS = [0, 16, 32, 64] as const
const BEAT_SNAP_MAX = 0.5
const LATENCY_MS_MAX = 300

function loadTolerance(): RecordTolerance {
  try {
    const raw = JSON.parse(localStorage.getItem(TOLERANCE_STORAGE_KEY) ?? '{}') as Partial<RecordTolerance>
    const num = (value: unknown, fallback: number, min: number, max: number) =>
      typeof value === 'number' && Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback
    return {
      beatSnap: num(raw.beatSnap, DEFAULT_TOLERANCE.beatSnap, 0, BEAT_SNAP_MAX),
      minRest: MIN_REST_OPTIONS.includes(raw.minRest as never) ? raw.minRest! : DEFAULT_TOLERANCE.minRest,
      latencyMs: num(raw.latencyMs, DEFAULT_TOLERANCE.latencyMs, 0, LATENCY_MS_MAX)
    }
  } catch {
    return { ...DEFAULT_TOLERANCE }
  }
}

type Phase = 'idle' | 'countIn' | 'recording' | 'done'

const props = defineProps<{
  musicScore: MusicScore
  skin?: Skin
  skinName?: string
}>()

const emit = defineEmits<{
  (e: 'sync', score: MusicScore): void
}>()

const visible = defineModel<boolean>({ default: false })

const { t } = useI18n()
const midiStore = useMidiStore()
const metronomeStore = useMetronomeStore()

const phase = ref<Phase>('idle')
const busy = computed(() => phase.value === 'countIn' || phase.value === 'recording')
const metronomeDuringRecord = ref(true)
/** 0–100 */
const metronomeVolume = ref(80)
const tolerance = ref<RecordTolerance>(loadTolerance())
const bpm = ref(DEFAULT_BPM)
const timeSignature = ref<TimeSignatureTypeEnum>(TimeSignatureTypeEnum['4_4'])
const noteGroupCount = ref(0)
const preview = shallowRef<MusicScore | null>(null)
const previewVersion = ref(0)
const result = shallowRef<MusicScore | null>(null)
const scrollRef = ref<HTMLElement | null>(null)
const viewStart = ref(0)

let recorder: MidiRecorder | null = null
let vDomList: VDom[] = []
let followRafId: number | null = null
let centeredMeasureNo = -1
/** 窗口右移后，等新布局出来再把这个小节放回原来的屏幕位置 */
let pendingAnchor: { measureNo: number; offset: number } | null = null
/** 预备拍中途取消 / 关闭抽屉后，作废尚未结束的那次预备拍 */
let countInEpoch = 0

/** 录制器原地改 preview，每次重新切出窗口让渲染器重新布局 */
const previewView = computed(() => {
  void previewVersion.value
  return preview.value ? buildWindowScore(preview.value, viewStart.value) : null
})

const timeSignatureOptions = computed(() =>
  TIME_SIGNATURE_TYPES_ORDERED.map((value) => ({ value, label: resolveTimeSignatureLabel(value) }))
)
const minRestOptions = computed(() =>
  MIN_REST_OPTIONS.map((value) => ({ value, label: t(`editor.pianoRecord.minRestOptions.${value}`) }))
)
/** 当前速度下，拍点吸附能容忍的晚按毫秒数 */
const beatSnapMs = computed(() => {
  const { beatUnit } = timeSignatureTypeToPlayer(timeSignature.value)
  const beatMs = 60000 / toBeatUnitBpm(bpm.value, beatUnit)
  return Math.round(tolerance.value.beatSnap * beatMs)
})
const deviceLabel = computed(() => {
  const names = midiStore.inputs
    .filter((device) => device.state === 'connected')
    .map((device) => device.name?.trim() || t('midi.unknownDevice'))
  return names.length ? names.join('、') : t('editor.pianoRecord.noDevice')
})
const hint = computed(() => {
  if (phase.value === 'countIn') return t('editor.pianoRecord.countInHint')
  if (phase.value === 'recording') return t('editor.pianoRecord.recordingHint')
  if (phase.value === 'done') {
    return noteGroupCount.value
      ? t('editor.pianoRecord.doneHint', { count: noteGroupCount.value })
      : t('editor.pianoRecord.emptyHint')
  }
  return t('editor.pianoRecord.idleHint')
})

function resolveTimeSignature(score: MusicScore): TimeSignatureTypeEnum {
  if (score.timeSignature) return score.timeSignature
  for (const grandStaff of score.grandStaffs ?? []) {
    for (const staff of grandStaff.staves ?? []) {
      for (const measure of staff.measures ?? []) {
        const type = measure.timeSignature_f?.type
        if (type) return type
      }
    }
  }
  return TimeSignatureTypeEnum['4_4']
}

function createPreviewScore(): MusicScore {
  const { score } = createPianoScoreWriter({
    timeSignature: timeSignature.value,
    keySignature: resolveScoreKeySignature(props.musicScore),
    bpm: bpm.value,
    measuresPerLine: PREVIEW_MEASURE_COUNT,
    width: PREVIEW_MEASURE_COUNT * PREVIEW_MEASURE_WIDTH
  })
  score.topSpaceHeight = 0
  for (const grandStaff of score.grandStaffs) grandStaff.uSpace = 0
  score.height = resolveSingleLineModeScoreHeight(2)
  return score
}

/** 窗口外起点的小节补上谱号调号；两端不都在窗口内的延音线不画 */
function buildWindowScore(score: MusicScore, start: number): MusicScore {
  const grandStaff = score.grandStaffs[0]!
  const end = Math.min(start + VIEW_MEASURE_COUNT, PREVIEW_MEASURE_COUNT)
  const noteIds = new Set<string>()
  const staves = grandStaff.staves.map((staff) => {
    const head = staff.measures[0]!
    const measures = staff.measures
      .slice(start, end)
      .map((measure, index) =>
        index === 0 && start > 0
          ? { ...measure, clef_f: head.clef_f, keySignature_f: head.keySignature_f }
          : measure
      )
    for (const measure of measures) {
      for (const slot of getMeasureSlots(measure)) {
        const symbol = slotSymbol(slot)
        if ('notesInfo' in symbol) for (const info of symbol.notesInfo) noteIds.add(info.id)
      }
    }
    return { ...staff, measures }
  })
  return {
    ...score,
    width: (end - start) * PREVIEW_MEASURE_WIDTH,
    grandStaffs: [{ ...grandStaff, staves }],
    affiliatedSymbols: score.affiliatedSymbols.filter((symbol) => {
      const { startId, endId } = symbol as { startId?: string; endId?: string }
      return startId != null && endId != null && noteIds.has(startId) && noteIds.has(endId)
    })
  }
}

/** 录制器每落笔一段，就把同一批 slot / 延音线挂到预览谱的对应小节上 */
function handleAppend(event: MidiRecordAppendEvent) {
  const score = preview.value
  if (!score) return
  const staff = score.grandStaffs[0]?.staves[event.staffIndex]
  if (!staff) return
  for (const piece of event.pieces) {
    const measure = staff.measures[piece.measureNo]
    if (measure) getMeasureNoteList(measure).push(piece.slot)
  }
  if (event.tieIds.length) {
    const ids = new Set(event.tieIds)
    score.affiliatedSymbols.push(
      ...event.musicScore.affiliatedSymbols.filter((symbol) => ids.has(symbol.id))
    )
  }
  if (event.kind === 'note') noteGroupCount.value += 1
  previewVersion.value += 1
}

function handleMidiMessage(event: MIDIMessageEvent) {
  if (!recorder || !busy.value) return
  const data = event.data
  if (!data || data.length < 2) return
  const status = data[0]! & 0xf0
  const midi = data[1]!
  const velocity = data[2] ?? 0
  const time = event.timeStamp || undefined
  if (status === 0x90 && velocity > 0) recorder.noteOn(midi, velocity, time)
  else if (status === 0x80 || status === 0x90) recorder.noteOff(midi, time)
}

function handleRenderMusicScore(list: VDom[]) {
  vDomList = list
  if (pendingAnchor) void nextTick(restoreAnchor)
}

/** 小节在滚动内容里的左端与宽度 */
function measureLayout(measureNo: number): { left: number; width: number } | null {
  const container = scrollRef.value
  const measure = preview.value?.grandStaffs[0]?.staves[0]?.measures[measureNo]
  const svg = container?.querySelector('svg')
  if (!container || !measure || !svg) return null
  const node = vDomList.find((item) => item.tag === 'measure' && item.targetId === measure.id)
  if (!node) return null
  const svgLeft =
    svg.getBoundingClientRect().left - container.getBoundingClientRect().left + container.scrollLeft
  return { left: svgLeft + node.x, width: node.w }
}

function centerMeasure(measureNo: number): boolean {
  const container = scrollRef.value
  const layout = measureLayout(measureNo)
  if (!container || !layout) return false
  container.scrollTo({
    left: layout.left + layout.width / 2 - container.clientWidth / 2,
    behavior: 'smooth'
  })
  return true
}

function shiftView(measureNo: number) {
  const container = scrollRef.value
  const anchorLayout = centeredMeasureNo >= 0 ? measureLayout(centeredMeasureNo) : null
  pendingAnchor =
    container && anchorLayout
      ? { measureNo: centeredMeasureNo, offset: anchorLayout.left - container.scrollLeft }
      : { measureNo: -1, offset: 0 }
  viewStart.value = Math.max(0, measureNo - VIEW_LEAD)
  void nextTick(() => requestAnimationFrame(() => pendingAnchor && restoreAnchor()))
}

function restoreAnchor() {
  const anchor = pendingAnchor
  const container = scrollRef.value
  pendingAnchor = null
  if (!anchor || !container) return
  const layout = anchor.measureNo >= 0 ? measureLayout(anchor.measureNo) : null
  container.scrollLeft = layout ? layout.left - anchor.offset : 0
}

function followCurrentMeasure() {
  followRafId = null
  if (!recorder || !busy.value) return
  const { measureNo } = recorder.getPosition()
  if (!pendingAnchor && measureNo != null && measureNo !== centeredMeasureNo) {
    if (measureNo >= viewStart.value + VIEW_MEASURE_COUNT - VIEW_SHIFT_MARGIN) shiftView(measureNo)
    else if (centerMeasure(measureNo)) centeredMeasureNo = measureNo
  }
  followRafId = requestAnimationFrame(followCurrentMeasure)
}

function stopFollow() {
  if (followRafId != null) cancelAnimationFrame(followRafId)
  followRafId = null
}

function disposeRecorder() {
  stopFollow()
  recorder?.dispose()
  recorder = null
}

/** 节拍器跟录制的拍号与速度；速度按四分音符换算到拍号分母 */
function syncMetronome() {
  const { timeSignature: playerTimeSignature, beatUnit } = timeSignatureTypeToPlayer(
    timeSignature.value
  )
  metronomeStore.syncScore({
    bpm: toBeatUnitBpm(bpm.value, beatUnit),
    beatUnit,
    timeSignature: playerTimeSignature
  })
  metronomeStore.setVolume(metronomeVolume.value / 100)
}

function stopMetronome() {
  countInEpoch += 1
  metronomeStore.stop()
}

/**
 * 录制器与预备拍同时启动，startDelayMs = 一小节预备拍时长，预备拍结束即第 1 小节起点；
 * 预备拍末尾稍早按下的音由录制器记在第 1 拍
 */
async function startRecording() {
  if (!midiStore.hasConnectedInput) {
    ElMessage.warning(t('editor.pianoRecord.needMidi'))
    return
  }
  disposeRecorder()
  result.value = null
  noteGroupCount.value = 0
  centeredMeasureNo = -1
  pendingAnchor = null
  viewStart.value = 0
  preview.value = createPreviewScore()
  previewVersion.value += 1
  scrollRef.value?.scrollTo({ left: 0 })

  phase.value = 'countIn'
  const epoch = ++countInEpoch
  syncMetronome()
  // 节拍器首次加载音色较慢，就绪后再同时起录制器和预备拍，两者起点才对得上
  await metronomeStore.waitReady()
  if (epoch !== countInEpoch || phase.value !== 'countIn') return

  recorder = createMidiRecorder({
    bpm: bpm.value,
    timeSignature: timeSignature.value,
    keySignature: resolveScoreKeySignature(props.musicScore),
    measuresPerLine: RESULT_MEASURES_PER_LINE,
    width: props.musicScore.width,
    title: props.musicScore.title,
    beatSnap: tolerance.value.beatSnap,
    minRest: tolerance.value.minRest,
    latencyMs: tolerance.value.latencyMs,
    startDelayMs: metronomeStore.getCountInDurationMs(),
    onAppend: handleAppend
  })
  recorder.start()
  followRafId = requestAnimationFrame(followCurrentMeasure)
  await metronomeStore.playCountIn()
  if (epoch !== countInEpoch || phase.value !== 'countIn') return

  if (metronomeDuringRecord.value) void metronomeStore.startLoop()
  phase.value = 'recording'
}

function cancelCountIn() {
  stopMetronome()
  disposeRecorder()
  phase.value = 'idle'
}

/** 编辑区沿用当前曲谱的 id 与 data（插槽高度等），高度补上标题区与每行歌词区 */
function buildResultScore(recorded: MusicScore): MusicScore {
  const current = props.musicScore
  const next = JSON.parse(JSON.stringify(recorded)) as MusicScore
  next.id = current.id
  ;(next as MusicScore & { data?: unknown }).data = JSON.parse(
    JSON.stringify((current as MusicScore & { data?: unknown }).data ?? {})
  )
  const { tSlotH, gdSlotH } = readScoreSlotHeights(current)
  next.height += tSlotH + next.grandStaffs.length * gdSlotH
  return next
}

function stopRecording() {
  if (!recorder) return
  stopMetronome()
  stopFollow()
  const recorded = recorder.stop()
  result.value = noteGroupCount.value ? buildResultScore(recorded) : null
  phase.value = 'done'
  previewVersion.value += 1
}

/** 换拍号后旧录音的小节划分已不对，清掉结果并换上新拍号的空预览 */
function handleTimeSignatureChange(value: TimeSignatureTypeEnum) {
  if (busy.value || value === timeSignature.value) return
  timeSignature.value = value
  disposeRecorder()
  phase.value = 'idle'
  result.value = null
  noteGroupCount.value = 0
  viewStart.value = 0
  centeredMeasureNo = -1
  pendingAnchor = null
  preview.value = createPreviewScore()
  previewVersion.value += 1
  scrollRef.value?.scrollTo({ left: 0 })
}

function handleSync() {
  if (result.value) emit('sync', result.value)
}

function reset() {
  stopMetronome()
  disposeRecorder()
  phase.value = 'idle'
  result.value = null
  noteGroupCount.value = 0
  preview.value = null
  viewStart.value = 0
  pendingAnchor = null
  centeredMeasureNo = -1
  vDomList = []
}

watch(visible, (open) => {
  if (open) {
    reset()
    bpm.value = props.musicScore.bpm || DEFAULT_BPM
    timeSignature.value = resolveTimeSignature(props.musicScore)
    preview.value = createPreviewScore()
    midiStore.addMessageListener(handleMidiMessage)
  } else {
    midiStore.removeMessageListener(handleMidiMessage)
    reset()
  }
})

watch(metronomeVolume, (value) => metronomeStore.setVolume(value / 100))

watch(
  tolerance,
  (value) => localStorage.setItem(TOLERANCE_STORAGE_KEY, JSON.stringify(value)),
  { deep: true }
)

function resetTolerance() {
  tolerance.value = { ...DEFAULT_TOLERANCE }
}

onBeforeUnmount(() => {
  midiStore.removeMessageListener(handleMidiMessage)
  stopMetronome()
  disposeRecorder()
})
</script>

<template>
  <el-drawer
    v-model="visible"
    direction="btt"
    size="460px"
    class="piano-record-drawer"
    :with-header="false"
  >
    <div class="piano-record">
      <header class="piano-record__header">
        <h2 class="piano-record__title">{{ t('editor.pianoRecord.title') }}</h2>
        <div class="piano-record__meta">
          <label class="piano-record__field">
            <span>{{ t('editor.pianoRecord.bpm') }}</span>
            <el-input-number
              v-model="bpm"
              :min="30"
              :max="240"
              :step="5"
              size="small"
              :disabled="busy"
            />
          </label>
          <label class="piano-record__field">
            <span>{{ t('editor.pianoRecord.timeSignature') }}</span>
            <el-select
              :model-value="timeSignature"
              size="small"
              class="piano-record__time-select"
              :disabled="busy"
              @update:model-value="handleTimeSignatureChange"
            >
              <el-option
                v-for="item in timeSignatureOptions"
                :key="item.value"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </label>
          <label class="piano-record__field">
            <span>{{ t('editor.pianoRecord.metronomeDuringRecord') }}</span>
            <el-switch v-model="metronomeDuringRecord" size="small" :disabled="busy" />
          </label>
          <div class="piano-record__field piano-record__field--volume">
            <span>{{ t('editor.pianoRecord.metronomeVolume') }}</span>
            <el-slider v-model="metronomeVolume" :min="0" :max="100" size="small" />
          </div>
          <el-popover
            placement="bottom"
            :width="340"
            trigger="click"
            popper-class="piano-record-tolerance-popper"
            :disabled="busy"
          >
            <template #reference>
              <button type="button" class="piano-record__btn piano-record__btn--small" :disabled="busy">
                {{ t('editor.pianoRecord.tolerance') }}
              </button>
            </template>
            <div class="piano-record-tolerance">
              <div class="piano-record-tolerance__row">
                <span class="piano-record-tolerance__label">{{ t('editor.pianoRecord.beatSnap') }}</span>
                <el-input-number
                  v-model="tolerance.beatSnap"
                  :min="0"
                  :max="BEAT_SNAP_MAX"
                  :step="0.05"
                  :precision="2"
                  :value-on-clear="0"
                  size="small"
                  controls-position="right"
                />
              </div>
              <p class="piano-record-tolerance__hint">
                {{ t('editor.pianoRecord.beatSnapHint', { ms: beatSnapMs }) }}
              </p>
              <div class="piano-record-tolerance__row">
                <span class="piano-record-tolerance__label">{{ t('editor.pianoRecord.minRest') }}</span>
                <el-select v-model="tolerance.minRest" size="small" class="piano-record-tolerance__select">
                  <el-option
                    v-for="item in minRestOptions"
                    :key="item.value"
                    :label="item.label"
                    :value="item.value"
                  />
                </el-select>
              </div>
              <p class="piano-record-tolerance__hint">{{ t('editor.pianoRecord.minRestHint') }}</p>
              <div class="piano-record-tolerance__row">
                <span class="piano-record-tolerance__label">{{ t('editor.pianoRecord.latencyMs') }}</span>
                <el-input-number
                  v-model="tolerance.latencyMs"
                  :min="0"
                  :max="LATENCY_MS_MAX"
                  :step="10"
                  :value-on-clear="0"
                  size="small"
                  controls-position="right"
                />
              </div>
              <p class="piano-record-tolerance__hint">{{ t('editor.pianoRecord.latencyMsHint') }}</p>
              <div class="piano-record-tolerance__footer">
                <button type="button" class="piano-record-tolerance__reset" @click="resetTolerance">
                  {{ t('editor.pianoRecord.toleranceReset') }}
                </button>
              </div>
            </div>
          </el-popover>
          <span class="piano-record__field piano-record__field--device">
            <span>{{ t('editor.pianoRecord.device') }}</span>
            <strong :class="{ 'is-missing': !midiStore.hasConnectedInput }">{{ deviceLabel }}</strong>
          </span>
        </div>
        <div class="piano-record__actions">
          <button
            v-if="!busy"
            type="button"
            class="piano-record__btn piano-record__btn--record"
            @click="startRecording"
          >
            {{ phase === 'done' ? t('editor.pianoRecord.restart') : t('editor.pianoRecord.start') }}
          </button>
          <button
            v-else-if="phase === 'countIn'"
            type="button"
            class="piano-record__btn"
            @click="cancelCountIn"
          >
            {{ t('common.cancel') }}
          </button>
          <button
            v-else
            type="button"
            class="piano-record__btn piano-record__btn--stop"
            @click="stopRecording"
          >
            {{ t('editor.pianoRecord.stop') }}
          </button>
          <button
            type="button"
            class="piano-record__btn piano-record__btn--primary"
            :disabled="!result"
            @click="handleSync"
          >
            {{ t('editor.pianoRecord.syncToScore') }}
          </button>
          <button
            type="button"
            class="piano-record__close"
            :aria-label="t('common.back')"
            @click="visible = false"
          >
            ×
          </button>
        </div>
      </header>

      <p
        class="piano-record__hint"
        :class="{ 'is-recording': phase === 'recording', 'is-count-in': phase === 'countIn' }"
      >
        <span v-if="busy" class="piano-record__dot" />
        {{ hint }}
      </p>

      <div ref="scrollRef" class="piano-record__paper">
        <musicScoreVue
          v-if="previewView && skin"
          :key="skinName"
          :data="previewView"
          :skin="skin"
          :skin-name="skinName"
          @renderMusicScore="handleRenderMusicScore"
        />
      </div>
    </div>
  </el-drawer>
</template>

<style scoped>
.piano-record {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: 100%;
  min-height: 0;
  box-sizing: border-box;
}

.piano-record__header {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px 18px;
  flex-shrink: 0;
}

.piano-record__title {
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: #5c4a6a;
}

.piano-record__meta {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px 16px;
  flex: 1 1 auto;
}

.piano-record__field {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #7a6a88;
}

.piano-record__field strong {
  color: #5c4a6a;
}

.piano-record__field strong.is-missing {
  color: #d9534f;
}

.piano-record__time-select {
  width: 120px;
}

.piano-record__field--volume .el-slider {
  width: 110px;
}

.piano-record__hint.is-count-in {
  color: #e08a1e;
  font-weight: 700;
}

.piano-record__hint.is-count-in .piano-record__dot {
  background: #e08a1e;
}

.piano-record__actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.piano-record__btn {
  min-height: 32px;
  padding: 0 16px;
  border: 1px solid rgba(255, 184, 208, 0.6);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
}

.piano-record__btn:hover:not(:disabled) {
  border-color: #ff8fb8;
  background: rgba(255, 214, 232, 0.85);
}

.piano-record__btn--record {
  border-color: rgba(255, 120, 150, 0.7);
  color: #e0446f;
}

.piano-record__btn--stop {
  border: none;
  color: #fff;
  background: #e0446f;
}

.piano-record__btn--stop:hover:not(:disabled) {
  background: #d23a63;
}

.piano-record__btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
}

.piano-record__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  filter: brightness(1.05);
}

.piano-record__btn--small {
  min-height: 26px;
  padding: 0 12px;
  font-size: 12px;
}

.piano-record__btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.piano-record__close {
  width: 32px;
  height: 32px;
  margin-left: 4px;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  line-height: 1;
  color: #7a6a88;
  background: transparent;
  cursor: pointer;
}

.piano-record__close:hover {
  background: rgba(255, 214, 232, 0.7);
}

.piano-record__hint {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 13px;
  line-height: 1.6;
  color: #8a7898;
}

.piano-record__hint.is-recording {
  color: #e0446f;
  font-weight: 700;
}

.piano-record__dot {
  flex-shrink: 0;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #e0446f;
  animation: piano-record-blink 1s ease-in-out infinite;
}

@keyframes piano-record-blink {
  50% {
    opacity: 0.25;
  }
}

.piano-record__paper {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  min-height: 0;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 16px;
  border-radius: 14px;
  background: #fff;
  box-shadow: inset 0 0 0 1px rgba(201, 184, 255, 0.45);
}

.piano-record__paper > :deep(svg) {
  flex-shrink: 0;
}
</style>

<!-- drawer 默认 teleport 到 body，scoped 打不到 -->
<style>
.piano-record-drawer.el-drawer {
  border-radius: 24px 24px 0 0;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.piano-record-drawer .el-drawer__body {
  display: flex;
  flex-direction: column;
  min-height: 0;
  padding: 18px 22px;
  overflow: hidden;
  box-sizing: border-box;
}

.piano-record-drawer .piano-record {
  flex: 1 1 auto;
}

.piano-record-tolerance-popper.el-popover {
  border-radius: 16px;
  padding: 14px 16px;
}

.piano-record-tolerance__row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.piano-record-tolerance__label {
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
}

.piano-record-tolerance__row .el-input-number,
.piano-record-tolerance__select {
  width: 130px;
}

.piano-record-tolerance__hint {
  margin: 4px 0 12px;
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.piano-record-tolerance__footer {
  display: flex;
  justify-content: flex-end;
}

.piano-record-tolerance__reset {
  padding: 4px 12px;
  border: 1px solid rgba(255, 184, 208, 0.6);
  border-radius: 999px;
  font-size: 12px;
  color: #8a5a72;
  background: #fff;
  cursor: pointer;
}

.piano-record-tolerance__reset:hover {
  background: rgba(255, 214, 232, 0.6);
}
</style>
