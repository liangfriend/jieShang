import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 音频表：用户上传到软件目录的音频文件 */
export interface AudioAttributes {
  id: number
  /** 用户展示名称 */
  name: string
  /** 操作系统绝对路径（文件名即 path.basename(url)，自动生成唯一值） */
  url: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface AudioCreationAttributes
  extends Optional<AudioAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class AudioModel
  extends Model<AudioAttributes, AudioCreationAttributes>
  implements AudioAttributes
{
  declare id: number
  declare name: string
  declare url: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

AudioModel.init(
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
    tableName: 'audio',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default AudioModel
