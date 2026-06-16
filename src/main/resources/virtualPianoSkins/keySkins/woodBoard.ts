import { buildVirtualPianoPack, type KeySkinSvg, wrapKeySkinSvg } from './shared'

const WOOD_END_RINGS = `<ellipse cx="6.2" cy="22.1" rx="0.8" ry="0.7" fill="none" stroke="#5a3c1e" stroke-width="0.52" opacity="0.65"/>
<ellipse cx="6.4" cy="22.3" rx="1.6" ry="1.5" fill="none" stroke="#321e0c" stroke-width="0.49" opacity="0.60"/>
<ellipse cx="6.1" cy="22.0" rx="2.4" ry="2.2" fill="none" stroke="#5a3c1e" stroke-width="0.46" opacity="0.55"/>
<ellipse cx="6.3" cy="22.2" rx="3.2" ry="2.9" fill="none" stroke="#321e0c" stroke-width="0.43" opacity="0.50"/>
<ellipse cx="6.0" cy="22.1" rx="4.0" ry="3.7" fill="none" stroke="#5a3c1e" stroke-width="0.40" opacity="0.45"/>
<ellipse cx="6.2" cy="22.3" rx="4.8" ry="4.4" fill="none" stroke="#321e0c" stroke-width="0.37" opacity="0.40"/>
<ellipse cx="6.1" cy="22.0" rx="5.6" ry="5.1" fill="none" stroke="#5a3c1e" stroke-width="0.34" opacity="0.35"/>`

/** 木板琴键（固定木纹种子与裂缝路径） */
const WOOD_WHITE: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="wdWnBase" x1="0" y1="0" x2="1" y2="0.06">
      <stop offset="0%" stop-color="#b98a4e"/>
      <stop offset="45%" stop-color="#cf9f63"/>
      <stop offset="78%" stop-color="#bd8d50"/>
      <stop offset="100%" stop-color="#a87a42"/>
    </linearGradient>
    <linearGradient id="wdWnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#a3753c"/><stop offset="100%" stop-color="#7d5628"/>
    </linearGradient>
    <linearGradient id="wdWnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#9c7038"/><stop offset="100%" stop-color="#7a5428"/>
    </linearGradient>
    <linearGradient id="wdWnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#8e6630"/><stop offset="100%" stop-color="#6c481f"/>
    </linearGradient>
    <filter id="wdWnGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.62 0.022" numOctaves="5" seed="42" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.30 0 0 0 0 0.17 0 0 0 0 0.06 0 0 0 1.2 -0.5"/>
    </filter>
    <filter id="wdWnBlotch" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.05 0.03" numOctaves="2" seed="49" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.20 0 0 0 0 0.12 0 0 0 0 0.04 0 0 0 0.5 -0.18"/>
    </filter>
  </defs>
  <path d="M0 82 H20 V96.5 Q20 100 17 100 H3 Q0 100 0 96.5 Z" fill="url(#wdWnFront)"/>
  <rect x="0" y="82" width="1.3" height="18" fill="url(#wdWnEdgeL)"/>
  <rect x="18.7" y="82" width="1.3" height="18" fill="url(#wdWnEdgeR)"/>
  <rect x="0" y="0" width="20" height="82" fill="url(#wdWnBase)"/>
  <rect x="0" y="0" width="20" height="82" filter="url(#wdWnBlotch)"/>
  <rect x="0" y="0" width="20" height="82" filter="url(#wdWnGrain)"/>
  <path d="M5.2 2 L4.8 10.7 L5.5 19.3 L4.6 28 L5.1 36.8 L4.9 45.2 L5.3 54 L4.7 62.5 L5.0 71 L4.8 78" stroke="#2a1808" stroke-width="0.5" fill="none" opacity="0.55" stroke-linecap="round"/>
  <path d="M14.5 6 L14.1 15.2 L15.0 23.8 L14.3 32.5 L14.8 41 L14.2 49.5 L14.6 58 L14.0 66.2 L14.4 74" stroke="#341c0a" stroke-width="0.4" fill="none" opacity="0.4" stroke-linecap="round"/>
  <rect x="0" y="0" width="1.6" height="82" fill="rgba(40,22,8,0.28)"/>
  <rect x="18.4" y="0" width="1.6" height="82" fill="rgba(40,22,8,0.34)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(40,22,8,0.35)" stroke-width="0.5"/>
  <line x1="0" y1="82" x2="20" y2="82" stroke="rgba(40,22,8,0.25)" stroke-width="0.5"/>`
  ),
  press: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="wdWpBase" x1="0" y1="0" x2="1" y2="0.06">
      <stop offset="0%" stop-color="#9a7038"/>
      <stop offset="50%" stop-color="#ad8048"/>
      <stop offset="100%" stop-color="#8c6432"/>
    </linearGradient>
    <linearGradient id="wdWpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#80582a"/><stop offset="100%" stop-color="#5e3e1c"/>
    </linearGradient>
    <linearGradient id="wdWpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#7c5630"/><stop offset="100%" stop-color="#5e3e1c"/>
    </linearGradient>
    <linearGradient id="wdWpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#704c28"/><stop offset="100%" stop-color="#523619"/>
    </linearGradient>
    <filter id="wdWpGrain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.62 0.022" numOctaves="5" seed="42" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.22 0 0 0 0 0.12 0 0 0 0 0.04 0 0 0 1.2 -0.5"/>
    </filter>
  </defs>
  <path d="M0 87 H20 V96.5 Q20 100 17 100 H3 Q0 100 0 96.5 Z" fill="url(#wdWpFront)"/>
  <rect x="0" y="87" width="1.3" height="13" fill="url(#wdWpEdgeL)"/>
  <rect x="18.7" y="87" width="1.3" height="13" fill="url(#wdWpEdgeR)"/>
  <rect x="0" y="0" width="20" height="87" fill="url(#wdWpBase)"/>
  <rect x="0" y="0" width="20" height="87" filter="url(#wdWpGrain)"/>
  <path d="M6.1 2 L5.7 11.5 L6.4 20.8 L5.5 30 L6.0 39.2 L5.8 48 L6.2 57 L5.6 66 L6.0 75 L5.7 84" stroke="#2a1808" stroke-width="0.5" fill="none" opacity="0.5" stroke-linecap="round"/>
  <rect x="0" y="0" width="1.6" height="87" fill="rgba(30,16,6,0.3)"/>
  <rect x="18.4" y="0" width="1.6" height="87" fill="rgba(30,16,6,0.36)"/>
  <rect x="0" y="84" width="20" height="3" fill="rgba(20,10,4,0.2)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(30,16,6,0.4)" stroke-width="0.5"/>
  <line x1="0" y1="87" x2="20" y2="87" stroke="rgba(30,16,6,0.3)" stroke-width="0.5"/>`
  )
}

const WOOD_BLACK: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <radialGradient id="wdBnTop" cx="48%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#8a5e34"/>
      <stop offset="55%" stop-color="#5e3c20"/>
      <stop offset="100%" stop-color="#3e2814"/>
    </radialGradient>
    <linearGradient id="wdBnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#3e2814"/><stop offset="100%" stop-color="#22140a"/>
    </linearGradient>
    <linearGradient id="wdBnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#3a2412"/><stop offset="100%" stop-color="#1e1208"/>
    </linearGradient>
    <linearGradient id="wdBnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#33200f"/><stop offset="100%" stop-color="#1a1006"/>
    </linearGradient>
    <filter id="wdBnRough" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="3" seed="17" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.20 0 0 0 0 0.12 0 0 0 0 0.05 0 0 0 0.6 -0.25"/>
    </filter>
    <filter id="wdBnBark" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="turbulence" baseFrequency="0.05 0.6" numOctaves="4" seed="20" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.14 0 0 0 0 0.08 0 0 0 0 0.03 0 0 0 1.4 -0.55"/>
    </filter>
    <filter id="wdBnShadow" x="-20%" y="-10%" width="140%" height="132%">
      <feDropShadow dx="0" dy="1" stdDeviation="0.8" flood-color="#120a04" flood-opacity="0.5"/>
    </filter>
  </defs>
  <g filter="url(#wdBnShadow)">
    <path d="M0 46 H12 V57 Q12 59.5 10 59.5 H2 Q0 59.5 0 57 Z" fill="url(#wdBnFront)"/>
    <path d="M0 46 H12 V57 Q12 59.5 10 59.5 H2 Q0 59.5 0 57 Z" filter="url(#wdBnBark)"/>
    <rect x="0" y="46" width="0.9" height="13.5" fill="url(#wdBnEdgeL)"/>
    <rect x="11.1" y="46" width="0.9" height="13.5" fill="url(#wdBnEdgeR)"/>
    <rect x="0" y="0" width="12" height="46" fill="url(#wdBnTop)"/>
    <rect x="0" y="0" width="12" height="46" filter="url(#wdBnRough)"/>
    ${WOOD_END_RINGS}
    <ellipse cx="6" cy="22" rx="0.8" ry="0.7" fill="#1c1006"/>
    <path d="M6 22 L5.6 2" stroke="#1c1006" stroke-width="0.5" opacity="0.6"/>
    <path d="M6 22 L11.4 26" stroke="#1c1006" stroke-width="0.45" opacity="0.5"/>
    <path d="M6 22 L1 16" stroke="#1c1006" stroke-width="0.4" opacity="0.45"/>
    <path d="M6 22 L7.5 44" stroke="#1c1006" stroke-width="0.4" opacity="0.4"/>
    <line x1="0" y1="46" x2="12" y2="46" stroke="rgba(20,10,4,0.4)" stroke-width="0.4"/>
  </g>`
  ),
  press: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <radialGradient id="wdBpTop" cx="48%" cy="42%" r="62%">
      <stop offset="0%" stop-color="#6a4626"/>
      <stop offset="55%" stop-color="#442c16"/>
      <stop offset="100%" stop-color="#281808"/>
    </radialGradient>
    <linearGradient id="wdBpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#281808"/><stop offset="100%" stop-color="#130b04"/>
    </linearGradient>
    <linearGradient id="wdBpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#281808"/><stop offset="100%" stop-color="#140c04"/>
    </linearGradient>
    <linearGradient id="wdBpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#221406"/><stop offset="100%" stop-color="#100a04"/>
    </linearGradient>
    <filter id="wdBpRough" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.9 0.9" numOctaves="3" seed="17" result="t"/>
      <feColorMatrix in="t" type="matrix" values="0 0 0 0 0.14 0 0 0 0 0.08 0 0 0 0 0.03 0 0 0 0.7 -0.3"/>
    </filter>
  </defs>
  <path d="M0 52 H12 V57 Q12 59.5 10 59.5 H2 Q0 59.5 0 57 Z" fill="url(#wdBpFront)"/>
  <rect x="0" y="52" width="0.9" height="7.5" fill="url(#wdBpEdgeL)"/>
  <rect x="11.1" y="52" width="0.9" height="7.5" fill="url(#wdBpEdgeR)"/>
  <rect x="0" y="0" width="12" height="52" fill="url(#wdBpTop)"/>
  <rect x="0" y="0" width="12" height="52" filter="url(#wdBpRough)"/>
  ${WOOD_END_RINGS.replace(/22\./g, '24.').replace(/ cy="22"/g, ' cy="24"')}
  <ellipse cx="6" cy="24" rx="0.8" ry="0.7" fill="#140c04"/>
  <path d="M6 24 L5.6 2" stroke="#140c04" stroke-width="0.5" opacity="0.6"/>
  <path d="M6 24 L11.4 28" stroke="#140c04" stroke-width="0.45" opacity="0.5"/>
  <rect x="0" y="50" width="12" height="2.5" fill="rgba(15,8,3,0.3)"/>
  <line x1="0" y1="52" x2="12" y2="52" stroke="rgba(15,8,3,0.55)" stroke-width="0.55"/>`
  )
}

export function buildWoodBoardPianoPack() {
  return buildVirtualPianoPack(WOOD_WHITE, WOOD_BLACK)
}
