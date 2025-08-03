<template>
  <div class="container">
    <div class="item" v-for="item in modelValue" @click="()=>item.callback?.()">
      {{ item.title }}
    </div>
  </div>
</template>
<script setup lang="ts">
type MenuListItem = {
  title: string,
  callback?: () => void,
  children?: [] // 二级菜单做二期
}
const props = defineProps({
  modelValue: {
    type: Array<MenuListItem>,
    default: () => [],
  }
})
</script>
<style scoped>
.container {
  display: flex;
  direction: rtl;

  > * {
    direction: ltr;
  }
}

.item {
  width: 60px;
  height: 60px;
  outline: 1px solid #000;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  user-select: none;
}
</style>