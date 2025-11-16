<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import GameCard from '@renderer/components/gameCard.vue'
import { useRouter } from 'vue-router'
import WorkDialog from '@renderer/views/home/components/workDialog.vue'

async function getGameList() {
  gameList.value = await window.api.game.list()
}

onMounted(async () => {
  await getGameList()
})
const gameList = ref()

const router = useRouter()
const workDialogVisible = ref(false)
</script>

<template>
  <div class="stack">
    <div class="stack-item main-layer">
      <div class="top">
        <el-button @click="workDialogVisible = true">打开编辑器</el-button>
      </div>
      <div class="left">筛选区</div>
      <div class="right">
        <game-card v-for="item in gameList" :game="item"></game-card>
      </div>
    </div>
    <work-dialog v-model="workDialogVisible" />
  </div>
</template>
<style>
.main-layer {
  display: grid;
  grid-template-rows: 100px 1fr;
  grid-template-columns: 200px 1fr;
  grid-template-areas:
    'top top '
    'left right';
}

.left {
  grid-area: left;
  background-color: #515c67;
}

.right {
  grid-area: right;
  display: flex;
  gap: 10px;
}

.top {
  grid-area: top;
  background-color: #515c67;
}
</style>
