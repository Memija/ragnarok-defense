/**
 * Ragnarok Defense — Premium Norse Mythological SVG Vector Icons
 * Custom high-fidelity vector artwork replacing raw emojis for all defenders and tools.
 */

export const DEFENDER_ICONS: Record<string, string> = {
  // ⛏️ Shovel / Demolish War-Pick Tool
  shovel: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-shovel">
  <defs>
    <linearGradient id="shv-shaft" x1="12" y1="36" x2="32" y2="14" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#451a03"/>
      <stop offset="40%" stop-color="#78350f"/>
      <stop offset="70%" stop-color="#92400e"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="shv-steel" x1="12" y1="12" x2="38" y2="38" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#f1f5f9"/>
      <stop offset="35%" stop-color="#94a3b8"/>
      <stop offset="70%" stop-color="#475569"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="shv-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="shv-rune" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#fca5a5"/>
      <stop offset="50%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#b91c1c"/>
    </linearGradient>
    <filter id="shv-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="26" cy="18" r="13" fill="#ef4444" opacity="0.18" filter="url(#shv-glow)"/>
  <line x1="12" y1="34" x2="32" y2="14" stroke="url(#shv-shaft)" stroke-width="4.2" stroke-linecap="round"/>
  <line x1="15" y1="33" x2="17" y2="29" stroke="#b45309" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="20" y1="28" x2="22" y2="24" stroke="#d97706" stroke-width="1.4" stroke-linecap="round"/>
  <line x1="25" y1="23" x2="27" y2="19" stroke="#b45309" stroke-width="1.4" stroke-linecap="round"/>
  <circle cx="10" cy="36" r="2.8" fill="url(#shv-gold)" stroke="#713f12" stroke-width="0.9"/>
  <circle cx="10" cy="36" r="1" fill="#451a03"/>
  <rect x="29" y="12" width="4.5" height="4.5" rx="1" transform="rotate(-45 29 12)" fill="url(#shv-gold)" stroke="#78350f" stroke-width="0.8"/>
  <path d="M19 7 C26 10 35 14 41 11 C38 18 34 26 37 32 C31 27 26 23 23 18 Z" fill="url(#shv-steel)" stroke="#0f172a" stroke-width="1.2" stroke-linejoin="round"/>
  <path d="M22 10 C28 13 36 15 40 12 C37 17 33 23 35 29" stroke="#ffffff" stroke-width="0.9" stroke-linecap="round" fill="none" opacity="0.85"/>
  <path d="M26 13 L30 17 L33 15 M28 16 L30 20" stroke="url(#shv-rune)" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#shv-glow)"/>
  <circle cx="40" cy="12" r="1.1" fill="#fee2e2"/>
  <circle cx="36" cy="30" r="0.9" fill="#fca5a5"/>
</svg>`,

  // 🌻 Solflower (Sacred Flora)
  sunflower: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-sunflower">
  <defs>
    <linearGradient id="sol-petal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="60%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#d97706"/>
    </linearGradient>
    <radialGradient id="sol-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffedd5"/>
      <stop offset="40%" stop-color="#ea580c"/>
      <stop offset="85%" stop-color="#9a3412"/>
      <stop offset="100%" stop-color="#431407"/>
    </radialGradient>
    <linearGradient id="sol-stem" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="100%" stop-color="#15803d"/>
    </linearGradient>
    <filter id="sol-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="24" cy="21" r="17" fill="#fbbf24" opacity="0.22" filter="url(#sol-glow)"/>
  <path d="M24 28 Q24 38 22 43" stroke="url(#sol-stem)" stroke-width="3" stroke-linecap="round"/>
  <path d="M23 37 Q15 36 14 31 Q20 31 23 35 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
  <path d="M23 39 Q31 38 33 33 Q27 32 23 37 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
  <path d="M24 21 L22 6 Q24 4 26 6 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L31 8 Q34 9 34 11 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L37 14 Q39 16 38 18 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L39 20 Q41 22 39 24 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L37 28 Q37 30 35 31 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L30 34 Q28 36 26 35 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L23 37 Q24 38 25 37 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L17 34 Q15 33 16 31 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L11 28 Q9 26 11 24 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L9 20 Q9 18 11 17 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L12 13 Q13 11 15 11 Z" fill="url(#sol-petal)"/>
  <path d="M24 21 L17 8 Q19 7 21 8 Z" fill="url(#sol-petal)"/>
  <circle cx="24" cy="21" r="9" fill="url(#sol-core)" stroke="#f59e0b" stroke-width="1.2"/>
  <path d="M26 15 L22 20 L26 22 L22 27" stroke="#fef08a" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" filter="url(#sol-glow)"/>
  <circle cx="24" cy="21" r="6" stroke="#fde047" stroke-width="0.8" stroke-dasharray="1.5 2" fill="none" opacity="0.75"/>
</svg>`,

  // 🟢 Peashooter (Sacred Flora)
  peashooter: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-peashooter">
  <defs>
    <linearGradient id="pea-body" x1="12" y1="10" x2="36" y2="34" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#86efac"/>
      <stop offset="40%" stop-color="#22c55e"/>
      <stop offset="80%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#14532d"/>
    </linearGradient>
    <radialGradient id="pea-orb" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#86efac"/>
      <stop offset="75%" stop-color="#16a34a"/>
      <stop offset="100%" stop-color="#052e16"/>
    </radialGradient>
    <linearGradient id="pea-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ca8a04"/>
    </linearGradient>
    <filter id="pea-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="34" cy="18" r="9" fill="#22c55e" opacity="0.25" filter="url(#pea-glow)"/>
  <path d="M12 42 Q24 38 36 42 Q24 44 12 42 Z" fill="#14532d"/>
  <path d="M14 41 Q8 35 15 33 Q21 37 17 41 Z" fill="#22c55e" stroke="#15803d" stroke-width="0.8"/>
  <path d="M24 41 Q33 37 36 41 Q28 43 24 41 Z" fill="#16a34a" stroke="#14532d" stroke-width="0.8"/>
  <path d="M21 38 Q20 28 22 22" stroke="#16a34a" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M15 17 Q9 14 11 9 Q14 8 16 13" stroke="#4ade80" stroke-width="2.5" stroke-linecap="round" fill="none"/>
  <ellipse cx="21" cy="18" rx="8" ry="7" fill="url(#pea-body)" stroke="#14532d" stroke-width="1"/>
  <path d="M24 13 L33 10 Q36 18 33 26 L24 23 Z" fill="url(#pea-body)" stroke="#14532d" stroke-width="1"/>
  <ellipse cx="33" cy="18" rx="2.5" ry="7" fill="url(#pea-gold)" stroke="#854d0e" stroke-width="0.9"/>
  <ellipse cx="33.5" cy="18" rx="1.5" ry="5.5" fill="#052e16"/>
  <circle cx="35" cy="18" r="4.2" fill="url(#pea-orb)" stroke="#dcfce7" stroke-width="0.8" filter="url(#pea-glow)"/>
  <circle cx="33.8" cy="16.5" r="1.2" fill="#ffffff"/>
  <circle cx="18" cy="15" r="1.8" fill="#f8fafc"/>
  <circle cx="18.8" cy="15" r="0.9" fill="#0f172a"/>
</svg>`,

  // ❄️ Snow Pea / Frost Sprite (Sacred Flora)
  snowpea: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-snowpea">
  <defs>
    <linearGradient id="frost-ice" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="35%" stop-color="#bae6fd"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <radialGradient id="frost-core" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#7dd3fc"/>
      <stop offset="85%" stop-color="#0369a1"/>
      <stop offset="100%" stop-color="#082f49"/>
    </radialGradient>
    <filter id="frost-glow" x="-25%" y="-25%" width="150%" height="150%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="24" cy="24" r="18" fill="#38bdf8" opacity="0.22" filter="url(#frost-glow)"/>
  <g transform="rotate(45 24 24)" fill="url(#frost-ice)" opacity="0.85">
    <polygon points="24,6 26.5,21 24,24 21.5,21" />
    <polygon points="24,42 26.5,27 24,24 21.5,27" />
    <polygon points="6,24 21,26.5 24,24 21,21.5" />
    <polygon points="42,24 27,26.5 24,24 27,21.5" />
  </g>
  <polygon points="24,4 28,18 24,24 20,18" fill="url(#frost-ice)" stroke="#0284c7" stroke-width="0.8"/>
  <line x1="24" y1="5" x2="24" y2="23" stroke="#ffffff" stroke-width="0.9" opacity="0.9"/>
  <polygon points="24,44 28,30 24,24 20,30" fill="url(#frost-ice)" stroke="#0284c7" stroke-width="0.8"/>
  <line x1="24" y1="43" x2="24" y2="25" stroke="#ffffff" stroke-width="0.9" opacity="0.9"/>
  <polygon points="4,24 18,28 24,24 18,20" fill="url(#frost-ice)" stroke="#0284c7" stroke-width="0.8"/>
  <line x1="5" y1="24" x2="23" y2="24" stroke="#ffffff" stroke-width="0.9" opacity="0.9"/>
  <polygon points="44,24 30,28 24,24 30,20" fill="url(#frost-ice)" stroke="#0284c7" stroke-width="0.8"/>
  <line x1="43" y1="24" x2="25" y2="24" stroke="#ffffff" stroke-width="0.9" opacity="0.9"/>
  <polygon points="24,15 31.8,19.5 31.8,28.5 24,33 16.2,28.5 16.2,19.5" fill="url(#frost-core)" stroke="#bae6fd" stroke-width="1.3" filter="url(#frost-glow)"/>
  <polygon points="24,19 25.5,22.5 29,24 25.5,25.5 24,29 22.5,25.5 19,24 22.5,22.5" fill="#ffffff"/>
  <circle cx="34" cy="11" r="1.2" fill="#ffffff"/>
  <circle cx="12" cy="35" r="1" fill="#bae6fd"/>
</svg>`,

  // 🌿 Repeater (Sacred Flora)
  repeater: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-repeater">
  <defs>
    <linearGradient id="rep-body" x1="10" y1="8" x2="38" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#4ade80"/>
      <stop offset="35%" stop-color="#16a34a"/>
      <stop offset="75%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </linearGradient>
    <linearGradient id="rep-brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fde047"/>
      <stop offset="50%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <radialGradient id="rep-orb" cx="40%" cy="40%" r="60%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="40%" stop-color="#86efac"/>
      <stop offset="80%" stop-color="#15803d"/>
      <stop offset="100%" stop-color="#052e16"/>
    </radialGradient>
    <filter id="rep-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <path d="M10 42 Q24 37 38 42 Z" fill="#052e16"/>
  <path d="M12 40 Q6 34 14 32 Q19 36 15 40 Z" fill="#15803d"/>
  <path d="M22 39 Q32 35 36 39 Z" fill="#16a34a"/>
  <path d="M19 40 Q17 28 20 22" stroke="#14532d" stroke-width="5" stroke-linecap="round"/>
  <path d="M13 15 Q8 10 12 6 Q16 6 18 12 Z" fill="#22c55e" stroke="#14532d" stroke-width="0.8"/>
  <path d="M17 12 Q14 7 18 4 Q22 5 21 11 Z" fill="#4ade80" stroke="#15803d" stroke-width="0.8"/>
  <ellipse cx="19" cy="18" rx="8" ry="7.5" fill="url(#rep-body)" stroke="#052e16" stroke-width="1"/>
  <path d="M22 10 L33 7 Q36 13 33 17 L22 15 Z" fill="url(#rep-body)" stroke="#052e16" stroke-width="0.9"/>
  <ellipse cx="33" cy="12" rx="2" ry="5" fill="url(#rep-brass)" stroke="#713f12" stroke-width="0.8"/>
  <circle cx="34.5" cy="12" r="3.2" fill="url(#rep-orb)" filter="url(#rep-glow)"/>
  <path d="M22 19 L35 18 Q38 25 35 29 L22 25 Z" fill="url(#rep-body)" stroke="#052e16" stroke-width="0.9"/>
  <ellipse cx="35" cy="23.5" rx="2.2" ry="5.5" fill="url(#rep-brass)" stroke="#713f12" stroke-width="0.8"/>
  <circle cx="36.5" cy="23.5" r="3.6" fill="url(#rep-orb)" filter="url(#rep-glow)"/>
  <rect x="25" y="11" width="3" height="13" rx="1.2" fill="url(#rep-brass)" stroke="#713f12" stroke-width="0.7"/>
  <circle cx="16" cy="15" r="1.8" fill="#f8fafc"/>
  <circle cx="17" cy="15" r="0.9" fill="#0f172a"/>
</svg>`,

  // 🏰 Rune Bastion / Wall-Nut (Tower)
  wallnut: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-wallnut">
  <defs>
    <linearGradient id="bst-stone" x1="12" y1="8" x2="36" y2="42" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#94a3b8"/>
      <stop offset="35%" stop-color="#64748b"/>
      <stop offset="75%" stop-color="#334155"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <linearGradient id="bst-gold" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <filter id="bst-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <rect x="10" y="38" width="28" height="6" rx="1.5" fill="#1e293b" stroke="#475569" stroke-width="1"/>
  <path d="M12 38 L14 14 L34 14 L36 38 Z" fill="url(#bst-stone)" stroke="#0f172a" stroke-width="1.2"/>
  <path d="M12 14 L12 9 L17 9 L17 12 L22 12 L22 9 L26 9 L26 12 L31 12 L31 9 L36 9 L36 14 Z" fill="url(#bst-stone)" stroke="#0f172a" stroke-width="1.2"/>
  <rect x="13.2" y="18" width="21.6" height="3" fill="#1e293b" stroke="url(#bst-gold)" stroke-width="0.8"/>
  <rect x="12.4" y="32" width="23.2" height="3" fill="#1e293b" stroke="url(#bst-gold)" stroke-width="0.8"/>
  <circle cx="16" cy="19.5" r="0.9" fill="#fde047"/>
  <circle cx="24" cy="19.5" r="0.9" fill="#fde047"/>
  <circle cx="32" cy="19.5" r="0.9" fill="#fde047"/>
  <circle cx="15" cy="33.5" r="0.9" fill="#fde047"/>
  <circle cx="24" cy="33.5" r="0.9" fill="#fde047"/>
  <circle cx="33" cy="33.5" r="0.9" fill="#fde047"/>
  <line x1="14" y1="26" x2="34" y2="26" stroke="#475569" stroke-width="0.8"/>
  <line x1="20" y1="21" x2="20" y2="26" stroke="#475569" stroke-width="0.8"/>
  <line x1="28" y1="26" x2="28" y2="32" stroke="#475569" stroke-width="0.8"/>
  <path d="M24 22 L24 30 M24 24 L20 22 M24 24 L28 22" stroke="url(#bst-gold)" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" filter="url(#bst-glow)"/>
</svg>`,

  // 🪨 Rune Mine / Potato Mine (Tower)
  potatomine: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-potatomine">
  <defs>
    <linearGradient id="mine-stone" x1="16" y1="12" x2="32" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#64748b"/>
      <stop offset="40%" stop-color="#475569"/>
      <stop offset="85%" stop-color="#1e293b"/>
      <stop offset="100%" stop-color="#0f172a"/>
    </linearGradient>
    <linearGradient id="mine-lava" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="80%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <filter id="mine-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <ellipse cx="24" cy="40" rx="18" ry="5" fill="#1c1917" stroke="#44403c" stroke-width="1"/>
  <path d="M8 41 L14 39 L19 41 M29 41 L34 39 L40 41" stroke="#f97316" stroke-width="0.9" opacity="0.8"/>
  <polygon points="17,39 20,18 28,18 31,39" fill="url(#mine-stone)" stroke="#0f172a" stroke-width="1.2"/>
  <polygon points="20,18 24,14 28,18 24,39" fill="#475569" opacity="0.6"/>
  <path d="M22 23 L24 21 L26 23 L24 28 L22 28" stroke="url(#mine-lava)" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round" filter="url(#mine-glow)"/>
  <path d="M22 31 L26 31 M24 31 L24 35" stroke="url(#mine-lava)" stroke-width="1.4" stroke-linecap="round" filter="url(#mine-glow)"/>
  <line x1="24" y1="14" x2="24" y2="8" stroke="#ca8a04" stroke-width="1.6" stroke-linecap="round"/>
  <polygon points="24,4 27,8 24,12 21,8" fill="url(#mine-lava)" stroke="#fef08a" stroke-width="0.8" filter="url(#mine-glow)"/>
  <circle cx="24" cy="8" r="1.5" fill="#ffffff"/>
  <circle cx="20" cy="6" r="0.8" fill="#fdba74"/>
  <circle cx="28" cy="6" r="0.8" fill="#fdba74"/>
</svg>`,

  // 🪴 Chomper (Sacred Flora)
  chomper: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-chomper">
  <defs>
    <linearGradient id="chm-jaw" x1="8" y1="6" x2="38" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#9333ea"/>
      <stop offset="40%" stop-color="#6b21a8"/>
      <stop offset="80%" stop-color="#3b0764"/>
      <stop offset="100%" stop-color="#1e0236"/>
    </linearGradient>
    <radialGradient id="chm-throat" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="#c084fc"/>
      <stop offset="50%" stop-color="#6b21a8"/>
      <stop offset="90%" stop-color="#2e1065"/>
      <stop offset="100%" stop-color="#020005"/>
    </radialGradient>
    <filter id="chm-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <path d="M16 42 Q24 37 32 42 Z" fill="#1e0236"/>
  <path d="M22 41 Q20 30 23 24" stroke="#581c87" stroke-width="4.5" stroke-linecap="round"/>
  <path d="M20 34 L16 32 M24 29 L28 27" stroke="#a855f7" stroke-width="1.5" stroke-linecap="round"/>
  <ellipse cx="26" cy="19" rx="10" ry="11" fill="url(#chm-throat)" stroke="#3b0764" stroke-width="1.2"/>
  <circle cx="22" cy="19" r="2.8" fill="#e879f9" filter="url(#chm-glow)"/>
  <path d="M15 17 C13 7 32 4 37 13 C31 16 23 15 15 17 Z" fill="url(#chm-jaw)" stroke="#2e1065" stroke-width="1.2"/>
  <polygon points="21,15 23,19 25,15" fill="#f8fafc" stroke="#3b0764" stroke-width="0.6"/>
  <polygon points="27,14 29,19 31,13" fill="#f8fafc" stroke="#3b0764" stroke-width="0.6"/>
  <polygon points="33,12 35,17 37,12" fill="#f8fafc" stroke="#3b0764" stroke-width="0.6"/>
  <path d="M16 21 C14 31 32 34 37 25 C31 22 23 23 16 21 Z" fill="url(#chm-jaw)" stroke="#2e1065" stroke-width="1.2"/>
  <polygon points="23,23 25,19 27,23" fill="#f8fafc" stroke="#3b0764" stroke-width="0.6"/>
  <polygon points="29,23 31,18 33,24" fill="#f8fafc" stroke="#3b0764" stroke-width="0.6"/>
  <circle cx="35" cy="27" r="1.2" fill="#a855f7" filter="url(#chm-glow)"/>
</svg>`,

  // 💣 Forge Blaster / Cherry Bomb (Tower)
  cherrybomb: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-cherrybomb">
  <defs>
    <radialGradient id="cb-body" cx="35%" cy="35%" r="65%">
      <stop offset="0%" stop-color="#475569"/>
      <stop offset="40%" stop-color="#1e293b"/>
      <stop offset="85%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="#020617"/>
    </radialGradient>
    <linearGradient id="cb-fire" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#f97316"/>
      <stop offset="80%" stop-color="#ef4444"/>
      <stop offset="100%" stop-color="#991b1b"/>
    </linearGradient>
    <filter id="cb-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="23" cy="27" r="15" fill="#ef4444" opacity="0.2" filter="url(#cb-glow)"/>
  <circle cx="23" cy="27" r="13" fill="url(#cb-body)" stroke="#334155" stroke-width="1.3"/>
  <path d="M17 21 Q21 24 20 30 Q25 31 29 27 M22 28 Q24 35 28 35" stroke="url(#cb-fire)" stroke-width="1.8" stroke-linecap="round" fill="none" filter="url(#cb-glow)"/>
  <path d="M15 29 L17 26 L19 28 M28 21 L31 23" stroke="#fde047" stroke-width="1" stroke-linecap="round"/>
  <rect x="20" y="12" width="6" height="4" rx="1" fill="#d97706" stroke="#78350f" stroke-width="0.8"/>
  <circle cx="21.5" cy="14" r="0.6" fill="#fde047"/>
  <circle cx="24.5" cy="14" r="0.6" fill="#fde047"/>
  <path d="M23 12 Q23 7 30 6 Q34 6 34 10" stroke="#78350f" stroke-width="2" stroke-linecap="round" fill="none"/>
  <circle cx="34" cy="9" r="3" fill="#fef08a" filter="url(#cb-glow)"/>
  <circle cx="34" cy="9" r="1.5" fill="#ffffff"/>
  <circle cx="38" cy="7" r="1" fill="#f97316"/>
  <circle cx="37" cy="12" r="0.8" fill="#facc15"/>
  <circle cx="31" cy="4" r="0.9" fill="#ef4444"/>
</svg>`,

  // 🗼 Fire Spire / Torchwood (Tower)
  torchwood: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-torchwood">
  <defs>
    <linearGradient id="spire-stone" x1="16" y1="18" x2="32" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#44403c"/>
      <stop offset="40%" stop-color="#292524"/>
      <stop offset="85%" stop-color="#1c1917"/>
      <stop offset="100%" stop-color="#0c0a09"/>
    </linearGradient>
    <linearGradient id="spire-flame" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="35%" stop-color="#ea580c"/>
      <stop offset="70%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#fef08a"/>
    </linearGradient>
    <filter id="spire-glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="24" cy="14" r="14" fill="#f97316" opacity="0.25" filter="url(#spire-glow)"/>
  <rect x="11" y="41" width="26" height="4" rx="1" fill="#1c1917" stroke="#44403c" stroke-width="0.8"/>
  <rect x="14" y="38" width="20" height="3" fill="#292524" stroke="#44403c" stroke-width="0.8"/>
  <polygon points="16,38 18,22 30,22 32,38" fill="url(#spire-stone)" stroke="#0c0a09" stroke-width="1"/>
  <path d="M24 38 L24 23 M21 31 L24 28 L27 31" stroke="#f97316" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round" filter="url(#spire-glow)"/>
  <path d="M15 22 Q24 24 33 22 L35 18 L13 18 Z" fill="#44403c" stroke="#d97706" stroke-width="1"/>
  <ellipse cx="24" cy="18" rx="10" ry="2.5" fill="#1c1917" stroke="#d97706" stroke-width="0.8"/>
  <path d="M16 18 C14 12 21 7 22 2 C25 6 28 8 28 12 C30 9 32 10 32 18 Z" fill="url(#spire-flame)" filter="url(#spire-glow)"/>
  <path d="M20 18 C18 14 22 10 23 6 C25 9 26 11 26 14 C27 12 28 13 28 18 Z" fill="#fef08a"/>
  <circle cx="19" cy="4" r="0.9" fill="#fef08a"/>
  <circle cx="28" cy="5" r="0.8" fill="#f97316"/>
  <circle cx="24" cy="0.8" r="0.6" fill="#fef08a"/>
</svg>`,

  // ⚙️ Dwarven Catapult / Kernel-pult (Tower)
  kernelpult: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-kernelpult">
  <defs>
    <linearGradient id="cat-wood" x1="8" y1="18" x2="40" y2="44" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#78350f"/>
      <stop offset="50%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#270e02"/>
    </linearGradient>
    <linearGradient id="cat-brass" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#78350f"/>
    </linearGradient>
    <linearGradient id="cat-stone" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#e2e8f0"/>
      <stop offset="50%" stop-color="#64748b"/>
      <stop offset="100%" stop-color="#1e293b"/>
    </linearGradient>
    <filter id="cat-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <line x1="8" y1="40" x2="40" y2="40" stroke="url(#cat-wood)" stroke-width="4.5" stroke-linecap="round"/>
  <circle cx="13" cy="40" r="4.5" fill="url(#cat-brass)" stroke="#451a03" stroke-width="1.2"/>
  <circle cx="13" cy="40" r="1.8" fill="#1e293b"/>
  <circle cx="35" cy="40" r="4.5" fill="url(#cat-brass)" stroke="#451a03" stroke-width="1.2"/>
  <circle cx="35" cy="40" r="1.8" fill="#1e293b"/>
  <polygon points="26,18 20,38 32,38" fill="none" stroke="url(#cat-wood)" stroke-width="3" stroke-linejoin="round"/>
  <circle cx="26" cy="28" r="4" fill="url(#cat-brass)" stroke="#78350f" stroke-width="0.9"/>
  <line x1="10" y1="16" x2="33" y2="33" stroke="url(#cat-wood)" stroke-width="3" stroke-linecap="round"/>
  <line x1="16" y1="20" x2="26" y2="28" stroke="#fde047" stroke-width="1" stroke-dasharray="2 1.5"/>
  <path d="M8 12 Q10 20 16 16 Z" fill="url(#cat-brass)" stroke="#78350f" stroke-width="1"/>
  <circle cx="12" cy="11" r="5" fill="url(#cat-stone)" stroke="#0f172a" stroke-width="0.9"/>
  <path d="M10 11 L12 9 L14 11 M12 11 L12 14" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" filter="url(#cat-glow)"/>
</svg>`,

  // 🔥 Forge Dragonfire / Jalapeno (Tower)
  jalapeno: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-jalapeno">
  <defs>
    <linearGradient id="df-head" x1="6" y1="12" x2="26" y2="36" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#b45309"/>
      <stop offset="40%" stop-color="#78350f"/>
      <stop offset="80%" stop-color="#451a03"/>
      <stop offset="100%" stop-color="#1c0d02"/>
    </linearGradient>
    <linearGradient id="df-fire" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="25%" stop-color="#fde047"/>
      <stop offset="55%" stop-color="#f97316"/>
      <stop offset="85%" stop-color="#dc2626"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <filter id="df-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="2" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <ellipse cx="32" cy="24" rx="14" ry="10" fill="#f97316" opacity="0.3" filter="url(#df-glow)"/>
  <path d="M6 34 L12 36 L20 28 L23 29 L23 20 L18 16 L12 16 L6 22 Z" fill="url(#df-head)" stroke="#0f172a" stroke-width="1.2"/>
  <path d="M10 16 Q8 10 13 8 Q13 13 16 16 Z" fill="#d97706" stroke="#451a03" stroke-width="0.8"/>
  <circle cx="14" cy="20" r="2" fill="#fef08a" filter="url(#df-glow)"/>
  <circle cx="14.4" cy="20" r="0.9" fill="#dc2626"/>
  <polygon points="21,21 23,23 21,25" fill="#f8fafc"/>
  <polygon points="21,26 23,28 21,29" fill="#f8fafc"/>
  <path d="M22 22 Q30 14 44 16 Q36 24 44 32 Q30 34 22 27 Z" fill="url(#df-fire)" filter="url(#df-glow)"/>
  <path d="M22 23 Q28 20 36 21 Q32 24 36 27 Q28 28 22 26 Z" fill="#ffffff"/>
  <circle cx="42" cy="12" r="1.1" fill="#fef08a"/>
  <circle cx="45" cy="24" r="1.3" fill="#f97316"/>
  <circle cx="42" cy="35" r="1" fill="#ef4444"/>
</svg>`,

  // ⚡ Asgard Einherjar (Tower)
  einherjar: `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-einherjar">
  <defs>
    <linearGradient id="ein-gold" x1="12" y1="8" x2="36" y2="40" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="75%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#713f12"/>
    </linearGradient>
    <linearGradient id="ein-bifrost" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="30%" stop-color="#7dd3fc"/>
      <stop offset="70%" stop-color="#38bdf8"/>
      <stop offset="100%" stop-color="#0284c7"/>
    </linearGradient>
    <filter id="ein-glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="1.8" result="blur"/>
      <feComposite in="SourceGraphic" in2="blur" operator="over"/>
    </filter>
  </defs>
  <circle cx="24" cy="24" r="17" fill="#38bdf8" opacity="0.22" filter="url(#ein-glow)"/>
  <line x1="8" y1="40" x2="38" y2="10" stroke="url(#ein-gold)" stroke-width="2.5" stroke-linecap="round"/>
  <polygon points="38,10 44,4 40,14 36,12" fill="url(#ein-bifrost)" stroke="#0369a1" stroke-width="0.8" filter="url(#ein-glow)"/>
  <ellipse cx="24" cy="26" rx="12" ry="14" fill="#0f172a" stroke="url(#ein-gold)" stroke-width="1.8"/>
  <circle cx="24" cy="26" r="4.5" fill="url(#ein-gold)"/>
  <circle cx="24" cy="26" r="1.5" fill="#0f172a"/>
  <path d="M17 19 Q11 12 10 4 Q17 8 18 16 Z" fill="url(#ein-bifrost)" stroke="#0284c7" stroke-width="0.8"/>
  <path d="M31 19 Q37 12 38 4 Q31 8 30 16 Z" fill="url(#ein-bifrost)" stroke="#0284c7" stroke-width="0.8"/>
  <path d="M18 20 C18 13 30 13 30 20 L28 27 L20 27 Z" fill="url(#ein-gold)" stroke="#713f12" stroke-width="1"/>
  <path d="M22 20 L26 20 M24 20 L24 28" stroke="#fef08a" stroke-width="1.8" stroke-linecap="round"/>
  <path d="M36 6 L33 11 L37 13 L34 18" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" filter="url(#ein-glow)"/>
</svg>`,

  // 🌿 Category: Sacred Plants
  cat_plants: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-cat-plants">
  <path d="M12 21 C12 21 11 14 15 10 C19 6 21 3 21 3 C21 3 18 5 14 9 C10 13 12 21 12 21 Z" fill="#4ade80"/>
  <path d="M12 21 C12 21 12 13 8 9 C4 5 3 3 3 3 C3 3 5 6 9 10 C13 14 12 21 12 21 Z" fill="#22c55e"/>
  <circle cx="12" cy="7" r="1.5" fill="#fef08a"/>
</svg>`,

  // 🏰 Category: Towers
  cat_towers: `<svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" class="unit-svg-icon svg-cat-towers">
  <path d="M4 21 L6 8 L9 8 L9 10 L11 10 L11 8 L13 8 L13 10 L15 10 L15 8 L18 8 L20 21 Z" fill="#38bdf8" stroke="#0284c7" stroke-width="0.8"/>
  <path d="M10 21 L10 16 Q12 14 14 16 L14 21 Z" fill="#0f172a"/>
  <circle cx="12" cy="12" r="1.2" fill="#fef08a"/>
</svg>`
};

export function getDefenderIcon(id: string): string {
  return DEFENDER_ICONS[id] || '⚔️';
}
