import { createMediaFileApi, type MediaListItem } from './mediaFile'

export type VideoListItem = MediaListItem

function api() {
  return createMediaFileApi(window.api.video, '未命名视频')
}

export const searchVideosFromDatabase = (keyword = '') => api().search(keyword)
export const createVideoInDatabase = (
  payload: Parameters<ReturnType<typeof api>['create']>[0]
) => api().create(payload)
export const deleteVideoFromDatabase = (id: number) => api().delete(id)
export const nameFromOriginalVideoFile = (fileName: string) => api().nameFromFile(fileName)
