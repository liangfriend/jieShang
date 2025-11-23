import { computed, ComputedRef, Ref, ref } from 'vue'
import { ResourceModel } from '@renderer/types'

export type StaticResource = {
  resourceList: Ref<ResourceModel[]>
  imageList: ComputedRef<ResourceModel[]>
  audioList: ComputedRef<ResourceModel[]>
  videoList: ComputedRef<ResourceModel[]>
}

export async function useStaticResource(groupId: number = -1): Promise<StaticResource> {
  const resourceList = ref([])
  resourceList.value = (
    await window.api.resource.query(groupId !== -1 ? { group: groupId } : {})
  ).data
  const imageList = computed(() => {
    return resourceList.value.filter((r: any) => r.type === 'image')
  })
  const audioList = computed(() => {
    return resourceList.value.filter((r: any) => r.type === 'audio')
  })
  const videoList = computed(() => {
    return resourceList.value.filter((r: any) => r.type === 'video')
  })

  return { resourceList, imageList, audioList, videoList }
}
