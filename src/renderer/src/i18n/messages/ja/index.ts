import abilityTest from './abilityTest'
import absolutePitchTest from './absolutePitchTest'
import achievements from './achievements'
import beginner from './beginner'
import chordRecognitionQuiz from './chordRecognitionQuiz'
import collection from './collection'
import common from './common'
import editor from './editor'
import home from './home'
import instrumentSim from './instrumentSim'
import keyNoteNameQuiz from './keyNoteNameQuiz'
import myAudio from './myAudio'
import myImage from './myImage'
import myVideo from './myVideo'
import noteSlice from './noteSlice'
import play from './play'
import practice from './practice'
import singing from './singing'
import rhythmSenseTest from './rhythmSenseTest'
import router from './router'
import settings from './settings'
import tools from './tools'
import whiteboard from './whiteboard'
import work from './work'

export default {
  ...common,
  ...settings,
  ...home,
  ...instrumentSim,
  ...editor,
  ...play,
  ...practice,
  ...singing,
  ...beginner,
  ...collection,
  ...achievements,
  ...abilityTest,
  ...rhythmSenseTest,
  ...absolutePitchTest,
  ...keyNoteNameQuiz,
  ...chordRecognitionQuiz,
  ...myAudio,
  ...myImage,
  ...myVideo,
  ...work,
  ...noteSlice,
  ...tools,
  ...whiteboard,
  ...router
}
