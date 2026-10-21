import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 自定义符号种类，对应 MusicScore.extraNoteSymbol / extraSlotSymbol / extraMeasureSymbol */
export const CUSTOM_SYMBOL_KINDS = ['note', 'slot', 'measure'] as const
export type CustomSymbolKind = (typeof CUSTOM_SYMBOL_KINDS)[number]

/**
 * 曲谱自定义符号库：加到曲谱时整份复制进 MusicScore.extra*Symbol，
 * 之后改 / 删库里的符号都不影响已有曲谱。
 * data 存 JSON：content(svg) / w / h / widthRatio? 及对应种类的规则字段。
 */
export interface CustomSymbolAttributes {
  id: number
  name: string
  kind: CustomSymbolKind
  /** 内部生成、全局唯一，曲谱附属符号 name 引用它 */
  skin_key: string
  data: string
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface CustomSymbolCreationAttributes
  extends Optional<CustomSymbolAttributes, 'id' | 'created_at' | 'updated_at' | 'deleted_at'> {}

export class CustomSymbolModel
  extends Model<CustomSymbolAttributes, CustomSymbolCreationAttributes>
  implements CustomSymbolAttributes
{
  declare id: number
  declare name: string
  declare kind: CustomSymbolKind
  declare skin_key: string
  declare data: string
  declare created_at: Date
  declare updated_at: Date
  declare deleted_at: Date | null
}

CustomSymbolModel.init(
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
    kind: {
      type: DataTypes.STRING,
      allowNull: false
    },
    skin_key: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
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
    tableName: 'custom_symbol',
    freezeTableName: true,
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    underscored: true
  }
)

export default CustomSymbolModel
