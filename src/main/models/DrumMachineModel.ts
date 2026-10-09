import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 电子鼓机谱：data 存 JSON（pattern 为谱本体，bpm / volume / swing 为播放配置） */
export interface DrumMachineAttributes {
  id: number
  name: string
  data: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface DrumMachineCreationAttributes
  extends Optional<DrumMachineAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class DrumMachineModel
  extends Model<DrumMachineAttributes, DrumMachineCreationAttributes>
  implements DrumMachineAttributes
{
  declare id: number
  declare name: string
  declare data: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

DrumMachineModel.init(
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
    tableName: 'drum_machine',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default DrumMachineModel
