import { createMediaFileApi, type MediaListItem } from './mediaFile'

export type ImageListItem = MediaListItem

function api() {
  return createMediaFileApi(window.api.image, '未命名图片')
}

export const searchImagesFromDatabase = (keyword = '') => api().search(keyword)
export const createImageInDatabase = (
  payload: Parameters<ReturnType<typeof api>['create']>[0]
) => api().create(payload)
export const deleteImageFromDatabase = (id: number) => api().delete(id)
export const nameFromOriginalImageFile = (fileName: string) => api().nameFromFile(fileName)
