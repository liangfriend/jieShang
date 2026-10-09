<script lang="ts" setup>
import type { MusicScore } from '@deciphony/renderer'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  expandSpanLeft,
  expandSpanRight,
  getSpanResizeState,
  resetSpanHorizontalOffset,
  shrinkSpanLeft,
  shrinkSpanRight,
  type SpanSymbol
} from '../renderEditSpanResize'

const props = defineProps<{
  musicScore: MusicScore
  symbol: SpanSymbol
}>()

const { t } = useI18n()

/** 依赖 startId/endId，保证扩/缩后按钮禁用态刷新 */
const state = computed(() => {
  void props.symbol.startId
  void props.symbol.endId
  return getSpanResizeState(props.musicScore, props.symbol)
})
</script>

<template>
  <section class="span-resize">
    <div class="span-resize__label">{{ t('editor.spanSymbol.coverage') }}</div>
    <div class="span-resize__row">
      <el-button
        size="small"
        :disabled="!state.canExpandLeft"
        @click="expandSpanLeft(musicScore, symbol)"
      >
        {{ t('editor.spanSymbol.expandLeft') }}
      </el-button>
      <el-button
        size="small"
        :disabled="!state.canExpandRight"
        @click="expandSpanRight(musicScore, symbol)"
      >
        {{ t('editor.spanSymbol.expandRight') }}
      </el-button>
      <el-button
        size="small"
        :disabled="!state.canShrinkLeft"
        @click="shrinkSpanLeft(musicScore, symbol)"
      >
        {{ t('editor.spanSymbol.shrinkLeft') }}
      </el-button>
      <el-button
        size="small"
        :disabled="!state.canShrinkRight"
        @click="shrinkSpanRight(musicScore, symbol)"
      >
        {{ t('editor.spanSymbol.shrinkRight') }}
      </el-button>
      <el-button size="small" @click="resetSpanHorizontalOffset(musicScore, symbol)">
        {{ t('editor.spanSymbol.resetAlignment') }}
      </el-button>
    </div>
  </section>
</template>

<style scoped>
.span-resize {
  margin-bottom: 14px;
}

.span-resize__label {
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #606266;
}

.span-resize__row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.span-resize__row .el-button + .el-button {
  margin-left: 0;
}
</style>
