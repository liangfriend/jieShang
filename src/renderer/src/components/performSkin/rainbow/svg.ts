/** 彩虹演奏皮肤 - 背景 SVG */
export const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="rb-bg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,248,252,0.96)"/>
      <stop offset="55%" stop-color="rgba(245,238,255,0.94)"/>
      <stop offset="100%" stop-color="rgba(234,245,255,0.92)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#rb-bg)"/>
</svg>`

/** 彩虹演奏皮肤 - 基准线 SVG */
export const baseline = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="3" preserveAspectRatio="none">
  <defs>
    <linearGradient id="rb-line" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="rgba(255,158,199,0)"/>
      <stop offset="8%" stop-color="rgba(255,158,199,0.45)"/>
      <stop offset="50%" stop-color="rgba(255,158,199,0.85)"/>
      <stop offset="92%" stop-color="rgba(201,184,255,0.45)"/>
      <stop offset="100%" stop-color="rgba(201,184,255,0)"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="3" rx="1.5" fill="url(#rb-line)"/>
</svg>`
