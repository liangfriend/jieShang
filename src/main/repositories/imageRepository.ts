import ImageModel from '../models/ImageModel'
import { MediaLibraryRepository } from './mediaLibraryRepository'

export class ImageRepository extends MediaLibraryRepository {
  constructor() {
    super(ImageModel)
  }
}
