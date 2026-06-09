import { ipcMain } from 'electron'
import type { CollectionType } from '../constant/collection'
import { CollectionService } from '../services/collectionService'

export class CollectionController {
  private collectionService: CollectionService

  constructor({ collectionService }) {
    this.collectionService = collectionService
  }

  register() {
    ipcMain.handle('collection:create', (_, payload) =>
      this.collectionService.createCollection(payload)
    )
    ipcMain.handle('collection:delete', (_, id) => this.collectionService.deleteCollection(id))
    ipcMain.handle('collection:update', (_, id, payload) =>
      this.collectionService.updateCollection(id, payload)
    )
    ipcMain.handle('collection:get', (_, id) => this.collectionService.getCollection(id))
    ipcMain.handle('collection:query', (_, filters) =>
      this.collectionService.queryCollections(filters)
    )
    ipcMain.handle('collection:list', () => this.collectionService.listCollections())
    ipcMain.handle('collection:listByType', (_, type: CollectionType) =>
      this.collectionService.listByType(type)
    )
  }
}
