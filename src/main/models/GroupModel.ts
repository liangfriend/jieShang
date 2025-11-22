import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

// ----------- 类型定义 -----------

export interface GroupAttributes {
  id: number
  name: string

  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

// 创建时允许 id / timestamps 不传
export interface GroupCreationAttributes
  extends Optional<GroupAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// ----------- Model 类定义 -----------

export class GroupModel
  extends Model<GroupAttributes, GroupCreationAttributes>
  implements GroupAttributes
{
  declare id: number
  declare name: string

  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

GroupModel.init(
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
    tableName: 'group',
    freezeTableName: true,

    timestamps: true, // 自动维护 create/update 时间
    createdAt: 'created_at',
    updatedAt: 'updated_at',

    paranoid: true, // 软删除
    deletedAt: 'deleted_at',

    underscored: true // row_createdAt => row_created_at
  }
)

export default GroupModel
