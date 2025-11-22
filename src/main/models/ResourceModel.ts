// src/main/models/ResourceModel.ts
import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

// ----------- 类型定义 -----------

export interface ResourceAttributes {
  id: number
  name: string
  type: 'image' | 'audio' | 'video'
  url: string
  group_id: number | null

  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface ResourceCreationAttributes
  extends Optional<ResourceAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

// ----------- Model 类 -----------

export class ResourceModel
  extends Model<ResourceAttributes, ResourceCreationAttributes>
  implements ResourceAttributes
{
  declare id: number
  declare name: string
  declare type: 'image' | 'audio' | 'video'
  declare url: string
  declare group_id: number | null

  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

ResourceModel.init(
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

    type: {
      type: DataTypes.ENUM('image', 'audio', 'video'),
      allowNull: false
    },

    url: {
      type: DataTypes.STRING,
      allowNull: false
    },

    group_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'group',
        key: 'id'
      }
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
    tableName: 'resource',
    freezeTableName: true,

    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true, // 软删除支持
    deletedAt: 'deleted_at',

    underscored: true
  }
)

export default ResourceModel
