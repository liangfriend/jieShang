// src/main/database/migrations.ts

import GameModel from '../models/GameModel'
import WorkModel from '../models/WorkModel'
import SaveModel from '../models/SaveModel'
import ResourceModel from '../models/ResourceModel'
import MigrationModel from '../models/MigrationModel'

// import sequelize from './connection'

export interface Migrations {
  id: string
  up: () => Promise<void>
  down: () => Promise<void>
}

export const migrations: Migrations[] = [
  // -------------------------------
  // 001 初始化数据库
  // -------------------------------
  {
    id: '001-init',
    async up() {
      await GameModel.sync()
      await SaveModel.sync()
      await WorkModel.sync()
      await ResourceModel.sync()
      await MigrationModel.sync()
    },
    async down() {
      await GameModel.drop()
      await SaveModel.drop()
      await WorkModel.drop()
      await ResourceModel.drop()
      await MigrationModel.drop()
    }
  }
]
