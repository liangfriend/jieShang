import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./views/index.vue'),
    meta: { title: '创客vue3版本' },
    redirect: '/jieShang/index',
    children: [
      {
        name: '导航首页',
        path: '/jieShang/index',
        component: () => import('./views/home/index.vue')
      },
      {
        name: '编辑器',
        path: '/jieShang/editor',
        component: () => import('./views/editor/index.vue')
      },
      {
        name: '乐器图鉴',
        path: '/jieShang/instrumentHandbook',
        component: () => import('./views/instrumentHandbook/index.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
