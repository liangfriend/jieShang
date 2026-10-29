import { createRouter, createWebHashHistory, RouteRecordRaw } from 'vue-router'
import { useAudioPlayerStore } from '@renderer/store/audioPlayer.store'
import { useMetronomeStore } from '@renderer/store/metronome.store'
import { usePlayStore } from '@renderer/store/play.store'
import { guardSingleLineModeEnter } from '@renderer/utils/scoreRoute'

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
    // 旧播放页入口并入编辑页；进入曲谱默认编辑模式（播放模式仅由页内菜单切换）
    path: '/play',
    name: 'play',
    redirect: (to) => {
      const query = { ...to.query }
      delete query.mode
      return { name: 'edit', query }
    }
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
    path: '/cl-sheet',
    name: 'clSheet',
    component: () => import('./views/clSheet/ClSheetView.vue'),
    meta: { title: '和弦弹唱谱' }
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
    redirect: { name: 'guitarChordManage' }
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
    path: '/ability-test/note-practice',
    name: 'notePractice',
    component: () => import('./views/abilityTest/NotePracticeView.vue'),
    meta: { title: '练习模式' }
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
    meta: { title: '和弦管理' }
  },
  {
    path: '/instrument-sim/harmonica',
    name: 'harmonicaSim',
    component: () => import('./views/instrumentSim/HarmonicaSimView.vue'),
    meta: { title: '模拟口琴' }
  },
  {
    path: '/instrument-sim/drum-machine',
    name: 'drumMachineSim',
    component: () => import('./views/instrumentSim/drumMachine/DrumMachineView.vue'),
    meta: { title: '电子鼓机' }
  },
  {
    path: '/instrument-sim/pan-flute',
    name: 'panFluteSim',
    component: () => import('./views/instrumentSim/PanFluteSimView.vue'),
    meta: { title: '模拟排箫' }
  },
  {
    path: '/instrument-sim/piccolo',
    name: 'piccoloSim',
    component: () => import('./views/instrumentSim/PiccoloSimView.vue'),
    meta: { title: '模拟短笛' }
  },
  {
    path: '/instrument-sim/kalimba',
    name: 'kalimbaSim',
    component: () => import('./views/instrumentSim/KalimbaSimView.vue'),
    meta: { title: '模拟卡林巴' }
  },
  {
    path: '/tools',
    name: 'tools',
    component: () => import('./views/tools/ToolsView.vue'),
    meta: { title: '工具' }
  },
  {
    path: '/tools/guitar-tune',
    name: 'guitarTuneTool',
    component: () => import('./views/tools/GuitarTuneToolView.vue'),
    meta: { title: '吉他调弦' }
  },
  {
    path: '/tools/metronome',
    name: 'metronomeTool',
    component: () => import('./views/tools/MetronomeToolView.vue'),
    meta: { title: '节拍器' }
  },
  {
    path: '/tools/pitch',
    name: 'pitchTool',
    component: () => import('./views/tools/PitchDetectionToolView.vue'),
    meta: { title: '音高检测' }
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
    path: '/manual',
    name: 'manual',
    component: () => import('./views/manual/ManualView.vue'),
    meta: { title: '使用手册' }
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

/** 离开曲谱播放相关页时强制停掉全局播放器，避免返回后仍出声 */
const SCORE_PLAYBACK_ROUTE_NAMES = new Set([
  'play',
  'practice',
  'forBeginner',
  'singing',
  'guitarSim'
])

router.beforeEach((to, from) => {
  const fromName = typeof from.name === 'string' ? from.name : ''
  if (!fromName || !SCORE_PLAYBACK_ROUTE_NAMES.has(fromName)) return
  const toName = typeof to.name === 'string' ? to.name : ''
  if (toName === fromName) return

  usePlayStore().stop()
  useAudioPlayerStore().stop()
  useMetronomeStore().stop()
})

router.afterEach(() => {
  document.title = '解熵'
})

export default router
