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
import { ScoreRepository } from './repositories/scoreRepository'
import { ScoreService } from './services/scoreService'
import { ScoreController } from './controllers/scoreController'
import { WorkRepository } from './repositories/workRepository'
import { WorkService } from './services/workService'
import { WorkController } from './controllers/workController'
import { CollectionRepository } from './repositories/collectionRepository'
import { CollectionService } from './services/collectionService'
import { CollectionController } from './controllers/collectionController'
import { FileService } from './services/fileService'
import { FileController } from './controllers/fileController'
import { ResourceService } from './services/resourceService'
import { ResourceController } from './controllers/resourceController'
import { ResourceRepository } from './repositories/resourceRepository'
import { GroupService } from './services/groupService'
import { GroupController } from './controllers/groupController'
import { GroupRepository } from './repositories/groupRepository'
import { WindowController } from './controllers/windowController'

export const container = createContainer()

export async function setupContainer() {
  await sequelize.authenticate()
  await runMigrations()

  container.register({
    sequelize: asValue(sequelize),

    gameRepository: asClass(GameRepository).singleton(),
    gameService: asClass(GameService).singleton(),
    gameController: asClass(GameController).singleton(),

    saveRepository: asClass(SaveRepository).singleton(),
    saveService: asClass(SaveService).singleton(),
    saveController: asClass(SaveController).singleton(),

    scoreRepository: asClass(ScoreRepository).singleton(),
    scoreService: asClass(ScoreService).singleton(),
    scoreController: asClass(ScoreController).singleton(),

    workRepository: asClass(WorkRepository).singleton(),
    workService: asClass(WorkService).singleton(),
    workController: asClass(WorkController).singleton(),

    collectionRepository: asClass(CollectionRepository).singleton(),
    collectionService: asClass(CollectionService).singleton(),
    collectionController: asClass(CollectionController).singleton(),

    resourceRepository: asClass(ResourceRepository).singleton(),
    resourceService: asClass(ResourceService).singleton(),
    resourceController: asClass(ResourceController).singleton(),

    groupRepository: asClass(GroupRepository).singleton(),
    groupService: asClass(GroupService).singleton(),
    groupController: asClass(GroupController).singleton(),

    windowController: asClass(WindowController).singleton(),

    fileService: asClass(FileService).singleton(),
    fileController: asClass(FileController).singleton()
  })

  return container
}
