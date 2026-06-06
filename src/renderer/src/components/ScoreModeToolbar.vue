<script setup lang="ts">
import { EditPen, VideoPlay } from '@element-plus/icons-vue'
import { useRoute, useRouter } from 'vue-router'
import BackButton from '@renderer/components/BackButton.vue'
import { buildScoreRouteQuery } from '@renderer/utils/scoreRoute'

const props = defineProps<{
  mode: 'edit' | 'play'
}>()

const route = useRoute()
const router = useRouter()

function switchMode() {
  const targetName = props.mode === 'edit' ? 'play' : 'edit'
  router.replace({
    name: targetName,
    query: buildScoreRouteQuery(route)
  })
}
</script>

<template>
  <footer class="score-mode-toolbar">
    <div class="score-mode-toolbar__side">
      <BackButton fallback="/" />
    </div>
    <button type="button" class="score-mode-toolbar__switch" @click="switchMode">
      <el-icon>
        <VideoPlay v-if="mode === 'edit'" />
        <EditPen v-else />
      </el-icon>
      <span>{{ mode === 'edit' ? '播放模式' : '编辑模式' }}</span>
    </button>
    <div class="score-mode-toolbar__side score-mode-toolbar__side--spacer" aria-hidden="true" />
  </footer>
</template>

<style scoped>
.score-mode-toolbar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
  gap: 12px;
  padding: 10px 16px calc(10px + env(safe-area-inset-bottom, 0px));
  border-top: 1px solid rgba(255, 184, 208, 0.35);
  background: rgba(255, 248, 251, 0.94);
  backdrop-filter: blur(8px);
  box-shadow: 0 -4px 24px rgba(200, 140, 180, 0.1);
}

.score-mode-toolbar__side {
  display: flex;
  align-items: center;
}

.score-mode-toolbar__side--spacer {
  visibility: hidden;
  pointer-events: none;
}

.score-mode-toolbar__switch {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 8px 18px;
  border: 1px solid rgba(201, 184, 255, 0.55);
  border-radius: 999px;
  background: linear-gradient(90deg, rgba(255, 184, 208, 0.35), rgba(201, 184, 255, 0.35));
  color: #5c4a6a;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease;
}

.score-mode-toolbar__switch:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(200, 140, 180, 0.2);
}
</style>
