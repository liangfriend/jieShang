import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 已解锁成就：仅存 key 与完成时间 */
export interface AchievementProgressAttributes {
  id: number
  key: string
  completed_at: Date
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface AchievementProgressCreationAttributes
  extends Optional<
    AchievementProgressAttributes,
    'id' | 'created_at' | 'updated_at' | 'deleted_at'
  > {}

export class AchievementProgressModel
  extends Model<AchievementProgressAttributes, AchievementProgressCreationAttributes>
  implements AchievementProgressAttributes
{
  declare id: number
  declare key: string
  declare completed_at: Date
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

AchievementProgressModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    tableName: 'achievement_progress',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default AchievementProgressModel
