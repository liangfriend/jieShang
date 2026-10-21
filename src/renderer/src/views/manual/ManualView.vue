<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, ArrowRight, Search } from '@element-plus/icons-vue'
import type { TreeInstance } from 'element-plus'
import BackButton from '@renderer/components/BackButton.vue'
import { resolveAppLocale } from '@renderer/i18n/locale'
import {
  MANUAL_FLAT,
  MANUAL_TREE,
  findManualNode,
  getManualAncestors,
  getManualPageSource,
  getManualPageSummary,
  getManualTitle,
  type ManualNode
} from './manualTree'
import { renderManualMarkdown } from './renderManualMarkdown'

defineOptions({ name: 'ManualView' })

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const appLocale = computed(() => resolveAppLocale(locale.value))
const titleOf = (id: string): string => getManualTitle(id, appLocale.value)

const treeRef = ref<TreeInstance>()
const contentRef = ref<HTMLElement>()
const keyword = ref('')

const treeData = [MANUAL_TREE]
const treeProps = computed(() => ({
  label: (data: ManualNode) => getManualTitle(data.id, appLocale.value),
  children: 'children'
}))
const defaultExpandedKeys = [MANUAL_TREE.id, ...(MANUAL_TREE.children ?? []).map((n) => n.id)]

const currentId = computed(() => {
  const raw = route.query.page
  const id = typeof raw === 'string' ? raw : ''
  return findManualNode(id) ? id : MANUAL_TREE.id
})

const currentNode = computed(() => findManualNode(currentId.value) ?? MANUAL_TREE)
const ancestors = computed(() => getManualAncestors(currentId.value))
const pageHtml = computed(() =>
  renderManualMarkdown(getManualPageSource(currentId.value, appLocale.value))
)

const childCards = computed(() =>
  (currentNode.value.children ?? []).map((child) => ({
    id: child.id,
    title: titleOf(child.id),
    summary: getManualPageSummary(child.id, appLocale.value)
  }))
)

const flatIndex = computed(() => MANUAL_FLAT.findIndex((n) => n.id === currentId.value))
const prevNode = computed(() => (flatIndex.value > 0 ? MANUAL_FLAT[flatIndex.value - 1] : null))
const nextNode = computed(() =>
  flatIndex.value >= 0 && flatIndex.value < MANUAL_FLAT.length - 1
    ? MANUAL_FLAT[flatIndex.value + 1]
    : null
)

const searchText = computed(
  () =>
    new Map(
      MANUAL_FLAT.map((n) => [
        n.id,
        `${titleOf(n.id)}\n${getManualPageSource(n.id, appLocale.value)}`.toLowerCase()
      ])
    )
)

const hasSearchResult = computed(() => {
  const q = keyword.value.trim().toLowerCase()
  if (!q) return true
  return MANUAL_FLAT.some((n) => searchText.value.get(n.id)?.includes(q))
})

function filterNode(value: string, data: ManualNode): boolean {
  const q = value.trim().toLowerCase()
  if (!q) return true
  return searchText.value.get(data.id)?.includes(q) ?? false
}

function openPage(id: string) {
  if (!findManualNode(id) || id === currentId.value) return
  router.replace({ query: { ...route.query, page: id } })
}

function onNodeClick(data: ManualNode) {
  openPage(data.id)
}

function onContentClick(event: MouseEvent) {
  const link = (event.target as HTMLElement).closest<HTMLElement>('.manual-link')
  const id = link?.dataset.page
  if (id) openPage(id)
}

function onContentKeydown(event: KeyboardEvent) {
  if (event.key !== 'Enter') return
  onContentClick(event as unknown as MouseEvent)
}

function syncTreeSelection(id: string) {
  const tree = treeRef.value
  if (!tree) return
  tree.setCurrentKey(id)
  let parent = tree.getNode(id)?.parent
  while (parent && parent.level > 0) {
    parent.expand()
    parent = parent.parent
  }
}

watch(keyword, (value) => treeRef.value?.filter(value))

watch(
  currentId,
  async (id) => {
    await nextTick()
    syncTreeSelection(id)
    contentRef.value?.scrollTo({ top: 0 })
  },
  { immediate: true }
)
</script>

<template>
  <div class="manual-page">
    <header class="manual-page__header">
      <BackButton fallback="/" />
      <h1 class="manual-page__title">{{ t('manual.title') }}</h1>
      <el-input
        v-model="keyword"
        class="manual-page__search"
        :placeholder="t('manual.searchPlaceholder')"
        :prefix-icon="Search"
        clearable
      />
    </header>

    <div class="manual-page__body">
      <aside class="manual-page__nav">
        <el-tree
          ref="treeRef"
          :data="treeData"
          :props="treeProps"
          node-key="id"
          :default-expanded-keys="defaultExpandedKeys"
          :current-node-key="currentId"
          :expand-on-click-node="false"
          :filter-node-method="filterNode"
          highlight-current
          class="manual-tree"
          @node-click="onNodeClick"
        />
        <p v-if="!hasSearchResult" class="manual-page__empty">{{ t('manual.noResult') }}</p>
      </aside>

      <main ref="contentRef" class="manual-page__content">
        <article class="manual-article">
          <nav v-if="ancestors.length" class="manual-breadcrumb">
            <template v-for="node in ancestors" :key="node.id">
              <button type="button" class="manual-breadcrumb__item" @click="openPage(node.id)">
                {{ titleOf(node.id) }}
              </button>
              <span class="manual-breadcrumb__sep">/</span>
            </template>
            <span class="manual-breadcrumb__current">{{ titleOf(currentNode.id) }}</span>
          </nav>

          <h1 class="manual-article__title">{{ titleOf(currentNode.id) }}</h1>

          <!-- eslint-disable-next-line vue/no-v-html -->
          <div class="manual-md" @click="onContentClick" @keydown="onContentKeydown" v-html="pageHtml" />

          <section v-if="childCards.length" class="manual-children">
            <h2 class="manual-children__title">{{ t('manual.chapterContents') }}</h2>
            <div class="manual-children__grid">
              <button
                v-for="child in childCards"
                :key="child.id"
                type="button"
                class="manual-child-card"
                @click="openPage(child.id)"
              >
                <span class="manual-child-card__title">{{ child.title }}</span>
                <span v-if="child.summary" class="manual-child-card__desc">{{ child.summary }}</span>
              </button>
            </div>
          </section>

          <footer class="manual-pager">
            <button
              v-if="prevNode"
              type="button"
              class="manual-pager__btn"
              @click="openPage(prevNode.id)"
            >
              <el-icon><ArrowLeft /></el-icon>
              <span class="manual-pager__label">{{ t('manual.prev') }}</span>
              <span class="manual-pager__name">{{ titleOf(prevNode.id) }}</span>
            </button>
            <span v-else />
            <button
              v-if="nextNode"
              type="button"
              class="manual-pager__btn manual-pager__btn--next"
              @click="openPage(nextNode.id)"
            >
              <span class="manual-pager__label">{{ t('manual.next') }}</span>
              <span class="manual-pager__name">{{ titleOf(nextNode.id) }}</span>
              <el-icon><ArrowRight /></el-icon>
            </button>
          </footer>
        </article>
      </main>
    </div>
  </div>
</template>

<style scoped>
.manual-page {
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #5c4a6a;
  background: linear-gradient(145deg, #fff5f9 0%, #f3ebff 45%, #e8f4ff 100%);
}

.manual-page__header {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.86);
}

.manual-page__title {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.manual-page__search {
  width: 260px;
  margin-left: auto;
}

.manual-page__body {
  flex: 1;
  min-height: 0;
  display: flex;
}

.manual-page__nav {
  flex-shrink: 0;
  width: 260px;
  overflow: auto;
  padding: 12px 8px;
  box-sizing: border-box;
  border-right: 1px solid rgba(201, 184, 255, 0.35);
  background: rgba(255, 255, 255, 0.55);
}

.manual-page__empty {
  margin: 12px;
  font-size: 13px;
  color: #9a8aa8;
}

.manual-tree {
  --el-tree-node-hover-bg-color: rgba(255, 184, 208, 0.18);
  background: transparent;
  color: #5c4a6a;
}

.manual-tree :deep(.el-tree-node__content) {
  height: 32px;
  border-radius: 8px;
}

.manual-tree :deep(.el-tree-node.is-current > .el-tree-node__content) {
  background: rgba(201, 184, 255, 0.35);
  font-weight: 700;
}

.manual-page__content {
  flex: 1;
  min-width: 0;
  overflow: auto;
  padding: 24px 32px 40px;
  box-sizing: border-box;
}

.manual-article {
  max-width: 880px;
  margin: 0 auto;
  padding: 28px 36px 24px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.88);
  box-shadow: 0 8px 32px rgba(200, 140, 180, 0.16);
}

.manual-breadcrumb {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px;
  margin-bottom: 8px;
  font-size: 13px;
  color: #9a8aa8;
}

.manual-breadcrumb__item {
  padding: 0;
  border: none;
  background: none;
  color: #a58bff;
  font-size: 13px;
  cursor: pointer;
}

.manual-breadcrumb__item:hover {
  text-decoration: underline;
}

.manual-article__title {
  margin: 0 0 16px;
  font-size: 26px;
  font-weight: 800;
}

.manual-children {
  margin-top: 28px;
}

.manual-children__title {
  margin: 0 0 12px;
  font-size: 17px;
}

.manual-children__grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
}

.manual-child-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 14px 16px;
  border: 2px solid rgba(201, 184, 255, 0.4);
  border-radius: 14px;
  background: linear-gradient(160deg, #fff 0%, #f8f0ff 100%);
  color: #5c4a6a;
  text-align: left;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.manual-child-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(201, 184, 255, 0.3);
}

.manual-child-card__title {
  font-size: 15px;
  font-weight: 700;
}

.manual-child-card__desc {
  font-size: 12px;
  line-height: 1.5;
  color: #9a8aa8;
}

.manual-pager {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-top: 32px;
  padding-top: 16px;
  border-top: 1px dashed rgba(201, 184, 255, 0.6);
}

.manual-pager__btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  max-width: 48%;
  padding: 8px 14px;
  border: 1px solid rgba(201, 184, 255, 0.6);
  border-radius: 999px;
  background: #fff;
  color: #5c4a6a;
  font-size: 13px;
  cursor: pointer;
}

.manual-pager__btn:hover {
  background: #f8f0ff;
}

.manual-pager__label {
  color: #9a8aa8;
}

.manual-pager__name {
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

/* 正文由 v-html 渲染，需穿透 scoped */
.manual-md {
  font-size: 14px;
  line-height: 1.8;
}

.manual-md :deep(h2) {
  margin: 28px 0 10px;
  padding-left: 10px;
  border-left: 4px solid #ff8fb8;
  font-size: 19px;
}

.manual-md :deep(h3) {
  margin: 20px 0 8px;
  font-size: 16px;
}

.manual-md :deep(h4) {
  margin: 16px 0 6px;
  font-size: 14px;
}

.manual-md :deep(p) {
  margin: 8px 0;
}

.manual-md :deep(ul),
.manual-md :deep(ol) {
  margin: 6px 0;
  padding-left: 22px;
}

.manual-md :deep(li) {
  margin: 3px 0;
}

.manual-md :deep(strong) {
  color: #d6578c;
}

.manual-md :deep(code) {
  padding: 1px 6px;
  border: 1px solid rgba(201, 184, 255, 0.6);
  border-radius: 6px;
  background: #f8f0ff;
  font-family: Consolas, 'Courier New', monospace;
  font-size: 13px;
}

.manual-md :deep(pre) {
  margin: 10px 0;
  padding: 12px 14px;
  overflow: auto;
  border-radius: 10px;
  background: #f6f1fb;
}

.manual-md :deep(pre code) {
  padding: 0;
  border: none;
  background: none;
  white-space: pre;
}

.manual-md :deep(.manual-tip) {
  margin: 12px 0;
  padding: 4px 14px;
  border-left: 4px solid #c9b8ff;
  border-radius: 8px;
  background: rgba(243, 235, 255, 0.7);
}

.manual-md :deep(.manual-figure) {
  margin: 14px 0;
  text-align: center;
}

.manual-md :deep(.manual-figure img) {
  max-width: 100%;
  border: 1px solid rgba(201, 184, 255, 0.45);
  border-radius: 10px;
  background: #fff;
}

.manual-md :deep(.manual-figure figcaption) {
  margin-top: 6px;
  color: #8a7fa8;
  font-size: 12px;
}

.manual-md :deep(.manual-table) {
  margin: 12px 0;
  overflow-x: auto;
}

.manual-md :deep(table) {
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
}

.manual-md :deep(th),
.manual-md :deep(td) {
  padding: 6px 10px;
  border: 1px solid rgba(201, 184, 255, 0.45);
  text-align: left;
  vertical-align: top;
}

.manual-md :deep(th) {
  background: rgba(243, 235, 255, 0.8);
  font-weight: 700;
}

.manual-md :deep(.manual-link) {
  color: #a58bff;
  font-weight: 600;
  cursor: pointer;
  text-decoration: underline dotted;
}

.manual-md :deep(.manual-link:hover) {
  color: #ff8fb8;
}
</style>
