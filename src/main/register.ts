import { setupContainer } from './container'

export async function registerController() {
  const container = await setupContainer()
  container.resolve('scoreController').register()
  container.resolve('workController').register()
  container.resolve('collectionController').register()
  container.resolve('groupController').register()
  container.resolve('achievementProgressController').register()
  container.resolve('noteSliceHighScoreController').register()
  container.resolve('audioController').register()
  container.resolve('imageController').register()
  container.resolve('videoController').register()
  container.resolve('guitarChordController').register()
  container.resolve('drumMachineController').register()
  container.resolve('customSymbolController').register()
  container.resolve('fileController').register()
  container.resolve('omrController').register()
  container.resolve('windowController').register()

  await container.resolve('achievementProgressService').syncCompletedToSteam()
}
