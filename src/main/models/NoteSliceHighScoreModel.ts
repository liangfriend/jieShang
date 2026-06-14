import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 音符切切各模式历史最高分 */
export type NoteSliceHighScoreMode = 'arcade' | 'endless' | 'extreme'

/** 计入排行榜的难度（不含测试） */
export type NoteSliceHighScoreDifficulty = 'easy' | 'standard' | 'hard'

export interface NoteSliceHighScoreAttributes {
  id: number
  mode: NoteSliceHighScoreMode
  difficulty: NoteSliceHighScoreDifficulty
  high_score: number
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface NoteSliceHighScoreCreationAttributes
  extends Optional<
    NoteSliceHighScoreAttributes,
    'id' | 'high_score' | 'created_at' | 'updated_at' | 'deleted_at'
  > {}

export class NoteSliceHighScoreModel
  extends Model<NoteSliceHighScoreAttributes, NoteSliceHighScoreCreationAttributes>
  implements NoteSliceHighScoreAttributes
{
  declare id: number
  declare mode: NoteSliceHighScoreMode
  declare difficulty: NoteSliceHighScoreDifficulty
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
        fields: ['mode', 'difficulty']
      }
    ]
  }
)

export default NoteSliceHighScoreModel
