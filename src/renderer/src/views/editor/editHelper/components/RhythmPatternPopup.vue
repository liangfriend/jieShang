<script setup lang="ts">
import musicScoreVue, { timeSignatureTypeToLabel } from '@deciphony/renderer'
import type { Skin, TimeSignatureTypeEnum } from '@deciphony/renderer'
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { RhythmPatternMode, RhythmPatternOption } from '../renderEditRhythmPattern'

defineOptions({ name: 'RhythmPatternPopup' })

const props = defineProps<{
  options: RhythmPatternOption[]
  activeIndex: number
  /** 选中小节的屏幕矩形；浮窗优先贴在其下方 */
  anchorRect: DOMRect | null
  timeSignature: TimeSignatureTypeEnum
  noteCount: number
  /** 按拍模式下一拍放不下、未参与组合的音数 */
  skipped: number
  mode: RhythmPatternMode
  skin?: Skin
  skinName?: string
}>()

const emit = defineEmits<{
  (e: 'pick', index: number): void
  (e: 'close'): void
}>()

const { t } = useI18n()
const panelRef = ref<HTMLElement | null>(null)
const gridRef = ref<HTMLElement | null>(null)
const position = ref<{ left: number; top: number } | null>(null)

const title = computed(() =>
  t('editor.rhythmPattern.heading', {
    mode: t(props.mode === 'beat' ? 'editor.rhythmPattern.modeBeat' : 'editor.rhythmPattern.modeMeasure'),
    timeSignature: timeSignatureTypeToLabel(props.timeSignature),
    count: props.noteCount
  })
)

const VIEWPORT_MARGIN = 8
const ANCHOR_GAP = 8

function placePanel() {
  const panel = panelRef.value
  if (!panel) return
  const { width, height } = panel.getBoundingClientRect()
  const vw = window.innerWidth
  const vh = window.innerHeight
  const anchor = props.anchorRect
  const clampLeft = (x: number) => Math.min(Math.max(VIEWPORT_MARGIN, x), vw - width - VIEWPORT_MARGIN)
  const clampTop = (y: number) => Math.min(Math.max(VIEWPORT_MARGIN, y), vh - height - VIEWPORT_MARGIN)
  if (!anchor) {
    position.value = { left: clampLeft((vw - width) / 2), top: clampTop((vh - height) / 2) }
    return
  }
  const below = anchor.bottom + ANCHOR_GAP
  const above = anchor.top - ANCHOR_GAP - height
  const top = below + height <= vh - VIEWPORT_MARGIN ? below : above >= VIEWPORT_MARGIN ? above : below
  position.value = { left: clampLeft(anchor.left), top: clampTop(top) }
}

/** 当前网格列数，供上下方向键按行跳 */
function columnCount(): number {
  const grid = gridRef.value
  if (!grid) return 1
  const columns = getComputedStyle(grid).gridTemplateColumns.split(' ').filter(Boolean).length
  return Math.max(1, columns)
}

function onWindowPointerDown(event: PointerEvent) {
  const panel = panelRef.value
  if (panel && event.target instanceof Node && panel.contains(event.target)) return
  emit('close')
}

watch(
  () => props.activeIndex,
  async (index) => {
    await nextTick()
    const card = gridRef.value?.children[index]
    if (card instanceof HTMLElement) card.scrollIntoView({ block: 'nearest' })
  }
)

onMounted(async () => {
  await nextTick()
  placePanel()
  window.addEventListener('pointerdown', onWindowPointerDown, true)
  window.addEventListener('resize', placePanel)
})

onBeforeUnmount(() => {
  window.removeEventListener('pointerdown', onWindowPointerDown, true)
  window.removeEventListener('resize', placePanel)
})

defineExpose({ columnCount })
</script>

<template>
  <Teleport to="body">
    <div
      ref="panelRef"
      class="rhythm-pattern-popup"
      :style="
        position
          ? { left: `${position.left}px`, top: `${position.top}px` }
          : { visibility: 'hidden' }
      "
      role="dialog"
      :aria-label="t('editor.rhythmPattern.title')"
    >
      <header class="rhythm-pattern-popup__header">
        <span class="rhythm-pattern-popup__title">{{ title }}</span>
        <span class="rhythm-pattern-popup__hint">{{ t('editor.rhythmPattern.hint') }}</span>
      </header>
      <p v-if="mode === 'beat' && skipped > 0" class="rhythm-pattern-popup__notice">
        {{ t('editor.rhythmPattern.skipped', { count: skipped }) }}
      </p>
      <p v-if="!options.length" class="rhythm-pattern-popup__empty">
        {{ t(mode === 'beat' ? 'editor.rhythmPattern.emptyBeat' : 'editor.rhythmPattern.empty') }}
      </p>
      <div v-else ref="gridRef" class="rhythm-pattern-popup__grid">
        <button
          v-for="(option, index) in options"
          :key="option.id"
          type="button"
          class="rhythm-pattern-popup__card"
          :class="{ 'is-active': index === activeIndex }"
          @click="emit('pick', index)"
        >
          <kbd v-if="option.shortcut" class="rhythm-pattern-popup__key">{{ option.shortcut }}</kbd>
          <span class="rhythm-pattern-popup__score">
            <musicScoreVue
              v-if="skin"
              :key="`${skinName}-${option.id}`"
              :data="option.preview"
              :skin="skin"
              :skin-name="skinName"
            />
          </span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.rhythm-pattern-popup {
  position: fixed;
  z-index: 3000;
  width: min(96vw, 1180px);
  max-height: calc(100vh - 16px);
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px 12px 12px;
  border: 1px solid rgba(201, 184, 255, 0.7);
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 12px 32px rgba(92, 74, 106, 0.22);
  box-sizing: border-box;
}

.rhythm-pattern-popup__header {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  justify-content: space-between;
  gap: 4px 12px;
}

.rhythm-pattern-popup__notice {
  margin: 0;
  font-size: 12px;
  color: #c0763a;
}

.rhythm-pattern-popup__title {
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.rhythm-pattern-popup__hint {
  font-size: 12px;
  color: #8a7a98;
}

.rhythm-pattern-popup__empty {
  margin: 8px 0;
  font-size: 13px;
  color: #8a7a98;
}

.rhythm-pattern-popup__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(176px, 1fr));
  gap: 4px;
  min-height: 0;
  overflow: auto;
}

.rhythm-pattern-popup__card {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
  padding: 4px 6px;
  border: 1px solid rgba(201, 184, 255, 0.35);
  border-radius: 8px;
  background: rgba(248, 240, 255, 0.45);
  cursor: pointer;
  transition:
    background-color 0.12s ease,
    border-color 0.12s ease;
}

.rhythm-pattern-popup__card.is-active {
  border-color: #ff8fb8;
  background: rgba(255, 214, 232, 0.75);
  box-shadow: 0 0 0 2px rgba(255, 158, 197, 0.35);
}

.rhythm-pattern-popup__key {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 20px;
  padding: 0 4px;
  border: 1px solid rgba(201, 184, 255, 0.8);
  border-bottom-width: 2px;
  border-radius: 5px;
  font-family: ui-monospace, Consolas, monospace;
  font-size: 11px;
  font-weight: 700;
  color: #7a5ac8;
  background: #fff;
}

.rhythm-pattern-popup__score {
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  height: 58px;
  overflow: hidden;
  border-radius: 6px;
  background: #fff;
  pointer-events: none;
}

.rhythm-pattern-popup__score :deep(svg) {
  width: auto;
  height: auto;
  max-width: 100%;
  max-height: 100%;
}
</style>
