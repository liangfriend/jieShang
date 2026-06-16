import { buildVirtualPianoPack, type KeySkinSvg, wrapKeySkinSvg } from './shared'

/** 黑白立体琴键 */
const MONO_WHITE: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="mcWnTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#efeff4"/>
    </linearGradient>
    <linearGradient id="mcWnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e2e2ea"/>
      <stop offset="100%" stop-color="#b8b8c6"/>
    </linearGradient>
    <linearGradient id="mcWnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#d6d6e0"/>
      <stop offset="100%" stop-color="#c4c4d0"/>
    </linearGradient>
    <linearGradient id="mcWnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ceced8"/>
      <stop offset="100%" stop-color="#bcbcc8"/>
    </linearGradient>
  </defs>
  <path d="M0 82 H20 V96.5 Q20 100 17 100 H3 Q0 100 0 96.5 Z" fill="url(#mcWnFront)"/>
  <rect x="0" y="82" width="1.3" height="18" fill="url(#mcWnEdgeL)"/>
  <rect x="18.7" y="82" width="1.3" height="18" fill="url(#mcWnEdgeR)"/>
  <rect x="0" y="0" width="20" height="82" fill="url(#mcWnTop)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/>
  <line x1="0" y1="82" x2="20" y2="82" stroke="rgba(0,0,0,0.08)" stroke-width="0.5"/>`
  ),
  press: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="mcWpTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#e8e8ee"/>
      <stop offset="100%" stop-color="#d0d0da"/>
    </linearGradient>
    <linearGradient id="mcWpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#c4c4d0"/>
      <stop offset="100%" stop-color="#b0b0be"/>
    </linearGradient>
    <linearGradient id="mcWpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#b8b8c4"/>
      <stop offset="100%" stop-color="#acacb8"/>
    </linearGradient>
    <linearGradient id="mcWpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#b0b0bc"/>
      <stop offset="100%" stop-color="#a4a4b0"/>
    </linearGradient>
  </defs>
  <path d="M0 87 H20 V96.5 Q20 100 17 100 H3 Q0 100 0 96.5 Z" fill="url(#mcWpFront)"/>
  <rect x="0" y="87" width="1.3" height="13" fill="url(#mcWpEdgeL)"/>
  <rect x="18.7" y="87" width="1.3" height="13" fill="url(#mcWpEdgeR)"/>
  <rect x="0" y="0" width="20" height="87" fill="url(#mcWpTop)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(0,0,0,0.15)" stroke-width="0.5"/>
  <line x1="0" y1="87" x2="20" y2="87" stroke="rgba(0,0,0,0.12)" stroke-width="0.5"/>`
  )
}

const MONO_BLACK: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <linearGradient id="mcBnTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#585860"/>
      <stop offset="100%" stop-color="#34343c"/>
    </linearGradient>
    <linearGradient id="mcBnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e2e34"/>
      <stop offset="100%" stop-color="#101014"/>
    </linearGradient>
    <linearGradient id="mcBnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#28282e"/>
      <stop offset="100%" stop-color="#1a1a20"/>
    </linearGradient>
    <linearGradient id="mcBnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#242428"/>
      <stop offset="100%" stop-color="#141418"/>
    </linearGradient>
    <filter id="mcBnShadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="0.8" stdDeviation="0.6" flood-color="#000" flood-opacity="0.35"/>
    </filter>
  </defs>
  <g filter="url(#mcBnShadow)">
    <path d="M0 46 H12 V57 Q12 59.5 10 59.5 H2 Q0 59.5 0 57 Z" fill="url(#mcBnFront)"/>
    <rect x="0" y="46" width="0.9" height="13.5" fill="url(#mcBnEdgeL)"/>
    <rect x="11.1" y="46" width="0.9" height="13.5" fill="url(#mcBnEdgeR)"/>
    <rect x="0" y="0" width="12" height="46" fill="url(#mcBnTop)"/>
    <rect x="0.6" y="1" width="0.5" height="42" fill="rgba(255,255,255,0.1)"/>
    <line x1="0" y1="46" x2="12" y2="46" stroke="rgba(0,0,0,0.2)" stroke-width="0.35"/>
  </g>`
  ),
  press: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <linearGradient id="mcBpTop" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#2e2e36"/>
      <stop offset="100%" stop-color="#16161c"/>
    </linearGradient>
    <linearGradient id="mcBpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#1a1a20"/>
      <stop offset="100%" stop-color="#020204"/>
    </linearGradient>
    <linearGradient id="mcBpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#18181e"/>
      <stop offset="100%" stop-color="#0a0a0e"/>
    </linearGradient>
    <linearGradient id="mcBpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#141418"/>
      <stop offset="100%" stop-color="#060608"/>
    </linearGradient>
  </defs>
  <path d="M0 52 H12 V57 Q12 59.5 10 59.5 H2 Q0 59.5 0 57 Z" fill="url(#mcBpFront)"/>
  <rect x="0" y="52" width="0.9" height="7.5" fill="url(#mcBpEdgeL)"/>
  <rect x="11.1" y="52" width="0.9" height="7.5" fill="url(#mcBpEdgeR)"/>
  <rect x="0" y="0" width="12" height="52" fill="url(#mcBpTop)"/>
  <rect x="0" y="50" width="12" height="2.5" fill="rgba(0,0,0,0.22)"/>
  <line x1="0" y1="52" x2="12" y2="52" stroke="rgba(0,0,0,0.55)" stroke-width="0.55"/>
  <line x1="0" y1="52.5" x2="12" y2="52.5" stroke="rgba(255,255,255,0.06)" stroke-width="0.35"/>`
  )
}

export function buildMonoChromePianoPack() {
  return buildVirtualPianoPack(MONO_WHITE, MONO_BLACK)
}
