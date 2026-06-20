<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'EditorNoticeDialog' })

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
</script>

<template>
  <el-dialog
    v-model="visible"
    title="编辑须知"
    width="560px"
    class="editor-notice-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">选中与删除</h3>
      <ul class="editor-notice-dialog__list">
        <li>点击曲谱上的元素即可选中；按 <kbd>Esc</kbd> 可退出选中状态。</li>
        <li>选中后按 <kbd>Delete</kbd> 或 <kbd>Backspace</kbd> 可删除当前选中项。</li>
        <li>
          音符上的部分符号无法在谱面上直接选中，请在右侧<strong>音符属性栏</strong>中删除。
        </li>
        <li>
          反复房子（volta）和连音线（slur）可以选中并删除，但需要精准点击到符号本身。
        </li>
        <li>小节、单谱表、复谱表在各自只剩最后一个时不允许删除（对应删除按钮会变灰）。</li>
      </ul>
    </section>

    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">MusicXML 导入为谱子</h3>
      <p class="editor-notice-dialog__lead">
        由于 musicxml 文件内容丰富，本人没办法一次性完全解析。以下是当前支持的符号内容：
      </p>
      <ul class="editor-notice-dialog__list">
        <li>小节谱号、调号、拍号</li>
        <li>音符、休止符、变音符号</li>
        <li>小节线、反复房子记号、连音线</li>
      </ul>
    </section>

    <section class="editor-notice-dialog__section">
      <h3 class="editor-notice-dialog__title">谱子导出为 musicxml</h3>
      <ul class="editor-notice-dialog__list">
        <li>小节谱号、调号、拍号</li>
        <li>音符、休止符、变音符号</li>
        <li>小节线、反复房子记号、连音线</li>
      </ul>
    </section>

    <template #footer>
      <button type="button" class="editor-notice-dialog__btn" @click="visible = false">
        知道了
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
