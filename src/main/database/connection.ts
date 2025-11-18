import { Sequelize } from 'sequelize'
import path from 'path'
import pathManager from '../utils/pathManager'

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: pathManager.getDatabasePath(),
  logging: false
})
export default sequelize
