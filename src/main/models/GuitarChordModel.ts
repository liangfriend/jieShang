import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 吉他和弦符号：data 存完整 tabChord JSON */
export interface GuitarChordAttributes {
  id: number
  /** 展示/搜索用名称（与 tabChord.name 同步） */
  name: string
  /** tabChord JSON 字符串 */
  data: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface GuitarChordCreationAttributes
  extends Optional<GuitarChordAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class GuitarChordModel
  extends Model<GuitarChordAttributes, GuitarChordCreationAttributes>
  implements GuitarChordAttributes
{
  declare id: number
  declare name: string
  declare data: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

GuitarChordModel.init(
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
    tableName: 'guitar_chord',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default GuitarChordModel
