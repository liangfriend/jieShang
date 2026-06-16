import { buildVirtualPianoPack, type KeySkinSvg, wrapKeySkinSvg } from './shared'

/** 重金属抛光金属琴键 */
const METAL_WHITE: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="hmWnTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#aeb6c2"/>
      <stop offset="12%" stop-color="#f8fbff"/>
      <stop offset="24%" stop-color="#9aa3b0"/>
      <stop offset="42%" stop-color="#eef3fa"/>
      <stop offset="56%" stop-color="#bcc5d0"/>
      <stop offset="74%" stop-color="#7e8794"/>
      <stop offset="100%" stop-color="#c4ccd8"/>
    </linearGradient>
    <linearGradient id="hmWnForm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.5)"/>
      <stop offset="22%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.22)"/>
    </linearGradient>
    <linearGradient id="hmWnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#aab2be"/>
      <stop offset="45%" stop-color="#7c8592"/>
      <stop offset="100%" stop-color="#565e6a"/>
    </linearGradient>
    <linearGradient id="hmWnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#9098a4"/><stop offset="100%" stop-color="#646c78"/>
    </linearGradient>
    <linearGradient id="hmWnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#828a96"/><stop offset="100%" stop-color="#545c68"/>
    </linearGradient>
    <filter id="hmWnSoft" x="-30%" y="-10%" width="160%" height="120%"><feGaussianBlur stdDeviation="0.9"/></filter>
  </defs>
  <path d="M0 91 H20 V98.25 Q20 100 17 100 H3 Q0 100 0 98.25 Z" fill="url(#hmWnFront)"/>
  <rect x="0" y="91" width="1.3" height="9" fill="url(#hmWnEdgeL)"/>
  <rect x="18.7" y="91" width="1.3" height="9" fill="url(#hmWnEdgeR)"/>
  <rect x="0" y="0" width="20" height="91" fill="url(#hmWnTop)"/>
  <rect x="0" y="0" width="20" height="91" fill="url(#hmWnForm)"/>
  <polygon points="4,-2 7.5,-2 2.5,91 -1,91" fill="rgba(255,255,255,0.55)" filter="url(#hmWnSoft)"/>
  <polygon points="13,-2 14.5,-2 11,91 9.5,91" fill="rgba(255,255,255,0.3)" filter="url(#hmWnSoft)"/>
  <rect x="0" y="0" width="20" height="1.2" fill="rgba(255,255,255,0.7)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(0,0,0,0.28)" stroke-width="0.5"/>
  <line x1="0" y1="91" x2="20" y2="91" stroke="rgba(0,0,0,0.18)" stroke-width="0.4"/>
  <line x1="0" y1="91.5" x2="20" y2="91.5" stroke="rgba(255,255,255,0.2)" stroke-width="0.3"/>`
  ),
  press: wrapKeySkinSvg(
    '0 0 20 100',
    `<defs>
    <linearGradient id="hmWpTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#7c8592"/>
      <stop offset="12%" stop-color="#bcc4d0"/>
      <stop offset="24%" stop-color="#6b7480"/>
      <stop offset="40%" stop-color="#aeb6c2"/>
      <stop offset="54%" stop-color="#828b98"/>
      <stop offset="70%" stop-color="#5a626e"/>
      <stop offset="86%" stop-color="#969fac"/>
      <stop offset="100%" stop-color="#6e7682"/>
    </linearGradient>
    <linearGradient id="hmWpForm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(0,0,0,0.28)"/>
      <stop offset="14%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.2)"/>
    </linearGradient>
    <linearGradient id="hmWpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6e7682"/><stop offset="100%" stop-color="#454d58"/>
    </linearGradient>
    <linearGradient id="hmWpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#666e7a"/><stop offset="100%" stop-color="#4a525c"/>
    </linearGradient>
    <linearGradient id="hmWpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#5e6672"/><stop offset="100%" stop-color="#424a54"/>
    </linearGradient>
  </defs>
  <path d="M0 93.5 H20 V98.25 Q20 100 17 100 H3 Q0 100 0 98.25 Z" fill="url(#hmWpFront)"/>
  <rect x="0" y="93.5" width="1.3" height="6.5" fill="url(#hmWpEdgeL)"/>
  <rect x="18.7" y="93.5" width="1.3" height="6.5" fill="url(#hmWpEdgeR)"/>
  <rect x="0" y="0" width="20" height="93.5" fill="url(#hmWpTop)"/>
  <rect x="0" y="0" width="20" height="93.5" fill="url(#hmWpForm)"/>
  <rect x="0" y="90.5" width="20" height="3" fill="rgba(0,0,0,0.2)"/>
  <line x1="20" y1="0" x2="20" y2="100" stroke="rgba(0,0,0,0.32)" stroke-width="0.5"/>
  <line x1="0" y1="93.5" x2="20" y2="93.5" stroke="rgba(0,0,0,0.25)" stroke-width="0.5"/>`
  )
}

const METAL_BLACK: KeySkinSvg = {
  normal: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <linearGradient id="hmBnTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#3c424c"/>
      <stop offset="14%" stop-color="#838d9c"/>
      <stop offset="26%" stop-color="#20252c"/>
      <stop offset="42%" stop-color="#9aa4b4"/>
      <stop offset="52%" stop-color="#2a3038"/>
      <stop offset="68%" stop-color="#5a626e"/>
      <stop offset="84%" stop-color="#171b20"/>
      <stop offset="100%" stop-color="#3a4048"/>
    </linearGradient>
    <linearGradient id="hmBnForm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(220,235,255,0.35)"/>
      <stop offset="20%" stop-color="rgba(255,255,255,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.3)"/>
    </linearGradient>
    <linearGradient id="hmBnFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#363c44"/><stop offset="100%" stop-color="#0c0e12"/>
    </linearGradient>
    <linearGradient id="hmBnEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#3a3f48"/><stop offset="100%" stop-color="#1c2026"/>
    </linearGradient>
    <linearGradient id="hmBnEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#2e333a"/><stop offset="100%" stop-color="#16191e"/>
    </linearGradient>
    <filter id="hmBnSoft" x="-40%" y="-10%" width="180%" height="120%"><feGaussianBlur stdDeviation="0.7"/></filter>
    <filter id="hmBnShadow" x="-20%" y="-10%" width="140%" height="135%">
      <feDropShadow dx="0" dy="0.9" stdDeviation="0.8" flood-color="#000" flood-opacity="0.6"/>
    </filter>
  </defs>
  <g filter="url(#hmBnShadow)">
    <path d="M0 53 H12 V58.5 Q12 59.5 10 59.5 H2 Q0 59.5 0 58.5 Z" fill="url(#hmBnFront)"/>
    <rect x="0" y="53" width="0.9" height="6.5" fill="url(#hmBnEdgeL)"/>
    <rect x="11.1" y="53" width="0.9" height="6.5" fill="url(#hmBnEdgeR)"/>
    <rect x="0" y="0" width="12" height="53" fill="url(#hmBnTop)"/>
    <rect x="0" y="0" width="12" height="53" fill="url(#hmBnForm)"/>
    <polygon points="3,-1 4.6,-1 2,53 0.6,53" fill="rgba(225,240,255,0.6)" filter="url(#hmBnSoft)"/>
    <circle cx="5" cy="6" r="0.9" fill="rgba(235,245,255,0.85)" filter="url(#hmBnSoft)"/>
    <rect x="0" y="0" width="12" height="0.9" fill="rgba(210,230,255,0.4)"/>
    <line x1="0" y1="53" x2="12" y2="53" stroke="rgba(200,220,255,0.15)" stroke-width="0.35"/>
  </g>`
  ),
  press: wrapKeySkinSvg(
    '0 0 12 60',
    `<defs>
    <linearGradient id="hmBpTop" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#22262c"/>
      <stop offset="16%" stop-color="#4a525e"/>
      <stop offset="30%" stop-color="#121519"/>
      <stop offset="46%" stop-color="#586272"/>
      <stop offset="56%" stop-color="#181c22"/>
      <stop offset="74%" stop-color="#363c44"/>
      <stop offset="100%" stop-color="#1a1e24"/>
    </linearGradient>
    <linearGradient id="hmBpForm" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="rgba(180,200,230,0.18)"/>
      <stop offset="20%" stop-color="rgba(0,0,0,0)"/>
      <stop offset="100%" stop-color="rgba(0,0,0,0.4)"/>
    </linearGradient>
    <linearGradient id="hmBpFront" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#202329"/><stop offset="100%" stop-color="#050608"/>
    </linearGradient>
    <linearGradient id="hmBpEdgeL" x1="1" y1="0" x2="0" y2="0">
      <stop offset="0%" stop-color="#22262c"/><stop offset="100%" stop-color="#0e1116"/>
    </linearGradient>
    <linearGradient id="hmBpEdgeR" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#1c2026"/><stop offset="100%" stop-color="#0a0c10"/>
    </linearGradient>
  </defs>
  <path d="M0 56 H12 V58.5 Q12 59.5 10 59.5 H2 Q0 59.5 0 58.5 Z" fill="url(#hmBpFront)"/>
  <rect x="0" y="56" width="0.9" height="3.75" fill="url(#hmBpEdgeL)"/>
  <rect x="11.1" y="56" width="0.9" height="3.75" fill="url(#hmBpEdgeR)"/>
  <rect x="0" y="0" width="12" height="56" fill="url(#hmBpTop)"/>
  <rect x="0" y="0" width="12" height="56" fill="url(#hmBpForm)"/>
  <rect x="0" y="53.5" width="12" height="2.5" fill="rgba(0,0,0,0.35)"/>
  <line x1="0" y1="56" x2="12" y2="56" stroke="rgba(0,0,0,0.65)" stroke-width="0.55"/>
  <line x1="0" y1="56.5" x2="12" y2="56.5" stroke="rgba(190,210,245,0.08)" stroke-width="0.35"/>`
  )
}

export function buildHeavyMetalPianoPack() {
  return buildVirtualPianoPack(METAL_WHITE, METAL_BLACK)
}
