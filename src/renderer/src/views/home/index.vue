<script lang="ts" setup>
import { computed, CSSProperties, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import WorkDialog from '@renderer/views/home/components/workDialog.vue'
import bg from '@renderer/assets/images/home/bg.png'
import SearchInput from '@renderer/views/home/components/searchInput.vue'

const router = useRouter()
const workDialogVisible = ref(false)

const mainLayerStyle = computed((): CSSProperties => {
  return {
    backgroundImage: `url(${bg})`,
    backgroundSize: '100% 100%'
  }
})
// 搜索
const search = ref('')
// 左侧菜单
import { House, Tickets, List, User, Folder, Grid } from '@element-plus/icons-vue'
import HomeMenu from '@renderer/views/home/components/homeMenu.vue'
import RecommendationCard from '@renderer/views/home/components/recommendationCard.vue'
import ChampionCard from '@renderer/views/home/components/championCard.vue'
import GameCard from '@renderer/views/home/components/gameCard.vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { GameModel, WorkModel } from '@renderer/types'

const menu = [
  { label: '我的作品', icon: House, value: 'work' },
  { label: '我的游戏', icon: Tickets, value: 'my_game' }
  // { label: '线上游戏', icon: User, value: 'online_game' },
  // { label: '图片资源', icon: Folder, value: 'image' },
  // { label: '音频资源', icon: Grid, value: 'audio' },
  // { label: '视频资源', icon: Grid, value: 'video' }
]
const active = ref('work')

async function selectMenu(item: any) {
  switch (item.value) {
    case 'work': {
      await getWorkList()
    }
    case 'my_game': {
      await getGameList()
    }
  }
}

// 作品列表
const workList = ref<WorkModel[]>([])

async function getWorkList() {
  console.log('chicken')
  workList.value = (await window.api.work.list()).data
}

// 游戏列表
const gameList = ref<GameModel[]>([])

async function getGameList() {
  gameList.value = (await window.api.game.list()).data
}

// 初始化
onMounted(async () => {
  await getWorkList()
})

// 推荐列表
const recommendationList = ref([
  {
    avatar: '',
    title: '金刚星',
    subTitle: '解放的力量',
    ranting: 3
  },
  {
    avatar: '',
    title: '般若-鬼心',
    subTitle: '日式恐怖',
    ranting: 3
  },
  {
    avatar: '',
    title: '吃过番茄之后可以大胆表白',
    subTitle: '青春文学',
    ranting: 4
  },
  {
    avatar: '',
    title: '名侦探柯北',
    subTitle: '这并不是搞笑类',
    ranting: 3
  },
  {
    avatar: '',
    title: '擦亮我们的双眼',
    subTitle: '某一个夏日的午后，做出了最后的决定',
    ranting: 3
  },
  {
    avatar: '',
    title: '疯子',
    subTitle: '人吃人的社会现象',
    ranting: 3
  },
  {
    avatar: '',
    title: '恒星时代',
    subTitle: '感受赛博纪元的繁华',
    ranting: 3
  }
])

// 选择作品
function selectWork(work) {
  router.replace({ path: '/editor', query: { workId: work.id } })
}

//删除作品
async function deleteWork(item) {
  ElMessageBox.confirm('确认删除?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      window.api.work.delete(item.id)
      await getWorkList()
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
    .catch(() => {})
}

// 进入游戏
function playGame(item) {
  //
  router.replace({ path: '/game/entry', query: { gameId: item.id, type: 'game' } })
}

//删除游戏
async function deleteGame(item) {
  ElMessageBox.confirm('确认删除?', 'Warning', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(async () => {
      window.api.game.delete(item.id)
      await getGameList()
      ElMessage({
        type: 'success',
        message: '删除成功'
      })
    })
    .catch(() => {})
}
</script>

<template>
  <div class="stack no-user-select">
    <div class="stack-item main-layer" :style="mainLayerStyle">
      <div class="logo" @click="workDialogVisible = true">创建作品</div>
      <div class="search">
        <search-input height="50px" btnWidth="100px" size="1.5rem" v-model="search"></search-input>
      </div>
      <div class="profile" v-mask>
        <el-avatar
          :size="50"
          src="https://cube.elemecdn.com/0/88/03b0d39583f48206768a7534e55bcpng.png"
        />
        <div>个人中心</div>
      </div>
      <div class="menu">
        <home-menu
          width="100%"
          item-height="50px"
          size="20px"
          height="100%"
          :items="menu"
          v-model="active"
          @select="selectMenu"
        ></home-menu>
      </div>
      <div class="list overflow-auto hidden-scrollbar">
        <template v-if="active === 'work'">
          <GameCard
            deleteable
            v-if="workList[0]"
            class="mb-[20px]"
            :name="workList[0].name"
            width="100%"
            height="300px"
            @select="selectWork(workList[0])"
            @delete="deleteWork(workList[0])"
          />
          <div class="gap-[20px] flex flex-wrap">
            <GameCard
              deleteable
              class="shrink-0"
              v-for="item in workList"
              :name="item.name"
              width="calc(50% - 10px)"
              height="200px"
              @select="selectWork(item)"
              @delete="deleteWork(item)"
            />
          </div>
        </template>
        <template v-else-if="active === 'my_game'">
          <GameCard
            deleteable
            v-if="gameList[0]"
            class="mb-[20px]"
            :name="gameList[0].name"
            :img="gameList[0].front_cover"
            width="100%"
            height="300px"
            @select="playGame(gameList[0])"
            @delete="deleteGame(gameList[0])"
          />
          <div class="gap-[20px] flex flex-wrap">
            <GameCard
              deleteable
              class="shrink-0"
              v-for="item in gameList"
              :name="item.name"
              :img="item.front_cover"
              width="calc(50% - 10px)"
              height="200px"
              @select="playGame(item)"
              @delete="deleteGame(item)"
            />
          </div>
        </template>
      </div>
      <div class="recommendation overflow-auto hidden-scrollbar">
        <ChampionCard
          v-mask
          class="mb-[20px]"
          title="本周榜首"
          avatar="girl.jpg"
          name="初战崭露锋芒"
          tag="强"
          subTag="辅助"
          width="calc(100%)"
          height="140px"
          avatarSize="62px"
          topTitleSize="17px"
          titleSize="15px"
          tagSize="13px"
          btnWidth="84px"
          buttonText="本地"
        />
        <div class="recommendation-list" v-mask>
          <div class="recommendation-title">本周推荐</div>
          <recommendation-card
            class="mx-[8px]"
            v-for="item in recommendationList"
            width="calc(100% - 16px)"
            :avatar="item.avatar"
            :title="item.title"
            :subTitle="item.subTitle"
            :rating="item.ranting"
            buttonText="查看详情"
            transparent
          ></recommendation-card>
        </div>
      </div>
    </div>
  </div>
  <work-dialog @deleted="getWorkList" @created="getWorkList" v-model="workDialogVisible" />
</template>
<style>
.main-layer {
  display: grid;
  gap: 20px;
  padding: 20px;
  grid-template-rows: 100px 1fr;
  grid-template-columns: 300px 1fr 300px;
  grid-template-areas:
    'logo search profile '
    'menu list recommendation';
}

.logo {
  grid-area: logo;
  font-size: 40px;
  color: #977955;
  font-weight: 400;
  display: flex;
  align-items: center;
  transition-duration: 0.5s;
  transform-origin: 0 50%;
  cursor: pointer;
  user-select: none;
}

.logo:hover {
  transform: scale(1.1);
}

.search {
  grid-area: search;
  display: flex;
  align-items: center;
}

.profile {
  grid-area: profile;
  display: flex;
  justify-content: flex-end;
  align-items: center;
  font-size: 30px;
  color: #977955;
  gap: 20px;
}

.menu {
  grid-area: menu;
}

.list {
  grid-area: list;
}

.recommendation {
  grid-area: recommendation;
}

.recommendation-list {
  background-color: rgba(255, 255, 245, 0.8);
  border-radius: 12px;
}

.recommendation-title {
  background: rgba(240, 208, 192, 0.2);
  height: 30px;
  display: flex;
  align-items: center;
  font-weight: 600;
  padding-left: 20px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  user-select: none;
}
</style>
