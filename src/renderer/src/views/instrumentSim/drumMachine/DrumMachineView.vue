<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { shortcutKey } from '@renderer/utils/shortcutKey'
import { onBeforeRouteLeave } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Delete,
  DocumentAdd,
  FolderOpened,
  VideoPause,
  VideoPlay
} from '@element-plus/icons-vue'
import BackButton from '@renderer/components/BackButton.vue'
import type { DrumBlockSelection, DrumMachineData } from '@renderer/types/drumMachine'
import {
  DRUM_BAR_UNITS,
  DRUM_BEAT_UNITS,
  DRUM_BLOCK_UNIT_OPTIONS,
  DRUM_BPM_MAX,
  DRUM_BPM_MIN,
  DRUM_DEFAULT_TRACK_SOUNDS,
  DRUM_SWING_MAX,
  DRUM_SWING_UNIT_OPTIONS,
  DRUM_TOTAL_BEATS_MAX,
  DRUM_TOTAL_BEATS_MIN,
  DRUM_TRACK_MAX
} from '@renderer/constant/drumMachine'
import {
  clampTotalUnits,
  createDefaultDrumMachineData,
  createTrack,
  fitBlocks,
  regridBlocks,
  setBlockDuration,
  toPlainDrumMachineData
} from '@renderer/utils/drumMachine/pattern'
import { useDrumMachinePlayer } from '@renderer/utils/drumMachine/useDrumMachinePlayer'
import {
  createDrumMachine,
  getDrumMachine,
  updateDrumMachine
} from '@renderer/utils/fileHelper/drumMachineFile'
import DrumTrackGrid from './DrumTrackGrid.vue'
import DrumMachineOpenDialog from './DrumMachineOpenDialog.vue'

defineOptions({ name: 'DrumMachineView' })

const { t } = useI18n()

const data = ref<DrumMachineData>(createDefaultDrumMachineData())
const name = ref('')
const currentId = ref<number | null>(null)
const selected = ref<DrumBlockSelection | null>(null)
const guideVisible = ref(false)
const openVisible = ref(false)
const saving = ref(false)

const player = useDrumMachinePlayer(() => data.value)

function snapshotOf(): string {
  return JSON.stringify({ name: name.value.trim(), data: toPlainDrumMachineData(data.value) })
}

const savedSnapshot = ref(snapshotOf())
const dirty = computed(() => snapshotOf() !== savedSnapshot.value)

function markSaved() {
  savedSnapshot.value = snapshotOf()
}

const totalBeats = computed({
  get: () => Math.round(data.value.pattern.totalUnits / DRUM_BEAT_UNITS),
  set: (beats: number) => {
    const total = clampTotalUnits(Math.round(beats) * DRUM_BEAT_UNITS)
    const pattern = data.value.pattern
    if (total === pattern.totalUnits) return
    pattern.totalUnits = total
    for (const track of pattern.tracks) track.blocks = fitBlocks(track.blocks, total)
    const sel = selected.value
    if (sel && !pattern.tracks[sel.trackIndex]?.blocks[sel.blockIndex]) selected.value = null
  }
})

const barsLabel = computed(() => {
  const total = data.value.pattern.totalUnits
  const bars = Math.floor(total / DRUM_BAR_UNITS)
  const beats = Math.round((total % DRUM_BAR_UNITS) / DRUM_BEAT_UNITS)
  return t('instrumentSim.drumMachine.barsLabel', { bars, beats })
})

const selectedBlock = computed(() => {
  const sel = selected.value
  if (!sel) return null
  return data.value.pattern.tracks[sel.trackIndex]?.blocks[sel.blockIndex] ?? null
})

const selectedDuration = computed({
  get: () => selectedBlock.value?.duration ?? null,
  set: (units: number | null) => {
    const sel = selected.value
    if (!sel || units == null) return
    const track = data.value.pattern.tracks[sel.trackIndex]
    if (!track) return
    track.blocks = setBlockDuration(track.blocks, sel.blockIndex, units, data.value.pattern.totalUnits)
  }
})

/** 整体时值：所有音轨的块时值一致时为该值，否则为 null */
const uniformDuration = computed({
  get: () => {
    let unit: number | null = null
    for (const track of data.value.pattern.tracks) {
      for (const block of track.blocks) {
        if (unit == null) unit = block.duration
        else if (block.duration !== unit) return null
      }
    }
    return unit
  },
  set: (units: number | null) => {
    if (units == null) return
    const pattern = data.value.pattern
    for (const track of pattern.tracks) {
      track.blocks = regridBlocks(track.blocks, units, pattern.totalUnits)
    }
    selected.value = null
  }
})

function unitLabel(units: number): string {
  return `1/${DRUM_BAR_UNITS / units}`
}

watch(
  () => [data.value.bpm, data.value.pattern.totalUnits],
  () => player.retime()
)

function addTrack() {
  const tracks = data.value.pattern.tracks
  if (tracks.length >= DRUM_TRACK_MAX) return
  const used = new Set(tracks.map((tr) => tr.sound))
  const sound = DRUM_DEFAULT_TRACK_SOUNDS.find((s) => !used.has(s)) ?? DRUM_DEFAULT_TRACK_SOUNDS[0]!
  tracks.push(createTrack(sound, data.value.pattern.totalUnits))
}

function removeTrack(index: number) {
  data.value.pattern.tracks.splice(index, 1)
  const sel = selected.value
  if (!sel) return
  if (sel.trackIndex === index) selected.value = null
  else if (sel.trackIndex > index) selected.value = { ...sel, trackIndex: sel.trackIndex - 1 }
}

async function clearAll() {
  try {
    await ElMessageBox.confirm(t('instrumentSim.drumMachine.clearAllConfirm'), t('common.confirm'), {
      type: 'warning'
    })
  } catch {
    return
  }
  for (const track of data.value.pattern.tracks) track.blocks.forEach((b) => (b.active = false))
}

function onPreview(sound: number, volume: number) {
  void player.preview(sound, volume).catch(() => ElMessage.error(t('instrumentSim.drumMachine.toneFailed')))
}

async function togglePlay() {
  try {
    await player.toggle()
  } catch {
    ElMessage.error(t('instrumentSim.drumMachine.toneFailed'))
  }
}

/** 有未保存改动时询问是否丢弃；返回 true 表示可以继续 */
async function confirmDiscard(): Promise<boolean> {
  if (!dirty.value) return true
  try {
    // 由后退（hash 变化）触发的离开守卫里弹框，默认会被 hashchange 立即关掉
    await ElMessageBox.confirm(t('instrumentSim.drumMachine.discardConfirm'), t('common.confirm'), {
      type: 'warning',
      closeOnHashChange: false
    })
    return true
  } catch {
    return false
  }
}

function applyLoaded(nextName: string, nextData: DrumMachineData, id: number | null) {
  player.stop()
  selected.value = null
  data.value = nextData
  name.value = nextName
  currentId.value = id
  markSaved()
}

async function onNew() {
  if (!(await confirmDiscard())) return
  applyLoaded('', createDefaultDrumMachineData(), null)
}

async function onOpenRecord(id: number) {
  if (id !== currentId.value && !(await confirmDiscard())) return
  try {
    const record = await getDrumMachine(id)
    applyLoaded(record.name, record.data, record.id)
    ElMessage.success(t('instrumentSim.drumMachine.loaded', { name: record.name }))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  }
}

function onRecordDeleted(id: number) {
  // 删掉的正是当前鼓机：保留编辑内容，下次保存时新建
  if (id === currentId.value) {
    currentId.value = null
    savedSnapshot.value = ''
  }
}

async function promptName(initial: string): Promise<string | null> {
  try {
    const { value } = await ElMessageBox.prompt(
      t('instrumentSim.drumMachine.namePrompt'),
      t('instrumentSim.drumMachine.saveAs'),
      {
        inputValue: initial || t('instrumentSim.drumMachine.defaultName'),
        inputValidator: (v: string) =>
          (v.trim().length > 0 && v.trim().length <= 100) || t('instrumentSim.drumMachine.nameInvalid')
      }
    )
    return value.trim()
  } catch {
    return null
  }
}

async function persist(saveAs: boolean) {
  if (saving.value) return
  let targetName = name.value.trim()
  if (saveAs || currentId.value == null || !targetName) {
    const input = await promptName(targetName)
    if (!input) return
    targetName = input
  }
  saving.value = true
  try {
    const record =
      !saveAs && currentId.value != null
        ? await updateDrumMachine(currentId.value, targetName, data.value)
        : await createDrumMachine(targetName, data.value)
    currentId.value = record.id
    name.value = record.name
    markSaved()
    ElMessage.success(t('instrumentSim.drumMachine.saved'))
  } catch (err) {
    ElMessage.error(err instanceof Error ? err.message : String(err))
  } finally {
    saving.value = false
  }
}

function isTypingTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement | null
  if (!el) return false
  const tag = el.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable
}

function onKeydown(event: KeyboardEvent) {
  if ((event.ctrlKey || event.metaKey) && shortcutKey(event).toLowerCase() === 's') {
    event.preventDefault()
    void persist(event.shiftKey)
    return
  }
  if (event.code !== 'Space' || isTypingTarget(event.target)) return
  if (openVisible.value || guideVisible.value) return
  event.preventDefault()
  void togglePlay()
}

onBeforeRouteLeave(async () => {
  if (!(await confirmDiscard())) return false
  player.stop()
  return true
})

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  void player.init().catch(() => ElMessage.error(t('instrumentSim.drumMachine.toneFailed')))
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <div class="drum-sim">
    <header class="drum-sim__header">
      <BackButton fallback="/instrument-sim" />
      <h1 class="drum-sim__title">{{ t('instrumentSim.drumMachine.title') }}</h1>
      <el-input
        v-model="name"
        size="small"
        maxlength="100"
        class="drum-sim__name"
        :placeholder="t('instrumentSim.drumMachine.unnamed')"
      />
      <span v-if="dirty" class="drum-sim__dirty">{{ t('instrumentSim.drumMachine.unsaved') }}</span>
      <div class="drum-sim__header-actions">
        <el-button size="small" :icon="DocumentAdd" @click="onNew">
          {{ t('instrumentSim.drumMachine.new') }}
        </el-button>
        <el-button size="small" :icon="FolderOpened" @click="openVisible = true">
          {{ t('instrumentSim.drumMachine.open') }}
        </el-button>
        <el-button size="small" type="primary" :loading="saving" @click="persist(false)">
          {{ t('common.save') }}
        </el-button>
        <el-button size="small" :disabled="saving" @click="persist(true)">
          {{ t('instrumentSim.drumMachine.saveAs') }}
        </el-button>
        <el-button size="small" @click="guideVisible = true">{{ t('instrumentSim.guide') }}</el-button>
      </div>
    </header>

    <section class="drum-sim__machine">
      <div class="drum-sim__transport">
        <button
          type="button"
          class="drum-sim__play"
          :class="{ 'is-playing': player.playing.value }"
          :disabled="player.loading.value"
          :title="t('instrumentSim.drumMachine.playHint')"
          @click="togglePlay"
        >
          <el-icon :size="26">
            <VideoPause v-if="player.playing.value" />
            <VideoPlay v-else />
          </el-icon>
        </button>

        <div class="drum-sim__field">
          <span class="drum-sim__label">BPM</span>
          <el-input-number
            v-model="data.bpm"
            :min="DRUM_BPM_MIN"
            :max="DRUM_BPM_MAX"
            :step="1"
            size="small"
            controls-position="right"
            class="drum-sim__number"
          />
        </div>

        <div class="drum-sim__field drum-sim__field--slider">
          <span class="drum-sim__label">{{ t('instrumentSim.drumMachine.volume') }}</span>
          <el-slider
            v-model="data.volume"
            :min="0"
            :max="1"
            :step="0.01"
            size="small"
            :format-tooltip="(v: number) => `${Math.round(v * 100)}%`"
          />
        </div>

        <div class="drum-sim__field drum-sim__field--slider">
          <el-tooltip :content="t('instrumentSim.drumMachine.swingHint')" placement="bottom">
            <span class="drum-sim__label drum-sim__label--help">
              {{ t('instrumentSim.drumMachine.swing') }}
            </span>
          </el-tooltip>
          <el-slider
            v-model="data.swing"
            :min="0"
            :max="DRUM_SWING_MAX"
            :step="0.01"
            size="small"
            :format-tooltip="(v: number) => `${Math.round(v * 100)}%`"
          />
          <el-radio-group v-model="data.swingUnit" size="small" class="drum-sim__swing-unit">
            <el-radio-button v-for="unit in DRUM_SWING_UNIT_OPTIONS" :key="unit" :value="unit">
              {{ unitLabel(unit) }}
            </el-radio-button>
          </el-radio-group>
        </div>

        <div class="drum-sim__field">
          <span class="drum-sim__label">{{ t('instrumentSim.drumMachine.totalBeats') }}</span>
          <el-input-number
            v-model="totalBeats"
            :min="DRUM_TOTAL_BEATS_MIN"
            :max="DRUM_TOTAL_BEATS_MAX"
            :step="1"
            size="small"
            controls-position="right"
            class="drum-sim__number"
          />
          <span class="drum-sim__sub">{{ barsLabel }}</span>
        </div>

        <el-button size="small" :icon="Delete" class="drum-sim__clear" @click="clearAll">
          {{ t('instrumentSim.drumMachine.clearAll') }}
        </el-button>
      </div>

      <div class="drum-sim__block-bar">
        <span class="drum-sim__label">{{ t('instrumentSim.drumMachine.uniformDuration') }}</span>
        <el-radio-group v-model="uniformDuration" size="small">
          <el-radio-button v-for="unit in DRUM_BLOCK_UNIT_OPTIONS" :key="unit" :value="unit">
            {{ unitLabel(unit) }}
          </el-radio-button>
        </el-radio-group>
        <span v-if="uniformDuration == null" class="drum-sim__sub">
          {{ t('instrumentSim.drumMachine.uniformMixed') }}
        </span>

        <span class="drum-sim__divider" />

        <span class="drum-sim__label">{{ t('instrumentSim.drumMachine.blockDuration') }}</span>
        <el-radio-group v-model="selectedDuration" size="small" :disabled="!selectedBlock">
          <el-radio-button v-for="unit in DRUM_BLOCK_UNIT_OPTIONS" :key="unit" :value="unit">
            {{ unitLabel(unit) }}
          </el-radio-button>
        </el-radio-group>
        <span class="drum-sim__sub">
          {{
            selectedBlock
              ? t('instrumentSim.drumMachine.blockSelected', {
                  duration: (selectedBlock.duration / DRUM_BEAT_UNITS).toFixed(3).replace(/\.?0+$/, '')
                })
              : t('instrumentSim.drumMachine.blockNone')
          }}
        </span>
        <span class="drum-sim__hint">{{ t('instrumentSim.drumMachine.mouseHint') }}</span>
      </div>

      <div class="drum-sim__grid">
        <DrumTrackGrid
          v-model:selected="selected"
          :pattern="data.pattern"
          :position-units="player.positionUnits.value"
          :playing="player.playing.value"
          @preview="onPreview"
          @add-track="addTrack"
          @remove-track="removeTrack"
        />
      </div>
    </section>

    <DrumMachineOpenDialog
      v-model="openVisible"
      :current-id="currentId"
      @open="onOpenRecord"
      @deleted="onRecordDeleted"
    />

    <el-dialog v-model="guideVisible" :title="t('instrumentSim.drumMachine.guideTitle')" width="560px">
      <p class="drum-sim__guide">{{ t('instrumentSim.drumMachine.guideBody') }}</p>
    </el-dialog>
  </div>
</template>

<style scoped>
.drum-sim {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(160deg, #fff8f2 0%, #eef5ff 55%, #f3ebff 100%);
  box-sizing: border-box;
}

.drum-sim__header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid rgba(120, 160, 200, 0.28);
  background: rgba(255, 252, 248, 0.92);
  flex-shrink: 0;
}

.drum-sim__title {
  margin: 0;
  font-size: 17px;
  font-weight: 700;
  color: #4a5568;
  white-space: nowrap;
}

.drum-sim__name {
  width: 220px;
}

.drum-sim__dirty {
  font-size: 12px;
  color: #d97706;
  white-space: nowrap;
}

.drum-sim__header-actions {
  margin-left: auto;
  display: flex;
  align-items: center;
  gap: 4px;
}

.drum-sim__machine {
  flex: 1;
  min-height: 0;
  margin: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  border-radius: 18px;
  background: #221f2e;
  box-shadow: 0 12px 32px rgba(40, 30, 70, 0.28);
  color: #d8d2ea;
}

.drum-sim__transport {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 18px;
}

.drum-sim__play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border: none;
  border-radius: 50%;
  background: linear-gradient(145deg, #34d399, #059669);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(16, 185, 129, 0.45);
  transition: transform 0.1s ease;
}

.drum-sim__play:hover:not(:disabled) {
  transform: scale(1.06);
}

.drum-sim__play:disabled {
  opacity: 0.5;
  cursor: wait;
}

.drum-sim__play.is-playing {
  background: linear-gradient(145deg, #fb7185, #e11d48);
  box-shadow: 0 4px 14px rgba(225, 29, 72, 0.45);
}

.drum-sim__field {
  display: flex;
  align-items: center;
  gap: 8px;
}

.drum-sim__field--slider {
  width: 200px;
}

.drum-sim__field--slider:has(.drum-sim__swing-unit) {
  width: 420px;
}

.drum-sim__swing-unit {
  flex-shrink: 0;
}

.drum-sim__field--slider :deep(.el-slider) {
  flex: 1;
}

.drum-sim__label {
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 600;
  color: #a79fc2;
}

.drum-sim__label--help {
  cursor: help;
  border-bottom: 1px dashed currentColor;
}

.drum-sim__number {
  width: 96px;
}

.drum-sim__sub {
  font-size: 12px;
  color: #8a82a6;
  white-space: nowrap;
}

.drum-sim__clear {
  margin-left: auto;
}

.drum-sim__block-bar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 10px;
  background: #1b1925;
}

.drum-sim__divider {
  width: 1px;
  height: 20px;
  margin: 0 6px;
  background: #3a3550;
}

.drum-sim__hint {
  margin-left: auto;
  font-size: 12px;
  color: #6f6890;
}

.drum-sim__grid {
  flex: 1;
  min-height: 0;
}

.drum-sim__guide {
  margin: 0;
  font-size: 14px;
  line-height: 1.75;
  color: #4a5568;
  white-space: pre-line;
}
</style>
