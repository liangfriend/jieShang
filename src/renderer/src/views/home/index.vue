<template>
  <div class="stack">
    <div class="stackItem" comment="背景层"></div>
    <div class="stack b-stackItem" comment="操作层">
      <div class="setting">设置</div>
      <div class="exit">退出</div>
      <div class="profile">个人信息</div>
      <div class="menu">
        <custom-menu v-model="customMenuData"></custom-menu>
      </div>
    </div>
  </div>
</template>
<script lang="ts" setup>

import {useRouter} from 'vue-router';
import CustomMenu from "@renderer/views/home/components/customMenu.vue";
import {ref} from "vue";

const router = useRouter();
const goTo = (path: string) => {
  router.push(path);
};
const customMenuData = ref([{
  title: '乐谱制作',
  callback: () => {
    goTo('/chuangKe/editor');
  },
}, {
  title: '课程学习',
  callback: () => {
  },
}, {
  title: '实用工具',
  callback: () => {
  },
}, {
  title: '素养训练',
  callback: () => {
  },
}, {
  title: '乐器演奏',
  callback: () => {
  },
}, {
  title: '乐器图鉴',
  callback: () => {
    goTo('/chuangKe/instrumentHandbook');
  },
}, {
  title: '管理任务',
  callback: () => {
  },
}, {
  title: '美育测评',
  callback: () => {
  },
}, {
  title: '元宇宙',
  callback: () => {
  },
}, {
  title: '自定义',
  callback: () => {
  },
},])
</script>
<style scoped lang="scss">
.setting {
  top: 0;
  left: 0;
  position: absolute;
}

.exit {
  bottom: 0;
  left: 0;
  position: absolute;
}

.profile {
  top: 0;
  right: 0;
  position: absolute;
}

.menu {
  bottom: 0;
  right: 0;
  position: absolute;
}
</style>

