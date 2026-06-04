import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: '谱旅之章' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
