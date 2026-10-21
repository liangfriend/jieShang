import { ipcMain } from 'electron'
import { CustomSymbolService } from '../services/customSymbolService'

export class CustomSymbolController {
  private customSymbolService: CustomSymbolService

  constructor({ customSymbolService }) {
    this.customSymbolService = customSymbolService
  }

  register() {
    ipcMain.handle('customSymbol:create', (_, payload) => this.customSymbolService.create(payload))
    ipcMain.handle('customSymbol:delete', (_, id) => this.customSymbolService.delete(id))
    ipcMain.handle('customSymbol:update', (_, id, payload) =>
      this.customSymbolService.update(id, payload)
    )
    ipcMain.handle('customSymbol:list', (_, kind) => this.customSymbolService.list(kind))
  }
}
