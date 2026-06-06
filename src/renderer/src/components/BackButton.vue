<script setup lang="ts">
import { ArrowLeft } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const props = withDefaults(
  defineProps<{
    label?: string
    fallback?: string
  }>(),
  {
    label: '返回',
    fallback: '/'
  }
)

const router = useRouter()

function handleBack() {
  const back = window.history.state?.back
  if (back != null) {
    router.back()
    return
  }
  router.push(props.fallback)
}
</script>

<template>
  <button type="button" class="back-button" @click="handleBack">
    <el-icon class="back-button__icon"><ArrowLeft /></el-icon>
    <span>{{ label }}</span>
  </button>
</template>

<style scoped>
.back-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  color: #303133;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    background 0.15s ease;
}

.back-button:hover {
  transform: translateY(-1px);
  background: #fff;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.12);
}

.back-button__icon {
  font-size: 14px;
}
</style>
