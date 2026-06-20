import achievements from './achievements'
import beginner from './beginner'
import collection from './collection'
import common from './common'
import editor from './editor'
import home from './home'
import noteSlice from './noteSlice'
import play from './play'
import practice from './practice'
import router from './router'
import settings from './settings'
import whiteboard from './whiteboard'

export default {
  ...common,
  ...settings,
  ...home,
  ...editor,
  ...play,
  ...practice,
  ...beginner,
  ...collection,
  ...achievements,
  ...noteSlice,
  ...whiteboard,
  ...router
}
