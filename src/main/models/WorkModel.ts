import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'
import ScoreModel from './ScoreModel'

/** 作品：元数据在库，.sjw 本体在磁盘（url 为绝对路径） */
export interface WorkAttributes {
  id: number
  name: string
  /** 关联曲谱（可选，嵌入谱在 sjw 内） */
  score_id: number | null
  /** 操作系统绝对路径（文件名即 path.basename(url)） */
  url: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface WorkCreationAttributes
  extends Optional<WorkAttributes, 'id' | 'score_id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class WorkModel
  extends Model<WorkAttributes, WorkCreationAttributes>
  implements WorkAttributes
{
  declare id: number
  declare name: string
  declare score_id: number | null
  declare url: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

WorkModel.init(
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
    score_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: ScoreModel,
        key: 'id'
      }
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
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
    tableName: 'work',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

WorkModel.belongsTo(ScoreModel, { foreignKey: 'score_id', as: 'score' })
ScoreModel.hasMany(WorkModel, { foreignKey: 'score_id', as: 'works' })

export default WorkModel
