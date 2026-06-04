import { setupContainer } from './container'

export async function registerController() {
  const container = await setupContainer()
  container.resolve('gameController').register()
  container.resolve('scoreController').register()
  container.resolve('workController').register()
  container.resolve('resourceController').register()
  container.resolve('saveController').register()
  container.resolve('groupController').register()
  container.resolve('fileController').register()
  container.resolve('windowController').register()
}
