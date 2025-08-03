const drag = {
  mounted(el: HTMLElement, binding: { value: boolean }) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    const onMouseDown = (e: MouseEvent) => {
      if (!binding.value) return; // 根据 binding.value 判断是否启用
      isDragging = true;
      offsetX = e.clientX - el.getBoundingClientRect().left;
      offsetY = e.clientY - el.getBoundingClientRect().top;
      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      el.style.left = `${e.clientX - offsetX}px`;
      el.style.top = `${e.clientY - offsetY}px`;
    };

    const onMouseUp = () => {
      isDragging = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    el.addEventListener('mousedown', onMouseDown);
    el._dragData = {onMouseDown};
  },

  updated(el: HTMLElement, binding: { value: boolean; oldValue: boolean }) {
    if (binding.value === binding.oldValue) return;

    // 切换时重新绑定或解绑事件
    if (binding.value) {
      if (!el._dragData) return;
      el.addEventListener('mousedown', el._dragData.onMouseDown);
    } else {
      if (!el._dragData) return;
      el.removeEventListener('mousedown', el._dragData.onMouseDown);
    }
  },

  unmounted(el: HTMLElement) {
    if (el._dragData) {
      el.removeEventListener('mousedown', el._dragData.onMouseDown);
    }
  },
};

export default drag;
