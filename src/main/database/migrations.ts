// src/main/database/migrations.ts

import GroupModel from '../models/GroupModel'
import MigrationModel from '../models/MigrationModel'
import { DataTypes } from 'sequelize'
import sequelize from './connection'
import ScoreModel, { DEFAULT_SCORE_TYPE } from '../models/ScoreModel'
import WorkModel from '../models/WorkModel'
import AudioModel from '../models/AudioModel'
import ImageModel from '../models/ImageModel'
import VideoModel from '../models/VideoModel'
import CollectionModel from '../models/CollectionModel'
import AchievementProgressModel from '../models/AchievementProgressModel'
import NoteSliceHighScoreModel from '../models/NoteSliceHighScoreModel'
import GuitarChordModel from '../models/GuitarChordModel'
import DrumMachineModel from '../models/DrumMachineModel'
import CustomSymbolModel from '../models/CustomSymbolModel'
import {
  syncBuiltinBass5Chords,
  syncBuiltinGuitarChords,
  syncBuiltinUkuleleChords
} from './guitarChordBuiltinSeed'
import { BUILTIN_COLLECTION_SEED_IDS } from '../constant/collectionSeedIds'
import { BUILTIN_SCORE_SKIN_SEEDS } from '../resources/scoreSkins/builtinScoreSkins'

export interface Migrations {
  id: string
  up: () => Promise<void>
  down: () => Promise<void>
}

/** 用当前资源覆盖内置乐谱皮肤内容；全新安装时行还不存在，update 影响 0 行即可 */
async function overwriteBuiltinScoreSkins(): Promise<void> {
  for (const item of BUILTIN_SCORE_SKIN_SEEDS) {
    const id =
      BUILTIN_COLLECTION_SEED_IDS.scoreSkin[
        item.name as keyof typeof BUILTIN_COLLECTION_SEED_IDS.scoreSkin
      ]
    await CollectionModel.update({ content: item.content }, { where: { id, is_built_in: true } })
  }
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
      // note_slice_high_score：含 notation 列，唯一索引 (mode, difficulty, notation)
      await NoteSliceHighScoreModel.sync()
      await DrumMachineModel.sync()
      // 内置藏品在 setupContainer 每次启动同步（新增藏品对已有库也生效）
      await syncBuiltinGuitarChords()
      await syncBuiltinUkuleleChords()
      await syncBuiltinBass5Chords()
    },
    async down() {
      await DrumMachineModel.drop()
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
  },
  {
    // 内置乐谱皮肤资源更新（含 tab 符尾改为朝下符干版本）；全新安装时行由启动同步插入
    id: '002-update-builtin-score-skins',
    async up() {
      await overwriteBuiltinScoreSkins()
    },
    async down() {
      // 旧皮肤内容未保留，无法回滚
    }
  },
  {
    // 内置乐谱皮肤加入古筝指法（单音指法 guzheng_* 与连续指法）
    id: '003-update-builtin-score-skins-guzheng',
    async up() {
      await overwriteBuiltinScoreSkins()
    },
    async down() {
      // 旧皮肤内容未保留，无法回滚
    }
  },
  {
    // score 增加 type 列区分打谱 / 和弦弹唱谱；全新安装时 001 的 sync 已建出该列
    id: '004-score-add-type',
    async up() {
      const qi = sequelize.getQueryInterface()
      const columns = await qi.describeTable('score')
      if (!columns.type) {
        await qi.addColumn('score', 'type', {
          type: DataTypes.STRING,
          allowNull: false,
          defaultValue: DEFAULT_SCORE_TYPE
        })
      }
    },
    async down() {
      const qi = sequelize.getQueryInterface()
      const columns = await qi.describeTable('score')
      if (columns.type) {
        await ScoreModel.destroy({ where: { type: 'cl_sheet' }, force: true })
        await qi.removeColumn('score', 'type')
      }
    }
  },
  {
    // 曲谱编辑自定义符号库（小节 / 音符 / slot），加到曲谱时整份复制进 MusicScore.extra*Symbol
    id: '005-create-custom-symbol',
    async up() {
      await CustomSymbolModel.sync()
    },
    async down() {
      await CustomSymbolModel.drop()
    }
  },
  {
    // 内置乐谱皮肤资源更新；全新安装时行由启动 syncBuiltinCollections 插入，此处 update 影响 0 行即可
    id: '006-update-builtin-score-skins',
    async up() {
      await overwriteBuiltinScoreSkins()
    },
    async down() {
      // 旧皮肤内容未保留，无法回滚
    }
  },
  {
    // 内置乐谱皮肤资源再次更新；全新安装时行由启动 syncBuiltinCollections 插入，此处 update 影响 0 行即可
    id: '007-update-builtin-score-skins',
    async up() {
      await overwriteBuiltinScoreSkins()
    },
    async down() {
      // 旧皮肤内容未保留，无法回滚
    }
  }
]
