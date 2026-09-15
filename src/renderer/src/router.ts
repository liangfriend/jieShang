import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import i18n from '@renderer/i18n'
import { guardSingleLineModeEnter } from '@renderer/utils/scoreRoute'

const ROUTE_TITLE_KEYS: Record<string, string> = {
  home: 'router.home',
  edit: 'router.edit',
  play: 'router.play',
  practice: 'router.practice',
  forBeginner: 'router.forBeginner',
  singing: 'router.singing',
  scores: 'router.scores',
  whiteboard: 'router.whiteboard',
  myWorks: 'router.myWorks',
  workEdit: 'router.workEdit',
  workShow: 'router.workShow',
  musicEncyclopedia: 'router.musicEncyclopedia',
  abilityTest: 'router.abilityTest',
  rhythmSenseTest: 'router.rhythmSenseTest',
  absolutePitchTest: 'router.absolutePitchTest',
  keyNoteNameQuiz: 'router.keyNoteNameQuiz',
  chordRecognitionQuiz: 'router.chordRecognitionQuiz',
  myAudio: 'router.myAudio',
  myImage: 'router.myImage',
  myVideo: 'router.myVideo',
  instrumentSim: 'router.instrumentSim',
  guitarSim: 'router.guitarSim',
  guitarChordManage: 'router.guitarChordManage',
  harmonicaSim: 'router.harmonicaSim',
  violinSim: 'router.violinSim',
  tools: 'router.tools',
  micTool: 'router.micTool',
  midiTool: 'router.midiTool',
  achievements: 'router.achievements',
  collection: 'router.collection',
  noteSliceArcade: 'router.noteSliceArcade',
  noteSliceEndless: 'router.noteSliceEndless',
  noteSliceExtreme: 'router.noteSliceExtreme'
}

const placeholder = () => import('./views/PhasePlaceholderView.vue')

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
    path: '/singing',
    name: 'singing',
    component: () => import('./views/singing/singing.vue'),
    meta: { title: '演唱模式' },
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
    path: '/my-works',
    name: 'myWorks',
    component: () => import('./views/WorkListView.vue'),
    meta: { title: '我的作品' }
  },
  {
    path: '/work-edit',
    name: 'workEdit',
    component: () => import('./views/work/WorkStudioView.vue'),
    meta: { title: '作品编辑' }
  },
  {
    path: '/work-show',
    name: 'workShow',
    component: () => import('./views/work/WorkStudioView.vue'),
    meta: { title: '作品展示' }
  },
  {
    path: '/music-encyclopedia',
    name: 'musicEncyclopedia',
    component: placeholder,
    meta: {
      title: '音乐百科',
      titleKey: 'router.musicEncyclopedia',
      placeholderKey: 'router.musicEncyclopediaPlaceholder'
    }
  },
  {
    path: '/ability-test',
    name: 'abilityTest',
    component: () => import('./views/AbilityTestView.vue'),
    meta: { title: '能力测试' }
  },
  {
    path: '/ability-test/rhythm',
    name: 'rhythmSenseTest',
    component: () => import('./views/abilityTest/RhythmSenseTestView.vue'),
    meta: { title: '节奏感测试' }
  },
  {
    path: '/ability-test/absolute-pitch',
    name: 'absolutePitchTest',
    component: () => import('./views/abilityTest/AbsolutePitchTestView.vue'),
    meta: { title: '音感测试' }
  },
  {
    path: '/ability-test/key-note-quiz',
    name: 'keyNoteNameQuiz',
    component: () => import('./views/abilityTest/KeyNoteNameQuizView.vue'),
    meta: { title: '琴键音名识别' }
  },
  {
    path: '/ability-test/chord-quiz',
    name: 'chordRecognitionQuiz',
    component: () => import('./views/abilityTest/ChordRecognitionQuizView.vue'),
    meta: { title: '和弦识别' }
  },
  {
    path: '/my-audio',
    name: 'myAudio',
    component: () => import('./views/myAudio/MyAudioView.vue'),
    meta: { title: '我的音频' }
  },
  {
    path: '/my-images',
    name: 'myImage',
    component: () => import('./views/myImage/MyImageView.vue'),
    meta: { title: '我的图片' }
  },
  {
    path: '/my-videos',
    name: 'myVideo',
    component: () => import('./views/myVideo/MyVideoView.vue'),
    meta: { title: '我的视频' }
  },
  {
    path: '/instrument-sim',
    name: 'instrumentSim',
    component: () => import('./views/instrumentSim/InstrumentSimView.vue'),
    meta: { title: '模拟乐器' }
  },
  {
    path: '/instrument-sim/guitar',
    name: 'guitarSim',
    component: () => import('./views/instrumentSim/GuitarSimView.vue'),
    meta: { title: '模拟吉他' }
  },
  {
    path: '/instrument-sim/guitar/chords',
    name: 'guitarChordManage',
    component: () => import('./views/instrumentSim/GuitarChordListView.vue'),
    meta: { title: '和弦符号' }
  },
  {
    path: '/instrument-sim/harmonica',
    name: 'harmonicaSim',
    component: () => import('./views/instrumentSim/HarmonicaSimView.vue'),
    meta: { title: '模拟口琴' }
  },
  {
    path: '/instrument-sim/violin',
    name: 'violinSim',
    component: placeholder,
    meta: {
      title: '模拟小提琴',
      titleKey: 'router.violinSim',
      placeholderKey: 'router.violinSimPlaceholder',
      backFallback: '/instrument-sim'
    }
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('./views/tools/ToolsView.vue'),
    meta: { title: '工具' }
  },
  {
    path: '/tools/microphone',
    name: 'micTool',
    component: () => import('./views/tools/MicrophoneToolView.vue'),
    meta: { title: '麦克风检测' }
  },
  {
    path: '/tools/midi',
    name: 'midiTool',
    component: () => import('./views/tools/MidiDeviceToolView.vue'),
    meta: { title: 'MIDI 设备检测' }
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
  },
  {
    path: '/literacy-camp',
    redirect: { name: 'abilityTest' }
  },
  {
    path: '/work-studio',
    redirect: { name: 'myWorks' }
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
