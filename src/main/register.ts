import { setupContainer } from './container'

export async function registerController() {
  const container = await setupContainer()
  container.resolve('scoreController').register()
  container.resolve('workController').register()
  container.resolve('collectionController').register()
  container.resolve('groupController').register()
  container.resolve('achievementProgressController').register()
  container.resolve('noteSliceHighScoreController').register()
  container.resolve('fileController').register()
  container.resolve('windowController').register()
}
