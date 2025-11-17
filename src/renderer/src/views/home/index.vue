<script lang="ts" setup>
import { computed, CSSProperties, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import WorkDialog from '@renderer/views/home/components/workDialog.vue'
import bg from '@renderer/assets/images/home/bg.png'
import SearchInput from '@renderer/views/home/components/searchInput.vue'

async function getGameList() {
  // gameList.value = await window.api.game.list()
}

onMounted(async () => {
  await getGameList()
})

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
const menu = [
  { label: '我的作品', icon: House, value: 'home' },
  { label: '我的游戏', icon: Tickets, value: 'card' },
  { label: '本地游戏', icon: List, value: 'local' },
  { label: '线上游戏', icon: User, value: 'user' },
  { label: '图片资源', icon: Folder, value: 'folder' },
  { label: '音频资源', icon: Grid, value: 'grid' },
  { label: '视频资源', icon: Grid, value: 'list2' }
]
const active = ref('home')
const onSelect = (item: any) => {
  console.log('点击菜单：', item)
}
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
// 游戏列表
const gameList = ref([
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
</script>

<template>
  <div class="stack">
    <div class="stack-item main-layer" :style="mainLayerStyle">
      <!--      <div class="top">-->
      <!--        <el-button @click="workDialogVisible = true">打开编辑器</el-button>-->
      <!--      </div>-->
      <!--      <div class="left">筛选区</div>-->
      <!--      <div class="right">-->
      <!--        <game-card v-for="item in gameList" :game="item"></game-card>-->
      <!--      </div>-->
      <!--    </div>-->
      <!--    <work-dialog v-model="workDialogVisible" />-->
      <div class="logo">解熵视觉小说</div>
      <div class="search">
        <search-input height="50px" btnWidth="100px" size="1.5rem" v-model="search"></search-input>
      </div>
      <div class="profile">
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
          @select="onSelect"
        ></home-menu>
      </div>
      <div class="list overflow-auto hidden-scrollbar">
        <GameCard
          class="mb-[20px]"
          img="girl.jpg"
          name="崩坏：星穹铁道"
          width="100%"
          height="300px"
          @select="(game) => console.log('点击了：', game)"
        />
        <div class="gap-[20px] flex flex-wrap">
          <GameCard
            class="shrink-0"
            v-for="item in gameList"
            img="girl.jpg"
            :name="item.title"
            width="calc(50% - 10px)"
            height="200px"
            @select="(game) => console.log('点击了：', game)"
          />
        </div>
      </div>
      <div class="recommendation overflow-auto hidden-scrollbar">
        <ChampionCard
          class="mb-[20px]"
          title="线上片状"
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
        <div class="recommendation-list">
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
}
</style>
