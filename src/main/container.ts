// src/main/container.ts
import { createContainer, asClass, asValue } from 'awilix'
import { DataTypes } from 'sequelize'
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
import { OmrService } from './services/omrService'
import { OmrController } from './controllers/omrController'
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
import { AudioRepository } from './repositories/audioRepository'
import { AudioService } from './services/audioService'
import { AudioController } from './controllers/audioController'
import { ImageRepository } from './repositories/imageRepository'
import { ImageService } from './services/imageService'
import { ImageController } from './controllers/imageController'
import { VideoRepository } from './repositories/videoRepository'
import { VideoService } from './services/videoService'
import { VideoController } from './controllers/videoController'
import { GuitarChordRepository } from './repositories/guitarChordRepository'
import { GuitarChordService } from './services/guitarChordService'
import { GuitarChordController } from './controllers/guitarChordController'
import GuitarChordModel from './models/GuitarChordModel'
import { DrumMachineRepository } from './repositories/drumMachineRepository'
import { DrumMachineService } from './services/drumMachineService'
import { DrumMachineController } from './controllers/drumMachineController'
import { CustomSymbolRepository } from './repositories/customSymbolRepository'
import { CustomSymbolService } from './services/customSymbolService'
import { CustomSymbolController } from './controllers/customSymbolController'
import { syncBuiltinCollectionThumbnails } from './utils/collectionThumbnailSync'
import { syncBuiltinCollections } from './database/collectionBuiltinSeed'

export const container = createContainer()

export async function setupContainer() {
  await sequelize.authenticate()
  await runMigrations()
  await GuitarChordModel.sync()
  // 旧版 frets 列 → 重建为 data(tabChord)；缺 hand_pose 时补列
  try {
    const qi = sequelize.getQueryInterface()
    const desc = await qi.describeTable('guitar_chord')
    if (desc && !('data' in desc)) {
      await GuitarChordModel.drop()
      await GuitarChordModel.sync()
    } else if (desc && !('hand_pose' in desc)) {
      await qi.addColumn('guitar_chord', 'hand_pose', {
        type: DataTypes.TEXT,
        allowNull: true,
        defaultValue: null
      })
    }
    if (desc && !('tab_type' in desc)) {
      await qi.addColumn('guitar_chord', 'tab_type', {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'tab6'
      })
    }
  } catch {
    await GuitarChordModel.sync()
  }
  syncBuiltinCollectionThumbnails()
  await syncBuiltinCollections()

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

    audioRepository: asClass(AudioRepository).singleton(),
    audioService: asClass(AudioService).singleton(),
    audioController: asClass(AudioController).singleton(),

    imageRepository: asClass(ImageRepository).singleton(),
    imageService: asClass(ImageService).singleton(),
    imageController: asClass(ImageController).singleton(),

    videoRepository: asClass(VideoRepository).singleton(),
    videoService: asClass(VideoService).singleton(),
    videoController: asClass(VideoController).singleton(),

    guitarChordRepository: asClass(GuitarChordRepository).singleton(),
    guitarChordService: asClass(GuitarChordService).singleton(),
    guitarChordController: asClass(GuitarChordController).singleton(),

    drumMachineRepository: asClass(DrumMachineRepository).singleton(),
    drumMachineService: asClass(DrumMachineService).singleton(),
    drumMachineController: asClass(DrumMachineController).singleton(),

    customSymbolRepository: asClass(CustomSymbolRepository).singleton(),
    customSymbolService: asClass(CustomSymbolService).singleton(),
    customSymbolController: asClass(CustomSymbolController).singleton(),

    windowController: asClass(WindowController).singleton(),

    fileService: asClass(FileService).singleton(),
    fileController: asClass(FileController).singleton(),

    omrService: asClass(OmrService).singleton(),
    omrController: asClass(OmrController).singleton()
  })

  await container.resolve<GuitarChordService>('guitarChordService').ensureDefaultChords()

  return container
}
