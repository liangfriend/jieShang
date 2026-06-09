/** 默认演奏皮肤 - 纯白背景 */
export const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
  <rect width="100%" height="100%" fill="#ffffff"/>
</svg>`

/** 默认演奏皮肤 - 纯红基准线 */
export const baseline = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="3" preserveAspectRatio="none">
  <rect width="100%" height="3" fill="#ff0000"/>
</svg>`

/** 默认演奏皮肤 - midi 按下时基准线琴键位高亮 */
export const baselineMidiActive = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="def-baseline-active" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#64b5f6"/>
      <stop offset="55%" stop-color="#2196f3"/>
      <stop offset="100%" stop-color="#1565c0"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" rx="999" fill="url(#def-baseline-active)"/>
</svg>`
