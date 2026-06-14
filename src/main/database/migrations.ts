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
import sequelize from '../database/connection'

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
  },
  {
    id: '003-high-score-by-difficulty',
    async up() {
      const qi = sequelize.getQueryInterface()
      const table = await qi.describeTable('note_slice_high_score').catch(() => null)
      if (!table) {
        await NoteSliceHighScoreModel.sync()
        return
      }
      if ('difficulty' in table) {
        return
      }

      await sequelize.query(`
        CREATE TABLE note_slice_high_score_new (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          mode VARCHAR(255) NOT NULL,
          difficulty VARCHAR(255) NOT NULL DEFAULT 'standard',
          high_score INTEGER NOT NULL DEFAULT 0,
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          deleted_at DATETIME,
          UNIQUE(mode, difficulty)
        )
      `)
      await sequelize.query(`
        INSERT INTO note_slice_high_score_new (id, mode, difficulty, high_score, created_at, updated_at, deleted_at)
        SELECT id, mode, 'standard', high_score, created_at, updated_at, deleted_at
        FROM note_slice_high_score
      `)
      await sequelize.query(`DROP TABLE note_slice_high_score`)
      await sequelize.query(`ALTER TABLE note_slice_high_score_new RENAME TO note_slice_high_score`)
    },
    async down() {
      await sequelize.query(`DROP TABLE IF EXISTS note_slice_high_score`)
    }
  }
]
