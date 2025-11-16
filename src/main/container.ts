// src/main/container.ts
import { createContainer, asClass, asValue } from 'awilix'
import sequelize from './database/connection'
import { runMigrations } from './database/migrationRunner'

import { GameRepository } from './repositories/gameRepository'
import { GameService } from './services/gameService'
import { GameController } from './controllers/gameController'
import { SaveRepository } from './repositories/saveRepository'
import { SaveService } from './services/saveService'
import { SaveController } from './controllers/saveController'
import { WorkService } from './services/workService'
import { WorkController } from './controllers/workController'
import { WorkRepository } from './repositories/workRepository'
import { FileService } from './services/fileService'
import { FileController } from './controllers/fileController'
import { ResourceService } from './services/resourceService'
import { ResourceController } from './controllers/resourceController'
import { ResourceRepository } from './repositories/ResourceRepository'
import { WindowController } from './controllers/windowController'

export const container = createContainer()

export async function setupContainer() {
  // 1. 先连接数据库
  await sequelize.authenticate()

  // 2. 执行迁移（自动创建表）
  await runMigrations()

  // 3. 再注册 IOC 容器
  container.register({
    sequelize: asValue(sequelize),

    gameRepository: asClass(GameRepository).singleton(),
    gameService: asClass(GameService).singleton(),
    gameController: asClass(GameController).singleton(),

    saveRepository: asClass(SaveRepository).singleton(),
    saveService: asClass(SaveService).singleton(),
    saveController: asClass(SaveController).singleton(),

    workRepository: asClass(WorkRepository).singleton(),
    workService: asClass(WorkService).singleton(),
    workController: asClass(WorkController).singleton(),

    resourceRepository: asClass(ResourceRepository).singleton(),
    resourceService: asClass(ResourceService).singleton(),
    resourceController: asClass(ResourceController).singleton(),

    windowController: asClass(WindowController).singleton(),

    fileService: asClass(FileService).singleton(),
    fileController: asClass(FileController).singleton()
  })

  return container
}
