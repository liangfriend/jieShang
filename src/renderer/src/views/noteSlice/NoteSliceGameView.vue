<script lang="ts" setup>
import NoteSliceGameHud from '@renderer/views/noteSlice/NoteSliceGameHud.vue'
import NoteSliceGameLayer from '@renderer/views/noteSlice/NoteSliceGameLayer.vue'
import NoteSliceStarfield from '@renderer/views/noteSlice/NoteSliceStarfield.vue'
import { provideNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'

// 页面级 session：分数、连击、音符块生成批次
provideNoteSliceGameSession()
</script>

<template>
  <div class="note-slice-game">
    <div class="stack">
      <!-- 背景层：星空 -->
      <div class="stackItem stackItem--bg">
        <NoteSliceStarfield />
      </div>

      <!-- 游戏层：音符块 + 清除特效 -->
      <div class="stackItem stackItem--game">
        <NoteSliceGameLayer />
      </div>

      <!-- UI 层：返回、分数、连击 -->
      <div class="stackItem stackItem--ui">
        <NoteSliceGameHud />
      </div>
    </div>
  </div>
</template>

<style scoped>
.note-slice-game {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  background: #070818;
}

.stack {
  position: relative;
  width: 100%;
  height: 100%;
}

.stackItem {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.stackItem--bg {
  z-index: 0;
}

.stackItem--game {
  z-index: 1;
  pointer-events: none;
}

.stackItem--game > * {
  pointer-events: auto;
}

.stackItem--ui {
  z-index: 2;
  pointer-events: none;
}
</style>
