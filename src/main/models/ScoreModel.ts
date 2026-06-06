import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 曲谱表：仅存打谱 JSON，可从作品通过 score_id 单独提取 */
export interface ScoreAttributes {
  id: number
  name: string
  /** 曲谱渲染插件产出的 JSON 字符串 */
  data: string
  /** 曲谱缩略图（预留，列表卡片展示用） */
  thumbnail?: string | null
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface ScoreCreationAttributes
  extends Optional<ScoreAttributes, 'id' | 'thumbnail' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class ScoreModel
  extends Model<ScoreAttributes, ScoreCreationAttributes>
  implements ScoreAttributes
{
  declare id: number
  declare name: string
  declare data: string
  declare thumbnail: string | null
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

ScoreModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    data: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: '{}'
    },
    thumbnail: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'score',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default ScoreModel
