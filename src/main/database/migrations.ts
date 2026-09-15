// src/main/database/migrations.ts

import GroupModel from '../models/GroupModel'
import MigrationModel from '../models/MigrationModel'
import ScoreModel from '../models/ScoreModel'
import WorkModel from '../models/WorkModel'
import AudioModel from '../models/AudioModel'
import ImageModel from '../models/ImageModel'
import VideoModel from '../models/VideoModel'
import CollectionModel from '../models/CollectionModel'
import AchievementProgressModel from '../models/AchievementProgressModel'
import NoteSliceHighScoreModel from '../models/NoteSliceHighScoreModel'
import GuitarChordModel from '../models/GuitarChordModel'
import { syncBuiltinCollections } from './collectionBuiltinSeed'
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
      await AudioModel.sync()
      await ImageModel.sync()
      await VideoModel.sync()
      await GuitarChordModel.sync()
      await CollectionModel.sync()
      await AchievementProgressModel.sync()
      await NoteSliceHighScoreModel.sync()
      syncBuiltinCollectionThumbnails()
      await syncBuiltinCollections()
    },
    async down() {
      await NoteSliceHighScoreModel.drop()
      await AchievementProgressModel.drop()
      await CollectionModel.drop()
      await GuitarChordModel.drop()
      await VideoModel.drop()
      await ImageModel.drop()
      await AudioModel.drop()
      await WorkModel.drop()
      await ScoreModel.drop()
      await GroupModel.drop()
      await MigrationModel.drop()
    }
  }
]
