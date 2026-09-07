import { SoundManager } from './SoundManager';
import { t } from '../i18n';

export interface LocationNode {
  id: string;
  name: string;
  subtitle: string;
  rune: string;
  role: string;
  threat: 'Normal' | 'Hard' | 'Extreme' | 'Nightmare';
  threatLevel: number;
  waves: number;
  level: number;
  locked: boolean;
  shake?: number;
  desc: string;
  px: number;
  py: number;
  radius: number;
  hover: number;
  type: 'capital' | 'city' | 'mine' | 'waterfall';
  icon: string;
  gemColor: string;
  accentColor: string;
  secondaryColor: string;
}

export class MapMenu {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  realmId: string;
  onSelectCity: (city: string) => void;
  animationId: number = 0;

  // Background images for dark and light themes
  bgDarkImg: HTMLImageElement | null = null;
  bgLightImg: HTMLImageElement | null = null;
  bgDarkLoaded: boolean = false;
  bgLightLoaded: boolean = false;

  // Richly detailed locations ordered strictly by campaign difficulty (Level 1 to 7)
  locations: LocationNode[] = [
    {
      id: 'althjofs-wheel',
      name: "Althjof's Wheel",
      subtitle: 'Water Mining',
      rune: 'ᚨ ᛚ ᛏ',
      role: 'Hydraulic Extraction Mill',
      threat: 'Normal',
      threatLevel: 1,
      level: 1,
      waves: 6,
      locked: false,
      desc: 'The outer river waterwheel. Low monster activity along the waterways makes this the ideal breach point to deploy your initial vanguard.',
      px: 0.63, py: 0.48, radius: 34, hover: 0, type: 'mine', icon: 'waterwheel', gemColor: '#14b8a6',
      accentColor: '#14b8a6', secondaryColor: '#d97706'
    },
    {
      id: 'andvaris-falls',
      name: "Andvari's Falls",
      subtitle: 'Cursed Waters',
      rune: 'ᚨ ᚾ ᛞ',
      role: 'Mystical Waterfall Cavern',
      threat: 'Normal',
      threatLevel: 2,
      level: 2,
      waves: 7,
      locked: true,
      desc: 'Subterranean rapids plunging into crystal chasms. Waterborne raiders and serpent beasts contest the passage to the cursed gold hoards.',
      px: 0.38, py: 0.82, radius: 34, hover: 0, type: 'waterfall', icon: 'waterfall', gemColor: '#38bdf8',
      accentColor: '#38bdf8', secondaryColor: '#0284c7'
    },
    {
      id: 'ivaldis-workshop',
      name: "Ivaldi's Workshop",
      subtitle: 'Artifacts',
      rune: 'ᛁ ᚹ ᚨ',
      role: 'Arcane Runecraft Sanctum',
      threat: 'Normal',
      threatLevel: 3,
      level: 3,
      waves: 8,
      locked: true,
      desc: 'The sacred craft enclave of the Sons of Ivaldi. Corrupted shadow fiends attempt to desecrate the celestial forges where Gungnir was born.',
      px: 0.50, py: 0.24, radius: 32, hover: 0, type: 'city', icon: 'gungnir', gemColor: '#c084fc',
      accentColor: '#c084fc', secondaryColor: '#7e22ce'
    },
    {
      id: 'jarnsmida-quarry',
      name: 'Jarnsmida Quarry',
      subtitle: 'Terraced Quarry',
      rune: 'ᛃ ᚨ ᚱ',
      role: 'Terraced Iron Quarry',
      threat: 'Hard',
      threatLevel: 4,
      level: 4,
      waves: 9,
      locked: true,
      desc: 'A colossal circular quarry descending in carved stone terraces. Armored iron-eaters and siege trolls have overrun the minecart rail lines.',
      px: 0.80, py: 0.28, radius: 34, hover: 0, type: 'mine', icon: 'minecart', gemColor: '#ea580c',
      accentColor: '#ea580c', secondaryColor: '#fb923c'
    },
    {
      id: 'dvalins-depths',
      name: "Dvalin's Depths",
      subtitle: 'Deep Mines',
      rune: 'ᛞ ᚹ ᚨ',
      role: 'Primordial Geode Shafts',
      threat: 'Hard',
      threatLevel: 5,
      level: 5,
      waves: 10,
      locked: true,
      desc: 'The colossal primordial mines of dwarf lord Dvalin. Vast timbered mine shafts and railway networks plunge into glowing crystal chasms.',
      px: 0.91, py: 0.58, radius: 34, hover: 0, type: 'mine', icon: 'minehoist', gemColor: '#f59e0b',
      accentColor: '#f59e0b', secondaryColor: '#78350f'
    },
    {
      id: 'sindris-forge',
      name: "Sindri's Forge",
      subtitle: 'Weaponsmiths',
      rune: 'ᛊ ᛁ ᚾ',
      role: 'Legendary Weapon Forges',
      threat: 'Extreme',
      threatLevel: 6,
      level: 6,
      waves: 11,
      locked: true,
      desc: 'Twin blast furnaces roaring day and night. Elite dragonfire drakes and vanguard fiends launch an all-out assault on the divine armories.',
      px: 0.72, py: 0.68, radius: 36, hover: 0, type: 'city', icon: 'forge', gemColor: '#ff5722',
      accentColor: '#ff5722', secondaryColor: '#fbbf24'
    },
    {
      id: 'nidavellir',
      name: 'Nidavellir',
      subtitle: 'The Capital',
      rune: 'ᚲ ᚨ ᛈ',
      role: 'Seat of Brokkr & Eitri · End Game',
      threat: 'Nightmare',
      threatLevel: 7,
      level: 7,
      waves: 12,
      locked: true,
      desc: 'The great subterranean capital fortress. Massive stone keeps, fortified bastions, and iron portcullises face the final apocalyptic horde.',
      px: 0.20, py: 0.36, radius: 38, hover: 0, type: 'capital', icon: 'castle', gemColor: '#ffd700',
      accentColor: '#ffd700', secondaryColor: '#b45309'
    }
  ];

  hoveredCity: LocationNode | null = null;
  lastHoveredCityId: string | null = null;
  hoveredReturn = false;
  lastHoveredReturn = false;

  // Particle systems
  waterSprayParticles: any[] = [];
  forgeEmbers: any[] = [];
  ambientMotes: any[] = [];
  onReturn: (() => void) | null = null;
  themeLightWeight: number = 0;

  constructor(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    realmId: string,
    onSelectCity: (city: string) => void,
    onReturn?: () => void
  ) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.realmId = realmId;
    this.onSelectCity = onSelectCity;
    this.onReturn = onReturn || null;

    const isLight = document.body.dataset.activeTheme === 'light';
    this.themeLightWeight = isLight ? 1 : 0;

    this.initProgression();
    this.loadBackgrounds();
    this.bindEvents();
    this.initParticles();
  }

  static readonly PROGRESSION_ORDER = [
    'althjofs-wheel',
    'andvaris-falls',
    'ivaldis-workshop',
    'jarnsmida-quarry',
    'dvalins-depths',
    'sindris-forge',
    'nidavellir'
  ];

  static getUnlockedCities(): string[] {
    try {
      const saved = localStorage.getItem('ragnarok_svartalfheim_unlocked');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const valid = parsed.filter(id => MapMenu.PROGRESSION_ORDER.includes(id));
          if (valid.length > 0) return valid;
        }
      }
    } catch (e) {}
    return ['althjofs-wheel'];
  }

  static unlockNextCity(currentCityId: string) {
    const list = MapMenu.getUnlockedCities();
    const idx = MapMenu.PROGRESSION_ORDER.indexOf(currentCityId);
    if (idx !== -1 && idx < MapMenu.PROGRESSION_ORDER.length - 1) {
      const nextId = MapMenu.PROGRESSION_ORDER[idx + 1];
      if (!list.includes(nextId)) {
        list.push(nextId);
        try {
          localStorage.setItem('ragnarok_svartalfheim_unlocked', JSON.stringify(list));
        } catch (e) {}
      }
    }
  }

  initProgression() {
    const unlocked = MapMenu.getUnlockedCities();

    for (const loc of this.locations) {
      loc.locked = !unlocked.includes(loc.id);
      loc.shake = 0;
    }
  }

  loadBackgrounds() {
    this.bgDarkImg = new Image();
    this.bgDarkImg.src = '/assets/svartalfheim_map_dark.jpg';
    this.bgDarkImg.onload = () => {
      this.bgDarkLoaded = true;
    };

    this.bgLightImg = new Image();
    this.bgLightImg.src = '/assets/svartalfheim_map_light.jpg';
    this.bgLightImg.onload = () => {
      this.bgLightLoaded = true;
    };
  }

  initParticles() {
    // Waterfall spray particles (around lower-left cascade at x~0.38, y~0.85)
    for (let i = 0; i < 45; i++) {
      this.waterSprayParticles.push({
        x: 0.35 + Math.random() * 0.08,
        y: 0.80 + Math.random() * 0.12,
        vx: (Math.random() - 0.5) * 0.0006,
        vy: -0.0008 - Math.random() * 0.0012,
        size: 2.0 + Math.random() * 4.0,
        alpha: 0.3 + Math.random() * 0.5,
        life: Math.random()
      });
    }

    // Forge embers (around Sindri's forge at x~0.72, y~0.68)
    for (let i = 0; i < 50; i++) {
      this.forgeEmbers.push({
        x: 0.68 + Math.random() * 0.09,
        y: 0.62 + Math.random() * 0.12,
        vx: (Math.random() - 0.4) * 0.0006,
        vy: -0.001 - Math.random() * 0.0018,
        size: 1.5 + Math.random() * 3.0,
        color: ['#ff9100', '#ffab00', '#ffd54f', '#ff3d00'][Math.floor(Math.random() * 4)],
        pulse: Math.random() * Math.PI * 2
      });
    }

    // Ambient floating cavern motes across the subterranean air
    for (let i = 0; i < 70; i++) {
      this.ambientMotes.push({
        x: Math.random(),
        y: Math.random(),
        vx: (Math.random() - 0.5) * 0.0002,
        vy: -0.0002 - Math.random() * 0.0004,
        size: 1.0 + Math.random() * 2.5,
        alpha: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2
      });
    }
  }

  bindEvents() {
    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('mouseleave', this.onMouseLeave);
  }

  unbindEvents() {
    this.canvas.removeEventListener('mousemove', this.onMouseMove);
    this.canvas.removeEventListener('click', this.onClick);
    this.canvas.removeEventListener('mouseleave', this.onMouseLeave);
  }

  onMouseLeave = () => {
    this.hoveredCity = null;
    this.hoveredReturn = false;
    this.lastHoveredCityId = null;
    this.canvas.style.cursor = 'default';
  };

  onMouseMove = (e: MouseEvent) => {
    const rect = this.canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const w = rect.width;
    const h = rect.height;

    this.hoveredCity = null;
    this.hoveredReturn = false;
    this.canvas.style.cursor = 'default';

    // Check hover on location nodes
    for (const loc of this.locations) {
      const lx = loc.px * w;
      const ly = loc.py * h;
      if (Math.hypot(mx - lx, my - ly) < loc.radius * 1.8) {
        this.hoveredCity = loc;
        this.canvas.style.cursor = loc.locked ? 'not-allowed' : 'pointer';
        break;
      }
    }

    // Audio chime on node hover change
    if (this.hoveredCity && this.hoveredCity.id !== this.lastHoveredCityId) {
      SoundManager.getInstance().playClick();
    }
    this.lastHoveredCityId = this.hoveredCity ? this.hoveredCity.id : null;
  };

  onClick = () => {
    if (this.hoveredCity) {
      if (this.hoveredCity.locked) {
        SoundManager.getInstance().playLocked();
        this.hoveredCity.shake = 12;
        return;
      }
      SoundManager.getInstance().playClick();
      this.onSelectCity(this.hoveredCity.id);
    }
  };

  start() { this.loop(); }
  stop() { cancelAnimationFrame(this.animationId); this.unbindEvents(); }
  loop = () => { this.draw(); this.animationId = requestAnimationFrame(this.loop); };

  draw() {
    const rect = this.canvas.getBoundingClientRect();
    const w = rect.width;
    const h = rect.height;
    const dpr = window.devicePixelRatio || 1;
    const ctx = this.ctx;
    const time = Date.now() / 1000;
    const isLight = document.body.dataset.activeTheme === 'light';
    const targetWeight = isLight ? 1 : 0;
    this.themeLightWeight += (targetWeight - this.themeLightWeight) * 0.08;
    this.themeLightWeight = Math.max(0, Math.min(1, this.themeLightWeight));

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.scale(dpr, dpr);
    ctx.clearRect(0, 0, w, h);

    // ── 1. RENDER HIGH-RES ILLUSTRATED REALM MAP BACKGROUND WITH SMOOTH DISSOLVE ──
    const imgRatio = 1376 / 768;
    const canvasRatio = w / h;
    let dw = w, dh = h, dx = 0, dy = 0;

    if (canvasRatio > imgRatio) {
      dh = w / imgRatio;
      dy = (h - dh) / 2;
    } else {
      dw = h * imgRatio;
      dx = (w - dw) / 2;
    }

    let renderedAny = false;

    // Draw Dark Realm Map
    if (this.bgDarkImg && this.bgDarkLoaded) {
      ctx.drawImage(this.bgDarkImg, dx, dy, dw, dh);
      renderedAny = true;
    }

    // Smoothly dissolve Light Realm Map on top based on themeLightWeight
    if (this.bgLightImg && this.bgLightLoaded) {
      if (this.themeLightWeight > 0.005) {
        ctx.save();
        ctx.globalAlpha = this.themeLightWeight;
        ctx.drawImage(this.bgLightImg, dx, dy, dw, dh);
        ctx.restore();
      }
      if (!renderedAny) renderedAny = true;
    }

    if (!renderedAny) {
      // Fallback procedural cavern gradient while images load
      const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
      bgGrad.addColorStop(0, '#1c1410');
      bgGrad.addColorStop(0.5, '#241a14');
      bgGrad.addColorStop(1, '#0e0a08');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, w, h);
    }

    // ── 2. DYNAMIC AMBIENT LIGHTING OVERLAYS ──
    ctx.save();
    // Warm forge ambient pulse at Sindri's Forge
    const forgePulse = Math.sin(time * 3.5) * 0.15 + 0.85;
    const forgeX = 0.72 * w;
    const forgeY = 0.68 * h;
    const forgeGlow = ctx.createRadialGradient(forgeX, forgeY, 10, forgeX, forgeY, 180);
    forgeGlow.addColorStop(0, `rgba(255, 140, 20, ${0.30 * forgePulse})`);
    forgeGlow.addColorStop(0.5, `rgba(245, 158, 11, ${0.12 * forgePulse})`);
    forgeGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = forgeGlow;
    ctx.beginPath();
    ctx.arc(forgeX, forgeY, 180, 0, Math.PI * 2);
    ctx.fill();

    // Cyan bioluminescent pulse at Waterfall and Crystals
    const waterPulse = Math.sin(time * 2.0) * 0.12 + 0.88;
    const waterX = 0.38 * w;
    const waterY = 0.82 * h;
    const waterGlow = ctx.createRadialGradient(waterX, waterY, 10, waterX, waterY, 160);
    waterGlow.addColorStop(0, `rgba(56, 189, 248, ${0.28 * waterPulse})`);
    waterGlow.addColorStop(0.6, `rgba(14, 165, 233, ${0.10 * waterPulse})`);
    waterGlow.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = waterGlow;
    ctx.beginPath();
    ctx.arc(waterX, waterY, 160, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // ── 3. ANIMATED WATERFALL SPRAY PARTICLES ──
    ctx.save();
    for (const p of this.waterSprayParticles) {
      p.y += p.vy;
      p.x += p.vx;
      p.life -= 0.012;
      if (p.life <= 0 || p.y < 0.75) {
        p.x = 0.35 + Math.random() * 0.08;
        p.y = 0.82 + Math.random() * 0.06;
        p.life = 1;
      }
      const alpha = p.life * p.alpha;
      ctx.fillStyle = isLight ? `rgba(224, 242, 254, ${alpha})` : `rgba(125, 211, 252, ${alpha})`;
      ctx.beginPath();
      ctx.arc(p.x * w, p.y * h, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // ── 4. ANIMATED FORGE EMBERS ──
    for (const emb of this.forgeEmbers) {
      emb.x += emb.vx;
      emb.y += emb.vy;
      if (emb.y < 0.55 || emb.x < 0.65 || emb.x > 0.82) {
        emb.x = 0.69 + Math.random() * 0.08;
        emb.y = 0.70 + Math.random() * 0.05;
      }
      const pSin = Math.sin(time * 5 + emb.pulse) * 0.3 + 0.7;
      ctx.fillStyle = emb.color;
      ctx.shadowColor = emb.color;
      ctx.shadowBlur = 6 * pSin;
      ctx.globalAlpha = 0.8 * pSin;
      ctx.beginPath();
      ctx.arc(emb.x * w, emb.y * h, emb.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;

    // ── 5. AMBIENT DRIFTING CAVERN MOTES ──
    for (const mote of this.ambientMotes) {
      mote.x += mote.vx;
      mote.y += mote.vy;
      if (mote.y < 0) mote.y = 1;
      if (mote.x < 0) mote.x = 1;
      if (mote.x > 1) mote.x = 0;
      const mAlpha = mote.alpha * (Math.sin(time * 2 + mote.phase) * 0.25 + 0.75);
      ctx.fillStyle = isLight ? `rgba(251, 191, 36, ${mAlpha})` : `rgba(245, 158, 11, ${mAlpha * 0.8})`;
      ctx.beginPath();
      ctx.arc(mote.x * w, mote.y * h, mote.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // ── 6. NATURALLY INTEGRATED DWARVEN LANDMARK MONUMENTS ──
    for (const loc of this.locations) {
      const shakeOffset = (loc.shake && loc.shake > 0) ? Math.sin(loc.shake * 3) * (loc.shake * 0.4) : 0;
      if (loc.shake && loc.shake > 0) {
        loc.shake -= 1;
      }
      const lx = loc.px * w + shakeOffset;
      const ly = loc.py * h;
      const isHovered = this.hoveredCity === loc;
      loc.hover += (isHovered ? 1 : -1) * 0.15;
      loc.hover = Math.max(0, Math.min(1, loc.hover));

      const r = loc.radius;

      // 6A. Grounded Isometric Stone Pedestal on terrain
      this.drawGroundedPedestal(ctx, lx, ly, r, loc, time, isLight);

      // 6B. Elevated 3D Crest Standard with Bespoke Handcrafted Vectors
      this.drawElevatedCrest(ctx, lx, ly, r, loc, time, isLight);

      // 6C. Integrated Dwarven Stone Name Plaque
      this.drawNamePlaque(ctx, lx, ly, r, loc, isLight);
    }

    // ── 7. INTERACTIVE MISSION INTEL CARD ON HOVER ──
    if (this.hoveredCity) {
      this.drawMissionIntelCard(ctx, this.hoveredCity, w, h, isLight, time);
    }

    // ── 8. MAJESTIC DWARVEN REALM TITLE BANNER ──
    ctx.save();
    const bannerW = Math.min(460, Math.max(280, w - 280));
    const bannerH = 48;
    const bannerX = (w - bannerW) / 2;
    const bannerY = 16;

    // Banner slate backing
    ctx.fillStyle = isLight ? 'rgba(255, 251, 235, 0.94)' : 'rgba(15, 12, 10, 0.92)';
    ctx.beginPath();
    ctx.roundRect(bannerX, bannerY, bannerW, bannerH, 8);
    ctx.fill();

    // Gold filigree border
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.8;
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Header Runic Text
    ctx.textAlign = 'center';
    ctx.fillStyle = isLight ? '#92400e' : '#f59e0b';
    ctx.font = '700 10px "Segoe UI Historic", "Segoe UI Symbol", sans-serif';
    ctx.fillText(`ᚱ ᚨ ᚷ ᚾ ᚨ ᚱ ᛟ ᚲ · ${t('realm_svartalfheim')} · ᛊ ᚹ ᚨ ᚱ ᛏ ᚨ ᛚ ᚠ`, w / 2, bannerY + 16);

    // Realm Title
    ctx.fillStyle = isLight ? '#1c1917' : '#fef08a';
    ctx.font = 'bold 15px "Outfit", "Inter", sans-serif';
    ctx.fillText(`${t('world_svartalfheim')} · Niðavellir`, w / 2, bannerY + 35);
    ctx.restore();
  }

  // ── GROUNDED ISOMETRIC STONE PEDESTAL ON TERRAIN ──
  private drawGroundedPedestal(
    ctx: CanvasRenderingContext2D,
    lx: number,
    ly: number,
    r: number,
    loc: LocationNode,
    time: number,
    isLight: boolean
  ) {
    ctx.save();

    // 1. Terrain Contact Shadow (soft diffuse ellipse directly on cavern floor)
    ctx.beginPath();
    ctx.ellipse(lx, ly + 14, r * 1.35 + loc.hover * 4, r * 0.44, 0, 0, Math.PI * 2);
    const shadowGrad = ctx.createRadialGradient(lx, ly + 14, 2, lx, ly + 14, r * 1.35 + loc.hover * 4);
    shadowGrad.addColorStop(0, 'rgba(0, 0, 0, 0.70)');
    shadowGrad.addColorStop(0.6, 'rgba(0, 0, 0, 0.40)');
    shadowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shadowGrad;
    ctx.fill();

    // 2. Tactical Action-Inviting Ground Radar Pulse
    if (!loc.locked) {
      const pingPhase = ((time * 0.7 + loc.px * 6) % 1);
      const pingR = (r * 1.1) + pingPhase * (r * 0.9);
      const pingAlpha = (1 - pingPhase) * (0.35 + loc.hover * 0.45);
      ctx.beginPath();
      ctx.ellipse(lx, ly + 12, pingR * 1.3, pingR * 0.46, 0, 0, Math.PI * 2);
      ctx.strokeStyle = loc.gemColor;
      ctx.globalAlpha = pingAlpha;
      ctx.lineWidth = 1.8;
      ctx.stroke();
      ctx.globalAlpha = 1.0;
    } else {
      // Subdued dormant boundary ring
      ctx.beginPath();
      ctx.ellipse(lx, ly + 12, r * 1.15, r * 0.42, 0, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(120, 113, 108, 0.30)';
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // 3. Tiered Carved Dwarven Stone Plinth (isometric octagon / ellipse)
    const plinthW = r * 1.15;
    const plinthH = r * 0.42;
    const plinthDepth = 9;

    // Base tier 3D rim depth
    ctx.beginPath();
    ctx.ellipse(lx, ly + 12, plinthW, plinthH, 0, 0, Math.PI);
    ctx.lineTo(lx - plinthW, ly + 12 - plinthDepth);
    ctx.ellipse(lx, ly + 12 - plinthDepth, plinthW, plinthH, 0, Math.PI, 0, true);
    ctx.closePath();
    const rimGrad = ctx.createLinearGradient(lx, ly, lx, ly + 16);
    rimGrad.addColorStop(0, isLight ? '#785f4e' : '#231812');
    rimGrad.addColorStop(1, isLight ? '#45352b' : '#120d09');
    ctx.fillStyle = rimGrad;
    ctx.fill();
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.stroke();

    // Upper Plinth Top Face
    ctx.beginPath();
    ctx.ellipse(lx, ly + 12 - plinthDepth, plinthW, plinthH, 0, 0, Math.PI * 2);
    const topGrad = ctx.createRadialGradient(lx, ly + 12 - plinthDepth, 2, lx, ly + 12 - plinthDepth, plinthW);
    topGrad.addColorStop(0, isLight ? '#d6c7b2' : '#3a2b22');
    topGrad.addColorStop(1, isLight ? '#9c826c' : '#1e140e');
    ctx.fillStyle = topGrad;
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // Inset glowing elemental runic vein on plinth surface
    ctx.beginPath();
    ctx.ellipse(lx, ly + 12 - plinthDepth, plinthW * 0.65, plinthH * 0.65, 0, 0, Math.PI * 2);
    ctx.strokeStyle = loc.gemColor;
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.restore();
  }

  // ── ELEVATED 3D CREST STANDARD WITH BESPOKE VECTOR ARTWORK ──
  private drawElevatedCrest(
    ctx: CanvasRenderingContext2D,
    lx: number,
    ly: number,
    r: number,
    loc: LocationNode,
    time: number,
    isLight: boolean
  ) {
    ctx.save();

    // Vertical tactile floating lift on hover and idle
    const floatY = -loc.hover * 10 + Math.sin(time * 2.2 + loc.px * 10) * 2.5;
    const cy = ly + floatY;

    // Intermediate contact shadow between floating crest and plinth
    ctx.beginPath();
    ctx.ellipse(lx, ly + 3 + loc.hover * 2, (r - 2) * 1.05, (r - 2) * 0.35, 0, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
    ctx.fill();

    // 1. Rotating Elder Futhark Reticle on Hover
    if (loc.hover > 0.05) {
      ctx.save();
      ctx.translate(lx, cy);
      ctx.rotate(time * 0.65);
      const reticleR = r + 15 + loc.hover * 4;
      ctx.beginPath();
      ctx.arc(0, 0, reticleR, 0, Math.PI * 2);
      ctx.strokeStyle = loc.locked ? '#ef4444' : loc.gemColor;
      ctx.globalAlpha = loc.hover * 0.85;
      ctx.setLineDash([7, 10]);
      ctx.lineWidth = 2.0;
      ctx.stroke();

      // Outer runic markers: LOKA for locked, Elder Futhark for active
      const runeSymbols = loc.locked ? ['ᛚ','ᛟ','ᚲ','ᚨ','ᛚ','ᛟ','ᚲ','ᚨ'] : ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ'];
      ctx.font = 'bold 9px "Segoe UI Historic", "Segoe UI Symbol", serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = loc.locked ? '#f87171' : loc.gemColor;
      for (let ri = 0; ri < runeSymbols.length; ri++) {
        const ra = (ri * Math.PI * 2) / runeSymbols.length;
        ctx.fillText(runeSymbols[ri], Math.cos(ra) * (reticleR + 7), Math.sin(ra) * (reticleR + 7));
      }
      ctx.restore();
    }

    // 2. Outer Heavy Dwarven Brass Medallion Frame
    ctx.beginPath();
    ctx.arc(lx, cy, r + 4, 0, Math.PI * 2);
    ctx.fillStyle = isLight ? '#e2d3b5' : '#1f1610';
    ctx.fill();
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 2.4;
    ctx.shadowColor = loc.gemColor;
    ctx.shadowBlur = 6 + loc.hover * 16;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Decorative Dwarven Rivets / Corner Clamps at 8 points
    ctx.fillStyle = '#f59e0b';
    for (let rv = 0; rv < 8; rv++) {
      const rva = (rv * Math.PI * 2) / 8;
      const rvx = lx + Math.cos(rva) * (r + 4);
      const rvy = cy + Math.sin(rva) * (r + 4);
      ctx.beginPath();
      ctx.arc(rvx, rvy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. Inner Medallion Backing Disc with Element Gradient
    ctx.beginPath();
    ctx.arc(lx, cy, r, 0, Math.PI * 2);
    const coreGrad = ctx.createRadialGradient(lx, cy - r * 0.3, 2, lx, cy, r);
    if (loc.type === 'capital') {
      coreGrad.addColorStop(0, isLight ? '#fef08a' : '#78350f');
      coreGrad.addColorStop(1, isLight ? '#ca8a04' : '#2e1065');
    } else if (loc.type === 'waterfall') {
      coreGrad.addColorStop(0, isLight ? '#e0f2fe' : '#0369a1');
      coreGrad.addColorStop(1, isLight ? '#38bdf8' : '#0c4a6e');
    } else if (loc.id === 'sindris-forge') {
      coreGrad.addColorStop(0, isLight ? '#fed7aa' : '#9a3412');
      coreGrad.addColorStop(1, isLight ? '#ea580c' : '#18181b');
    } else if (loc.id === 'ivaldis-workshop') {
      coreGrad.addColorStop(0, isLight ? '#f3e8ff' : '#6b21a8');
      coreGrad.addColorStop(1, isLight ? '#c084fc' : '#1e1b4b');
    } else {
      coreGrad.addColorStop(0, isLight ? '#fef3c7' : '#92400e');
      coreGrad.addColorStop(1, isLight ? '#b45309' : '#1c1917');
    }
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // Clip within crest disc for crisp interior rendering
    ctx.save();
    ctx.beginPath();
    ctx.arc(lx, cy, r - 0.5, 0, Math.PI * 2);
    ctx.clip();

    if (loc.locked) {
      ctx.filter = 'brightness(96%) saturate(92%) contrast(98%)';
    }

    // Dispatch to bespoke handcrafted vector renderer
    switch (loc.id) {
      case 'nidavellir':
        this.drawNidavellirCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'sindris-forge':
        this.drawSindriForgeCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'andvaris-falls':
        this.drawAndvariFallsCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'althjofs-wheel':
        this.drawAlthjofsWheelCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'dvalins-depths':
        this.drawDvalinsDepthsCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'jarnsmida-quarry':
        this.drawJarnsmidaQuarryCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      case 'ivaldis-workshop':
        this.drawIvaldiWorkshopCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
      default:
        this.drawNidavellirCrest(ctx, lx, cy, r, time, loc.hover, isLight);
        break;
    }

    ctx.filter = 'none';

    // If locked, draw heavy crossed dwarven iron chains and padlock
    if (loc.locked) {
      this.drawDwarvenLock(ctx, lx, cy, r, time);
    }

    ctx.restore();

    // Inner gold hairline bezel ring
    ctx.beginPath();
    ctx.arc(lx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = loc.locked ? '#d4af37' : '#d4af37';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // 4. Waypoint Beacon: Start diamond if unlocked, Padlock badge if locked
    if (loc.locked) {
      const lockY = cy - r - 13;
      ctx.save();
      ctx.translate(lx, lockY);
      ctx.fillStyle = 'rgba(24, 18, 14, 0.94)';
      ctx.beginPath();
      ctx.roundRect(-24, -8, 48, 16, 4);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(212, 175, 55, 0.4)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      ctx.font = 'bold 8.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = '#fef08a';
      ctx.fillText(`🔒 Lvl ${loc.level}`, 0, 0);
      ctx.restore();
    } else {
      const beaconY = cy - r - 13;
      const beaconPulse = Math.sin(time * 3.5 + loc.px * 8) * 0.25 + 0.75;
      ctx.save();
      ctx.translate(lx, beaconY);
      ctx.scale(1 + loc.hover * 0.25, 1 + loc.hover * 0.25);

      // Glow halo
      ctx.beginPath();
      ctx.arc(0, 0, 7 * beaconPulse, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(245, 158, 11, ${0.4 * beaconPulse + loc.hover * 0.3})`;
      ctx.fill();

      // Golden Diamond
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.lineTo(5, 0);
      ctx.lineTo(0, 6);
      ctx.lineTo(-5, 0);
      ctx.closePath();
      ctx.fillStyle = loc.hover > 0.1 ? '#fef08a' : '#d4af37';
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1;
      ctx.stroke();

      // Downward battle chevron
      ctx.fillStyle = '#451a03';
      ctx.beginPath();
      ctx.moveTo(-2.5, -2);
      ctx.lineTo(0, 2);
      ctx.lineTo(2.5, -2);
      ctx.stroke();

      ctx.restore();
    }

    ctx.restore();
  }

  // ── FORGED DWARVEN LOCK & HEAVY CHAINS (LOCKED MONUMENT OVERLAY) ──
  private drawDwarvenLock(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number) {
    ctx.save();
    
    // 1. Slender, semi-translucent forged mithril/gold chains that reveal the crest art
    ctx.save();
    ctx.globalAlpha = 0.55;

    // Soft underlying contact line
    ctx.strokeStyle = 'rgba(20, 16, 12, 0.4)';
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.72, cy - r * 0.55);
    ctx.lineTo(cx + r * 0.72, cy + r * 0.55);
    ctx.moveTo(cx + r * 0.72, cy - r * 0.55);
    ctx.lineTo(cx - r * 0.72, cy + r * 0.55);
    ctx.stroke();

    // Gleaming dwarven gold chain links
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.6;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.72, cy - r * 0.55);
    ctx.lineTo(cx + r * 0.72, cy + r * 0.55);
    ctx.moveTo(cx + r * 0.72, cy - r * 0.55);
    ctx.lineTo(cx - r * 0.72, cy + r * 0.55);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Light, Radiant Forged Dwarven Brass & Mithril Padlock
    const lockW = 18;
    const lockH = 15;
    const lockY = cy + 2;

    // Ambient golden aura behind the lock
    ctx.save();
    ctx.shadowColor = 'rgba(253, 224, 71, 0.65)';
    ctx.shadowBlur = 10;

    // Radiant gold & silver shackle
    ctx.beginPath();
    ctx.arc(cx, lockY - 1, 5.5, Math.PI, 0);
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 2.8;
    ctx.stroke();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.0;
    ctx.stroke();

    // Padlock body (gleaming light gold & polished dwarven brass)
    const lockGrad = ctx.createLinearGradient(cx - lockW * 0.5, lockY, cx + lockW * 0.5, lockY + lockH);
    lockGrad.addColorStop(0, '#ffffff');
    lockGrad.addColorStop(0.25, '#fef08a');
    lockGrad.addColorStop(0.7, '#f59e0b');
    lockGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = lockGrad;
    ctx.beginPath();
    ctx.roundRect(cx - lockW * 0.5, lockY, lockW, lockH, 3.5);
    ctx.fill();
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1.3;
    ctx.stroke();
    ctx.restore();

    // Specular diagonal highlight gleam across padlock
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cx - lockW * 0.5 + 1, lockY + 1, lockW - 2, 2.5, 1);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.fill();
    ctx.restore();

    // Sparkling corner rivets
    ctx.fillStyle = '#ffffff';
    for (const rx of [cx - lockW * 0.5 + 2.5, cx + lockW * 0.5 - 2.5]) {
      for (const ry of [lockY + 2.5, lockY + lockH - 2.5]) {
        ctx.beginPath();
        ctx.arc(rx, ry, 0.9, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Glowing Crimson/Amber Rune Keyhole (Ward of sealing)
    const keyholePulse = Math.sin(time * 3.5) * 0.25 + 0.75;
    ctx.save();
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 5;
    ctx.fillStyle = `rgba(239, 68, 68, ${keyholePulse})`;
    ctx.beginPath();
    ctx.arc(cx, lockY + lockH * 0.42, 2.0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 0.9, lockY + lockH * 0.42, 1.8, 3.2);
    ctx.restore();

    ctx.restore();
  }

  // ── 1. NIDAVELLIR: ROYAL DWARVEN CITADEL, KING'S HORNED CROWN & CROSSED WARAXES ──
  private drawNidavellirCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, _time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // Crossed Golden War-Axes behind the citadel
    ctx.save();
    ctx.translate(cx, cy);
    const axeAngle = 0.65;
    for (const dir of [-1, 1]) {
      ctx.save();
      ctx.rotate(dir * axeAngle);
      // Ash handle
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-1.5, -r * 0.75, 3, r * 1.5);
      // Gold end caps
      ctx.fillStyle = '#ffd700';
      ctx.fillRect(-2, r * 0.65, 4, 3);
      // Double-crescent Axe Head
      ctx.beginPath();
      ctx.moveTo(0, -r * 0.45);
      ctx.bezierCurveTo(dir * 12, -r * 0.65, dir * 18, -r * 0.55, dir * 16, -r * 0.25);
      ctx.bezierCurveTo(dir * 10, -r * 0.35, dir * 4, -r * 0.35, 0, -r * 0.35);
      ctx.fillStyle = '#ffd700';
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // Chiseled Stone Fortress Citadel Keep
    const kw = r * 0.7;
    const kh = r * 0.8;
    const kx = cx - kw * 0.5;
    const ky = cy - kh * 0.35;

    // Fortress center wall
    const stoneGrad = ctx.createLinearGradient(kx, ky, kx + kw, ky + kh);
    stoneGrad.addColorStop(0, '#52525b');
    stoneGrad.addColorStop(0.5, '#3f3f46');
    stoneGrad.addColorStop(1, '#27272a');
    ctx.fillStyle = stoneGrad;
    ctx.beginPath();
    ctx.rect(kx, ky, kw, kh);
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#d4af37';
    ctx.stroke();

    // Crenellations (battlements) atop center keep
    ctx.fillStyle = '#71717a';
    for (let c = 0; c < 4; c++) {
      ctx.fillRect(kx + (c * kw) / 4 + 1, ky - 5, kw / 4 - 2, 6);
    }

    // Flanking Bastion Watchtowers
    const tw = kw * 0.35;
    const th = kh * 0.9;
    for (const bx of [kx - tw * 0.6, kx + kw - tw * 0.4]) {
      ctx.fillStyle = '#3f3f46';
      ctx.fillRect(bx, ky - 3, tw, th);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1;
      ctx.strokeRect(bx, ky - 3, tw, th);
      // Bastion conical roof
      ctx.beginPath();
      ctx.moveTo(bx - 1, ky - 3);
      ctx.lineTo(bx + tw * 0.5, ky - 10);
      ctx.lineTo(bx + tw + 1, ky - 3);
      ctx.closePath();
      ctx.fillStyle = '#d97706';
      ctx.fill();
      ctx.stroke();
    }

    // Glowing Arched Gateway & Portcullis
    const gw = kw * 0.4;
    const gh = kh * 0.5;
    const gx = cx - gw * 0.5;
    const gy = cy + kh * 0.65 - gh;
    ctx.beginPath();
    ctx.arc(cx, gy + gh * 0.4, gw * 0.5, Math.PI, 0);
    ctx.lineTo(gx + gw, gy + gh);
    ctx.lineTo(gx, gy + gh);
    ctx.closePath();
    const gateGlow = ctx.createRadialGradient(cx, gy + gh * 0.6, 2, cx, gy + gh * 0.6, gw);
    gateGlow.addColorStop(0, '#fef08a');
    gateGlow.addColorStop(0.7, '#f59e0b');
    gateGlow.addColorStop(1, '#78350f');
    ctx.fillStyle = gateGlow;
    ctx.fill();
    // Iron portcullis bars
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1.2;
    for (let bar = 1; bar < 4; bar++) {
      ctx.beginPath();
      ctx.moveTo(gx + (bar * gw) / 4, gy + gh * 0.2);
      ctx.lineTo(gx + (bar * gw) / 4, gy + gh);
      ctx.stroke();
    }

    // High King's Crown atop Central Keep
    const crownY = ky - 11;
    ctx.beginPath();
    ctx.moveTo(cx - 10, crownY);
    ctx.lineTo(cx - 12, crownY - 7);
    ctx.lineTo(cx - 5, crownY - 3);
    ctx.lineTo(cx, crownY - 9);
    ctx.lineTo(cx + 5, crownY - 3);
    ctx.lineTo(cx + 12, crownY - 7);
    ctx.lineTo(cx + 10, crownY);
    ctx.closePath();
    ctx.fillStyle = '#ffd700';
    ctx.fill();
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1;
    ctx.stroke();
    // Ruby center cabochon
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(cx, crownY - 2, 2.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ── 2. SINDRI'S FORGE: ROARING DRAGONFIRE, MASTERWORK ANVIL, STRIKING HAMMER & SPARKS ──
  private drawSindriForgeCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Roaring background forge fire flames
    ctx.save();
    const flamePulse = Math.sin(time * 6) * 2;
    const flameGrad = ctx.createLinearGradient(cx, cy + r * 0.4, cx, cy - r * 0.8);
    flameGrad.addColorStop(0, 'rgba(239, 68, 68, 0.85)');
    flameGrad.addColorStop(0.5, 'rgba(245, 158, 11, 0.7)');
    flameGrad.addColorStop(1, 'rgba(254, 240, 138, 0)');
    ctx.fillStyle = flameGrad;
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.6, cy + r * 0.3);
    ctx.quadraticCurveTo(cx - r * 0.4, cy - r * 0.5 + flamePulse, cx - r * 0.2, cy - r * 0.7);
    ctx.quadraticCurveTo(cx, cy - r * 0.4, cx + r * 0.1, cy - r * 0.75 - flamePulse);
    ctx.quadraticCurveTo(cx + r * 0.3, cy - r * 0.45, cx + r * 0.6, cy + r * 0.3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 2. Oak anvil stump block
    const stumpW = r * 0.75;
    const stumpH = r * 0.3;
    const stumpX = cx - stumpW * 0.5;
    const stumpY = cy + r * 0.35;
    ctx.fillStyle = '#451a03';
    ctx.fillRect(stumpX, stumpY, stumpW, stumpH);
    // Iron band on stump
    ctx.fillStyle = '#27272a';
    ctx.fillRect(stumpX - 1, stumpY + stumpH * 0.3, stumpW + 2, 4);

    // 3. Heavy Dwarven Blacksmith Anvil
    const anvilW = r * 0.9;
    const anvilH = r * 0.45;
    const ax = cx - anvilW * 0.5;
    const ay = stumpY - anvilH;

    ctx.beginPath();
    // Horn pointing left
    ctx.moveTo(ax - 2, ay + 3);
    ctx.quadraticCurveTo(ax + anvilW * 0.25, ay + 2, ax + anvilW * 0.28, ay);
    // Anvil face (top flat)
    ctx.lineTo(ax + anvilW * 0.85, ay);
    // Right heel
    ctx.lineTo(ax + anvilW * 0.88, ay + 7);
    // Waist curve in
    ctx.quadraticCurveTo(ax + anvilW * 0.65, ay + anvilH * 0.55, ax + anvilW * 0.8, ay + anvilH);
    // Base
    ctx.lineTo(ax + anvilW * 0.2, ay + anvilH);
    // Left waist curve
    ctx.quadraticCurveTo(ax + anvilW * 0.35, ay + anvilH * 0.55, ax - 2, ay + 3);
    ctx.closePath();

    const anvilGrad = ctx.createLinearGradient(ax, ay, ax + anvilW, ay + anvilH);
    anvilGrad.addColorStop(0, '#52525b');
    anvilGrad.addColorStop(0.5, '#27272a');
    anvilGrad.addColorStop(1, '#18181b');
    ctx.fillStyle = anvilGrad;
    ctx.fill();
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Molten red/orange glowing strike surface on anvil
    ctx.fillStyle = '#ff5722';
    ctx.fillRect(ax + anvilW * 0.35, ay, anvilW * 0.45, 2.5);

    // 4. Striking Warhammer of Sindri
    const strikePhase = Math.sin(time * 4);
    const hammerAngle = -0.45 + (hover > 0.05 ? strikePhase * 0.25 : strikePhase * 0.12);
    ctx.save();
    ctx.translate(cx + 4, ay);
    ctx.rotate(hammerAngle);
    // Handle
    ctx.fillStyle = '#78350f';
    ctx.fillRect(-2, -r * 0.75, 4, r * 0.75);
    // Leather wrap grip
    ctx.fillStyle = '#b45309';
    ctx.fillRect(-2.5, -r * 0.65, 5, r * 0.35);
    // Heavy Steel Hammer Head
    ctx.fillStyle = '#3f3f46';
    ctx.fillRect(-10, -r * 0.88, 20, 11);
    ctx.strokeStyle = '#ffd700';
    ctx.lineWidth = 1;
    ctx.strokeRect(-10, -r * 0.88, 20, 11);
    // Runic engraving on hammer head
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 8px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ᛊ', 0, -r * 0.88 + 5.5);
    ctx.restore();

    // 5. Radiating Spark Bursts from Strike Point
    const sparkOriginX = cx + 8;
    const sparkOriginY = ay + 1;
    const numSparks = 6;
    ctx.strokeStyle = '#fef08a';
    ctx.lineWidth = 1.2;
    for (let s = 0; s < numSparks; s++) {
      const sparkAngle = -Math.PI * 0.15 - (s / numSparks) * Math.PI * 0.85 + Math.sin(time * 12 + s) * 0.2;
      const sparkDist = 6 + (Math.sin(time * 8 + s * 2) * 0.5 + 0.5) * 14;
      ctx.beginPath();
      ctx.moveTo(sparkOriginX, sparkOriginY);
      ctx.lineTo(sparkOriginX + Math.cos(sparkAngle) * sparkDist, sparkOriginY + Math.sin(sparkAngle) * sparkDist);
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── 3. ANDVARI'S FALLS: CURSED GOLDEN RING (ANDVARANAUT) & MYSTICAL WATERFALL ──
  private drawAndvariFallsCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Cascading subterranean water torrents
    ctx.save();
    const waterGrad = ctx.createLinearGradient(cx, cy - r * 0.8, cx, cy + r * 0.8);
    waterGrad.addColorStop(0, '#0284c7');
    waterGrad.addColorStop(0.5, '#0ea5e9');
    waterGrad.addColorStop(1, '#0369a1');
    ctx.fillStyle = waterGrad;

    // Waterfall streams
    for (let stream = -2; stream <= 2; stream++) {
      const sx = cx + stream * 8;
      ctx.strokeStyle = stream % 2 === 0 ? 'rgba(224, 242, 254, 0.7)' : 'rgba(125, 211, 252, 0.6)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(sx, cy - r * 0.75);
      ctx.bezierCurveTo(sx + Math.sin(time * 3 + stream) * 2, cy, sx - 2, cy + r * 0.4, sx, cy + r * 0.7);
      ctx.stroke();
    }
    ctx.restore();

    // 2. Foaming splash pool ripples at base
    ctx.strokeStyle = 'rgba(224, 242, 254, 0.8)';
    ctx.lineWidth = 1.2;
    for (let rip = 1; rip <= 3; rip++) {
      const ripR = (r * 0.3) + rip * 5 + Math.sin(time * 4 + rip) * 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + r * 0.55, ripR, ripR * 0.32, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // 3. The Cursed Gold Ring (Andvaranaut)
    const ringR = r * 0.42;
    ctx.save();
    ctx.translate(cx, cy - 2);
    ctx.rotate(time * 0.6);

    // Outer gold ring band
    ctx.beginPath();
    ctx.arc(0, 0, ringR, 0, Math.PI * 2);
    ctx.lineWidth = 4.5;
    ctx.strokeStyle = '#ffd700';
    ctx.shadowColor = '#facc15';
    ctx.shadowBlur = 8;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner ring bevel
    ctx.beginPath();
    ctx.arc(0, 0, ringR - 2.5, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#b45309';
    ctx.stroke();

    // Serpent dragon head clasping tail
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(ringR, 0, 3.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ef4444'; // dragon eye
    ctx.fillRect(ringR - 1, -1, 1.5, 1.5);
    ctx.restore();

    // 4. Central Cursed Aquamarine Jewel held in the ring center
    const gemPulse = Math.sin(time * 3) * 0.15 + 0.85;
    const gemGlow = ctx.createRadialGradient(cx, cy - 2, 1, cx, cy - 2, 10);
    gemGlow.addColorStop(0, '#e0f2fe');
    gemGlow.addColorStop(0.4, '#38bdf8');
    gemGlow.addColorStop(1, 'rgba(2, 132, 199, 0)');
    ctx.fillStyle = gemGlow;
    ctx.beginPath();
    ctx.arc(cx, cy - 2, 9 * gemPulse, 0, Math.PI * 2);
    ctx.fill();

    // Faceted crystal diamond
    ctx.fillStyle = '#bae6fd';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx + 5, cy - 2);
    ctx.lineTo(cx, cy + 4);
    ctx.lineTo(cx - 5, cy - 2);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 0.8;
    ctx.stroke();

    ctx.restore();
  }

  // ── 4. ALTHJOF'S WHEEL: ROTATING WATERWHEEL, TIMBER FLUME & DREDGED GOLD ──
  private drawAlthjofsWheelCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Churning turquoise water stream background
    const riverGrad = ctx.createLinearGradient(cx - r, cy, cx + r, cy);
    riverGrad.addColorStop(0, '#0f766e');
    riverGrad.addColorStop(0.5, '#14b8a6');
    riverGrad.addColorStop(1, '#0d9488');
    ctx.fillStyle = riverGrad;
    ctx.fillRect(cx - r * 0.7, cy + r * 0.25, r * 1.4, r * 0.45);

    // 2. Timber Hydraulic Sluice Flume
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.75, cy + r * 0.35);
    ctx.lineTo(cx + r * 0.75, cy + r * 0.22);
    ctx.lineTo(cx + r * 0.75, cy + r * 0.48);
    ctx.lineTo(cx - r * 0.75, cy + r * 0.6);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Dredged sparkling gold nuggets in the sluice
    const goldPositions = [[-12, 14], [0, 10], [14, 7]];
    for (const [gx, gy] of goldPositions) {
      ctx.fillStyle = '#ffd700';
      ctx.beginPath();
      ctx.arc(cx + gx, cy + gy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.stroke();
    }

    // 3. Rotating 8-Spoke Dwarven Timber & Brass Waterwheel
    const wheelR = r * 0.52;
    const wheelY = cy - 3;
    ctx.save();
    ctx.translate(cx, wheelY);
    ctx.rotate(time * 1.4);

    // Outer rim
    ctx.beginPath();
    ctx.arc(0, 0, wheelR, 0, Math.PI * 2);
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = '#92400e';
    ctx.stroke();

    // Brass inner binding ring
    ctx.beginPath();
    ctx.arc(0, 0, wheelR - 3, 0, Math.PI * 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = '#d97706';
    ctx.stroke();

    // 8 Spokes and Paddles
    for (let sp = 0; sp < 8; sp++) {
      ctx.rotate(Math.PI / 4);
      // Spoke
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, wheelR);
      ctx.stroke();
      // Angled Paddle Scoop on Rim
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-3.5, wheelR - 2, 7, 5);
    }

    // Central Brass Axle Hub
    ctx.fillStyle = '#d4af37';
    ctx.beginPath();
    ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#1c1917';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Water spray from paddle rotation
    ctx.fillStyle = 'rgba(204, 251, 241, 0.75)';
    for (let sp = 0; sp < 4; sp++) {
      const spx = cx - 14 + sp * 8 + Math.sin(time * 6 + sp) * 2;
      const spy = cy + 4 + Math.cos(time * 5 + sp) * 2;
      ctx.beginPath();
      ctx.arc(spx, spy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── 5. DVALIN'S DEPTHS: PRIMORDIAL MINE HOIST, PULLEY CABLE & GLOWING GEODES ──
  private drawDvalinsDepthsCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Deep shaft abyss opening
    const shaftR = r * 0.38;
    const shaftY = cy + r * 0.32;
    ctx.beginPath();
    ctx.ellipse(cx, shaftY, shaftR * 1.2, shaftR * 0.5, 0, 0, Math.PI * 2);
    const abyssGrad = ctx.createRadialGradient(cx, shaftY, 2, cx, shaftY, shaftR * 1.2);
    abyssGrad.addColorStop(0, '#000000');
    abyssGrad.addColorStop(0.7, '#1c1917');
    abyssGrad.addColorStop(1, '#451a03');
    ctx.fillStyle = abyssGrad;
    ctx.fill();
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // 2. Heavy Timber/Iron Mine Headframe A-Frame Derrick
    const topY = cy - r * 0.7;
    const baseW = r * 0.75;
    const leftX = cx - baseW * 0.5;
    const rightX = cx + baseW * 0.5;
    const baseY = shaftY;

    // Left & Right derrick uprights
    ctx.strokeStyle = '#3f3f46';
    ctx.lineWidth = 3.2;
    ctx.beginPath();
    ctx.moveTo(leftX, baseY);
    ctx.lineTo(cx, topY);
    ctx.lineTo(rightX, baseY);
    ctx.stroke();

    // Cross-bracing trusses
    ctx.strokeStyle = '#71717a';
    ctx.lineWidth = 1.2;
    const midY = (topY + baseY) * 0.5;
    ctx.beginPath();
    ctx.moveTo(leftX + 4, midY);
    ctx.lineTo(rightX - 4, midY);
    ctx.moveTo(leftX + 2, baseY);
    ctx.lineTo(cx, midY);
    ctx.lineTo(rightX - 2, baseY);
    ctx.stroke();

    // 3. Spinning Mine Cable Sheave / Pulley Wheel at Apex
    ctx.save();
    ctx.translate(cx, topY + 4);
    ctx.rotate(time * 2.2);
    ctx.beginPath();
    ctx.arc(0, 0, 7.5, 0, Math.PI * 2);
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d4af37';
    ctx.stroke();
    for (let s = 0; s < 4; s++) {
      ctx.rotate(Math.PI / 2);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(0, 7);
      ctx.stroke();
    }
    ctx.restore();

    // Lift cable descending from wheel into shaft
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx - 3, topY + 11);
    ctx.lineTo(cx - 3, shaftY);
    ctx.stroke();

    // 4. Clusters of Glowing Amber Crystal Geodes flanking the shaft
    const geodeClusters = [
      { x: cx - shaftR * 1.1, y: shaftY - 4, scale: 0.9 },
      { x: cx + shaftR * 0.9, y: shaftY - 5, scale: 1.1 }
    ];
    for (const gc of geodeClusters) {
      const pulse = Math.sin(time * 3 + gc.x) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(245, 158, 11, ${0.4 * pulse})`;
      ctx.beginPath();
      ctx.arc(gc.x, gc.y, 10 * gc.scale, 0, Math.PI * 2);
      ctx.fill();

      // Sharp crystal shards
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(gc.x - 3 * gc.scale, gc.y + 4);
      ctx.lineTo(gc.x, gc.y - 8 * gc.scale);
      ctx.lineTo(gc.x + 3 * gc.scale, gc.y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(gc.x + 2, gc.y + 3);
      ctx.lineTo(gc.x + 6 * gc.scale, gc.y - 5 * gc.scale);
      ctx.lineTo(gc.x + 7 * gc.scale, gc.y + 4);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  // ── 6. JARNSMIDA QUARRY: TERRACED IRON QUARRY, RIVETED MINECART & CRANE ──
  private drawJarnsmidaQuarryCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, _time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Concentric terraced quarry stone steps
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 1.4;
    for (let step = 1; step <= 3; step++) {
      ctx.beginPath();
      ctx.arc(cx, cy - 10, r * 0.35 + step * 7, 0.2, Math.PI - 0.2);
      ctx.stroke();
    }

    // 2. Twin steel mine tracks with wooden cross ties
    const trackY = cy + r * 0.42;
    const trackW = r * 0.8;
    const tx = cx - trackW * 0.5;
    // Sleepers (wooden ties)
    ctx.fillStyle = '#78350f';
    for (let tie = 0; tie < 6; tie++) {
      ctx.fillRect(tx + (tie * trackW) / 5, trackY - 2, 4, 8);
    }
    // Rails
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(tx - 4, trackY);
    ctx.lineTo(tx + trackW + 4, trackY);
    ctx.moveTo(tx - 4, trackY + 4);
    ctx.lineTo(tx + trackW + 4, trackY + 4);
    ctx.stroke();

    // 3. Heavy Riveted Iron Minecart
    const cartW = r * 0.72;
    const cartH = r * 0.36;
    const cartX = cx - cartW * 0.5;
    const cartY = trackY - cartH - 4;

    // Cart hopper body (flared trapezoid)
    ctx.beginPath();
    ctx.moveTo(cartX - 3, cartY);
    ctx.lineTo(cartX + cartW + 3, cartY);
    ctx.lineTo(cartX + cartW - 2, cartY + cartH);
    ctx.lineTo(cartX + 2, cartY + cartH);
    ctx.closePath();
    const cartGrad = ctx.createLinearGradient(cartX, cartY, cartX + cartW, cartY + cartH);
    cartGrad.addColorStop(0, '#71717a');
    cartGrad.addColorStop(0.5, '#3f3f46');
    cartGrad.addColorStop(1, '#27272a');
    ctx.fillStyle = cartGrad;
    ctx.fill();
    ctx.strokeStyle = '#ea580c';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Brass rivets on cart
    ctx.fillStyle = '#f59e0b';
    for (let rv = 0; rv < 4; rv++) {
      ctx.beginPath();
      ctx.arc(cartX + 4 + (rv * (cartW - 8)) / 3, cartY + cartH * 0.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Cart flanged wheels
    for (const wx of [cartX + 5, cartX + cartW - 5]) {
      ctx.fillStyle = '#18181b';
      ctx.beginPath();
      ctx.arc(wx, trackY - 1, 4.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // 4. Heaped Raw Iron Hematite Ore chunks spilling over cart
    const oreColors = ['#ea580c', '#c2410c', '#fb923c', '#7c2d12'];
    for (let o = 0; o < 6; o++) {
      const ox = cartX + 4 + o * 4.5;
      const oy = cartY - 2 - (Math.sin(o * 1.5) * 3 + 2);
      ctx.fillStyle = oreColors[o % oreColors.length];
      ctx.beginPath();
      ctx.moveTo(ox, oy + 4);
      ctx.lineTo(ox + 3, oy);
      ctx.lineTo(ox + 6, oy + 3);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#fef08a';
      ctx.lineWidth = 0.5;
      ctx.stroke();
    }

    // 5. Quarry Boom Crane Cable & Hook suspended overhead
    ctx.strokeStyle = '#a1a1aa';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx + 8, cy - r * 0.7);
    ctx.lineTo(cx + 8, cartY - 6);
    ctx.stroke();
    // Hook
    ctx.strokeStyle = '#d4af37';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx + 5, cartY - 3, 3, 0, Math.PI);
    ctx.stroke();

    ctx.restore();
  }

  // ── 7. IVALDI'S WORKSHOP: SACRED SPEARHEAD OF GUNGNIR & ROTATING CELESTIAL ASTROLABE ──
  private drawIvaldiWorkshopCrest(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, time: number, _hover: number, _isLight: boolean) {
    ctx.save();
    // 1. Concentric Rotating Celestial Astrolabe Rings
    ctx.save();
    ctx.translate(cx, cy);

    // Outer ring (clockwise)
    ctx.rotate(time * 0.35);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.68, 0, Math.PI * 2);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = '#c084fc';
    ctx.setLineDash([4, 8]);
    ctx.stroke();

    // Inner ring (counter-clockwise)
    ctx.rotate(-time * 0.7);
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.48, 0, Math.PI * 2);
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = '#e9d5ff';
    ctx.setLineDash([3, 6]);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.restore();

    // 2. Ethereal Violet Energy Aura in Center
    const auraPulse = Math.sin(time * 3) * 0.15 + 0.85;
    const auraGrad = ctx.createRadialGradient(cx, cy, 2, cx, cy, r * 0.65);
    auraGrad.addColorStop(0, `rgba(233, 213, 255, ${0.45 * auraPulse})`);
    auraGrad.addColorStop(0.5, `rgba(168, 85, 247, ${0.25 * auraPulse})`);
    auraGrad.addColorStop(1, 'rgba(59, 7, 100, 0)');
    ctx.fillStyle = auraGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.65, 0, Math.PI * 2);
    ctx.fill();

    // 3. The Sacred Spearhead of Gungnir (Divine spear crafted by Sons of Ivaldi)
    const spearH = r * 0.95;
    const spearW = r * 0.36;
    const tipY = cy - spearH * 0.52;
    const baseY = cy + spearH * 0.48;

    // Ash spear shaft
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 2, baseY - 8, 4, 14);

    // Damascus steel spearhead with flared barbs
    ctx.beginPath();
    ctx.moveTo(cx, tipY);
    ctx.bezierCurveTo(cx + spearW * 0.45, tipY + spearH * 0.3, cx + spearW * 0.6, tipY + spearH * 0.55, cx + spearW * 0.5, tipY + spearH * 0.68);
    ctx.lineTo(cx + spearW * 0.15, tipY + spearH * 0.62);
    ctx.lineTo(cx + 2.5, baseY - 6);
    ctx.lineTo(cx - 2.5, baseY - 6);
    ctx.lineTo(cx - spearW * 0.15, tipY + spearH * 0.62);
    ctx.lineTo(cx - spearW * 0.5, tipY + spearH * 0.68);
    ctx.bezierCurveTo(cx - spearW * 0.6, tipY + spearH * 0.55, cx - spearW * 0.45, tipY + spearH * 0.3, cx, tipY);
    ctx.closePath();

    const bladeGrad = ctx.createLinearGradient(cx - spearW * 0.5, tipY, cx + spearW * 0.5, baseY);
    bladeGrad.addColorStop(0, '#ffffff');
    bladeGrad.addColorStop(0.3, '#c084fc');
    bladeGrad.addColorStop(0.7, '#7e22ce');
    bladeGrad.addColorStop(1, '#3b0764');
    ctx.fillStyle = bladeGrad;
    ctx.fill();
    ctx.strokeStyle = '#f5d0fe';
    ctx.lineWidth = 1.2;
    ctx.stroke();

    // Central Glowing Runic Fuller Line (Odin's divine mark)
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.5;
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 6;
    ctx.beginPath();
    ctx.moveTo(cx, tipY + 4);
    ctx.lineTo(cx, tipY + spearH * 0.58);
    ctx.stroke();
    ctx.shadowBlur = 0;

    // 4. Orbiting Arcane Rune Glints
    for (let g = 0; g < 3; g++) {
      const glintAngle = time * 1.8 + (g * Math.PI * 2) / 3;
      const gx = cx + Math.cos(glintAngle) * (r * 0.48);
      const gy = cy + Math.sin(glintAngle) * (r * 0.48);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(gx, gy, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // ── INTEGRATED DWARVEN STONE NAME PLAQUE ──
  private drawNamePlaque(
    ctx: CanvasRenderingContext2D,
    lx: number,
    ly: number,
    _r: number,
    loc: LocationNode,
    _isLight: boolean
  ) {
    ctx.save();

    const plaqueW = Math.max(136, ctx.measureText(loc.name).width + 36);
    const plaqueH = 32;
    const px = lx - plaqueW * 0.5;
    const py = ly + 25;

    // Plaque Drop Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
    ctx.beginPath();
    ctx.roundRect(px + 2, py + 2, plaqueW, plaqueH, 5);
    ctx.fill();

    // Plaque Stone Backing Slate: Deep carved dwarven obsidian granite
    ctx.beginPath();
    ctx.roundRect(px, py, plaqueW, plaqueH, 5);
    const pGrad = ctx.createLinearGradient(px, py, px, py + plaqueH);
    pGrad.addColorStop(0, 'rgba(30, 22, 16, 0.94)');
    pGrad.addColorStop(0.5, 'rgba(20, 14, 10, 0.96)');
    pGrad.addColorStop(1, 'rgba(12, 8, 6, 0.98)');
    ctx.fillStyle = pGrad;
    ctx.fill();

    // Gold Filigree Border
    ctx.strokeStyle = loc.locked ? '#854d0e' : (loc.hover > 0.1 ? '#fde047' : '#d4af37');
    ctx.lineWidth = loc.hover > 0.1 ? 1.8 : 1.2;
    if (!loc.locked && loc.hover > 0.1) {
      ctx.shadowColor = '#d4af37';
      ctx.shadowBlur = 8;
    }
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Corner Rivet Dots
    ctx.fillStyle = loc.locked ? '#b45309' : '#f59e0b';
    for (const cx of [px + 5, px + plaqueW - 5]) {
      for (const cy of [py + 5, py + plaqueH - 5]) {
        ctx.beginPath();
        ctx.arc(cx, cy, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Location Name (Bold, High Contrast Norse Serif)
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = loc.locked ? '#fef3c7' : '#fef08a';
    ctx.font = `bold ${12.5 + loc.hover * 0.8}px "Outfit", "Inter", sans-serif`;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.95)';
    ctx.shadowBlur = 4;
    ctx.fillText(loc.name, lx, py + 11);

    // Rune Tag + Role Subtitle / Status
    if (loc.locked) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = `700 9.5px "Segoe UI Historic", "Segoe UI Symbol", sans-serif`;
      ctx.shadowBlur = 0;
      ctx.fillText(`[ ${loc.rune} ] 🔒 Lvl ${loc.level} · Locked`, lx, py + 23);
    } else {
      ctx.fillStyle = '#fde047';
      ctx.font = `bold 9.5px "Segoe UI Historic", "Segoe UI Symbol", sans-serif`;
      ctx.shadowBlur = 0;
      ctx.fillText(`[ ${loc.rune} ] ✦ Level 1 · Unlocked ✦`, lx, py + 23);
    }

    ctx.restore();
  }

  // ── INTERACTIVE MISSION INTEL CARD (ON HOVER) ──
  drawMissionIntelCard(ctx: CanvasRenderingContext2D, loc: LocationNode, w: number, h: number, isLight: boolean, time: number) {
    ctx.save();
    const cardW = 340;
    const cardH = 190;

    // Position card intelligently: prefer right of node, clamp inside canvas bounds
    let cardX = loc.px * w + loc.radius + 24;
    if (cardX + cardW > w - 20) {
      cardX = loc.px * w - loc.radius - cardW - 24;
    }
    // Strict boundary clamping so it NEVER clips off left or right
    cardX = Math.max(20, Math.min(w - cardW - 20, cardX));

    let cardY = loc.py * h - cardH * 0.5;
    cardY = Math.max(75, Math.min(h - cardH - 35, cardY));

    // Card drop shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.80)';
    ctx.beginPath();
    ctx.roundRect(cardX + 6, cardY + 6, cardW, cardH, 10);
    ctx.fill();

    // Card background slate
    const cardGrad = ctx.createLinearGradient(cardX, cardY, cardX, cardY + cardH);
    if (isLight) {
      cardGrad.addColorStop(0, '#fffbeb');
      cardGrad.addColorStop(0.5, '#fef3c7');
      cardGrad.addColorStop(1, '#fde68a');
    } else {
      cardGrad.addColorStop(0, '#1c1917');
      cardGrad.addColorStop(0.5, '#181412');
      cardGrad.addColorStop(1, '#0c0a09');
    }
    ctx.fillStyle = cardGrad;
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardW, cardH, 8);
    ctx.fill();

    // Ornate gold border with Nordic runic glow
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#d4af37';
    ctx.shadowColor = '#d4af37';
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Inner gold hairline border
    ctx.lineWidth = 0.8;
    ctx.strokeStyle = isLight ? 'rgba(180, 83, 9, 0.4)' : 'rgba(212, 175, 55, 0.4)';
    ctx.strokeRect(cardX + 5, cardY + 5, cardW - 10, cardH - 10);

    // Header: Rune Badge & Title
    ctx.textAlign = 'left';
    ctx.fillStyle = loc.gemColor;
    ctx.font = 'bold 15px "Segoe UI Historic", "Segoe UI Symbol", "Outfit", sans-serif';
    ctx.fillText(`[ ${loc.rune} ]`, cardX + 16, cardY + 28);

    ctx.fillStyle = isLight ? '#1c1917' : '#fef08a';
    ctx.font = 'bold 16px "Outfit", "Inter", sans-serif';
    ctx.fillText(loc.name, cardX + 70, cardY + 28);

    // Subtitle & Role
    ctx.fillStyle = isLight ? '#78350f' : '#d4af37';
    ctx.font = '700 11px sans-serif';
    ctx.fillText(loc.role, cardX + 16, cardY + 46);

    // Decorative separator bar
    ctx.strokeStyle = isLight ? '#d97706' : '#78350f';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cardX + 16, cardY + 54);
    ctx.lineTo(cardX + cardW - 16, cardY + 54);
    ctx.stroke();

    // Lore Description
    ctx.fillStyle = isLight ? '#451a03' : '#e7e5e4';
    ctx.font = '11.5px sans-serif';
    this.drawWrappedText(ctx, loc.desc, cardX + 16, cardY + 70, cardW - 32, 16);

    // Threat & Wave Defense Specs
    const threatColors: Record<string, string> = {
      Normal: '#22c55e',
      Hard: '#f59e0b',
      Extreme: '#f97316',
      Nightmare: '#ef4444'
    };
    const tCol = threatColors[loc.threat] || '#f59e0b';
    ctx.fillStyle = tCol;
    ctx.font = 'bold 11px sans-serif';
    ctx.fillText(`Threat: ${loc.threat} (Level ${loc.level}/7)`, cardX + 16, cardY + 134);

    ctx.fillStyle = isLight ? '#52525b' : '#a1a1aa';
    ctx.font = '600 11px sans-serif';
    ctx.fillText(`⚔️ ${loc.waves} Invasion Waves`, cardX + 184, cardY + 134);

    // Action Inviting Call to Action / Locked Status Banner
    if (loc.locked) {
      ctx.fillStyle = 'rgba(239, 68, 68, 0.18)';
      ctx.beginPath();
      ctx.roundRect(cardX + 8, cardY + cardH - 34, cardW - 16, 26, 4);
      ctx.fill();
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f87171';
      ctx.font = 'bold 11px "Outfit", sans-serif';
      ctx.fillText(`🔒 Locked — Complete Level ${loc.level - 1} to unlock 🔒`, cardX + cardW * 0.5, cardY + cardH - 17);
    } else {
      const pulse = Math.sin(time * 4) * 0.3 + 0.7;
      ctx.fillStyle = isLight ? `rgba(180, 83, 9, ${0.15 + pulse * 0.1})` : `rgba(217, 119, 6, ${0.25 + pulse * 0.15})`;
      ctx.beginPath();
      ctx.roundRect(cardX + 8, cardY + cardH - 34, cardW - 16, 26, 4);
      ctx.fill();
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = isLight ? '#92400e' : '#fde047';
      ctx.font = 'bold 12px "Outfit", sans-serif';
      ctx.fillText('▶ Click to deploy defenders ◀', cardX + cardW * 0.5, cardY + cardH - 17);
    }

    ctx.restore();
  }

  drawWrappedText(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, lineHeight: number) {
    const words = text.split(' ');
    let line = '';
    let currY = y;
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && n > 0) {
        ctx.fillText(line, x, currY);
        line = words[n] + ' ';
        currY += lineHeight;
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currY);
  }
}
