import { Model, DataTypes, Optional } from 'sequelize'
import sequelize from '../database/connection'

/** 吉他和弦符号：data 存完整 tabChord JSON；hand_pose 存按弦手型；tab_type 区分 4/6 弦 */
export type GuitarChordTabType = 'tab4' | 'tab5' | 'tab6'

export function isGuitarChordTabType(raw: unknown): raw is GuitarChordTabType {
  return raw === 'tab4' || raw === 'tab5' || raw === 'tab6'
}

export function guitarChordStringCount(tabType: GuitarChordTabType): number {
  if (tabType === 'tab4') return 4
  if (tabType === 'tab5') return 5
  return 6
}

export function guitarChordTabTypeFromStringCount(stringCount: number): GuitarChordTabType {
  if (stringCount === 4) return 'tab4'
  if (stringCount === 5) return 'tab5'
  return 'tab6'
}

export interface GuitarChordAttributes {
  id: number
  /** 展示/搜索用名称（与 tabChord.name 同步） */
  name: string
  /** tabChord JSON 字符串 */
  data: string
  /** FingerPoseMap JSON 字符串；未编辑时为 null */
  hand_pose: string | null
  /** tab4=尤克里里四弦；tab5=贝斯五弦；tab6=吉他六弦 */
  tab_type: GuitarChordTabType
  created_at?: Date
  updated_at?: Date
  deleted_at?: Date | null
}

export interface GuitarChordCreationAttributes
  extends Optional<
    GuitarChordAttributes,
    'id' | 'hand_pose' | 'tab_type' | 'created_at' | 'updated_at' | 'deleted_at'
  > {}

export class GuitarChordModel
  extends Model<GuitarChordAttributes, GuitarChordCreationAttributes>
  implements GuitarChordAttributes
{
  declare id: number
  declare name: string
  declare data: string
  declare hand_pose: string | null
  declare tab_type: GuitarChordTabType
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
    hand_pose: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null
    },
    tab_type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'tab6'
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
