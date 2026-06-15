<script lang="ts" setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { formatNoteSliceExtremeElapsed } from '@renderer/views/noteSlice/noteSliceGameMode'

const props = defineProps<{
  modelValue: boolean
  /** 存活时间（ms） */
  survivalMs: number
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  playAgain: []
}>()

const router = useRouter()

const survivalLabel = computed(() => formatNoteSliceExtremeElapsed(props.survivalMs))

function close(): void {
  emit('update:modelValue', false)
}

function onPlayAgain(): void {
  close()
  emit('playAgain')
}

function onGoHome(): void {
  close()
  router.push('/')
}
</script>

<template>
  <el-dialog
    :model-value="modelValue"
    title="游戏结束"
    width="420px"
    class="note-slice-game-over-dialog"
    append-to-body
    align-center
    :close-on-click-modal="false"
    :close-on-press-escape="false"
    :show-close="false"
    @update:model-value="emit('update:modelValue', $event)"
  >
    <p class="note-slice-game-over-dialog__desc">存活时间</p>
    <p class="note-slice-game-over-dialog__score">{{ survivalLabel }}</p>

    <template #footer>
      <div class="note-slice-game-over-dialog__actions">
        <el-button type="primary" @click="onPlayAgain">再来一局</el-button>
        <el-button @click="onGoHome">回到首页</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<style scoped>
.note-slice-game-over-dialog__desc {
  margin: 0;
  text-align: center;
  color: #909399;
  font-size: 14px;
}

.note-slice-game-over-dialog__score {
  margin: 12px 0 0;
  text-align: center;
  font-size: 48px;
  font-weight: 800;
  line-height: 1;
  color: #303133;
  font-variant-numeric: tabular-nums;
}

.note-slice-game-over-dialog__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}
</style>
