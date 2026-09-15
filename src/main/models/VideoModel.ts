import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 视频表：用户上传到软件目录的视频文件 */
export interface VideoAttributes {
  id: number
  name: string
  /** 操作系统绝对路径（文件名即 path.basename(url)） */
  url: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface VideoCreationAttributes
  extends Optional<VideoAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class VideoModel
  extends Model<VideoAttributes, VideoCreationAttributes>
  implements VideoAttributes
{
  declare id: number
  declare name: string
  declare url: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

VideoModel.init(
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
    tableName: 'video',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default VideoModel
