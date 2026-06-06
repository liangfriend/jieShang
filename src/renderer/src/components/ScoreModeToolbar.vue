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
  border-top: 1px solid rgba(0, 0, 0, 0.08);
  background: rgba(255, 255, 255, 0.94);
  backdrop-filter: blur(8px);
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
  border: 1px solid rgba(64, 158, 255, 0.35);
  border-radius: 999px;
  background: rgba(64, 158, 255, 0.08);
  color: #409eff;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    background 0.15s ease,
    transform 0.15s ease;
}

.score-mode-toolbar__switch:hover {
  background: rgba(64, 158, 255, 0.16);
  transform: translateY(-1px);
}
</style>
