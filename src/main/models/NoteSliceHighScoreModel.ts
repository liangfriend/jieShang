import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 音符切切各模式历史最高分 */
export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

/** 计入排行榜的难度（不含测试） */
export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

/** 谱面模式：线谱 / 简谱（最高分按此维度分开记录） */
export type NoteSliceHighScoreNotation = 'staff' | 'jianpu'

export const NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION: NoteSliceHighScoreNotation = 'staff'

/** (mode, difficulty, notation) 唯一索引名 */
export const NOTE_SLICE_HIGH_SCORE_UNIQUE_INDEX = 'note_slice_high_score_mode_difficulty_notation'

export interface NoteSliceHighScoreAttributes {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  notation: NoteSliceHighScoreNotation
  high_score: number
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface NoteSliceHighScoreCreationAttributes
  extends Optional<
    NoteSliceHighScoreAttributes,
    'id' | 'notation' | 'high_score' | 'created_at' | 'updated_at' | 'deleted_at'
  > {}

export class NoteSliceHighScoreModel
  extends Model<NoteSliceHighScoreAttributes, NoteSliceHighScoreCreationAttributes>
  implements NoteSliceHighScoreAttributes
{
  declare id: number
  declare mode: NoteSliceHighScoreMode
  declare difficulty: NoteSliceHighScoreDifficulty
  declare notation: NoteSliceHighScoreNotation
  declare high_score: number
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

NoteSliceHighScoreModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    mode: {
      type: DataTypes.STRING,
      allowNull: false
    },
    difficulty: {
      type: DataTypes.STRING,
      allowNull: false
    },
    notation: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: NOTE_SLICE_HIGH_SCORE_DEFAULT_NOTATION
    },
    high_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'note_slice_high_score',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true,
    indexes: [
      {
        unique: true,
        name: NOTE_SLICE_HIGH_SCORE_UNIQUE_INDEX,
        fields: ['mode', 'difficulty', 'notation']
      }
    ]
  }
)

export default NoteSliceHighScoreModel
