<script lang="ts" setup>
import { useNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'

const { isFrozen, isDoubleScore } = useNoteSliceGameSession()
</script>

<template>
  <div
    class="note-slice-buff-overlay"
    :class="{
      'note-slice-buff-overlay--freeze': isFrozen,
      'note-slice-buff-overlay--double': isDoubleScore
    }"
    aria-hidden="true"
  >
    <div class="note-slice-buff-overlay__vignette note-slice-buff-overlay__vignette--freeze" />
    <div class="note-slice-buff-overlay__vignette note-slice-buff-overlay__vignette--double" />
  </div>
</template>

<style scoped>
.note-slice-buff-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  overflow: hidden;
}

.note-slice-buff-overlay__vignette {
  position: absolute;
  inset: 0;
  opacity: 0;
  transition: opacity 0.45s ease;
  pointer-events: none;
}

.note-slice-buff-overlay__vignette--freeze {
  background: radial-gradient(
    ellipse 82% 78% at 50% 50%,
    transparent 42%,
    rgba(120, 210, 255, 0.1) 62%,
    rgba(48, 130, 210, 0.42) 100%
  );
  box-shadow:
    inset 0 0 90px 28px rgba(90, 190, 255, 0.22),
    inset 0 0 180px 72px rgba(40, 100, 180, 0.28);
}

.note-slice-buff-overlay__vignette--double {
  background: radial-gradient(
    ellipse 80% 76% at 50% 50%,
    transparent 44%,
    rgba(255, 220, 120, 0.08) 64%,
    rgba(255, 170, 50, 0.38) 100%
  );
  box-shadow:
    inset 0 0 80px 24px rgba(255, 200, 80, 0.24),
    inset 0 0 160px 64px rgba(220, 140, 30, 0.22);
}

.note-slice-buff-overlay--freeze .note-slice-buff-overlay__vignette--freeze {
  opacity: 1;
  animation: note-slice-buff-freeze-breathe 2.4s ease-in-out infinite;
}

.note-slice-buff-overlay--double .note-slice-buff-overlay__vignette--double {
  opacity: 1;
  animation: note-slice-buff-double-breathe 1.8s ease-in-out infinite;
}

@keyframes note-slice-buff-freeze-breathe {
  0%,
  100% {
    box-shadow:
      inset 0 0 90px 28px rgba(90, 190, 255, 0.2),
      inset 0 0 180px 72px rgba(40, 100, 180, 0.24);
  }
  50% {
    box-shadow:
      inset 0 0 110px 36px rgba(120, 210, 255, 0.3),
      inset 0 0 200px 84px rgba(50, 120, 200, 0.34);
  }
}

@keyframes note-slice-buff-double-breathe {
  0%,
  100% {
    box-shadow:
      inset 0 0 80px 24px rgba(255, 200, 80, 0.2),
      inset 0 0 160px 64px rgba(220, 140, 30, 0.18);
  }
  50% {
    box-shadow:
      inset 0 0 100px 32px rgba(255, 220, 120, 0.32),
      inset 0 0 190px 78px rgba(240, 160, 40, 0.28);
  }
}
</style>
