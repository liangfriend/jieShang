import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: '谱旅之章' }
  },
  {
    path: '/edit',
    name: 'edit',
    component: () => import('./views/editor/editor.vue'),
    meta: { title: '曲谱编辑' }
  },
  {
    path: '/play',
    name: 'play',
    component: () => import('./views/editor/play.vue'),
    meta: { title: '曲谱播放' }
  },
  {
    path: '/scores',
    name: 'scores',
    component: () => import('./views/ScoreListView.vue'),
    meta: { title: '我的曲谱' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
