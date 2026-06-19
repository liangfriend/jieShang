// src/main/database/migrations.ts

import GroupModel from '../models/GroupModel'
import MigrationModel from '../models/MigrationModel'
import ScoreModel from '../models/ScoreModel'
import WorkModel from '../models/WorkModel'
import CollectionModel from '../models/CollectionModel'
import AchievementProgressModel from '../models/AchievementProgressModel'
import NoteSliceHighScoreModel from '../models/NoteSliceHighScoreModel'
import { insertBuiltinCollections, syncBuiltinCollections } from './collectionBuiltinSeed'
import { syncBuiltinCollectionThumbnails } from '../utils/collectionThumbnailSync'

export interface Migrations {
  id: string
  up: () => Promise<void>
  down: () => Promise<void>
}

export const migrations: Migrations[] = [
  {
    id: '001-init',
    async up() {
      await MigrationModel.sync()
      await GroupModel.sync()
      await ScoreModel.sync()
      await WorkModel.sync()
      await CollectionModel.sync()
      await AchievementProgressModel.sync()
      await NoteSliceHighScoreModel.sync()
      syncBuiltinCollectionThumbnails()
      await insertBuiltinCollections()
    },
    async down() {
      await NoteSliceHighScoreModel.drop()
      await AchievementProgressModel.drop()
      await CollectionModel.drop()
      await WorkModel.drop()
      await ScoreModel.drop()
      await GroupModel.drop()
      await MigrationModel.drop()
    }
  },
  {
    id: '002-sync-builtin-collections',
    async up() {
      await syncBuiltinCollections()
    },
    async down() {
      // 仅同步元数据，不回滚
    }
  }
]
