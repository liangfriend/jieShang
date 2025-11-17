<script setup lang="ts">
import { computed } from 'vue'

// props：传入菜单列表
const props = defineProps({
  items: {
    type: Array as () => Array<{
      label: string
      icon: any
      value: string | number
    }>,
    default: () => []
  },
  modelValue: {
    type: [String, Number],
    default: ''
  },
  width: {
    type: String,
    default: '150px'
  },
  height: {
    type: String,
    default: '500px'
  },
  size: {
    type: String,
    default: '14px' // 图标 + 字体大小
  },
  itemHeight: {
    type: String,
    default: '34px' // 每个菜单项高度
  }
})

const emit = defineEmits(['update:modelValue', 'select'])

const selectItem = (item: any) => {
  emit('update:modelValue', item.value)
  emit('select', item)
}

// 样式计算
const panelStyle = computed(() => ({
  width: props.width,
  height: props.height
}))

const menuItemStyle = computed(() => ({
  height: props.itemHeight,
  lineHeight: props.itemHeight
}))

const menuIconStyle = computed(() => ({
  fontSize: props.size
}))

const menuTextStyle = computed(() => ({
  fontSize: props.size
}))
</script>

<template>
  <div class="menu-panel" :style="panelStyle">
    <div
      v-for="item in items"
      :key="item.value"
      class="menu-item"
      :class="{ active: item.value === modelValue }"
      :style="menuItemStyle"
      @click="selectItem(item)"
    >
      <el-icon class="menu-icon" :style="menuIconStyle">
        <component :is="item.icon" />
      </el-icon>

      <span class="menu-text" :style="menuTextStyle">{{ item.label }}</span>
    </div>
  </div>
</template>

<style scoped>
.menu-panel {
  padding: 12px 8px;
  display: flex;
  flex-direction: column;
  gap: 6px;

  /* 背景 白色→透明 */
  background: linear-gradient(to bottom, rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0));
  border-radius: 12px;
  box-shadow: 0px -1px 1px 0.5px rgba(157, 141, 123, 0.1);
}

.menu-item {
  display: flex;
  align-items: center;
  padding: 6px 10px;
  border-radius: 999px;
  cursor: pointer;
  color: #9c8c7a;
  transition: 0.2s;
}

.menu-text {
  margin-left: 8px;
}

.menu-item.active {
  background: #c69a7a;
  color: #fff;
}

.menu-item.active .menu-icon {
  color: #fff;
}
</style>
