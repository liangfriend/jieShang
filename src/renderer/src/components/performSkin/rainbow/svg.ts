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

/** 彩虹演奏皮肤 - midi 按下时基准线琴键位高亮 */
export const baselineMidiActive = `<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" preserveAspectRatio="none">
  <defs>
    <linearGradient id="rb-baseline-active" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ff6eb4"/>
      <stop offset="35%" stop-color="#ff3d9a"/>
      <stop offset="65%" stop-color="#b47aff"/>
      <stop offset="100%" stop-color="#5ce1e6"/>
    </linearGradient>
    <linearGradient id="rb-baseline-active-shine" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.95"/>
      <stop offset="45%" stop-color="#ffffff" stop-opacity="0.35"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0"/>
    </linearGradient>
    <filter id="rb-baseline-active-glow" x="-20%" y="-80%" width="140%" height="260%">
      <feGaussianBlur stdDeviation="1.2" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="100%" height="100%" rx="999" fill="url(#rb-baseline-active)" filter="url(#rb-baseline-active-glow)"/>
  <rect x="8%" y="12%" width="84%" height="42%" rx="999" fill="url(#rb-baseline-active-shine)"/>
  <rect width="100%" height="100%" rx="999" fill="none" stroke="#ffffff" stroke-opacity="0.55" stroke-width="1.2"/>
</svg>`
