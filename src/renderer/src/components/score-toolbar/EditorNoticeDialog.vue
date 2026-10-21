<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EditorNoticeDialog' })

type ShortcutItem = { keys: string[]; desc: string }
type ShortcutGroup = { title: string; lead: string; items: ShortcutItem[] }

const SHORTCUT_GROUP_KEYS = ['number', 'staff', 'drum', 'tab'] as const

const { t, tm } = useI18n()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const visible = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const selectionItems = computed(() => tm('editor.noticeDialog.selectionItems') as string[])
const commonShortcutItems = computed(
  () => tm('editor.noticeDialog.commonShortcutItems') as ShortcutItem[]
)
const shortcutGroups = computed(() => {
  const groups = tm('editor.noticeDialog.shortcutGroups') as Record<string, ShortcutGroup>
  return SHORTCUT_GROUP_KEYS.map((key) => ({ key, ...groups[key]! }))
})
const standardModeItems = computed(() => tm('editor.noticeDialog.standardModeItems') as string[])
const midiItems = computed(() => tm('editor.noticeDialog.midiItems') as string[])
const tabItems = computed(() => tm('editor.noticeDialog.tabItems') as string[])
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.noticeDialog.title')"
    width="min(1080px, 92vw)"
    class="editor-notice-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <div class="editor-notice-dialog__scroll">
      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.selectionTitle') }}</h3>
        <ul class="editor-notice-dialog__list">
          <li v-for="(item, index) in selectionItems" :key="index">{{ item }}</li>
        </ul>
      </section>

      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">
          {{ t('editor.noticeDialog.commonShortcutTitle') }}
        </h3>
        <dl class="editor-notice-dialog__keys editor-notice-dialog__keys--common">
          <div
            v-for="(item, index) in commonShortcutItems"
            :key="index"
            class="editor-notice-dialog__key-row"
          >
            <dt class="editor-notice-dialog__key-cell">
              <kbd v-for="key in item.keys" :key="key">{{ key }}</kbd>
            </dt>
            <dd class="editor-notice-dialog__key-desc">{{ item.desc }}</dd>
          </div>
        </dl>
        <p class="editor-notice-dialog__note">{{ t('editor.noticeDialog.commonShortcutNote') }}</p>
      </section>

      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.standardModeTitle') }}</h3>
        <ul class="editor-notice-dialog__list">
          <li v-for="(item, index) in standardModeItems" :key="index">{{ item }}</li>
        </ul>
      </section>

      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.shortcutTitle') }}</h3>
        <div class="editor-notice-dialog__groups">
          <article
            v-for="group in shortcutGroups"
            :key="group.key"
            class="editor-notice-dialog__group"
            :class="`editor-notice-dialog__group--${group.key}`"
          >
            <h4 class="editor-notice-dialog__group-title">{{ group.title }}</h4>
            <p class="editor-notice-dialog__lead">{{ group.lead }}</p>
            <dl class="editor-notice-dialog__keys">
              <div
                v-for="(item, index) in group.items"
                :key="index"
                class="editor-notice-dialog__key-row"
              >
                <dt class="editor-notice-dialog__key-cell">
                  <kbd v-for="key in item.keys" :key="key">{{ key }}</kbd>
                </dt>
                <dd class="editor-notice-dialog__key-desc">{{ item.desc }}</dd>
              </div>
            </dl>
          </article>
        </div>
      </section>

      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.midiTitle') }}</h3>
        <ul class="editor-notice-dialog__list">
          <li v-for="(item, index) in midiItems" :key="index">{{ item }}</li>
        </ul>
      </section>

      <section class="editor-notice-dialog__section">
        <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.tabTitle') }}</h3>
        <ul class="editor-notice-dialog__list">
          <li v-for="(item, index) in tabItems" :key="index">{{ item }}</li>
        </ul>
      </section>
    </div>

    <template #footer>
      <button type="button" class="editor-notice-dialog__btn" @click="visible = false">
        {{ t('common.gotIt') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.editor-notice-dialog__scroll {
  max-height: min(70vh, 760px);
  overflow-y: auto;
  padding-right: 8px;
  margin-right: -8px;
}

.editor-notice-dialog__section {
  padding: 14px 0;
  border-bottom: 1px dashed rgba(255, 184, 208, 0.35);
}

.editor-notice-dialog__section:first-child {
  padding-top: 0;
}

.editor-notice-dialog__section:last-of-type {
  border-bottom: none;
}

.editor-notice-dialog__title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 800;
  color: #5c4a6a;
}

.editor-notice-dialog__list {
  margin: 0;
  padding-left: 1.2em;
  font-size: 13px;
  line-height: 1.7;
  color: #7a6a88;
}

.editor-notice-dialog__note {
  margin: 8px 0 0;
  font-size: 12px;
  color: #a08bb0;
}

.editor-notice-dialog__groups {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

@media (max-width: 860px) {
  .editor-notice-dialog__groups {
    grid-template-columns: minmax(0, 1fr);
  }
}

.editor-notice-dialog__group {
  padding: 14px 16px;
  border: 1px solid rgba(255, 184, 208, 0.45);
  border-radius: 14px;
  background: rgba(255, 247, 251, 0.75);
}

.editor-notice-dialog__group--staff {
  border-color: rgba(185, 168, 255, 0.5);
  background: rgba(247, 244, 255, 0.75);
}

.editor-notice-dialog__group--drum {
  border-color: rgba(255, 196, 140, 0.55);
  background: rgba(255, 249, 241, 0.75);
}

.editor-notice-dialog__group--tab {
  border-color: rgba(140, 210, 190, 0.55);
  background: rgba(242, 252, 248, 0.75);
}

.editor-notice-dialog__group-title {
  margin: 0 0 6px;
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.editor-notice-dialog__lead {
  margin: 0 0 10px;
  font-size: 12.5px;
  line-height: 1.6;
  color: #8a7898;
}

.editor-notice-dialog__keys {
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.editor-notice-dialog__keys--common {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 24px;
}

@media (max-width: 860px) {
  .editor-notice-dialog__keys--common {
    grid-template-columns: minmax(0, 1fr);
  }
}

.editor-notice-dialog__key-row {
  display: grid;
  grid-template-columns: 108px minmax(0, 1fr);
  gap: 10px;
  align-items: start;
}

.editor-notice-dialog__key-cell {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.editor-notice-dialog__key-desc {
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: #7a6a88;
}

.editor-notice-dialog__key-cell kbd {
  display: inline-block;
  min-width: 1.6em;
  padding: 1px 7px;
  border: 1px solid rgba(255, 184, 208, 0.65);
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  color: #5c4a6a;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 1px 0 rgba(122, 90, 134, 0.15);
}

.editor-notice-dialog__btn {
  min-width: 96px;
  padding: 8px 20px;
  border: none;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
}

.editor-notice-dialog__btn:hover {
  filter: brightness(1.05);
}
</style>
