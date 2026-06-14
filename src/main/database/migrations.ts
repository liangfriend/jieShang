// src/main/database/migrations.ts

import GameModel from '../models/GameModel'
import SaveModel from '../models/SaveModel'
import ResourceModel from '../models/ResourceModel'
import GroupModel from '../models/GroupModel'
import MigrationModel from '../models/MigrationModel'
import ScoreModel from '../models/ScoreModel'
import WorkModel from '../models/WorkModel'
import CollectionModel from '../models/CollectionModel'
import AchievementProgressModel from '../models/AchievementProgressModel'
import NoteSliceHighScoreModel from '../models/NoteSliceHighScoreModel'
import { insertBuiltinCollections } from './collectionBuiltinSeed'

export interface Migrations {
  id: string
  up: () => Promise<void>
  down: () => Promise<void>
}

export const migrations: Migrations[] = [
  {
    id: '001-init',
    async up() {
      await GameModel.sync()
      await SaveModel.sync()
      await ResourceModel.sync()
      await MigrationModel.sync()
      await GroupModel.sync()
      await ScoreModel.sync()
      await WorkModel.sync()
      await CollectionModel.sync()
      await insertBuiltinCollections()
    },
    async down() {
      await CollectionModel.drop()
      await WorkModel.drop()
      await ScoreModel.drop()
      await GroupModel.drop()
      await MigrationModel.drop()
      await ResourceModel.drop()
      await SaveModel.drop()
      await GameModel.drop()
    }
  },
  {
    id: '002-achievement-and-high-score',
    async up() {
      await AchievementProgressModel.sync()
      await NoteSliceHighScoreModel.sync()
    },
    async down() {
      await NoteSliceHighScoreModel.drop()
      await AchievementProgressModel.drop()
    }
  }
]
