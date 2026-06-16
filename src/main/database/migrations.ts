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
import { COLLECTION_TYPE } from '../constant/collection'
import { BUILTIN_COLLECTION_SEED_IDS } from '../constant/collectionSeedIds'
import {
  buildHeavyMetalPianoPack,
  buildMonoChromePianoPack,
  buildWoodBoardPianoPack
} from '../resources/virtualPianoSkins/builtinSkins'

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
  },
  {
    id: '004-piano-skin-packs',
    async up() {
      const heavyMetalId = BUILTIN_COLLECTION_SEED_IDS.pianoSkin.重金属
      await CollectionModel.update(
        {
          name: '重金属',
          content: JSON.stringify(buildHeavyMetalPianoPack()),
          description: '抛光金属琴键，多段反射高光与镜面质感。'
        },
        { where: { id: heavyMetalId } }
      )

      const monoId = BUILTIN_COLLECTION_SEED_IDS.pianoSkin.黑白
      const woodId = BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板

      const existing = await CollectionModel.findAll({ where: { id: [monoId, woodId] } })
      const existingIds = new Set(existing.map((row) => row.id))

      if (!existingIds.has(monoId)) {
        await CollectionModel.create({
          id: monoId,
          type: COLLECTION_TYPE.PIANO_SKIN,
          name: '黑白',
          content: JSON.stringify(buildMonoChromePianoPack()),
          description: '略带俯视的立体黑白琴键，顶面与前沿分明。',
          is_built_in: true,
          owned: true
        })
      }

      if (!existingIds.has(woodId)) {
        await CollectionModel.create({
          id: woodId,
          type: COLLECTION_TYPE.PIANO_SKIN,
          name: '木板',
          content: JSON.stringify(buildWoodBoardPianoPack()),
          description: '木纹木板白键与木桩年轮黑键，做旧质感。',
          is_built_in: true,
          owned: true
        })
      }

      // 开发测试：确保已存在记录也为已拥有
      await CollectionModel.update({ owned: true }, { where: { id: [monoId, woodId] } })

      await sequelize.query(
        `INSERT OR REPLACE INTO sqlite_sequence (name, seq) VALUES ('collection', ${BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板})`
      )
    },
    async down() {
      await CollectionModel.destroy({
        where: { id: [BUILTIN_COLLECTION_SEED_IDS.pianoSkin.黑白, BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板] }
      })
    }
  },
  {
    id: '005-piano-skin-owned-dev',
    async up() {
      const monoId = BUILTIN_COLLECTION_SEED_IDS.pianoSkin.黑白
      const woodId = BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板
      await CollectionModel.update({ owned: true }, { where: { id: [monoId, woodId] } })
    },
    async down() {
      await CollectionModel.update({ owned: false }, { where: { id: [BUILTIN_COLLECTION_SEED_IDS.pianoSkin.黑白, BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板] } })
    }
  },
  {
    id: '006-piano-skin-side-half',
    async up() {
      await CollectionModel.update(
        { content: JSON.stringify(buildHeavyMetalPianoPack()) },
        { where: { id: BUILTIN_COLLECTION_SEED_IDS.pianoSkin.重金属 } }
      )
      await CollectionModel.update(
        { content: JSON.stringify(buildMonoChromePianoPack()) },
        { where: { id: BUILTIN_COLLECTION_SEED_IDS.pianoSkin.黑白 } }
      )
      await CollectionModel.update(
        { content: JSON.stringify(buildWoodBoardPianoPack()) },
        { where: { id: BUILTIN_COLLECTION_SEED_IDS.pianoSkin.木板 } }
      )
    },
    async down() {
      // SVG 几何不可无损回滚，跳过
    }
  }
]
