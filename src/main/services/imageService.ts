import { ImageRepository } from '../repositories/imageRepository'
import { MediaLibraryService } from './mediaLibraryService'

export class ImageService extends MediaLibraryService {
  constructor({ imageRepository }: { imageRepository: ImageRepository }) {
    super('image', imageRepository)
  }
}
