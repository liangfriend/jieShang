import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./App.vue'),
    meta: { title: '解熵' },
    // redirect: '/',
    children: []
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
