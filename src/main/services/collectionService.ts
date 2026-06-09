import type { CollectionType } from '../constant/collection'
import {
  CollectionRepository,
  type CollectionQueryFilters,
  type CollectionUpdatePayload,
  type CollectionWritePayload
} from '../repositories/collectionRepository'

export class CollectionService {
  private collectionRepository: CollectionRepository

  constructor({ collectionRepository }) {
    this.collectionRepository = collectionRepository
  }

  async createCollection(payload: CollectionWritePayload) {
    const data = await this.collectionRepository.create(payload)
    return { success: true, data }
  }

  async deleteCollection(id: string | number) {
    const data = await this.collectionRepository.delete(id)
    return { success: true, data }
  }

  async updateCollection(id: string | number, payload: CollectionUpdatePayload) {
    const data = await this.collectionRepository.update(id, payload)
    return { success: true, data }
  }

  async getCollection(id: string | number) {
    const data = await this.collectionRepository.findById(id)
    return { success: true, data }
  }

  async queryCollections(filters: CollectionQueryFilters) {
    const data = await this.collectionRepository.query(filters)
    return { success: true, data }
  }

  async listCollections() {
    const data = await this.collectionRepository.query({})
    return { success: true, data }
  }

  async listByType(type: CollectionType) {
    const data = await this.collectionRepository.listByType(type)
    return { success: true, data }
  }
}
