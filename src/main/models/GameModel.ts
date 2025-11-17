import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

// ----------- 类型定义 -----------

export interface GameAttributes {
  id: number
  name: string
  data: string
  front_cover: string
  description: string

  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

// 创建时允许 id / timestamps 不传
export interface GameCreationAttributes
  extends Optional<GameAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// ----------- Model 类定义 -----------

export class GameModel
  extends Model<GameAttributes, GameCreationAttributes>
  implements GameAttributes
{
  declare id: number
  declare name: string
  declare data: string
  declare front_cover: string
  declare description: string

  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

GameModel.init(
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
      allowNull: false
    },
    front_cover: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
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
    tableName: 'game',
    freezeTableName: true,

    timestamps: true, // 自动维护 create/update 时间
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    paranoid: true, // 软删除
    deletedAt: 'deleted_at',

    underscored: true // row_createdAt => row_created_at
  }
)

export default GameModel
