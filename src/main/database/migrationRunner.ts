import MigrationModel from '../models/MigrationModel'
import { migrations } from './migrations'
import { getLogger } from '../utils/log'

const logger = getLogger('Migration')

export async function runMigrations() {
  logger.info('🚀 Checking migrations...')

  await MigrationModel.sync()

  const applied = await MigrationModel.findAll()
  const appliedIds = applied.map((m) => m.id)

  for (const item of migrations) {
    // 如果id不存在已有的记录中，执行up,并更新migrtation数据库
    if (!appliedIds.includes(item.id)) {
      logger.info(`🔧 Running migration: ${item.id}`)
      await item.up()
      await MigrationModel.create({ id: item.id })
      logger.info(`✅ Done: ${item.id}`)
    }
  }

  logger.info('🎉 Migration complete.')
}

// 回滚到指定版本
export async function rollbackTo(targetId: string) {
  logger.warn(`⚠ Rolling back to: ${targetId}`)

  const applied = await MigrationModel.findAll()
  const appliedIds = applied.map((m: any) => m.id)

  // 找到需要回滚的 migration（倒序）
  const needRollback = migrations.filter((m) => appliedIds.includes(m.id)).reverse()

  for (const m of needRollback) {
    if (m.id === targetId) break

    logger.warn(`⏪ Rolling back migration: ${m.id}`)
    await m.down()
    await MigrationModel.destroy({ where: { id: m.id } })
  }

  logger.info('Rollback complete.')
}
