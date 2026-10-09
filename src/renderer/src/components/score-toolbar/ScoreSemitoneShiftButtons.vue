<script setup lang="ts">
import { useI18n } from 'vue-i18n'

withDefaults(
  defineProps<{
    variant?: 'inline' | 'toolbar'
    disabled?: boolean
  }>(),
  {
    variant: 'toolbar',
    disabled: false
  }
)

const emit = defineEmits<{
  shift: [semitones: 1 | -1]
}>()

const { t } = useI18n()

function onRaise() {
  emit('shift', 1)
}

function onLower() {
  emit('shift', -1)
}
</script>

<template>
  <div
    class="score-semitone-shift"
    :class="{
      'score-semitone-shift--inline': variant === 'inline',
      'score-semitone-shift--toolbar': variant === 'toolbar'
    }"
  >
    <template v-if="variant === 'toolbar'">
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="disabled"
        @click="onRaise"
      >
        {{ t('editor.toolbar.raiseSemitone') }}
      </button>
      <button
        type="button"
        class="score-toolbar__btn"
        :disabled="disabled"
        @click="onLower"
      >
        {{ t('editor.toolbar.lowerSemitone') }}
      </button>
    </template>
    <template v-else>
      <el-button class="toolbar-btn" size="small" :disabled="disabled" @click="onRaise">
        {{ t('editor.toolbar.raiseSemitone') }}
      </el-button>
      <el-button class="toolbar-btn" size="small" :disabled="disabled" @click="onLower">
        {{ t('editor.toolbar.lowerSemitone') }}
      </el-button>
    </template>
  </div>
</template>

<style scoped>
.score-semitone-shift--toolbar {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.score-semitone-shift--inline {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
</style>
