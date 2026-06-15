<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import NoteSliceBlockContent from '@renderer/views/noteSlice/NoteSliceBlockContent.vue'
import NoteSliceSlotClearEffect from '@renderer/views/noteSlice/NoteSliceSlotClearEffect.vue'
import NoteSliceSlotExplosionEffect from '@renderer/views/noteSlice/NoteSliceSlotExplosionEffect.vue'
import NoteSliceSlotHealEffect from '@renderer/views/noteSlice/NoteSliceSlotHealEffect.vue'
import NoteSliceSlotFreezeEffect from '@renderer/views/noteSlice/NoteSliceSlotFreezeEffect.vue'
import NoteSliceSlotDoubleEffect from '@renderer/views/noteSlice/NoteSliceSlotDoubleEffect.vue'
import {
  buildNoteSliceBlockWithMidi,
  buildRandomNoteSliceBlock,
  NOTE_SLICE_BOMB_BATCH,
  NOTE_SLICE_DOUBLE_BATCH,
  NOTE_SLICE_FREEZE_BATCH,
  NOTE_SLICE_HEAL_BATCH,
  type NoteSliceActiveBlock
} from '@renderer/views/noteSlice/noteSliceBlockFactory'
import {
  NOTE_SLICE_GAME_HEIGHT,
  NOTE_SLICE_GAME_WIDTH
} from '@renderer/views/noteSlice/noteSliceGameConstants'
import { getActiveNoteSliceDifficultyConfig } from '@renderer/views/noteSlice/noteSliceDifficultyConfig'
import {
  applyNoteSliceFreezeToSpawnConfig,
  getNoteSliceBlockLifetimeMsFromConfig,
  resolveNoteSliceBlockOpacityFromConfig,
  type NoteSliceSpawnRuntimeConfig
} from '@renderer/views/noteSlice/noteSliceSpawnRuntimeConfig'
import {
  setSpawnConfigPassTime
} from '@renderer/views/noteSlice/noteSliceSpawnConfigManager'
import {
  getNoteSliceSlotPosition,
  listEmptyNoteSliceSlots,
  NOTE_SLICE_GRID_SLOT_INDICES,
  pickRandomNoteSliceSlot
} from '@renderer/views/noteSlice/noteSliceGridLayout'
import { shouldSpawnByInterval } from '@renderer/views/noteSlice/noteSliceSpawn'
import { createNoteSlicePenaltyBombQueue } from '@renderer/views/noteSlice/noteSlicePenaltyBombQueue'
import { useNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'
import { useNoteSliceMidiInput } from '@renderer/views/noteSlice/useNoteSliceMidiInput'

type SlotEffectExpose = {
  play: () => void
}

/** 存活在屏幕上的音符块 */
const blocks = ref<NoteSliceActiveBlock[]>([])

/** 计分 / 连击 / 生成批次 / midi 黑名单 / 模式状态 */
const {
  mode,
  isRunning,
  passTimeMs,
  nextBatch,
  onBlocksCleared,
  onBombCleared,
  onHealCleared,
  onFreezeCleared,
  onDoubleCleared,
  onMissedBlocks,
  isFrozen,
  tickBuffState,
  tickModeState,
  resetCombo,
  addBlacklistedMidi,
  removeBlacklistedMidi,
  getBlacklistedMidis
} = useNoteSliceGameSession()

const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

/** 当前帧生效的生成参数（每 tick 按 passTime 更新） */
const currentSpawnConfig = ref<NoteSliceSpawnRuntimeConfig>(
  getActiveNoteSliceDifficultyConfig(0)
)

/** 冰冻增益下 solidMs / fadeMs ×2 */
const effectiveSpawnConfig = computed(() =>
  isFrozen.value
    ? applyNoteSliceFreezeToSpawnConfig(currentSpawnConfig.value)
    : currentSpawnConfig.value
)

let elapsedMs = 0

/** 15 个格子各对应一个清除特效组件 */
const slotClearEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(() => null)

/** 15 个格子各对应一个爆炸特效组件 */
const slotExplosionEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(
  () => null
)

/** 15 个格子各对应一个治疗特效组件 */
const slotHealEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(() => null)

/** 15 个格子各对应一个冰冻特效组件 */
const slotFreezeEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(() => null)

/** 15 个格子各对应一个加倍特效组件 */
const slotDoubleEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(() => null)

let blockIdSeq = 0
let rafId = 0
let lastTimestamp = 0
/** 成功生成音符块后的冷却剩余时间（ms） */
let spawnCooldownMs = 0
/** 各类特殊块独立生成冷却（ms） */
let bombSpawnCooldownMs = 0
let freezeSpawnCooldownMs = 0
let doubleSpawnCooldownMs = 0
/** 治疗块生成冷却剩余时间（ms），仅极限模式 */
let healSpawnCooldownMs = 0

/** 乱按惩罚：入队后在 tick 开头统一生成炸弹，避免与随机 spawn 抢时序 */
const penaltyBombQueue = createNoteSlicePenaltyBombQueue()

function bindSlotClearEffect(slotIndex: number, el: unknown): void {
  slotClearEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function bindSlotExplosionEffect(slotIndex: number, el: unknown): void {
  slotExplosionEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function bindSlotHealEffect(slotIndex: number, el: unknown): void {
  slotHealEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function bindSlotFreezeEffect(slotIndex: number, el: unknown): void {
  slotFreezeEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function bindSlotDoubleEffect(slotIndex: number, el: unknown): void {
  slotDoubleEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function applySpawnCooldown(): void {
  spawnCooldownMs = getActiveNoteSliceDifficultyConfig().spawnCooldownSeconds * 1000
}

function applyBombSpawnCooldown(): void {
  bombSpawnCooldownMs =
    getActiveNoteSliceDifficultyConfig().bombSpawnCooldownSeconds * 1000
}

function applyFreezeSpawnCooldown(): void {
  freezeSpawnCooldownMs =
    getActiveNoteSliceDifficultyConfig().freezeSpawnCooldownSeconds * 1000
}

function applyDoubleSpawnCooldown(): void {
  doubleSpawnCooldownMs =
    getActiveNoteSliceDifficultyConfig().doubleSpawnCooldownSeconds * 1000
}

function applyHealSpawnCooldown(): void {
  healSpawnCooldownMs = getActiveNoteSliceDifficultyConfig().healSpawnCooldownSeconds * 1000
}

/** 将已构造的治疗块放入指定格子 */
function placeHealBlockAtSlot(slotIndex: number, block: UnplacedBlock): void {
  const { x, y } = getNoteSliceSlotPosition(slotIndex, block.width, block.height)
  blocks.value.push({
    ...block,
    slotIndex,
    batch: NOTE_SLICE_HEAL_BATCH,
    x,
    y,
    ageMs: 0
  })
}

function placeFreezeBlockAtSlot(slotIndex: number, block: UnplacedBlock): void {
  const { x, y } = getNoteSliceSlotPosition(slotIndex, block.width, block.height)
  blocks.value.push({
    ...block,
    slotIndex,
    batch: NOTE_SLICE_FREEZE_BATCH,
    x,
    y,
    ageMs: 0
  })
}

function placeDoubleBlockAtSlot(slotIndex: number, block: UnplacedBlock): void {
  const { x, y } = getNoteSliceSlotPosition(slotIndex, block.width, block.height)
  blocks.value.push({
    ...block,
    slotIndex,
    batch: NOTE_SLICE_DOUBLE_BATCH,
    x,
    y,
    ageMs: 0
  })
}

/** 炸弹消失后解除对应 midi 的黑名单 */
function releaseBombBlacklist(blocksToRelease: readonly NoteSliceActiveBlock[]): void {
  for (const block of blocksToRelease) {
    if (block.type === 'bomb') {
      removeBlacklistedMidi(block.midi)
    }
  }
}

function isMidiOnField(midi: number): boolean {
  return blocks.value.some((block) => block.midi === midi)
}

type UnplacedBlock = Omit<NoteSliceActiveBlock, 'slotIndex' | 'batch' | 'x' | 'y' | 'ageMs'>

/** 将已构造的炸弹块放入指定格子，并加入黑名单 */
function placeBombBlockAtSlot(slotIndex: number, block: UnplacedBlock): void {
  const { x, y } = getNoteSliceSlotPosition(slotIndex, block.width, block.height)
  blocks.value.push({
    ...block,
    slotIndex,
    batch: NOTE_SLICE_BOMB_BATCH,
    x,
    y,
    ageMs: 0
  })
  addBlacklistedMidi(block.midi)
}

/** 在指定格子生成指定 midi 的炸弹块 */
function spawnBombWithMidiAtSlot(slotIndex: number, midi: number): boolean {
  const block = buildNoteSliceBlockWithMidi(`note-slice-penalty-bomb-${++blockIdSeq}`, midi, {
    type: 'bomb'
  })
  if (!block) return false
  placeBombBlockAtSlot(slotIndex, block)
  return true
}

/**
 * 处理乱按惩罚队列：本帧尽量生成；格子已满则丢弃剩余项，不再入队。
 * 不走 spawn 冷却，且在随机 spawn 之前执行。
 */
function processPendingPenaltyBombs(): void {
  if (mode === 'extreme') return

  const pendingMidis = penaltyBombQueue.drain()
  if (pendingMidis.length === 0) return

  for (const midi of pendingMidis) {
    if (isMidiOnField(midi)) continue

    const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
    const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
    if (emptySlots.length === 0) break

    const slotIndex = pickRandomNoteSliceSlot(emptySlots)
    if (slotIndex === null) break

    spawnBombWithMidiAtSlot(slotIndex, midi)
  }
}

/** 乱按：街机/无限生成惩罚炸弹；极限模式直接扣 1 命 */
function punishWrongMidiPress(midi: number): void {
  if (!isRunning.value) return
  resetCombo()
  if (isMidiOnField(midi)) return

  if (mode === 'extreme') {
    onMissedBlocks(1)
    return
  }

  penaltyBombQueue.enqueue(midi)
}

/** 按下 midi 后，清除所有匹配块并触发对应格子特效 */
function clearBlocksByMidi(midi: number): void {
  if (!isRunning.value) return

  const targets = blocks.value.filter((block) => block.midi === midi)
  if (targets.length === 0) {
    punishWrongMidiPress(midi)
    return
  }

  const normalTargets = targets.filter((block) => block.type === 'normal')
  const bombTargets = targets.filter((block) => block.type === 'bomb')
  const healTargets = targets.filter((block) => block.type === 'heal')
  const freezeTargets = targets.filter((block) => block.type === 'freeze')
  const doubleTargets = targets.filter((block) => block.type === 'double')

  if (freezeTargets.length > 0) {
    onFreezeCleared()
  }
  if (doubleTargets.length > 0) {
    onDoubleCleared()
  }

  if (normalTargets.length > 0) {
    onBlocksCleared(normalTargets)
  }

  const affectedSlots = new Set(targets.map((block) => block.slotIndex))
  releaseBombBlacklist(bombTargets)
  blocks.value = blocks.value.filter((block) => block.midi !== midi)

  for (const slotIndex of affectedSlots) {
    if (bombTargets.some((block) => block.slotIndex === slotIndex)) {
      slotExplosionEffects[slotIndex]?.play()
      continue
    }
    if (healTargets.some((block) => block.slotIndex === slotIndex)) {
      slotHealEffects[slotIndex]?.play()
      continue
    }
    if (freezeTargets.some((block) => block.slotIndex === slotIndex)) {
      slotFreezeEffects[slotIndex]?.play()
      continue
    }
    if (doubleTargets.some((block) => block.slotIndex === slotIndex)) {
      slotDoubleEffects[slotIndex]?.play()
      continue
    }
    if (normalTargets.some((block) => block.slotIndex === slotIndex)) {
      slotClearEffects[slotIndex]?.play()
    }
  }

  if (bombTargets.length > 0) {
    onBombCleared()
  }
  if (healTargets.length > 0) {
    onHealCleared()
  }
}

useNoteSliceMidiInput(clearBlocksByMidi)

// 往空格子上 push 音符块，更新音符生成冷却
function spawnBlockAtSlot(slotIndex: number): void {
  const block = buildRandomNoteSliceBlock(`note-slice-block-${++blockIdSeq}`, {
    type: 'normal',
    excludedMidis: getBlacklistedMidis()
  })
  if (!block) return
  const { x, y } = getNoteSliceSlotPosition(slotIndex, block.width, block.height)
  blocks.value.push({
    ...block,
    slotIndex,
    batch: nextBatch(),
    x,
    y,
    ageMs: 0
  })
  applySpawnCooldown()
}

// 往空格子上 push 炸弹块；batch 固定 -1，不占用正常批次计数
function spawnBombAtSlot(slotIndex: number): void {
  const excludedMidis = new Set(getBlacklistedMidis())
  for (const block of blocks.value) {
    excludedMidis.add(block.midi)
  }
  const block = buildRandomNoteSliceBlock(`note-slice-bomb-${++blockIdSeq}`, {
    type: 'bomb',
    excludedMidis
  })
  if (!block) return
  placeBombBlockAtSlot(slotIndex, block)
  applyBombSpawnCooldown()
}

// 生成普通音符块
function trySpawnBlock(): void {
  if (spawnCooldownMs > 0) return
  // 已经被占的格子
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  // 空格子
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  // 找到空格子
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnBlockAtSlot(slotIndex)
}

// 生成冰冻音符块（街机 / 无限）
function spawnFreezeAtSlot(slotIndex: number): void {
  const excludedMidis = new Set(getBlacklistedMidis())
  for (const block of blocks.value) {
    excludedMidis.add(block.midi)
  }
  const block = buildRandomNoteSliceBlock(`note-slice-freeze-${++blockIdSeq}`, {
    type: 'freeze',
    excludedMidis
  })
  if (!block) return
  placeFreezeBlockAtSlot(slotIndex, block)
  applyFreezeSpawnCooldown()
}

// 生成加倍音符块（街机 / 无限）
function spawnDoubleAtSlot(slotIndex: number): void {
  const excludedMidis = new Set(getBlacklistedMidis())
  for (const block of blocks.value) {
    excludedMidis.add(block.midi)
  }
  const block = buildRandomNoteSliceBlock(`note-slice-double-${++blockIdSeq}`, {
    type: 'double',
    excludedMidis
  })
  if (!block) return
  placeDoubleBlockAtSlot(slotIndex, block)
  applyDoubleSpawnCooldown()
}

// 生成治疗音符块（仅极限模式）
function spawnHealAtSlot(slotIndex: number): void {
  const excludedMidis = new Set(getBlacklistedMidis())
  for (const block of blocks.value) {
    excludedMidis.add(block.midi)
  }
  const block = buildRandomNoteSliceBlock(`note-slice-heal-${++blockIdSeq}`, {
    type: 'heal',
    excludedMidis
  })
  if (!block) return
  placeHealBlockAtSlot(slotIndex, block)
  applyHealSpawnCooldown()
}

// 生成炸弹音符块（极限模式不生成任何炸弹）
function trySpawnBomb(): void {
  if (mode === 'extreme') return
  if (bombSpawnCooldownMs > 0) return
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnBombAtSlot(slotIndex)
}

// 生成冰冻音符块
function trySpawnFreeze(): void {
  if (mode === 'extreme') return
  if (freezeSpawnCooldownMs > 0) return
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnFreezeAtSlot(slotIndex)
}

// 生成加倍音符块
function trySpawnDouble(): void {
  if (mode === 'extreme') return
  if (doubleSpawnCooldownMs > 0) return
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnDoubleAtSlot(slotIndex)
}

// 生成治疗音符块
function trySpawnHeal(): void {
  if (mode !== 'extreme') return
  if (healSpawnCooldownMs > 0) return
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnHealAtSlot(slotIndex)
}

function handleExpiringBlocks(expiringBlocks: readonly NoteSliceActiveBlock[]): void {
  releaseBombBlacklist(expiringBlocks)
  if (mode === 'extreme') {
    onMissedBlocks(expiringBlocks.length)
  }
}

function tick(timestamp: number): void {
  if (!isRunning.value) return

  if (lastTimestamp === 0) {
    lastTimestamp = timestamp
  }
  const deltaMs = Math.min(48, timestamp - lastTimestamp)
  lastTimestamp = timestamp
  elapsedMs += deltaMs
  passTimeMs.value = elapsedMs

  setSpawnConfigPassTime(elapsedMs)
  currentSpawnConfig.value = getActiveNoteSliceDifficultyConfig(elapsedMs)
  const blockLifetimeMs = getNoteSliceBlockLifetimeMsFromConfig(effectiveSpawnConfig.value)

  // 更新每个音符块的存活时间
  for (const block of blocks.value) {
    block.ageMs += deltaMs
  }

  // 清除超出规定寿命的音符块
  const expiringBlocks = blocks.value.filter((block) => block.ageMs >= blockLifetimeMs)
  handleExpiringBlocks(expiringBlocks)
  blocks.value = blocks.value.filter((block) => block.ageMs < blockLifetimeMs)

  // 乱按惩罚炸弹：优先于随机 spawn，且不占用 spawn 冷却
  processPendingPenaltyBombs()

  // 街机倒计时、增益剩余时间等模式逻辑
  tickModeState(deltaMs)
  tickBuffState(deltaMs)
  if (!isRunning.value) {
    stopTick()
    return
  }

  // 如果生成音符的冷却时间存在，更新冷却时间
  if (spawnCooldownMs > 0) {
    spawnCooldownMs = Math.max(0, spawnCooldownMs - deltaMs)
  }
  if (bombSpawnCooldownMs > 0) {
    bombSpawnCooldownMs = Math.max(0, bombSpawnCooldownMs - deltaMs)
  }
  if (freezeSpawnCooldownMs > 0) {
    freezeSpawnCooldownMs = Math.max(0, freezeSpawnCooldownMs - deltaMs)
  }
  if (doubleSpawnCooldownMs > 0) {
    doubleSpawnCooldownMs = Math.max(0, doubleSpawnCooldownMs - deltaMs)
  }
  if (healSpawnCooldownMs > 0) {
    healSpawnCooldownMs = Math.max(0, healSpawnCooldownMs - deltaMs)
  }

  const { bombSpawnAvgSeconds, spawnAvgSeconds, healSpawnAvgSeconds, freezeSpawnAvgSeconds, doubleSpawnAvgSeconds } =
    getActiveNoteSliceDifficultyConfig()
  if (mode !== 'extreme' && shouldSpawnByInterval(bombSpawnAvgSeconds, deltaMs)) {
    trySpawnBomb()
  }

  if (mode !== 'extreme' && shouldSpawnByInterval(freezeSpawnAvgSeconds, deltaMs)) {
    trySpawnFreeze()
  }

  if (mode !== 'extreme' && shouldSpawnByInterval(doubleSpawnAvgSeconds, deltaMs)) {
    trySpawnDouble()
  }

  if (shouldSpawnByInterval(spawnAvgSeconds, deltaMs)) {
    trySpawnBlock()
  }

  if (mode === 'extreme' && shouldSpawnByInterval(healSpawnAvgSeconds, deltaMs)) {
    trySpawnHeal()
  }

  rafId = window.requestAnimationFrame(tick)
}

function startTick(): void {
  stopTick()
  elapsedMs = 0
  passTimeMs.value = 0
  spawnCooldownMs = 0
  bombSpawnCooldownMs = 0
  freezeSpawnCooldownMs = 0
  doubleSpawnCooldownMs = 0
  healSpawnCooldownMs = 0
  currentSpawnConfig.value = getActiveNoteSliceDifficultyConfig(0)
  setSpawnConfigPassTime(0)
  lastTimestamp = 0
  rafId = window.requestAnimationFrame(tick)
}

function stopTick(): void {
  if (rafId !== 0) {
    window.cancelAnimationFrame(rafId)
    rafId = 0
  }
  lastTimestamp = 0
  elapsedMs = 0
  passTimeMs.value = 0
  spawnCooldownMs = 0
  bombSpawnCooldownMs = 0
  freezeSpawnCooldownMs = 0
  doubleSpawnCooldownMs = 0
  healSpawnCooldownMs = 0
}

defineExpose({
  startTick,
  stopTick
})

onUnmounted(() => {
  stopTick()
})
</script>

<template>
  <div class="note-slice-game-layer">
    <svg
      class="note-slice-game-layer__svg"
      :viewBox="`0 0 ${NOTE_SLICE_GAME_WIDTH} ${NOTE_SLICE_GAME_HEIGHT}`"
      preserveAspectRatio="xMidYMid meet"
      xmlns="http://www.w3.org/2000/svg"
    >
      <NoteSliceBlockContent
        v-for="block in blocks"
        :key="block.id"
        :x="block.x"
        :y="block.y"
        :type="block.type"
        :opacity="resolveNoteSliceBlockOpacityFromConfig(block.ageMs, effectiveSpawnConfig)"
        :music-score="block.musicScore"
        :skin="scoreSkin"
        :skin-name="scoreSkinName"
      />

      <!-- 每格常驻一个清除特效，手动切中普通音符时 play() -->
      <NoteSliceSlotClearEffect
        v-for="slotIndex in NOTE_SLICE_GRID_SLOT_INDICES"
        :key="`slot-clear-${slotIndex}`"
        :ref="(el) => bindSlotClearEffect(slotIndex, el)"
        :slot-index="slotIndex"
      />

      <!-- 每格常驻一个爆炸特效，切中炸弹时 play() -->
      <NoteSliceSlotExplosionEffect
        v-for="slotIndex in NOTE_SLICE_GRID_SLOT_INDICES"
        :key="`slot-explosion-${slotIndex}`"
        :ref="(el) => bindSlotExplosionEffect(slotIndex, el)"
        :slot-index="slotIndex"
      />

      <!-- 每格常驻一个治疗特效，切中治疗块时 play() -->
      <NoteSliceSlotHealEffect
        v-for="slotIndex in NOTE_SLICE_GRID_SLOT_INDICES"
        :key="`slot-heal-${slotIndex}`"
        :ref="(el) => bindSlotHealEffect(slotIndex, el)"
        :slot-index="slotIndex"
      />

      <!-- 每格常驻一个冰冻特效，切中冰冻块时 play() -->
      <NoteSliceSlotFreezeEffect
        v-for="slotIndex in NOTE_SLICE_GRID_SLOT_INDICES"
        :key="`slot-freeze-${slotIndex}`"
        :ref="(el) => bindSlotFreezeEffect(slotIndex, el)"
        :slot-index="slotIndex"
      />

      <!-- 每格常驻一个加倍特效，切中加倍块时 play() -->
      <NoteSliceSlotDoubleEffect
        v-for="slotIndex in NOTE_SLICE_GRID_SLOT_INDICES"
        :key="`slot-double-${slotIndex}`"
        :ref="(el) => bindSlotDoubleEffect(slotIndex, el)"
        :slot-index="slotIndex"
      />
    </svg>
  </div>
</template>

<style scoped>
.note-slice-game-layer {
  width: 100%;
  height: 100%;
}

.note-slice-game-layer__svg {
  display: block;
  width: 100%;
  height: 100%;
}
</style>
