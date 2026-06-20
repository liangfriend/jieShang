<script setup lang="ts">
import { ref } from 'vue'

defineOptions({ name: 'NotationTypeConvertDialog' })

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
    title="切换曲谱类型"
    width="440px"
    class="notation-convert-dialog cute-dialog"
    append-to-body
    align-center
    destroy-on-close
    :close-on-click-modal="false"
    @close="onCancel"
  >
    <p class="notation-convert-dialog__text">
      切换后播放信息会尽量保持一致，但谱面样式与部分记谱细节可能丢失，且此操作不可撤销。
    </p>

    <template #footer>
      <div class="notation-convert-dialog__actions">
        <button type="button" class="notation-convert-dialog__btn notation-convert-dialog__btn--ghost" @click="onCancel">
          取消
        </button>
        <button type="button" class="notation-convert-dialog__btn notation-convert-dialog__btn--primary" @click="onConfirm">
          确定
        </button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.notation-convert-dialog__text {
  margin: 0;
  font-size: 14px;
  line-height: 1.7;
  color: #5c4a6a;
}

.notation-convert-dialog__actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.notation-convert-dialog__btn {
  min-width: 88px;
  padding: 8px 20px;
  border-radius: 999px;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
}

.notation-convert-dialog__btn--ghost {
  border: 1px solid rgba(201, 184, 255, 0.65);
  color: #6a5a88;
  background: rgba(255, 255, 255, 0.85);
}

.notation-convert-dialog__btn--primary {
  border: none;
  color: #fff;
  background: linear-gradient(135deg, #ff9ec5, #c9b8ff);
  box-shadow: 0 4px 14px rgba(255, 158, 197, 0.35);
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
