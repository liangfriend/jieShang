import VideoModel from '../models/VideoModel'
import { MediaLibraryRepository } from './mediaLibraryRepository'

export class VideoRepository extends MediaLibraryRepository {
  constructor() {
    super(VideoModel)
  }
}
