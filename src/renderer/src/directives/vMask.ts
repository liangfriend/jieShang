// maskDirective.js
export default {
  mounted(el) {
    // 创建遮罩层
    const mask = document.createElement('div')
    mask.className = 'v-mask-layer'
    mask.innerText = '敬请期待'

    // 基础样式
    Object.assign(mask.style, {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      background: 'rgba(0,0,0,0.5)',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '20px',
      zIndex: 9999,
      borderRadius: getComputedStyle(el).borderRadius
    })

    // 让目标元素成为定位容器
    el.style.position = 'relative'

    // 保存引用用于卸载
    el.__mask__ = mask

    el.appendChild(mask)
  },

  unmounted(el) {
    if (el.__mask__) {
      el.removeChild(el.__mask__)
      delete el.__mask__
    }
  }
}
