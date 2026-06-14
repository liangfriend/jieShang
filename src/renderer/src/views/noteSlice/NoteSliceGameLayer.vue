<script lang="ts" setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useScoreSkin } from '@renderer/utils/collection/useScoreSkin'
import NoteSliceBlockContent from '@renderer/views/noteSlice/NoteSliceBlockContent.vue'
import NoteSliceSlotClearEffect from '@renderer/views/noteSlice/NoteSliceSlotClearEffect.vue'
import NoteSliceSlotExplosionEffect from '@renderer/views/noteSlice/NoteSliceSlotExplosionEffect.vue'
import {
  buildNoteSliceBlockWithMidi,
  buildRandomNoteSliceBlock,
  NOTE_SLICE_BOMB_BATCH,
  type NoteSliceActiveBlock
} from '@renderer/views/noteSlice/noteSliceBlockFactory'
import {
  getNoteSliceBlockLifetimeMs,
  NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS,
  NOTE_SLICE_GAME_HEIGHT,
  NOTE_SLICE_GAME_WIDTH,
  NOTE_SLICE_SPAWN_AVG_SECONDS,
  NOTE_SLICE_SPAWN_COOLDOWN_SECONDS,
  resolveNoteSliceBlockOpacity
} from '@renderer/views/noteSlice/noteSliceGameConstants'
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

/** 计分 / 连击 / 生成批次 / midi 黑名单 */
const {
  nextBatch,
  onBlocksCleared,
  resetCombo,
  addBlacklistedMidi,
  removeBlacklistedMidi,
  getBlacklistedMidis
} = useNoteSliceGameSession()

const { skin: scoreSkin, skinName: scoreSkinName } = useScoreSkin()

const blockLifetimeMs = getNoteSliceBlockLifetimeMs()

/** 15 个格子各对应一个清除特效组件 */
const slotClearEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(() => null)

/** 15 个格子各对应一个爆炸特效组件 */
const slotExplosionEffects: (SlotEffectExpose | null)[] = NOTE_SLICE_GRID_SLOT_INDICES.map(
  () => null
)

let blockIdSeq = 0
let rafId = 0
let lastTimestamp = 0
/** 成功生成音符块后的冷却剩余时间（ms） */
let spawnCooldownMs = 0

/** 乱按惩罚：入队后在 tick 开头统一生成炸弹，避免与随机 spawn 抢时序 */
const penaltyBombQueue = createNoteSlicePenaltyBombQueue()

function bindSlotClearEffect(slotIndex: number, el: unknown): void {
  slotClearEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function bindSlotExplosionEffect(slotIndex: number, el: unknown): void {
  slotExplosionEffects[slotIndex] = (el as SlotEffectExpose | null) ?? null
}

function applySpawnCooldown(): void {
  spawnCooldownMs = NOTE_SLICE_SPAWN_COOLDOWN_SECONDS * 1000
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

/** 乱按：连击清零并将该 midi 加入惩罚炸弹队列 */
function punishWrongMidiPress(midi: number): void {
  resetCombo()
  if (isMidiOnField(midi)) return
  penaltyBombQueue.enqueue(midi)
}

/** 按下 midi 后，清除所有匹配块并触发对应格子特效 */
function clearBlocksByMidi(midi: number): void {
  const targets = blocks.value.filter((block) => block.midi === midi)
  if (targets.length === 0) {
    punishWrongMidiPress(midi)
    return
  }

  const normalTargets = targets.filter((block) => block.type === 'normal')
  const bombTargets = targets.filter((block) => block.type === 'bomb')

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
    if (normalTargets.some((block) => block.slotIndex === slotIndex)) {
      slotClearEffects[slotIndex]?.play()
    }
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
  applySpawnCooldown()
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

// 生成炸弹音符块
function trySpawnBomb(): void {
  if (spawnCooldownMs > 0) return
  const occupiedSlots = new Set(blocks.value.map((block) => block.slotIndex))
  const emptySlots = listEmptyNoteSliceSlots(occupiedSlots)
  const slotIndex = pickRandomNoteSliceSlot(emptySlots)
  if (slotIndex === null) return
  spawnBombAtSlot(slotIndex)
}

function tick(timestamp: number): void {
  if (lastTimestamp === 0) {
    lastTimestamp = timestamp
  }
  const deltaMs = Math.min(48, timestamp - lastTimestamp)
  lastTimestamp = timestamp

  // 更新每个音符块的存活时间
  for (const block of blocks.value) {
    block.ageMs += deltaMs
  }

  // 清除超出规定寿命的音符块
  const expiringBlocks = blocks.value.filter((block) => block.ageMs >= blockLifetimeMs)
  releaseBombBlacklist(expiringBlocks)
  blocks.value = blocks.value.filter((block) => block.ageMs < blockLifetimeMs)

  // 乱按惩罚炸弹：优先于随机 spawn，且不占用 spawn 冷却
  processPendingPenaltyBombs()

  // 如果生成音符的冷却时间存在，更新冷却时间
  if (spawnCooldownMs > 0) {
    spawnCooldownMs = Math.max(0, spawnCooldownMs - deltaMs)
  }

  // 随机数判断是否要生成炸弹块（平均间隔更长）
  if (shouldSpawnByInterval(NOTE_SLICE_BOMB_SPAWN_AVG_SECONDS, deltaMs)) {
    trySpawnBomb()
  }

  // 随机数判断是否要生成普通音符块
  if (shouldSpawnByInterval(NOTE_SLICE_SPAWN_AVG_SECONDS, deltaMs)) {
    trySpawnBlock()
  }

  rafId = window.requestAnimationFrame(tick)
}

onMounted(() => {
  rafId = window.requestAnimationFrame(tick)
})

onUnmounted(() => {
  window.cancelAnimationFrame(rafId)
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
        :opacity="resolveNoteSliceBlockOpacity(block.ageMs)"
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
