// src/main/container.ts
import { createContainer, asClass, asValue } from 'awilix'
import sequelize from './database/connection'
import { runMigrations } from './database/migrationRunner'

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
import { GroupService } from './services/groupService'
import { GroupController } from './controllers/groupController'
import { GroupRepository } from './repositories/groupRepository'
import { WindowController } from './controllers/windowController'
import { AchievementProgressRepository } from './repositories/achievementProgressRepository'
import { AchievementProgressService } from './services/achievementProgressService'
import { AchievementProgressController } from './controllers/achievementProgressController'
import { NoteSliceHighScoreRepository } from './repositories/noteSliceHighScoreRepository'
import { NoteSliceHighScoreService } from './services/noteSliceHighScoreService'
import { NoteSliceHighScoreController } from './controllers/noteSliceHighScoreController'
import { syncBuiltinCollectionThumbnails } from './utils/collectionThumbnailSync'

export const container = createContainer()

export async function setupContainer() {
  await sequelize.authenticate()
  await runMigrations()
  syncBuiltinCollectionThumbnails()

  container.register({
    sequelize: asValue(sequelize),

    scoreRepository: asClass(ScoreRepository).singleton(),
    scoreService: asClass(ScoreService).singleton(),
    scoreController: asClass(ScoreController).singleton(),

    workRepository: asClass(WorkRepository).singleton(),
    workService: asClass(WorkService).singleton(),
    workController: asClass(WorkController).singleton(),

    collectionRepository: asClass(CollectionRepository).singleton(),
    collectionService: asClass(CollectionService).singleton(),
    collectionController: asClass(CollectionController).singleton(),

    groupRepository: asClass(GroupRepository).singleton(),
    groupService: asClass(GroupService).singleton(),
    groupController: asClass(GroupController).singleton(),

    achievementProgressRepository: asClass(AchievementProgressRepository).singleton(),
    achievementProgressService: asClass(AchievementProgressService).singleton(),
    achievementProgressController: asClass(AchievementProgressController).singleton(),

    noteSliceHighScoreRepository: asClass(NoteSliceHighScoreRepository).singleton(),
    noteSliceHighScoreService: asClass(NoteSliceHighScoreService).singleton(),
    noteSliceHighScoreController: asClass(NoteSliceHighScoreController).singleton(),

    windowController: asClass(WindowController).singleton(),

    fileService: asClass(FileService).singleton(),
    fileController: asClass(FileController).singleton()
  })

  return container
}
