import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('./App.vue'),
    meta: { title: '物语星球' },
    redirect: '/home',
    children: [
      {
        path: '/home',
        meta: { title: '首页' },
        component: () => import('./views/home/index.vue')
      },
      {
        path: '/editor',
        meta: { title: '编辑器' },
        component: () => import('./views/editor/index.vue')
      },
      {
        path: '/game',
        meta: { title: '游戏' },
        redirect: '/game/entry',
        component: () => import('./views/game/index.vue'),
        children: [
          {
            path: '/game/entry',
            meta: { title: '游戏入口' },
            component: () => import('./views/game/entry.vue')
          },
          {
            path: '/game/game',
            meta: { title: '游戏界面' },
            component: () => import('./views/game/game.vue')
          }
        ]
      }
    ]
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})
export default router
