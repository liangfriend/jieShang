import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'
import type { CollectionType } from '../constant/collection'

/**
 * 藏品表
 * - 音色 / 曲谱皮肤 / 钢琴皮肤：content 存藏品本体（JSON 或 data URL）
 * - 演奏皮肤：content 存内置皮肤名称
 */
export interface CollectionAttributes {
  id: number
  type: CollectionType
  /** 藏品内容（TEXT） */
  content: string
  /** 藏品说明 */
  description: string | null
  /** 是否内置（软件自带，不可删除） */
  is_built_in: boolean
  /** 是否已拥有 */
  owned: boolean
  /** 藏品缩略图（列表展示用） */
  thumbnail: string | null
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface CollectionCreationAttributes
  extends Optional<
    CollectionAttributes,
    | 'id'
    | 'description'
    | 'is_built_in'
    | 'owned'
    | 'thumbnail'
    | 'created_at'
    | 'updated_at'
    | 'deleted_at'
  > {}

export class CollectionModel
  extends Model<CollectionAttributes, CollectionCreationAttributes>
  implements CollectionAttributes
{
  declare id: number
  declare type: CollectionType
  declare content: string
  declare description: string | null
  declare is_built_in: boolean
  declare owned: boolean
  declare thumbnail: string | null
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

CollectionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      defaultValue: ''
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    is_built_in: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    owned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    tableName: 'collection',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default CollectionModel
