<script lang="ts" setup>
import BackButton from '@renderer/components/BackButton.vue'

import { NOTE_SLICE_COMBO_DISPLAY_MIN } from '@renderer/views/noteSlice/noteSliceScoring'

import { useNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'

const { score, combo } = useNoteSliceGameSession()
</script>

<template>
  <header class="note-slice-game-hud">
    <!-- 左：返回 -->

    <div class="note-slice-game-hud__left">
      <BackButton class="note-slice-game-hud__back" fallback="/" />
    </div>

    <!-- 中：分数 -->

    <div class="note-slice-game-hud__center">
      <span class="note-slice-game-hud__score">{{ score }}</span>
    </div>

    <!-- 右：连击（三连击起显示） -->

    <div class="note-slice-game-hud__right">
      <span v-if="combo >= NOTE_SLICE_COMBO_DISPLAY_MIN" class="note-slice-game-hud__combo">
        {{ combo }} 连击
      </span>
    </div>
  </header>
</template>

<style scoped>
.note-slice-game-hud {
  display: grid;

  grid-template-columns: 1fr auto 1fr;

  align-items: center;

  width: 100%;

  padding: 16px;

  box-sizing: border-box;

  pointer-events: none;
}

.note-slice-game-hud__left {
  justify-self: start;
}

.note-slice-game-hud__center {
  justify-self: center;
}

.note-slice-game-hud__right {
  justify-self: end;

  min-width: 88px;

  text-align: right;
}

.note-slice-game-hud__back {
  pointer-events: auto;
}

.note-slice-game-hud__score {
  font-size: 28px;

  font-weight: 700;

  line-height: 1;

  color: #fff;

  text-shadow: 0 0 16px rgba(255, 220, 120, 0.45);
}

.note-slice-game-hud__combo {
  font-size: 18px;

  font-weight: 600;

  line-height: 1;

  color: #ffd978;

  white-space: nowrap;
}
</style>
