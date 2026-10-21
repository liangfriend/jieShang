<script lang="ts" setup>
import { computed, nextTick, onBeforeUnmount, ref, shallowReactive, shallowRef, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import SJWPDF, { Page, type SJW, type SPage } from '@deciphony/work'

defineOptions({ name: 'WorkThumbnailRail' })

const props = defineProps<{
  data: SJW
  pageIndex: number
  editable?: boolean
  /** 已复制过一页时才能粘贴 */
  canPaste?: boolean
  pdfRef: InstanceType<typeof SJWPDF> | null
}>()

const emit = defineEmits<{
  select: [index: number]
  addPage: []
  insertPage: []
  removePage: []
  /** 复制当前页并插到后面（内容与当前页相同） */
  duplicatePage: []
  copyPage: [index: number]
  pastePage: [index: number]
  removePageAt: [index: number]
}>()

const { t } = useI18n()

type PageMenuCommand = 'copy' | 'paste' | 'delete'

type PageMenuState = {
  x: number
  y: number
  index: number
}

const pageMenu = ref<PageMenuState | null>(null)
const pageMenuRef = ref<HTMLElement | null>(null)
const pageMenuPos = ref({ left: 0, top: 0 })

const pageMenuStyle = computed(() => ({
  left: `${pageMenuPos.value.left}px`,
  top: `${pageMenuPos.value.top}px`
}))

function closePageMenu() {
  pageMenu.value = null
}

function clampPageMenu() {
  const el = pageMenuRef.value
  const menu = pageMenu.value
  if (!el || !menu) return
  const pad = 8
  const rect = el.getBoundingClientRect()
  let left = menu.x
  let top = menu.y
  if (left + rect.width > window.innerWidth - pad) {
    left = Math.max(pad, window.innerWidth - rect.width - pad)
  }
  if (top + rect.height > window.innerHeight - pad) {
    top = Math.max(pad, window.innerHeight - rect.height - pad)
  }
  pageMenuPos.value = { left, top }
}

async function openPageMenu(index: number, ev: MouseEvent) {
  ev.preventDefault()
  ev.stopPropagation()
  if (!props.editable) return
  pageMenu.value = { x: ev.clientX, y: ev.clientY, index }
  pageMenuPos.value = { left: ev.clientX, top: ev.clientY }
  await nextTick()
  clampPageMenu()
}

function runPageMenu(command: PageMenuCommand) {
  const menu = pageMenu.value
  if (!menu) return
  if (command === 'paste' && !props.canPaste) return
  if (command === 'delete' && pages.value.length <= 1) return
  const index = menu.index
  closePageMenu()
  if (command === 'copy') emit('copyPage', index)
  else if (command === 'paste') emit('pastePage', index)
  else emit('removePageAt', index)
}

function onDocPointerDown(ev: Event) {
  const target = ev.target
  if (target instanceof Node && pageMenuRef.value?.contains(target)) return
  closePageMenu()
}

function onPageMenuKeydown(ev: KeyboardEvent) {
  if (ev.key === 'Escape') closePageMenu()
}

watch(pageMenu, (menu, _prev, onCleanup) => {
  if (!menu) return
  const frame = requestAnimationFrame(() => {
    document.addEventListener('pointerdown', onDocPointerDown, true)
    document.addEventListener('keydown', onPageMenuKeydown)
    window.addEventListener('scroll', closePageMenu, true)
  })
  onCleanup(() => {
    cancelAnimationFrame(frame)
    document.removeEventListener('pointerdown', onDocPointerDown, true)
    document.removeEventListener('keydown', onPageMenuKeydown)
    window.removeEventListener('scroll', closePageMenu, true)
  })
})

/** 缩略图框最大尺寸（栏宽约 148，去掉 padding） */
const THUMB_MAX_W = 112
const THUMB_MAX_H = 160

/** 拖动 / 拉伸停止多久后刷新缩略图 */
const THUMB_REFRESH_DELAY = 300

const pages = computed(() => props.data.pages ?? [])

type Snapshot = Record<string, unknown>

/**
 * 快照对象按 id 复用、只改变化字段：缩略图里的 Score 拿到新对象会整份重渲染（大曲谱数十毫秒），
 * 复用后刷新只触发位移等字段的更新。musicScore 等大对象共享引用。
 */
let snapshotCache = new Map<string, Snapshot>()
let nextCache = new Map<string, Snapshot>()

function syncSnapshot<T extends { id: string }>(source: T): T {
  const snap = snapshotCache.get(source.id) ?? shallowReactive<Snapshot>({})
  nextCache.set(source.id, snap)
  for (const key of Object.keys(snap)) {
    if (!(key in source)) delete snap[key]
  }
  for (const [key, value] of Object.entries(source)) {
    if (key === 'crop' && value && typeof value === 'object') {
      if (JSON.stringify(snap[key]) !== JSON.stringify(value)) snap[key] = { ...(value as object) }
    } else if (snap[key] !== value) {
      snap[key] = value
    }
  }
  return snap as T
}

function snapshotPage(page: SPage): SPage {
  const snap = syncSnapshot({ ...page, elements: undefined, scores: undefined })
  ;(snap as Snapshot).elements = page.elements?.map(syncSnapshot)
  ;(snap as Snapshot).scores = page.scores?.map(syncSnapshot)
  return snap as SPage
}

function snapshotPages(): SPage[] {
  nextCache = new Map()
  const result = pages.value.map(snapshotPage)
  snapshotCache = nextCache
  return result
}

/** 缩略图需要跟随的字段；不含 musicScore 内容，避免每次深遍历整份曲谱 */
function pageSignature(page: SPage): string {
  const { scores, drawings, ...rest } = page
  return JSON.stringify([
    rest,
    drawings?.length ?? 0,
    (scores ?? []).map(({ musicScore, ...frame }) => [frame, musicScore?.width, musicScore?.height])
  ])
}

/**
 * 缩略图渲染的是整页（含完整曲谱）的第二份实例；直接绑实时数据会让拖动时每帧都重绘缩略图，
 * 大曲谱下绘制开销翻倍。改为渲染快照，停止变化后再刷新。
 */
const thumbPages = shallowRef<SPage[]>(snapshotPages())
let refreshTimer: ReturnType<typeof setTimeout> | null = null

function refreshThumbs() {
  if (refreshTimer) clearTimeout(refreshTimer)
  refreshTimer = null
  thumbPages.value = snapshotPages()
}

watch(() => pages.value.map((p) => p.id).join('|'), refreshThumbs)

watch(
  () => pages.value.map(pageSignature).join('\n'),
  () => {
    if (refreshTimer) clearTimeout(refreshTimer)
    refreshTimer = setTimeout(refreshThumbs, THUMB_REFRESH_DELAY)
  }
)

onBeforeUnmount(() => {
  if (refreshTimer) clearTimeout(refreshTimer)
  closePageMenu()
})

function resolveThumb(src: string | undefined): string {
  if (!src) return ''
  return props.pdfRef?.resolveSrc(src) || src
}

/** 按最大框等比缩放，避免大页撑破缩略图栏 */
function thumbLayout(page: { width: number; height: number }) {
  const w = Math.max(1, page.width)
  const h = Math.max(1, page.height)
  const scale = Math.min(THUMB_MAX_W / w, THUMB_MAX_H / h)
  return {
    frameWidth: Math.max(1, Math.round(w * scale)),
    frameHeight: Math.max(1, Math.round(h * scale)),
    scale
  }
}
</script>

<template>
  <aside class="thumb-rail">
    <div class="thumb-rail__meta">
      <div class="thumb-rail__name">{{ data.name || t('work.title') }}</div>
      <div v-if="data.author" class="thumb-rail__author">{{ data.author }}</div>
      <div v-if="editable" class="thumb-rail__ops">
        <button type="button" @click="emit('addPage')">{{ t('work.pages.add') }}</button>
        <button type="button" @click="emit('insertPage')">{{ t('work.pages.insert') }}</button>
        <button type="button" @click="emit('removePage')">{{ t('work.pages.remove') }}</button>
        <button type="button" @click="emit('duplicatePage')">{{ t('work.pages.copy') }}</button>
      </div>
    </div>

    <div class="thumb-rail__list">
      <button
        v-for="(page, index) in thumbPages"
        :key="page.id"
        type="button"
        class="thumb-rail__item"
        :class="{ 'is-active': index === pageIndex }"
        @click="emit('select', index)"
        @contextmenu="openPageMenu(index, $event)"
      >
        <div
          class="thumb-rail__frame"
          :style="{
            width: `${thumbLayout(page).frameWidth}px`,
            height: `${thumbLayout(page).frameHeight}px`
          }"
        >
          <img
            v-if="page.thumbnail"
            class="thumb-rail__img"
            :alt="page.id"
            :src="resolveThumb(page.thumbnail)"
          />
          <div
            v-else
            class="thumb-rail__inner"
            :style="{
              width: `${page.width}px`,
              height: `${page.height}px`,
              transform: `scale(${thumbLayout(page).scale})`
            }"
          >
            <Page
              :page="page"
              thumbnail
              :resolve-src="(src) => pdfRef?.resolveSrc(src) || src"
            />
          </div>
        </div>
        <span class="thumb-rail__label">{{ index + 1 }}</span>
      </button>
    </div>

    <Teleport to="body">
      <ul
        v-if="pageMenu"
        ref="pageMenuRef"
        class="thumb-page-menu"
        role="menu"
        :style="pageMenuStyle"
        @contextmenu.prevent
      >
        <li
          class="thumb-page-menu__item"
          role="menuitem"
          @pointerdown.prevent.stop="runPageMenu('copy')"
        >
          {{ t('work.pages.copy') }}
        </li>
        <li
          class="thumb-page-menu__item"
          :class="{ 'thumb-page-menu__item--disabled': !canPaste }"
          :aria-disabled="!canPaste ? 'true' : undefined"
          role="menuitem"
          @pointerdown.prevent.stop="runPageMenu('paste')"
        >
          {{ t('work.pages.paste') }}
        </li>
        <li
          class="thumb-page-menu__item thumb-page-menu__item--danger"
          :class="{ 'thumb-page-menu__item--disabled': pages.length <= 1 }"
          :aria-disabled="pages.length <= 1 ? 'true' : undefined"
          role="menuitem"
          @pointerdown.prevent.stop="runPageMenu('delete')"
        >
          {{ t('work.pages.delete') }}
        </li>
      </ul>
    </Teleport>
  </aside>
</template>

<style scoped>
.thumb-rail {
  width: 148px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 10px;
  overflow: hidden;
  border-right: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.92);
  box-sizing: border-box;
}

.thumb-rail__meta {
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

/* 只有缩略图列表滚动，顶部名称与加页 / 插入 / 删页 / 复制按钮固定 */
.thumb-rail__list {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  scrollbar-width: none;
}

.thumb-rail__list::-webkit-scrollbar {
  display: none;
}

.thumb-rail__name {
  font-size: 13px;
  font-weight: 800;
  color: #5c4a6a;
  word-break: break-word;
}

.thumb-rail__author {
  font-size: 11px;
  color: #9a8aa8;
}

.thumb-rail__ops {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4px;
  margin-top: 6px;
}

.thumb-rail__ops button {
  min-width: 0;
  padding: 4px 0;
  border-radius: 8px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  background: #fff;
  font-size: 11px;
  font-weight: 700;
  color: #5c4a6a;
  cursor: pointer;
}

.thumb-rail__item {
  flex-shrink: 0;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  padding: 8px 6px;
  border: 2px solid transparent;
  border-radius: 12px;
  background: transparent;
  cursor: pointer;
}

.thumb-rail__item.is-active {
  border-color: #ff8fb8;
  background: rgba(255, 255, 255, 0.9);
}

.thumb-rail__frame {
  overflow: hidden;
  border-radius: 6px;
  border: 1px solid rgba(200, 180, 200, 0.45);
  background: #fff;
  max-width: 100%;
}

.thumb-rail__img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.thumb-rail__inner {
  transform-origin: top left;
  pointer-events: none;
}

.thumb-rail__label {
  font-size: 11px;
  font-weight: 700;
  color: #9a8aa8;
}
</style>

<style>
.thumb-page-menu {
  position: fixed;
  z-index: 10000;
  margin: 0;
  padding: 4px 0;
  min-width: 120px;
  list-style: none;
  background: #fff;
  border: 1px solid rgba(255, 184, 208, 0.55);
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(138, 90, 114, 0.18);
  font-size: 13px;
  font-weight: 700;
  color: #5c4a6a;
  user-select: none;
}

.thumb-page-menu__item {
  padding: 8px 14px;
  cursor: pointer;
  white-space: nowrap;
}

.thumb-page-menu__item:hover {
  background: rgba(255, 248, 251, 0.96);
}

.thumb-page-menu__item--danger {
  color: #d6336c;
}

.thumb-page-menu__item--danger:hover {
  background: rgba(255, 240, 245, 0.96);
}

.thumb-page-menu__item--disabled {
  color: #c0c4cc;
  cursor: not-allowed;
}

.thumb-page-menu__item--disabled:hover {
  background: transparent;
}

.thumb-page-menu__item--danger.thumb-page-menu__item--disabled {
  color: #f3a6bc;
}
</style>
