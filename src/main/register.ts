import { setupContainer } from './container'

export async function registerController() {
  const container = await setupContainer()
  // 注册 IPC
  const gameController = container.resolve('gameController')
  gameController.register()
  const workController = container.resolve('workController')
  workController.register()
  const resourceController = container.resolve('resourceController')
  resourceController.register()
  const saveController = container.resolve('saveController')
  saveController.register()
  const groupController = container.resolve('groupController')
  groupController.register()
  const fileController = container.resolve('fileController')
  fileController.register()
  const windowController = container.resolve('windowController')
  windowController.register()
}
