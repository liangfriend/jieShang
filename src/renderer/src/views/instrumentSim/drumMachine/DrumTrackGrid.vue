<script lang="ts" setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { ArrowDown, Delete, Plus, VideoPlay } from '@element-plus/icons-vue'
import type { DrumBlockSelection, DrumPattern, DrumTrack } from '@renderer/types/drumMachine'
import {
  DRUM_BAR_UNITS,
  DRUM_BEAT_UNITS,
  DRUM_BLOCK_UNIT_OPTIONS,
  DRUM_SOUND_CATEGORIES,
  DRUM_SOUND_LIST,
  DRUM_TRACK_COLORS,
  DRUM_TRACK_MAX,
  drumSoundLabel
} from '@renderer/constant/drumMachine'
import { blockStarts, isTrackAudible, regridBlocks } from '@renderer/utils/drumMachine/pattern'

const props = defineProps<{
  pattern: DrumPattern
  /** 播放位置（Unit256），未播放为 -1 */
  positionUnits: number
  playing: boolean
  selected: DrumBlockSelection | null
}>()

const emit = defineEmits<{
  (e: 'update:selected', value: DrumBlockSelection | null): void
  (e: 'preview', sound: number, volume: number): void
  (e: 'add-track'): void
  (e: 'remove-track', index: number): void
}>()

const { t, locale } = useI18n()

const LEFT_WIDTH = 340
/** 音轨区铺满容器宽度；总时值过长时不低于此密度（十六分块 = 8px），超出则横向滚动 */
const MIN_PX_PER_UNIT = 0.5

const rootRef = ref<HTMLElement | null>(null)
const viewportWidth = ref(0)
let resizeObserver: ResizeObserver | null = null

const soundGroups = computed(() =>
  DRUM_SOUND_CATEGORIES.map((category) => ({
    category,
    options: DRUM_SOUND_LIST.filter((s) => s.category === category).map((s) => ({
      value: s.key,
      label: `${s.key}. ${drumSoundLabel(s.key, locale.value)}`
    }))
  }))
)

const starts = computed(() => props.pattern.tracks.map((track) => blockStarts(track.blocks)))
const laneWidth = computed(() =>
  Math.max(viewportWidth.value - LEFT_WIDTH, props.pattern.totalUnits * MIN_PX_PER_UNIT)
)
const beatCount = computed(() => Math.round(props.pattern.totalUnits / DRUM_BEAT_UNITS))

/** 时值占音轨区的百分比宽度，避免逐块取整累积误差 */
function unitsPercent(units: number): string {
  return `${(units / props.pattern.totalUnits) * 100}%`
}

const playheadLeft = computed(() =>
  props.positionUnits < 0
    ? null
    : LEFT_WIDTH + (props.positionUnits / props.pattern.totalUnits) * laneWidth.value
)

function trackColor(index: number): string {
  return DRUM_TRACK_COLORS[index % DRUM_TRACK_COLORS.length]!
}

function blockClass(track: DrumTrack, trackIndex: number, blockIndex: number) {
  const block = track.blocks[blockIndex]!
  const start = starts.value[trackIndex]![blockIndex]!
  const pos = props.positionUnits
  return {
    'is-active': block.active,
    'is-selected':
      props.selected?.trackIndex === trackIndex && props.selected.blockIndex === blockIndex,
    'is-playing': block.active && pos >= start && pos < start + block.duration,
    'is-beat': start % DRUM_BEAT_UNITS === 0,
    'is-bar': start % DRUM_BAR_UNITS === 0
  }
}

/** 左键点亮，右键熄灭；按住拖动连续绘制 */
const paintValue = ref<boolean | null>(null)

function setActive(trackIndex: number, blockIndex: number, active: boolean) {
  const track = props.pattern.tracks[trackIndex]
  const block = track?.blocks[blockIndex]
  if (!track || !block || block.active === active) return
  block.active = active
  if (active && !props.playing) emit('preview', track.sound, track.volume)
}

function onBlockDown(event: PointerEvent, trackIndex: number, blockIndex: number) {
  if (event.button !== 0 && event.button !== 2) return
  event.preventDefault()
  emit('update:selected', { trackIndex, blockIndex })
  paintValue.value = event.button === 0
  setActive(trackIndex, blockIndex, paintValue.value)
}

function onBlockEnter(event: PointerEvent, trackIndex: number, blockIndex: number) {
  if (paintValue.value == null) return
  if ((event.buttons & 3) === 0) {
    paintValue.value = null
    return
  }
  setActive(trackIndex, blockIndex, paintValue.value)
}

function endPaint() {
  paintValue.value = null
}

function toggleSolo(track: DrumTrack) {
  track.solo = !track.solo
}

function toggleMute(track: DrumTrack) {
  track.muted = !track.muted
}

function onTrackCommand(command: string, trackIndex: number) {
  const track = props.pattern.tracks[trackIndex]
  if (!track) return
  if (command === 'clear') {
    track.blocks.forEach((b) => (b.active = false))
  } else if (command === 'invert') {
    track.blocks.forEach((b) => (b.active = !b.active))
  } else if (command === 'remove') {
    emit('remove-track', trackIndex)
    return
  } else if (command.startsWith('grid:')) {
    const unit = Number(command.slice(5))
    track.blocks = regridBlocks(track.blocks, unit, props.pattern.totalUnits)
  }
  if (props.selected?.trackIndex === trackIndex) emit('update:selected', null)
}

function onSoundChange(track: DrumTrack, sound: number) {
  track.sound = sound
  emit('preview', sound, track.volume)
}

function unitLabel(units: number): string {
  return `1/${DRUM_BAR_UNITS / units}`
}

onMounted(() => {
  window.addEventListener('pointerup', endPaint)
  const el = rootRef.value
  if (!el) return
  viewportWidth.value = el.clientWidth
  resizeObserver = new ResizeObserver(() => {
    viewportWidth.value = el.clientWidth
  })
  resizeObserver.observe(el)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerup', endPaint)
  resizeObserver?.disconnect()
  resizeObserver = null
})
</script>

<template>
  <div ref="rootRef" class="dm-grid" @contextmenu.prevent>
    <div
      class="dm-grid__content"
      :style="{ width: `${LEFT_WIDTH + laneWidth}px`, '--left-w': `${LEFT_WIDTH}px` }"
    >
      <div class="dm-grid__ruler">
        <div class="dm-grid__corner">{{ t('instrumentSim.drumMachine.tracks') }}</div>
        <div class="dm-grid__beats" :style="{ width: `${laneWidth}px` }">
          <span
            v-for="beat in beatCount"
            :key="beat"
            class="dm-grid__beat"
            :class="{ 'is-bar': (beat - 1) % 4 === 0 }"
            :style="{ width: unitsPercent(DRUM_BEAT_UNITS) }"
          >
            {{ (beat - 1) % 4 === 0 ? Math.floor((beat - 1) / 4) + 1 : '·' }}
          </span>
        </div>
      </div>

      <div
        v-for="(track, trackIndex) in pattern.tracks"
        :key="track.id"
        class="dm-grid__row"
        :class="{ 'is-silent': !isTrackAudible(track, pattern.tracks) }"
        :style="{ '--track-color': trackColor(trackIndex) }"
      >
        <div class="dm-grid__head">
          <span class="dm-grid__dot" />
          <el-select
            :model-value="track.sound"
            size="small"
            filterable
            class="dm-grid__sound"
            @update:model-value="(v: number) => onSoundChange(track, v)"
          >
            <el-option-group
              v-for="group in soundGroups"
              :key="group.category"
              :label="t(`instrumentSim.drumMachine.category.${group.category}`)"
            >
              <el-option
                v-for="opt in group.options"
                :key="opt.value"
                :label="opt.label"
                :value="opt.value"
              />
            </el-option-group>
          </el-select>
          <button
            type="button"
            class="dm-grid__icon-btn"
            :title="t('instrumentSim.drumMachine.preview')"
            @click="emit('preview', track.sound, track.volume)"
          >
            <el-icon><VideoPlay /></el-icon>
          </button>
          <button
            type="button"
            class="dm-grid__toggle"
            :class="{ 'is-on': track.solo, 'is-solo': track.solo }"
            :title="t('instrumentSim.drumMachine.solo')"
            @click="toggleSolo(track)"
          >
            S
          </button>
          <button
            type="button"
            class="dm-grid__toggle"
            :class="{ 'is-on': track.muted, 'is-mute': track.muted }"
            :title="t('instrumentSim.drumMachine.mute')"
            @click="toggleMute(track)"
          >
            M
          </button>
          <el-slider
            v-model="track.volume"
            :min="0"
            :max="1"
            :step="0.05"
            size="small"
            class="dm-grid__volume"
            :format-tooltip="(v: number) => `${Math.round(v * 100)}%`"
          />
          <el-dropdown trigger="click" @command="(c: string) => onTrackCommand(c, trackIndex)">
            <button type="button" class="dm-grid__icon-btn" :title="t('instrumentSim.drumMachine.more')">
              <el-icon><ArrowDown /></el-icon>
            </button>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  v-for="unit in DRUM_BLOCK_UNIT_OPTIONS"
                  :key="unit"
                  :command="`grid:${unit}`"
                >
                  {{ t('instrumentSim.drumMachine.regrid', { unit: unitLabel(unit) }) }}
                </el-dropdown-item>
                <el-dropdown-item command="invert" divided>
                  {{ t('instrumentSim.drumMachine.invert') }}
                </el-dropdown-item>
                <el-dropdown-item command="clear">
                  {{ t('instrumentSim.drumMachine.clear') }}
                </el-dropdown-item>
                <el-dropdown-item command="remove" divided>
                  <el-icon><Delete /></el-icon>
                  {{ t('instrumentSim.drumMachine.removeTrack') }}
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>

        <div class="dm-grid__lane" :style="{ width: `${laneWidth}px` }">
          <div
            v-for="(block, blockIndex) in track.blocks"
            :key="blockIndex"
            class="dm-grid__block"
            :class="blockClass(track, trackIndex, blockIndex)"
            :style="{ width: unitsPercent(block.duration) }"
            :title="unitLabel(block.duration)"
            @pointerdown="onBlockDown($event, trackIndex, blockIndex)"
            @pointerenter="onBlockEnter($event, trackIndex, blockIndex)"
          >
            <span class="dm-grid__cell" />
          </div>
        </div>
      </div>

      <div class="dm-grid__footer">
        <el-button
          size="small"
          :icon="Plus"
          :disabled="pattern.tracks.length >= DRUM_TRACK_MAX"
          @click="emit('add-track')"
        >
          {{ t('instrumentSim.drumMachine.addTrack') }}
        </el-button>
      </div>

      <div v-if="playheadLeft != null" class="dm-grid__playhead" :style="{ left: `${playheadLeft}px` }" />
    </div>
  </div>
</template>

<style scoped>
.dm-grid {
  height: 100%;
  overflow: auto;
  border-radius: 14px;
  background: #17151f;
  user-select: none;
}

.dm-grid__content {
  position: relative;
  min-height: 100%;
  padding-bottom: 8px;
}

.dm-grid__ruler {
  position: sticky;
  top: 0;
  z-index: 4;
  display: flex;
  height: 26px;
  background: #1f1c2b;
  border-bottom: 1px solid #2c2839;
}

.dm-grid__corner {
  position: sticky;
  left: 0;
  z-index: 5;
  flex-shrink: 0;
  width: var(--left-w);
  padding: 0 12px;
  line-height: 26px;
  font-size: 12px;
  font-weight: 600;
  color: #9d95b5;
  background: #1f1c2b;
  box-sizing: border-box;
}

.dm-grid__beats {
  display: flex;
}

.dm-grid__beat {
  flex-shrink: 0;
  font-size: 11px;
  line-height: 26px;
  color: #5d5775;
  text-indent: 4px;
  white-space: nowrap;
  overflow: hidden;
  border-left: 1px solid #2c2839;
  box-sizing: border-box;
}

.dm-grid__beat.is-bar {
  color: #c4b8e8;
  font-weight: 700;
  border-left-color: #4a4462;
}

.dm-grid__row {
  display: flex;
  height: 40px;
  border-bottom: 1px solid #221f2d;
}

.dm-grid__head {
  position: sticky;
  left: 0;
  z-index: 3;
  flex-shrink: 0;
  width: var(--left-w);
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 0 8px 0 10px;
  background: #1c1a26;
  border-right: 1px solid #2c2839;
  box-sizing: border-box;
}

.dm-grid__row.is-silent .dm-grid__lane,
.dm-grid__row.is-silent .dm-grid__sound {
  opacity: 0.45;
}

.dm-grid__dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--track-color);
  box-shadow: 0 0 6px var(--track-color);
}

.dm-grid__sound {
  width: 128px;
  flex-shrink: 0;
}

.dm-grid__icon-btn,
.dm-grid__toggle {
  flex-shrink: 0;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  padding: 0;
  border: 1px solid #3a3550;
  border-radius: 6px;
  background: #262233;
  color: #b8b0d0;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.dm-grid__icon-btn:hover,
.dm-grid__toggle:hover {
  border-color: #5c5580;
  color: #fff;
}

.dm-grid__toggle.is-solo {
  background: #facc15;
  border-color: #facc15;
  color: #1c1a26;
}

.dm-grid__toggle.is-mute {
  background: #f87171;
  border-color: #f87171;
  color: #1c1a26;
}

.dm-grid__volume {
  flex: 1;
  min-width: 40px;
  margin: 0 4px;
}

.dm-grid__lane {
  display: flex;
  flex-shrink: 0;
  height: 100%;
}

.dm-grid__block {
  flex-shrink: 0;
  height: 100%;
  padding: 5px 1px;
  box-sizing: border-box;
  border-left: 1px solid transparent;
  cursor: pointer;
}

.dm-grid__block.is-beat {
  border-left-color: #2e2a3d;
}

.dm-grid__block.is-bar {
  border-left-color: #4a4462;
}

.dm-grid__cell {
  display: block;
  height: 100%;
  border-radius: 5px;
  background: #2a2638;
  transition:
    background 0.08s ease,
    box-shadow 0.08s ease,
    transform 0.08s ease;
}

.dm-grid__block:hover .dm-grid__cell {
  background: #353047;
}

.dm-grid__block.is-active .dm-grid__cell {
  background: var(--track-color);
  box-shadow: 0 0 8px color-mix(in srgb, var(--track-color) 55%, transparent);
}

.dm-grid__block.is-selected .dm-grid__cell {
  outline: 2px solid #ffffff;
  outline-offset: 1px;
}

.dm-grid__block.is-playing .dm-grid__cell {
  transform: scaleY(1.12);
  box-shadow: 0 0 16px var(--track-color);
  filter: brightness(1.25);
}

.dm-grid__footer {
  position: sticky;
  left: 0;
  width: var(--left-w);
  padding: 10px;
  box-sizing: border-box;
}

.dm-grid__playhead {
  position: absolute;
  top: 0;
  bottom: 0;
  z-index: 2;
  width: 2px;
  background: rgba(255, 255, 255, 0.75);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.6);
  pointer-events: none;
}
</style>
