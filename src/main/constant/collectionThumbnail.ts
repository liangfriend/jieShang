import pathManager from '../utils/pathManager'

export const APP_IMAGE_SCHEME = 'app-image'

/** 内置藏品缩略图虚拟路径：app-image://image/collection/{id}.svg */
export function builtinCollectionThumbnailUrl(id: number): string {
  return pathManager.toAppImageUrl(`image/collection/${id}.svg`)
}
