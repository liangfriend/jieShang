import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import i18n from '@renderer/i18n'
import { guardSingleLineModeEnter } from '@renderer/utils/scoreRoute'

const ROUTE_TITLE_KEYS: Record<string, string> = {
  home: 'router.home',
  edit: 'router.edit',
  play: 'router.play',
  practice: 'router.practice',
  forBeginner: 'router.forBeginner',
  scores: 'router.scores',
  whiteboard: 'router.whiteboard',
  literacyCamp: 'router.literacyCamp',
  achievements: 'router.achievements',
  collection: 'router.collection',
  noteSliceArcade: 'router.noteSliceArcade',
  noteSliceEndless: 'router.noteSliceEndless',
  noteSliceExtreme: 'router.noteSliceExtreme'
}

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'home',
    component: () => import('./views/HomeView.vue'),
    meta: { title: '解熵' }
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
    meta: { title: '练习模式' },
    beforeEnter: guardSingleLineModeEnter
  },
  {
    path: '/for-beginner',
    name: 'forBeginner',
    component: () => import('./views/forBeginner/forBeginner.vue'),
    meta: { title: '新手模式' },
    beforeEnter: guardSingleLineModeEnter
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
    path: '/achievements',
    name: 'achievements',
    component: () => import('./views/AchievementsView.vue'),
    meta: { title: '成就' }
  },
  {
    path: '/collection',
    name: 'collection',
    component: () => import('./views/CollectionView.vue'),
    meta: { title: '藏品' }
  },
  {
    path: '/note-slice/arcade',
    name: 'noteSliceArcade',
    component: () => import('./views/noteSlice/NoteSliceArcadeView.vue'),
    meta: { title: '街机模式' }
  },
  {
    path: '/note-slice/endless',
    name: 'noteSliceEndless',
    component: () => import('./views/noteSlice/NoteSliceEndlessView.vue'),
    meta: { title: '无限模式' }
  },
  {
    path: '/note-slice/extreme',
    name: 'noteSliceExtreme',
    component: () => import('./views/noteSlice/NoteSliceExtremeView.vue'),
    meta: { title: '极限模式' }
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

router.afterEach((to) => {
  const routeName = typeof to.name === 'string' ? to.name : ''
  const titleKey = ROUTE_TITLE_KEYS[routeName]
  if (!titleKey) return
  const title = i18n.global.t(titleKey)
  if (title && title !== titleKey) {
    document.title = title
  }
})

export default router
