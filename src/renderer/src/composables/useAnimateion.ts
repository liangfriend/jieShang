import { ref } from 'vue'
import { Animateion } from '@renderer/types'

function setup() {
  const animationMap = ref(new Map())

  function executeAnimation(id: number, animation: Animateion) {
    animationMap.value.set(id, animation)
  }

  return {
    animationMap,
    executeAnimation
  }
}

const res = setup()

export function useAnimateion() {
  return res
}
