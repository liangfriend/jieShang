<script setup lang="ts">
import { computed } from 'vue'

defineOptions({ name: 'MusicXmlNoticeDialog' })

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
    title="MusicXML 转换需知"
    width="520px"
    class="musicxml-notice-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
  >
    <p class="musicxml-notice-dialog__lead">
      由于 musicxml 文件内容丰富，本人没办法一次性完全解析。以下是当前支持的符号内容：
    </p>

    <section class="musicxml-notice-dialog__section">
      <h3 class="musicxml-notice-dialog__title">musicxml 导入为谱子</h3>
      <ul class="musicxml-notice-dialog__list">
        <li>小节谱号、调号、拍号</li>
        <li>音符、休止符、变音符号</li>
        <li>小节线、反复房子记号、连音线</li>
      </ul>
    </section>

    <section class="musicxml-notice-dialog__section">
      <h3 class="musicxml-notice-dialog__title">谱子导出为 musicxml</h3>
      <ul class="musicxml-notice-dialog__list">
        <li>小节谱号、调号、拍号</li>
        <li>音符、休止符、变音符号</li>
        <li>小节线、反复房子记号、连音线</li>
      </ul>
    </section>

    <template #footer>
      <button type="button" class="musicxml-notice-dialog__btn" @click="visible = false">
        知道了
      </button>
    </template>
  </el-dialog>
</template>

<style scoped>
.musicxml-notice-dialog__lead {
  margin: 0 0 14px;
  font-size: 13px;
  line-height: 1.6;
  color: #5c4a6a;
}

.musicxml-notice-dialog__section {
  padding: 12px 0;
  border-bottom: 1px dashed rgba(255, 184, 208, 0.35);
}

.musicxml-notice-dialog__section:last-of-type {
  border-bottom: none;
}

.musicxml-notice-dialog__title {
  margin: 0 0 8px;
  font-size: 14px;
  font-weight: 800;
  color: #5c4a6a;
}

.musicxml-notice-dialog__list {
  margin: 0;
  padding-left: 1.2em;
  font-size: 13px;
  line-height: 1.7;
  color: #7a6a88;
}

.musicxml-notice-dialog__btn {
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

.musicxml-notice-dialog__btn:hover {
  filter: brightness(1.05);
}
</style>
