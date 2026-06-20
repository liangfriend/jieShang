<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'EditorNoticeDialog' })

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
const importItems = computed(() => tm('editor.noticeDialog.importItems') as string[])
const exportItems = computed(() => tm('editor.noticeDialog.exportItems') as string[])
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('editor.noticeDialog.title')"
    width="560px"
    class="editor-notice-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.selectionTitle') }}</h3>
      <ul class="editor-notice-dialog__list">
        <li v-for="(item, index) in selectionItems" :key="index">{{ item }}</li>
      </ul>
    </section>

    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.importTitle') }}</h3>
      <p class="editor-notice-dialog__lead">
        {{ t('editor.noticeDialog.importLead') }}
      </p>
      <ul class="editor-notice-dialog__list">
        <li v-for="(item, index) in importItems" :key="index">{{ item }}</li>
      </ul>
    </section>

    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">{{ t('editor.noticeDialog.exportTitle') }}</h3>
      <ul class="editor-notice-dialog__list">
        <li v-for="(item, index) in exportItems" :key="index">{{ item }}</li>
      </ul>
    </section>

    <template #footer>
      <button type="button" class="editor-notice-dialog__btn" @click="visible = false">
        {{ t('common.gotIt') }}
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.editor-notice-dialog__lead {
  margin: 0 0 10px;
  font-size: 13px;
  line-height: 1.6;
  color: #5c4a6a;
}

.editor-notice-dialog__section {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(255, 184, 208, 0.35);
}

.editor-notice-dialog__section:last-of-type {
  border-bottom: none;
}

.editor-notice-dialog__title {
  margin: 0 0 8px;
  font-size: 14px;
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

.editor-notice-dialog__list kbd {
  display: inline-block;
  min-width: 1.4em;
  padding: 0 6px;
  border: 1px solid rgba(255, 184, 208, 0.55);
  border-radius: 6px;
  font-family: inherit;
  font-size: 12px;
  line-height: 1.5;
  color: #5c4a6a;
  background: rgba(255, 255, 255, 0.9);
  box-shadow: 0 1px 0 rgba(122, 90, 134, 0.12);
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
