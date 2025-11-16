import { DataTypes, Model } from 'sequelize'
import sequelize from '../database/connection'

// ------------- TS 类型 -------------
export interface MigrationAttributes {
  id: string
  createdAt?: Date
}

export class MigrationModel extends Model<MigrationAttributes> implements MigrationAttributes {
  declare id: string
  declare createdAt: Date
}

// ------------- Model 定义 -------------
MigrationModel.init(
  {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'migration',
    timestamps: false
  }
)

export default MigrationModel
