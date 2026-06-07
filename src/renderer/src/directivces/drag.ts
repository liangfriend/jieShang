import type { DirectiveBinding } from 'vue'

interface DragOptions {
  enabled: boolean
  axis?: 'x' | 'y' | 'both'
  limit?: boolean
}

const drag = {
  mounted(el: HTMLElement, binding: DirectiveBinding<DragOptions>) {
    let isDragging = false
    let offsetX = 0
    let offsetY = 0

    const getLimitRect = () => el.parentElement?.getBoundingClientRect() ?? null

    const onPointerMove = (e: PointerEvent) => {
      if (!isDragging) return
      let newLeft = e.clientX - offsetX
      let newTop = e.clientY - offsetY
      const axis = binding.value?.axis ?? 'both'
      const limit = binding.value?.limit ?? false

      if (limit) {
        const rect = getLimitRect()
        if (rect) {
          const elRect = el.getBoundingClientRect()
          if (axis === 'x' || axis === 'both') {
            newLeft = Math.max(0, Math.min(newLeft, rect.width - elRect.width))
          }
          if (axis === 'y' || axis === 'both') {
            newTop = Math.max(0, Math.min(newTop, rect.height - elRect.height))
          }
        }
      }

      if (axis !== 'y') el.style.left = `${newLeft}px`
      if (axis !== 'x') el.style.top = `${newTop}px`
    }

    const onPointerUp = (e: PointerEvent) => {
      if (!isDragging) return
      isDragging = false
      el.removeEventListener('pointermove', onPointerMove)
      el.removeEventListener('pointerup', onPointerUp)
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!binding.value?.enabled) return
      isDragging = true
      el.setPointerCapture(e.pointerId)
      const computedStyle = getComputedStyle(el)
      offsetX = e.clientX - parseInt(computedStyle.left)
      offsetY = e.clientY - parseInt(computedStyle.top)
      el.addEventListener('pointermove', onPointerMove)
      el.addEventListener('pointerup', onPointerUp)
    }

    el.addEventListener('pointerdown', onPointerDown)
    ;(el as HTMLElement & { _dragData?: { onPointerDown: (e: PointerEvent) => void } })._dragData = {
      onPointerDown
    }
  },

  updated(el: HTMLElement, binding: DirectiveBinding<DragOptions>) {
    const data = (el as HTMLElement & { _dragData?: { onPointerDown: (e: PointerEvent) => void } })._dragData
    if (!data) return
    if (binding.value?.enabled) {
      el.addEventListener('pointerdown', data.onPointerDown)
    } else {
      el.removeEventListener('pointerdown', data.onPointerDown)
    }
  },

  unmounted(el: HTMLElement) {
    const data = (el as HTMLElement & { _dragData?: { onPointerDown: (e: PointerEvent) => void } })._dragData
    if (data) el.removeEventListener('pointerdown', data.onPointerDown)
  }
}

export default drag
