// src/main/database/migrations.ts

import GameModel from '../models/GameModel'
import SaveModel from '../models/SaveModel'
import ResourceModel from '../models/ResourceModel'
import GroupModel from '../models/GroupModel'
import MigrationModel from '../models/MigrationModel'
import ScoreModel from '../models/ScoreModel'
import WorkModel from '../models/WorkModel'
import sequelize from './connection'

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
    },
    async down() {
      await GameModel.drop()
      await SaveModel.drop()
      await ResourceModel.drop()
      await MigrationModel.drop()
      await GroupModel.drop()
    }
  },
  {
    id: '002-score-courseware',
    async up() {
      await sequelize.query('DROP TABLE IF EXISTS work')
      await ScoreModel.sync()
      await sequelize.query(
        `CREATE TABLE IF NOT EXISTS courseware (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name VARCHAR(255) NOT NULL,
          score_id INTEGER REFERENCES score(id),
          data TEXT NOT NULL DEFAULT '{}',
          created_at DATETIME NOT NULL,
          updated_at DATETIME NOT NULL,
          deleted_at DATETIME
        )`
      )
    },
    async down() {
      await sequelize.query('DROP TABLE IF EXISTS courseware')
      await ScoreModel.drop()
    }
  },
  {
    id: '003-courseware-to-work',
    async up() {
      const tables = await sequelize.getQueryInterface().showAllTables()
      const names = tables.map((t) => (typeof t === 'string' ? t : (t as { tableName: string }).tableName))
      if (names.includes('courseware') && !names.includes('work')) {
        await sequelize.query('ALTER TABLE courseware RENAME TO work')
      } else if (!names.includes('work')) {
        await WorkModel.sync()
      }
    },
    async down() {
      const tables = await sequelize.getQueryInterface().showAllTables()
      const names = tables.map((t) => (typeof t === 'string' ? t : (t as { tableName: string }).tableName))
      if (names.includes('work') && !names.includes('courseware')) {
        await sequelize.query('ALTER TABLE work RENAME TO courseware')
      }
    }
  },
  {
    id: '004-score-thumbnail',
    async up() {
      const table = await sequelize.getQueryInterface().describeTable('score')
      if (!table.thumbnail) {
        await sequelize.query('ALTER TABLE score ADD COLUMN thumbnail TEXT')
      }
    },
    async down() {
      const table = await sequelize.getQueryInterface().describeTable('score')
      if (table.thumbnail) {
        await sequelize.query('ALTER TABLE score DROP COLUMN thumbnail')
      }
    }
  }
]
