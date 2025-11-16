import { computed, ComputedRef, Ref, ref } from 'vue'

type Resource = {
  id: number
  name: string
  type: string
  url: string
}
export type StaticResource = {
  resourceList: Ref<Resource[]>
  imageList: ComputedRef<Resource[]>
  audioList: ComputedRef<Resource[]>
  videoList: ComputedRef<Resource[]>
}

function setup(data: Resource[]): StaticResource {
  const resourceList = ref(data || [])
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

let res: StaticResource | null = null

export function updateStaticResource(resrourceList: Resource[]) {
  if (!res) {
    res = setup(resrourceList)
  } else {
    res.resourceList.value = resrourceList
  }
}

export function useStaticResource() {
  if (!res) updateStaticResource([])

  return res!
}
