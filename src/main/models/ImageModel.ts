import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 图片表：用户上传到软件目录的图片文件 */
export interface ImageAttributes {
  id: number
  name: string
  /** 操作系统绝对路径（文件名即 path.basename(url)） */
  url: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface ImageCreationAttributes
  extends Optional<ImageAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class ImageModel
  extends Model<ImageAttributes, ImageCreationAttributes>
  implements ImageAttributes
{
  declare id: number
  declare name: string
  declare url: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

ImageModel.init(
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
    tableName: 'image',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default ImageModel
