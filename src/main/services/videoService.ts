import { VideoRepository } from '../repositories/videoRepository'
import { MediaLibraryService } from './mediaLibraryService'

export class VideoService extends MediaLibraryService {
  constructor({ videoRepository }: { videoRepository: VideoRepository }) {
    super('video', videoRepository)
  }
}
