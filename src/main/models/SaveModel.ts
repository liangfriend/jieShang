import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

// ----------- 类型定义 -----------

export interface SaveAttributes {
  id: number
  game_id: number
  name: string
  data: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

// 创建时允许部分字段不传
export interface SaveCreationAttributes
  extends Optional<SaveAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// ----------- Model 类定义 -----------

export class SaveModel
  extends Model<SaveAttributes, SaveCreationAttributes>
  implements SaveAttributes
{
  declare id: number
  declare game_id: number
  declare name: string
  declare data: string

  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

SaveModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },

    game_id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    data: {
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
    tableName: 'save',
    freezeTableName: true,

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    paranoid: true,
    deletedAt: 'deleted_at',

    underscored: true
  }
)

export default SaveModel
