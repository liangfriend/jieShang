<script lang="ts" setup>
import { computed } from 'vue'
import BackButton from '@renderer/components/BackButton.vue'
import {
  formatNoteSliceArcadeTimeRemaining,
  formatNoteSliceExtremeElapsed,
  NOTE_SLICE_ENDLESS_LIVES,
  NOTE_SLICE_EXTREME_LIVES
} from '@renderer/views/noteSlice/noteSliceGameMode'
import { NOTE_SLICE_COMBO_DISPLAY_MIN } from '@renderer/views/noteSlice/noteSliceScoring'
import { useNoteSliceGameSession } from '@renderer/views/noteSlice/useNoteSliceGameSession'

const { mode, score, combo, timeRemainingMs, lives, passTimeMs, isFrozen, isDoubleScore } =
  useNoteSliceGameSession()

const showBuffUi = computed(
  () => mode !== 'extreme' && (isFrozen.value || isDoubleScore.value)
)

const arcadeTimeLabel = computed(() => formatNoteSliceArcadeTimeRemaining(timeRemainingMs.value))
const extremeElapsedLabel = computed(() => formatNoteSliceExtremeElapsed(passTimeMs.value))
</script>

<template>
  <header class="note-slice-game-hud">
    <!-- 左：返回 + 模式信息（街机倒计时 / 无限生命） -->
    <div class="note-slice-game-hud__left">
      <BackButton class="note-slice-game-hud__back" fallback="/" />

      <span v-if="mode === 'arcade'" class="note-slice-game-hud__timer">{{ arcadeTimeLabel }}</span>

      <div v-else-if="mode === 'endless'" class="note-slice-game-hud__lives" aria-label="剩余生命">
        <span
          v-for="heartIndex in NOTE_SLICE_ENDLESS_LIVES"
          :key="heartIndex"
          class="note-slice-game-hud__heart"
          :class="{ 'is-active': heartIndex <= lives }"
        >
          ♥
        </span>
      </div>

      <div v-else-if="mode === 'extreme'" class="note-slice-game-hud__extreme-meta">
        <div class="note-slice-game-hud__lives" aria-label="剩余生命">
          <span
            v-for="heartIndex in NOTE_SLICE_EXTREME_LIVES"
            :key="heartIndex"
            class="note-slice-game-hud__heart"
            :class="{ 'is-active': heartIndex <= lives }"
          >
            ♥
          </span>
        </div>
        <span class="note-slice-game-hud__timer note-slice-game-hud__timer--extreme">
          {{ extremeElapsedLabel }}
        </span>
      </div>
    </div>

    <!-- 中：分数（极限模式不计分，不显示） -->
    <div v-if="mode !== 'extreme'" class="note-slice-game-hud__center">
      <span class="note-slice-game-hud__score">{{ score }}</span>
    </div>
    <div v-else class="note-slice-game-hud__center" />

    <!-- 右：增益状态 + 连击 -->
    <div class="note-slice-game-hud__right">
      <div v-if="showBuffUi" class="note-slice-game-hud__buffs" role="status">
        <span v-if="isFrozen" class="note-slice-game-hud__buff note-slice-game-hud__buff--freeze">
          <span aria-hidden="true">❄</span>
          减速
        </span>
        <span
          v-if="isDoubleScore"
          class="note-slice-game-hud__buff note-slice-game-hud__buff--double"
        >
          <span aria-hidden="true">×2</span>
          加倍
        </span>
      </div>

      <span
        v-if="mode !== 'extreme' && combo >= NOTE_SLICE_COMBO_DISPLAY_MIN"
        class="note-slice-game-hud__combo"
      >
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
  display: flex;
  align-items: center;
  gap: 12px;
  justify-self: start;
}

.note-slice-game-hud__extreme-meta {
  display: flex;
  align-items: center;
  gap: 14px;
}

.note-slice-game-hud__center {
  justify-self: center;
}

.note-slice-game-hud__right {
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  justify-self: end;
  min-width: 88px;
  text-align: right;
}

.note-slice-game-hud__buffs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.note-slice-game-hud__buff {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  letter-spacing: 0.03em;
  color: #fff;
  white-space: nowrap;
  animation: note-slice-hud-buff-in 0.3s ease-out;
}

.note-slice-game-hud__buff--freeze {
  border: 1px solid rgba(160, 230, 255, 0.55);
  background: rgba(48, 120, 190, 0.62);
  box-shadow: 0 0 14px rgba(100, 200, 255, 0.3);
}

.note-slice-game-hud__buff--double {
  border: 1px solid rgba(255, 220, 120, 0.6);
  background: rgba(180, 120, 20, 0.58);
  box-shadow: 0 0 14px rgba(255, 200, 80, 0.3);
}

@keyframes note-slice-hud-buff-in {
  from {
    opacity: 0;
    transform: scale(0.92);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.note-slice-game-hud__back {
  pointer-events: auto;
}

.note-slice-game-hud__timer {
  font-size: 22px;
  font-weight: 700;
  line-height: 1;
  color: #fff;
  font-variant-numeric: tabular-nums;
  text-shadow: 0 0 12px rgba(255, 220, 120, 0.35);
}

.note-slice-game-hud__timer--extreme {
  min-width: 7ch;
  text-shadow: 0 0 12px rgba(120, 255, 180, 0.35);
}

.note-slice-game-hud__lives {
  display: flex;
  align-items: center;
  gap: 4px;
}

.note-slice-game-hud__heart {
  font-size: 20px;
  line-height: 1;
  color: rgba(255, 255, 255, 0.25);
}

.note-slice-game-hud__heart.is-active {
  color: #ff6b8a;
  text-shadow: 0 0 10px rgba(255, 107, 138, 0.45);
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
