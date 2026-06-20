<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

defineOptions({ name: 'ScoreDeleteDialog' })

const { t } = useI18n()

const visible = ref(false)

let resolveFn: ((confirmed: boolean) => void) | null = null
let settled = false

function open(): Promise<boolean> {
  return new Promise((resolve) => {
    settled = false
    resolveFn = resolve
    visible.value = true
  })
}

function settle(confirmed: boolean) {
  if (settled) return
  settled = true
  visible.value = false
  const resolve = resolveFn
  resolveFn = null
  resolve?.(confirmed)
}

function onCancel() {
  settle(false)
}

function onConfirm() {
  settle(true)
}

defineExpose({ open })
</script>

<template>
  <el-dialog
    v-model="visible"
    :title="t('scores.deleteTitle')"
    width="400px"
    class="score-delete-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="onCancel"
  >
    <p class="score-delete-dialog__text">
      {{ t('scores.deleteMessage') }}{{ t('scores.deleteWarning') }}
    </p>

    <template #footer>
      <div class="score-delete-dialog__actions">
        <button
          type="button"
          class="score-delete-dialog__btn score-delete-dialog__btn--ghost"
          @click="onCancel"
        >
          {{ t('common.cancel') }}
        </button>
        <button
          type="button"
          class="score-delete-dialog__btn score-delete-dialog__btn--danger"
          @click="onConfirm"
        >
          {{ t('common.delete') }}
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.score-delete-dialog__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #5c4a6a;
}

.score-delete-dialog__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

.score-delete-dialog__btn {
  min-width: 96px;
  padding: 8px 22px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.score-delete-dialog__btn--ghost {
  border: 1px solid rgba(201, 184, 255, 0.65);
  color: #6a5a88;
  background: rgba(255, 255, 255, 0.85);
}

.score-delete-dialog__btn--danger {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9a9a, #f56c6c);
  box-shadow: 0 4px 14px rgba(245, 108, 108, 0.32);
}
</style>

<style>
.cute-dialog.el-dialog {
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(180deg, #fff8fb 0%, #f8f0ff 100%);
}

.cute-dialog .el-dialog__header {
  padding: 20px 24px 8px;
}

.cute-dialog .el-dialog__title {
  font-weight: 800;
  color: #5c4a6a;
}

.cute-dialog .el-dialog__body {
  padding: 8px 24px 12px;
}

.cute-dialog .el-dialog__footer {
  padding: 8px 24px 20px;
}
</style>
