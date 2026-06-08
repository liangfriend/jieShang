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
    component: () => import('./views/play/play.vue'),
    meta: { title: '曲谱播放' }
  },
  {
    path: '/practice',
    name: 'practice',
    component: () => import('./views/practice/practice.vue'),
    meta: { title: '练习模式' }
  },
  {
    path: '/for-beginner',
    name: 'forBeginner',
    component: () => import('./views/forBeginner/forBeginner.vue'),
    meta: { title: '新手模式' }
  },
  {
    path: '/scores',
    name: 'scores',
    component: () => import('./views/ScoreListView.vue'),
    meta: { title: '我的曲谱' }
  },
  {
    path: '/whiteboard',
    name: 'whiteboard',
    component: () => import('./views/TeachingWhiteboardView.vue'),
    meta: { title: '教学白板' }
  },
  {
    path: '/literacy-camp',
    name: 'literacyCamp',
    component: () => import('./views/LiteracyCampView.vue'),
    meta: { title: '素养训练营' }
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import('./views/CollectionView.vue'),
    meta: { title: '藏品' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
