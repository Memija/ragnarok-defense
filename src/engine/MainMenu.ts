import { SoundManager } from './SoundManager';
import { t, getRatatoskrQuotes } from '../i18n';

function sr(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Branch {
  x1: number; y1: number;
  cx: number; cy: number;
  x2: number; y2: number;
  w1: number; w2: number;
  depth: number;
  seed: number;
  realmId?: string;
  isRoot: boolean;
  hover: number;
  len: number;
}

interface BatchedLeaf {
  x: number; y: number;
  rx: number; ry: number;
  rot: number;
  branchIdx: number;
}

interface LeafBatch {
  colorDark: string;
  colorLight: string;
  leaves: BatchedLeaf[];
}

interface CosmicMote {
  x: number; y: number;
  vx: number; vy: number;
  r: number;
  alpha: number;
  colorDark: string;
  colorLight: string;
}

interface CanopyCloud {
  x: number; y: number;
  rx: number; ry: number;
  colorDark: string;
  colorLight: string;
  seed: number;
}

export class MainMenu {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animationId = 0;
  mouseX = -9999; mouseY = -9999;

  branches: Branch[] = [];
  sortedBranches: Branch[] = [];
  leafBatches: LeafBatch[] = [];
  canopyClouds: CanopyCloud[] = [];
  motes: CosmicMote[] = [];
  waterRipples: { x: number; y: number; r: number; maxR: number; life: number }[] = [];
  built = false;

  // Ratatoskr (The Celestial Messenger Spirit Squirrel of Yggdrasil)
  ratatoskr = {
    branchIdx: 0,
    t: 0.35,
    speed: 135, // Natural locomotion in pixels per second
    dir: 1,
    state: 'running' as 'running' | 'nibbling' | 'lookout',
    stateTimer: 0,
    scurryTimer: 1.6, // Burst scurry timer
    pauseTimer: 0, // Inquisitive alert micro-pause
    dist: 0, // Continuous distance accumulator for bounding gallop
    heading: 0, // Smoothly interpolated rotation angle
    posX: 0,
    posY: 0,
    jumpY: 0,
    jumpVy: 0,
    acornScale: 0,
    bubbleTimer: 0,
    bubbleText: '✧ ᛉ ✧',
    transitionCooldown: 0,
    trail: [] as { x: number; y: number; life: number; r: number; color: string }[],
    crunchParticles: [] as { x: number; y: number; vx: number; vy: number; life: number; color: string }[]
  };

  trunkBaseY = 0;
  trunkTopY = 0;
  trunkCenterX = 0;

  parallaxX = 0;
  parallaxY = 0;

  // Warp sequence
  transitioningRealm: any = null;
  transitionTimer = 0;

  realms = [
    { id: 'asgard',       name: 'Asgard',       title: 'Realm of the Aesir',       sub: 'Golden City of the Gods',   x: 0.50, y: 0.15, color: '#fbbf24', rune: 'ᚨ', radius: 0.056, pulse: 0, locked: true },
    { id: 'alfheim',      name: 'Alfheim',      title: 'Realm of Light Elves',     sub: 'Luminous Fairy Meadows',    x: 0.22, y: 0.26, color: '#f472b6', rune: 'ᛉ', radius: 0.056, pulse: 0, locked: true },
    { id: 'vanaheim',     name: 'Vanaheim',     title: 'Realm of Nature',          sub: 'Wild Primordial Sanctuary', x: 0.78, y: 0.26, color: '#4ade80', rune: 'ᚹ', radius: 0.056, pulse: 0, locked: true },
    { id: 'svartalfheim', name: 'Svartalfheim', title: 'Realm of Dwarves',         sub: 'Great Subterranean Forges', x: 0.14, y: 0.46, color: '#f97316', rune: 'ᚲ', radius: 0.062, pulse: 0, locked: false },
    { id: 'midgard',      name: 'Midgard',      title: 'Realm of Mortals',         sub: 'Heart of the World Tree',   x: 0.50, y: 0.48, color: '#38bdf8', rune: 'ᛗ', radius: 0.062, pulse: 0, locked: true },
    { id: 'jotunheim',    name: 'Jotunheim',    title: 'Realm of Frost Giants',    sub: 'Barren Glacial Peaks',      x: 0.86, y: 0.46, color: '#22d3ee', rune: 'ᚦ', radius: 0.056, pulse: 0, locked: true },
    { id: 'niflheim',     name: 'Niflheim',     title: 'Realm of Ice and Mist',    sub: 'Primordial Frozen Mist',    x: 0.24, y: 0.70, color: '#a5f3fc', rune: 'ᛁ', radius: 0.056, pulse: 0, locked: true },
    { id: 'muspelheim',   name: 'Muspelheim',   title: 'Realm of Fire',            sub: 'Domain of Lord Surtr',      x: 0.76, y: 0.70, color: '#ef4444', rune: 'ᛊ', radius: 0.056, pulse: 0, locked: true },
    { id: 'helheim',      name: 'Helheim',      title: 'Realm of the Dead',        sub: 'Silent Obsidian Domain',    x: 0.50, y: 0.88, color: '#94a3b8', rune: 'ᚺ', radius: 0.056, pulse: 0, locked: true }
  ];

  speakQuoteIndex = 0;

  triggerRatatoskrSpeak() {
    const r = this.ratatoskr;
    r.state = 'lookout';
    r.stateTimer = 3.6;
    r.bubbleTimer = 3.6;
    const quotes = getRatatoskrQuotes();
    r.bubbleText = quotes[this.speakQuoteIndex % quotes.length];
    this.speakQuoteIndex++;
    SoundManager.getInstance().playSquirrelChirp();
  }

  hoveredRealm: any = null;
  onSelectRealm: (r: string) => void;

  constructor(canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D, onSelectRealm: (r: string) => void) {
    this.canvas = canvas;
    this.ctx = ctx;
    this.onSelectRealm = onSelectRealm;

    this.canvas.addEventListener('mousemove', this.onMouseMove);
    this.canvas.addEventListener('click', this.onClick);
    this.canvas.addEventListener('mouseleave', () => {
      this.hoveredRealm = null;
      this.canvas.style.cursor = 'default';
      this.mouseX = -9999;
      this.mouseY = -9999;
    });
  }

  onMouseMove = (e: MouseEvent) => {
    if (this.transitioningRealm) return;
    const rect = this.canvas.getBoundingClientRect();
    this.mouseX = e.clientX - rect.left;
    this.mouseY = e.clientY - rect.top;
    const nx = this.mouseX / rect.width, ny = this.mouseY / rect.height;

    // Check if hovering over Ratatoskr
    const ratDist = Math.hypot(this.mouseX - this.ratatoskr.posX, this.mouseY - this.ratatoskr.posY);
    if (ratDist < 48) {
      this.canvas.style.cursor = 'pointer';
      return;
    }

    this.hoveredRealm = null;
    for (const r of this.realms) {
      if (Math.hypot(nx - r.x, ny - r.y) < r.radius * 1.35) {
        if (!r.locked) {
          this.hoveredRealm = r;
          this.canvas.style.cursor = 'pointer';
        }
        return;
      }
    }

    let nearTree = false;
    for (const br of this.branches) {
      if (br.hover > 0.25) {
        nearTree = true;
        break;
      }
    }
    this.canvas.style.cursor = nearTree ? 'pointer' : 'default';
  }

  onClick = () => {
    // Click Ratatoskr to cycle dialogue with a cheerful chirp
    const ratDist = Math.hypot(this.mouseX - this.ratatoskr.posX, this.mouseY - this.ratatoskr.posY);
    if (ratDist < 50) {
      this.triggerRatatoskrSpeak();
      return;
    }

    if (this.hoveredRealm && !this.transitioningRealm) {
      SoundManager.getInstance().playClick();
      this.transitioningRealm = this.hoveredRealm;
      this.transitionTimer = 0;
    }
  }

  qbz(p0: number, p1: number, p2: number, t: number) {
    const m = 1 - t;
    return m * m * p0 + 2 * m * t * p1 + t * t * p2;
  }

  getBranchSurfaceInfo(br: Branch, t: number) {
    const clampedT = Math.max(0, Math.min(1, t));
    const bx = this.qbz(br.x1, br.cx, br.x2, clampedT);
    const by = this.qbz(br.y1, br.cy, br.y2, clampedT);

    // Tangent derivative along quadratic bezier
    const tx = 2 * (1 - clampedT) * (br.cx - br.x1) + 2 * clampedT * (br.x2 - br.cx);
    const ty = 2 * (1 - clampedT) * (br.cy - br.y1) + 2 * clampedT * (br.y2 - br.cy);
    const tLen = Math.hypot(tx, ty) || 1;
    const tanX = tx / tLen;
    const tanY = ty / tLen;

    // Normal pointing upward in screen space
    let normX = -tanY;
    let normY = tanX;
    if (normY > 0.1) {
      normX = -normX;
      normY = -normY;
    } else if (Math.abs(normY) <= 0.1 && normX * (bx - this.trunkCenterX) < 0) {
      // On vertical trunk, surface normal points outward away from center
      normX = -normX;
      normY = -normY;
    }

    const w = br.w1 + (br.w2 - br.w1) * clampedT;
    return {
      x: bx + normX * (w * 0.35),
      y: by + normY * (w * 0.35),
      tanX,
      tanY,
      normX,
      normY,
      w
    };
  }

  addBranch(
    x1: number, y1: number,
    x2: number, y2: number,
    w1: number, w2: number,
    depth: number,
    seed: number,
    realmId?: string,
    isRoot = false
  ) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 5) return;
    const px = -dy / len, py = dx / len;
    const curveMag = (sr(seed + 1) - 0.5) * len * 0.18;

    const br: Branch = {
      x1, y1, x2, y2,
      cx: (x1 + x2) / 2 + px * curveMag,
      cy: (y1 + y2) / 2 + py * curveMag,
      w1, w2, depth, seed, realmId, isRoot, hover: 0,
      len: Math.max(10, len)
    };
    this.branches.push(br);
    const branchIdx = this.branches.length - 1;

    // Sprout lush leaves along delicate twigs
    if (!isRoot && depth <= 5 && w1 < 44) {
      const leafCount = 14 + Math.floor(sr(seed + 89) * 14);
      const batchCount = this.leafBatches.length;

      for (let k = 0; k < leafCount; k++) {
        const t = 0.08 + sr(seed + k * 31) * 0.92;
        const spread = (sr(seed + k * 17) - 0.5) * 44;
        const lx = this.qbz(x1, br.cx, x2, t) + spread;
        const ly = this.qbz(y1, br.cy, y2, t) + (sr(seed + k * 23) - 0.5) * 38;

        const batchIdx = (seed + k) % batchCount;
        this.leafBatches[batchIdx].leaves.push({
          x: lx, y: ly,
          rx: 7.0 + sr(seed + k * 41) * 6.0,
          ry: 3.8 + sr(seed + k * 43) * 3.8,
          rot: sr(seed + k * 19) * Math.PI,
          branchIdx
        });
      }
    }

    // Recursive fractal twigs (delicate sub-branches)
    if (depth > 0 && w2 > 0.7) {
      const forkCount = depth >= 3 ? 2 : 2;
      for (let i = 0; i < forkCount; i++) {
        const t = 0.25 + i * 0.30 + sr(seed + i * 13) * 0.12;
        const mx = this.qbz(x1, br.cx, x2, t);
        const my = this.qbz(y1, br.cy, y2, t);
        const side = (i % 2 === 0) ? -1 : 1;
        const ang = Math.atan2(dy, dx) + side * (0.28 + sr(seed + i * 7) * 0.44);
        const sl = len * (0.38 + sr(seed + i * 19) * 0.22);
        this.addBranch(
          mx, my,
          mx + Math.cos(ang) * sl, my + Math.sin(ang) * sl,
          Math.min(7.5, w2 * 0.48), Math.max(0.6, w2 * 0.18),
          depth - 1, seed + 100 + i * 73, undefined, isRoot
        );
      }
    }
  }

  buildTree(w: number, h: number) {
    this.branches = [];
    this.canopyClouds = [];
    const cx = w * 0.5;
    const baseY = h * 0.74;
    const topY = h * 0.15;
    const tw = Math.max(56, w * 0.058);

    this.trunkBaseY = baseY;
    this.trunkTopY = topY;
    this.trunkCenterX = cx;

    // Initialize 9 Fimbulwinter leaf batches (Evergreen Ash kissed with Rime Frost & Snow Caps)
    const darkPalette = [
      '#064e3b', // Deep ancient spruce evergreen
      '#065f46', // Sub-zero pine bough
      '#047857', // Frost-hardy spruce
      '#0d9488', // Glacial teal-green
      '#14b8a6', // Frost mint
      '#2dd4bf', // Glowing ice needle
      '#5eead4', // Crystalline rime frost
      '#a5f3fc', // Glacial azure ice glaze
      '#f0fdfa'  // Pure snow-capped leaf tip
    ];
    const lightPalette = [
      '#0f766e', // Arctic evergreen
      '#0d9488', // Glacial teal
      '#14b8a6', // Frost emerald
      '#38bdf8', // Luminous sky-ice blue
      '#7dd3fc', // Pale glacial ice
      '#a5f3fc', // Crystalline frost
      '#bae6fd', // Arctic snow haze
      '#e0f2fe', // Pale snow glaze
      '#ffffff'  // Pure sunlit frost crystal
    ];
    this.leafBatches = darkPalette.map((colorDark, idx) => ({
      colorDark,
      colorLight: lightPalette[idx],
      leaves: []
    }));

    const midY1 = baseY - (baseY - topY) * 0.38;
    const midY2 = baseY - (baseY - topY) * 0.72;

    // === 1. MAIN GNARLED ASH TRUNK ===
    this.addBranch(cx, baseY, cx, midY1, tw * 1.35, tw * 0.95, 1, 10);
    this.addBranch(cx, midY1, cx, midY2, tw * 0.95, tw * 0.70, 1, 20);
    this.addBranch(cx, midY2, cx, topY + h * 0.02, tw * 0.70, tw * 0.45, 1, 30);

    // === 2. REALM CONNECTING BOUGHS & CANOPY LIMBS ===
    // Asgard (Crown & High Foliage Wings)
    const asg = this.realms[0];
    this.addBranch(cx, topY + h * 0.02, asg.x * w, asg.y * h + h * 0.02, tw * 0.45, tw * 0.12, 5, 500, 'asgard');
    this.addBranch(cx, topY + h * 0.02, cx - w * 0.18, topY - h * 0.04, tw * 0.35, tw * 0.06, 5, 510);
    this.addBranch(cx, topY + h * 0.02, cx + w * 0.18, topY - h * 0.04, tw * 0.35, tw * 0.06, 5, 520);
    this.addBranch(cx, topY + h * 0.05, cx - w * 0.26, topY + h * 0.01, tw * 0.30, tw * 0.05, 4, 530);
    this.addBranch(cx, topY + h * 0.05, cx + w * 0.26, topY + h * 0.01, tw * 0.30, tw * 0.05, 4, 540);

    // Alfheim & Vanaheim (High Majestic Canopy Arches)
    const alf = this.realms[1];
    this.addBranch(cx, midY2, alf.x * w + w * 0.02, alf.y * h + h * 0.015, tw * 0.55, tw * 0.12, 5, 1100, 'alfheim');
    this.addBranch(cx, midY2 + h * 0.03, alf.x * w + w * 0.08, alf.y * h - h * 0.04, tw * 0.32, tw * 0.06, 4, 1120);
    this.addBranch(cx, midY2 - h * 0.04, alf.x * w - w * 0.06, alf.y * h + h * 0.05, tw * 0.28, tw * 0.05, 4, 1130);

    const van = this.realms[2];
    this.addBranch(cx, midY2, van.x * w - w * 0.02, van.y * h + h * 0.015, tw * 0.55, tw * 0.12, 5, 600, 'vanaheim');
    this.addBranch(cx, midY2 + h * 0.03, van.x * w - w * 0.08, van.y * h - h * 0.04, tw * 0.32, tw * 0.06, 4, 620);
    this.addBranch(cx, midY2 - h * 0.04, van.x * w + w * 0.06, van.y * h + h * 0.05, tw * 0.28, tw * 0.05, 4, 630);

    // Svartalfheim & Jotunheim (Sweeping Outward Boughs)
    const sva = this.realms[3];
    this.addBranch(cx, midY1, sva.x * w + w * 0.02, sva.y * h + h * 0.015, tw * 0.60, tw * 0.12, 5, 1200, 'svartalfheim');
    this.addBranch(cx, midY1 - h * 0.04, sva.x * w + w * 0.10, sva.y * h - h * 0.05, tw * 0.35, tw * 0.06, 4, 1220);

    const jot = this.realms[5];
    this.addBranch(cx, midY1, jot.x * w - w * 0.02, jot.y * h + h * 0.015, tw * 0.60, tw * 0.12, 5, 700, 'jotunheim');
    this.addBranch(cx, midY1 - h * 0.04, jot.x * w - w * 0.10, jot.y * h - h * 0.05, tw * 0.35, tw * 0.06, 4, 720);

    // Midgard (Heartwood Loops & Foliage Nest)
    const mid = this.realms[4];
    this.addBranch(cx, midY1 + h * 0.02, mid.x * w - w * 0.03, mid.y * h + h * 0.015, tw * 0.40, tw * 0.08, 3, 800, 'midgard');
    this.addBranch(cx, midY1 + h * 0.02, mid.x * w + w * 0.03, mid.y * h + h * 0.015, tw * 0.40, tw * 0.08, 3, 810, 'midgard');

    // Niflheim & Muspelheim (Arching Lower Boughs)
    const nif = this.realms[6];
    this.addBranch(cx, baseY - h * 0.05, nif.x * w + w * 0.02, nif.y * h + h * 0.015, tw * 0.60, tw * 0.12, 4, 1300, 'niflheim');

    const mus = this.realms[7];
    this.addBranch(cx, baseY - h * 0.05, mus.x * w - w * 0.02, mus.y * h + h * 0.015, tw * 0.60, tw * 0.12, 4, 1400, 'muspelheim');

    // Helheim Roots
    const hel = this.realms[8];
    this.addBranch(cx, baseY, hel.x * w, hel.y * h - h * 0.03, tw * 0.75, tw * 0.14, 3, 900, 'helheim', true);
    for (let i = 0; i < 7; i++) {
      const a = Math.PI / 2 + [-0.85, -0.55, -0.28, 0, 0.28, 0.55, 0.85][i];
      const rl = h * (0.15 + sr(i * 33) * 0.10);
      this.addBranch(
        cx, baseY,
        cx + Math.cos(a) * rl, baseY + Math.sin(a) * rl,
        tw * 0.50, tw * 0.04,
        2, 1000 + i * 53, undefined, true
      );
    }

    // Pre-sort branches once by width for high performance drawing
    this.sortedBranches = [...this.branches].sort((a, b) => b.w1 - a.w1);

    // === 3. CANOPY CROWN CLUSTER FOLIAGE GENERATION ===
    // Populate dense foliage crowns around upper boughs and realm branches
    const clusterCenters = [
      { x: cx, y: topY - h * 0.02, radius: w * 0.16, count: 120 },
      { x: cx - w * 0.16, y: topY + h * 0.01, radius: w * 0.12, count: 85 },
      { x: cx + w * 0.16, y: topY + h * 0.01, radius: w * 0.12, count: 85 },
      { x: alf.x * w, y: alf.y * h - h * 0.03, radius: w * 0.10, count: 70 },
      { x: van.x * w, y: van.y * h - h * 0.03, radius: w * 0.10, count: 70 },
      { x: sva.x * w + w * 0.04, y: sva.y * h - h * 0.04, radius: w * 0.09, count: 60 },
      { x: jot.x * w - w * 0.04, y: jot.y * h - h * 0.04, radius: w * 0.09, count: 60 },
      { x: cx, y: midY1, radius: w * 0.09, count: 50 }
    ];

    const batchCount = this.leafBatches.length;
    for (let c = 0; c < clusterCenters.length; c++) {
      const cl = clusterCenters[c];
      for (let k = 0; k < cl.count; k++) {
        const ang = sr(c * 53 + k * 17) * Math.PI * 2;
        const rad = Math.sqrt(sr(c * 71 + k * 31)) * cl.radius;
        const lx = cl.x + Math.cos(ang) * rad;
        const ly = cl.y + Math.sin(ang) * rad * 0.65;

        const batchIdx = (c * 7 + k) % batchCount;
        this.leafBatches[batchIdx].leaves.push({
          x: lx, y: ly,
          rx: 7.5 + sr(c * 19 + k * 23) * 6.5,
          ry: 4.0 + sr(c * 29 + k * 41) * 4.0,
          rot: sr(c * 31 + k * 13) * Math.PI,
          branchIdx: -1
        });
      }
    }

    // Rich volumetric canopy depth clouds (48 soft layered puffs)
    for (let i = 0; i < 48; i++) {
      const ang = sr(i * 37) * Math.PI * 2;
      const dist = sr(i * 29) * w * 0.38;
      const clx = cx + Math.cos(ang) * dist;
      const cly = topY + h * 0.12 + Math.sin(ang) * dist * 0.44;
      if (cly < baseY - h * 0.10 && cly > topY - h * 0.10) {
        this.canopyClouds.push({
          x: clx, y: cly,
          rx: 48 + sr(i * 43) * 60,
          ry: 30 + sr(i * 47) * 40,
          colorDark: 'rgba(6, 42, 38, 0.26)',
          colorLight: 'rgba(186, 230, 253, 0.22)',
          seed: 5000 + i * 31
        });
      }
    }

    // Initialize Fimbulwinter snowfall & crystalline frost particles
    this.motes = [];
    for (let i = 0; i < 75; i++) {
      this.motes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.45,
        vy: 0.35 + Math.random() * 0.85, // Gentle fluttering snowfall
        r: 1.0 + Math.random() * 2.4,
        alpha: 0.35 + Math.random() * 0.55,
        colorDark: Math.random() > 0.35 ? '#e0f2fe' : '#a5f3fc',
        colorLight: Math.random() > 0.35 ? '#ffffff' : '#38bdf8'
      });
    }

    this.built = true;
  }

  // Draw deeply atmospheric sky & Bifrost Aurora ribbons (Theme-Aware)
  drawAtmosphericSky(w: number, h: number, time: number, isLight: boolean) {
    const ctx = this.ctx;

    // Sky Gradient (Fimbulwinter Polar Skies)
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    if (isLight) {
      // Sub-zero arctic winter morning sky with pale sun glow
      sky.addColorStop(0.0, '#cffafe');
      sky.addColorStop(0.35, '#e0f2fe');
      sky.addColorStop(0.70, '#f0f9ff');
      sky.addColorStop(0.90, '#fef3c7');
      sky.addColorStop(1.0, '#fffbeb');
    } else {
      // Deep polar winter cosmic sky
      sky.addColorStop(0.0, '#02050f');
      sky.addColorStop(0.30, '#05122e');
      sky.addColorStop(0.65, '#081e3a');
      sky.addColorStop(0.85, '#031020');
      sky.addColorStop(1.0, '#01050d');
    }
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Flowing Glacial Aurora Curtains
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'multiply' : 'lighter';
    const auroraWaves = isLight
      ? [
          { color: 'rgba(56, 189, 248, 0.10)', y: h * 0.16, freq: 0.003, speed: 0.4 },
          { color: 'rgba(45, 212, 191, 0.08)', y: h * 0.22, freq: 0.004, speed: 0.3 },
          { color: 'rgba(125, 211, 252, 0.10)', y: h * 0.13, freq: 0.002, speed: 0.5 }
        ]
      : [
          { color: 'rgba(34, 211, 238, 0.14)', y: h * 0.16, freq: 0.003, speed: 0.4 },
          { color: 'rgba(45, 212, 191, 0.12)', y: h * 0.22, freq: 0.004, speed: 0.3 },
          { color: 'rgba(167, 139, 250, 0.08)', y: h * 0.13, freq: 0.002, speed: 0.5 }
        ];

    for (const au of auroraWaves) {
      ctx.beginPath();
      ctx.moveTo(0, 0);
      const steps = 24;
      for (let i = 0; i <= steps; i++) {
        const x = (i / steps) * w;
        const wave = Math.sin(time * au.speed + x * au.freq) * (h * 0.07) +
                     Math.cos(time * (au.speed * 0.7) + x * (au.freq * 2)) * (h * 0.03);
        ctx.lineTo(x, au.y + wave);
      }
      ctx.lineTo(w, 0);
      ctx.closePath();
      ctx.fillStyle = au.color;
      ctx.fill();
    }
    ctx.restore();

    // Twinkling Stars / Morning Glimmers
    for (let i = 0; i < 70; i++) {
      const sx = (sr(i * 19) * w + this.parallaxX * 0.25 + w) % w;
      const sy = (sr(i * 29) * h * 0.8 + this.parallaxY * 0.25 + h) % h;
      const twinkle = 0.2 + 0.35 * Math.sin(time * 2.2 + i * 1.7);
      ctx.fillStyle = isLight ? `rgba(180, 83, 9, ${twinkle * 0.5})` : `rgba(224, 242, 254, ${twinkle})`;
      ctx.fillRect(sx, sy, 1.4, 1.4);
    }
  }

  // Draw volumetric canopy clouds for soft depth
  drawCanopyClouds(time: number, isLight: boolean) {
    const ctx = this.ctx;
    ctx.save();
    for (const cc of this.canopyClouds) {
      const sway = Math.sin(time * 1.2 + cc.seed) * 3;
      ctx.beginPath();
      ctx.ellipse(cc.x + sway, cc.y, cc.rx, cc.ry, 0, 0, Math.PI * 2);
      ctx.fillStyle = isLight ? cc.colorLight : cc.colorDark;
      ctx.fill();
    }
    ctx.restore();
  }

  // Draw ancient gnarled wood with bioluminescent Norse runic grain (Theme-Aware)
  drawYggdrasilWood(time: number, isLight: boolean) {
    const ctx = this.ctx;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    const branches = this.sortedBranches;

    // 1. Deep Ancient Cold Ash Bark Silhouette
    const barkOuter = isLight ? '#24160d' : '#100805';
    const barkCore = isLight ? '#382013' : '#1e1109';
    const barkRidge = isLight ? '#54301d' : '#331c10';

    for (const br of branches) {
      const avgW = (br.w1 + br.w2) * 0.5;

      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = avgW * 1.15;
      ctx.strokeStyle = barkOuter;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = avgW * 0.75;
      ctx.strokeStyle = barkCore;
      ctx.stroke();

      // Ancient woodgrain ridge
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx - avgW * 0.12, br.cy, br.x2, br.y2);
      ctx.lineWidth = Math.max(1.0, avgW * 0.22);
      ctx.strokeStyle = barkRidge;
      ctx.stroke();

      // Fimbulwinter crystalline rime frost lining along the upper bark surface
      if (!br.isRoot && avgW > 4) {
        ctx.beginPath();
        ctx.moveTo(br.x1, br.y1 - avgW * 0.38);
        ctx.quadraticCurveTo(br.cx, br.cy - avgW * 0.38, br.x2, br.y2 - avgW * 0.38);
        ctx.lineWidth = Math.max(1.0, avgW * 0.14);
        ctx.strokeStyle = isLight ? 'rgba(255, 255, 255, 0.72)' : 'rgba(224, 242, 254, 0.38)';
        ctx.stroke();
      }
    }

    // 2. Living Defiant Celestial Sap Veins (Resisting Fimbulwinter's Frozen Grasp)
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
    for (const br of branches) {
      const h = br.hover;
      const pulse = 0.28 + 0.22 * Math.sin(time * 2.0 + br.seed) + h * 0.6;

      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = Math.max(1.3, br.w1 * 0.08) + h * 3.5;
      ctx.strokeStyle = isLight
        ? `rgba(2, 132, 199, ${Math.min(1, pulse * 1.2)})`
        : `rgba(56, 189, 248, ${Math.min(1, pulse)})`;
      ctx.stroke();

      // Core celestial pulse
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = Math.max(0.6, br.w1 * 0.03) + h * 1.5;
      ctx.strokeStyle = isLight
        ? `rgba(254, 240, 138, ${Math.min(1, pulse * 0.9)})`
        : `rgba(224, 242, 254, ${Math.min(1, pulse * 0.85)})`;
      ctx.stroke();

      if (h > 0.1) {
        ctx.lineWidth = Math.max(0.8, br.w1 * 0.03) + h * 1.8;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + h * 0.55})`;
        ctx.stroke();
      }
    }

    // 3. Ancient Elder Futhark Inscription on Trunk (ᛃᚷᚷᛞᚱᚨᛊᛁᛚ: YGGDRASIL)
    const runes = ['ᛃ','ᚷ','ᚷ','ᛞ','ᚱ','ᚨ','ᛊ','ᛁ','ᛚ'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 9; i++) {
      const t = 0.10 + (i / 9) * 0.80;
      const ry = this.trunkBaseY - t * (this.trunkBaseY - this.trunkTopY);
      const rx = this.trunkCenterX + Math.sin(i * 2.3) * 8;
      const wave = Math.sin(time * 2.0 - i * 0.4);
      const alpha = 0.5 + 0.5 * Math.max(0, wave);

      ctx.font = `bold ${18 + (i % 3) * 3}px serif`;
      ctx.fillStyle = isLight ? `rgba(2, 132, 199, ${alpha})` : `rgba(125, 211, 252, ${alpha})`;
      ctx.fillText(runes[i], rx, ry);
    }
    ctx.restore();
  }

  // Draw natural lush leaves along twigs (Ultra-Fast 60fps Single-Color-Set Batched Fills)
  drawLushLeaves(time: number, isLight: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalAlpha = isLight ? 0.92 : 0.88;

    for (const batch of this.leafBatches) {
      ctx.fillStyle = isLight ? batch.colorLight : batch.colorDark;
      for (const lf of batch.leaves) {
        const ph = lf.branchIdx >= 0 && lf.branchIdx < this.branches.length ? this.branches[lf.branchIdx].hover : 0;
        const sway = Math.sin(time * 1.8 + lf.x) * 2.5 + ph * 4;
        ctx.beginPath();
        ctx.ellipse(lf.x + sway, lf.y, lf.rx, lf.ry, lf.rot, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Draw realm-specific ambient elemental particle effects
  drawRealmParticleAmbience(w: number, h: number, time: number, isLight: boolean) {
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';

    for (const r of this.realms) {
      const rx = r.x * w, ry = r.y * h;
      const moteCount = 4;
      for (let k = 0; k < moteCount; k++) {
        const orbitAngle = time * 1.2 + (k * Math.PI * 2) / moteCount + r.x * 10;
        const orbitRadius = (r.radius * w * 0.6) + Math.sin(time * 2 + k) * 6;
        const ox = rx + Math.cos(orbitAngle) * orbitRadius;
        const oy = ry + Math.sin(orbitAngle) * orbitRadius * 0.7;

        ctx.fillStyle = r.color;
        ctx.globalAlpha = 0.4 + 0.3 * Math.sin(time * 3 + k);
        ctx.beginPath();
        ctx.arc(ox, oy, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Draw Masterpiece Realm Medallions (Theme-Aware)
  drawRealmMedallion(r: any, rx: number, ry: number, oR: number, time: number, isLight: boolean) {
    const ctx = this.ctx;
    const isHovered = this.hoveredRealm === r;
    const p = r.pulse;

    ctx.save();

    if (r.locked) {
      ctx.filter = 'saturate(75%) brightness(92%) opacity(85%)';
    }

    // 1. Radiant Aura on Hover
    if (isHovered || p > 0.04) {
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      ctx.fillStyle = r.color;
      ctx.globalAlpha = (isLight ? 0.18 : 0.22) + p * 0.45;
      ctx.beginPath();
      ctx.arc(rx, ry, oR * 1.85, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 2. Outer Rotating Norse Filigree Runic Ring
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(time * 0.3 * (r.id === 'jotunheim' || r.id === 'muspelheim' ? -1 : 1));
    ctx.beginPath();
    ctx.arc(0, 0, oR + 6, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 1.8;
    ctx.setLineDash([6, 8]);
    ctx.stroke();

    for (let k = 0; k < 4; k++) {
      const ka = (k * Math.PI) / 2;
      const kx = Math.cos(ka) * (oR + 6);
      const ky = Math.sin(ka) * (oR + 6);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(kx, ky, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 3. Metallic Bronze/Gold Beveled Rim
    const rimGrad = ctx.createLinearGradient(rx - oR, ry - oR, rx + oR, ry + oR);
    rimGrad.addColorStop(0, '#fef08a');
    rimGrad.addColorStop(0.5, '#ca8a04');
    rimGrad.addColorStop(1, '#582d09');
    ctx.beginPath();
    ctx.arc(rx, ry, Math.max(1, oR + 2), 0, Math.PI * 2);
    ctx.fillStyle = rimGrad;
    ctx.fill();

    // 4. Inner Elemental Core Sphere
    const safeRadius = Math.max(1, oR);
    const coreGrad = ctx.createRadialGradient(rx - oR * 0.3, ry - oR * 0.3, 0, rx, ry, safeRadius);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.35, r.color);
    coreGrad.addColorStop(0.85, '#0f172a');
    coreGrad.addColorStop(1, '#020617');
    ctx.beginPath();
    ctx.arc(rx, ry, Math.max(0.5, oR - 1), 0, Math.PI * 2);
    ctx.fillStyle = coreGrad;
    ctx.fill();

    // 5. Central Glowing Rune
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.font = `bold ${Math.round(oR * 0.95)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(r.rune, rx, ry);
    ctx.restore();

    ctx.restore(); // Restore filter

    if (r.locked) {
      const lockY = ry + oR * 0.34;
      const lR = Math.max(7, Math.round(oR * 0.26));
      ctx.save();
      // Backing pill glow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.beginPath();
      ctx.roundRect(rx - lR * 1.25, lockY - lR * 1.15, lR * 2.5, lR * 2.3, lR * 0.5);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.2;
      ctx.shadowColor = 'rgba(253, 224, 71, 0.6)';
      ctx.shadowBlur = 6;
      ctx.stroke();

      // Shackle
      ctx.beginPath();
      ctx.arc(rx, lockY - lR * 0.35, lR * 0.45, Math.PI, 0);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.2;
      ctx.stroke();

      // Lock body (lighter gleaming gold/mithril)
      const lGrad = ctx.createLinearGradient(rx - lR * 0.7, lockY - lR * 0.25, rx + lR * 0.7, lockY + lR * 0.75);
      lGrad.addColorStop(0, '#ffffff');
      lGrad.addColorStop(0.3, '#fef08a');
      lGrad.addColorStop(0.7, '#f59e0b');
      lGrad.addColorStop(1, '#b45309');
      ctx.fillStyle = lGrad;
      ctx.beginPath();
      ctx.roundRect(rx - lR * 0.7, lockY - lR * 0.25, lR * 1.4, lR * 1.0, 2.5);
      ctx.fill();
      ctx.strokeStyle = '#ffd700';
      ctx.lineWidth = 1.0;
      ctx.stroke();

      // Keyhole
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.arc(rx, lockY + lR * 0.15, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillRect(rx - 0.7, lockY + lR * 0.15, 1.4, 2.2);

      ctx.restore();
    }

    // Realm Label & Subtitle Badge (High Contrast in both themes)
    ctx.save();
    const rawWorldName = t('world_' + r.id) || r.name;
    const labelText = rawWorldName;
    ctx.font = 'bold 13px "Outfit", "Inter", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const labelY = ry + oR + 12;

    if (isLight) {
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
      ctx.strokeText(labelText, rx, labelY);
    }
    ctx.fillStyle = r.locked
      ? (isLight ? '#334155' : 'rgba(241, 245, 249, 0.92)')
      : (isHovered ? (isLight ? '#0f172a' : '#ffffff') : (isLight ? '#78350f' : r.color));
    ctx.fillText(labelText, rx, labelY);

    if (isHovered) {
      const realmTitle = t('realm_' + r.id);
      const singleSub = r.locked ? `🔒 ${t('locked')}` : `✦ ${realmTitle} ✦`;
      ctx.font = `600 11px "Outfit", sans-serif`;
      if (isLight) {
        ctx.lineWidth = 3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.92)';
        ctx.strokeText(singleSub, rx, ry + oR + 28);
      }
      ctx.fillStyle = r.locked ? '#dc2626' : (isLight ? '#0f172a' : '#ffffff');
      ctx.fillText(singleSub, rx, ry + oR + 28);
    }
    ctx.restore();
  }

  // Draw Ratatoskr (The Mythical Celestial Messenger Squirrel of Yggdrasil)
  drawRatatoskr(time: number, isLight: boolean) {
    if (this.branches.length === 0) return;
    const ctx = this.ctx;
    const r = this.ratatoskr;

    if (r.branchIdx >= this.branches.length) r.branchIdx = 0;
    const br = this.branches[r.branchIdx];

    const dt = 0.016;

    // === 1. NATURAL LOCOMOTION & CADENCE STATE MACHINE ===
    if (r.state === 'running') {
      // Natural scamper burst cadence: squirrels run in energetic bursts with brief alert pauses
      if (r.pauseTimer > 0) {
        r.pauseTimer -= dt;
      } else {
        const movePx = r.speed * dt;
        const dtParam = movePx / Math.max(15, br.len);
        r.t += dtParam * r.dir;
        r.dist += movePx;
        r.scurryTimer -= dt;

        if (r.scurryTimer <= 0) {
          r.pauseTimer = 0.16 + Math.random() * 0.14; // Quick micro-sniff pause
          r.scurryTimer = 1.4 + Math.random() * 1.6;
        }

        // Drop stardust trail behind scampering paws
        if (Math.random() < 0.30) {
          r.trail.push({
            x: r.posX + (Math.random() - 0.5) * 8,
            y: r.posY + (Math.random() - 0.5) * 8,
            life: 1.0,
            r: 1.2 + Math.random() * 2.2,
            color: isLight ? '#f59e0b' : '#fbbf24'
          });
        }
      }

      // Smooth branch transition when reaching endpoints
      r.transitionCooldown -= dt;
      if (r.transitionCooldown <= 0 && (r.t >= 0.97 || r.t <= 0.03)) {
        const endX = r.dir > 0 ? br.x2 : br.x1;
        const endY = r.dir > 0 ? br.y2 : br.y1;

        // Find connected branching neighbors
        const candidates: { idx: number; startT: number; dir: number }[] = [];
        for (let i = 0; i < this.branches.length; i++) {
          if (i === r.branchIdx) continue;
          const b = this.branches[i];
          if (Math.hypot(b.x1 - endX, b.y1 - endY) < 42) {
            candidates.push({ idx: i, startT: 0.04, dir: 1 });
          } else if (Math.hypot(b.x2 - endX, b.y2 - endY) < 42) {
            candidates.push({ idx: i, startT: 0.96, dir: -1 });
          }
        }

        if (candidates.length > 0 && Math.random() < 0.88) {
          const next = candidates[Math.floor(Math.random() * candidates.length)];
          r.branchIdx = next.idx;
          r.t = next.startT;
          r.dir = next.dir;
          r.transitionCooldown = 0.5; // Prevent instant bouncing
        } else {
          r.dir *= -1; // Natural turnaround at canopy tip
          r.transitionCooldown = 0.35;
        }

        // Roll next natural behavioral action
        const roll = Math.random();
        if (roll < 0.35) {
          r.state = 'nibbling';
          r.stateTimer = 2.4 + Math.random() * 1.6;
          r.acornScale = 0;
        } else if (roll < 0.70) {
          r.state = 'lookout';
          r.stateTimer = 2.0 + Math.random() * 1.4;
          r.bubbleTimer = r.stateTimer;
          const quotes = getRatatoskrQuotes();
          r.bubbleText = Math.random() < 0.4
            ? ['✧ ᛉ ✧', '✦ ᚱᚨᛏ ✦', '🌰 ✨', '✧ ᚱ ✧', '✦ ᛇ ✦'][Math.floor(Math.random() * 5)]
            : quotes[Math.floor(Math.random() * quotes.length)];
        }
      }
    } else if (r.state === 'nibbling') {
      r.stateTimer -= dt;
      r.acornScale = Math.min(1.0, r.acornScale + dt * 4.5);

      // Emit crunchy golden acorn crumbs
      if (Math.random() < 0.25) {
        r.crunchParticles.push({
          x: r.posX + (Math.random() - 0.5) * 8,
          y: r.posY - 6,
          vx: (Math.random() - 0.5) * 1.5,
          vy: 0.5 + Math.random() * 1.5,
          life: 1.0,
          color: Math.random() > 0.5 ? '#fde047' : '#f59e0b'
        });
      }

      if (r.stateTimer <= 0) {
        r.state = 'running';
        r.speed = 130 + Math.random() * 30;
      }
    } else if (r.state === 'lookout') {
      r.stateTimer -= dt;
      if (r.bubbleTimer > 0) r.bubbleTimer -= dt;
      if (r.stateTimer <= 0) {
        r.state = 'running';
        r.speed = 130 + Math.random() * 30;
      }
    }

    // === 2. SURFACE POSITION & SMOOTH HEADING ===
    const info = this.getBranchSurfaceInfo(br, r.t);

    if (r.posX === 0 && r.posY === 0) {
      r.posX = info.x;
      r.posY = info.y;
    } else {
      // Smooth lerp to prevent any teleportation across branch joins
      r.posX += (info.x - r.posX) * 0.45;
      r.posY += (info.y - r.posY) * 0.45;
    }

    // Calculate heading vector in direction of travel
    let moveX = info.tanX * r.dir;
    let moveY = info.tanY * r.dir;
    if (r.state === 'nibbling' || r.state === 'lookout') {
      // Aligned with the branch slope
      moveX = info.tanX * (r.dir >= 0 ? 1 : -1);
      moveY = info.tanY * (r.dir >= 0 ? 1 : -1);
    }

    const targetHeading = Math.atan2(moveY, moveX);
    let angleDiff = targetHeading - r.heading;
    while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
    while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
    r.heading += angleDiff * Math.min(1, dt * 14);

    // === 3. MOUSE CURIOUS HOVER INTERACTION (SPEAKS INSTEAD OF SPINNING) ===
    const distToMouse = Math.hypot(this.mouseX - r.posX, this.mouseY - r.posY);
    const isRatHovered = distToMouse < 55;

    if (isRatHovered) {
      if (r.state !== 'lookout' || r.bubbleTimer <= 0.2) {
        this.triggerRatatoskrSpeak();
      } else {
        r.stateTimer = Math.max(r.stateTimer, 2.2);
        r.bubbleTimer = Math.max(r.bubbleTimer, 2.2);
      }
    }

    // Update Stardust & Crunch Particles
    for (let i = r.trail.length - 1; i >= 0; i--) {
      const p = r.trail[i];
      p.life -= 0.025;
      p.y -= 0.3;
      if (p.life <= 0) {
        r.trail.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.life * (isLight ? 0.75 : 0.85);
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0, p.r * p.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    for (let i = r.crunchParticles.length - 1; i >= 0; i--) {
      const cp = r.crunchParticles[i];
      cp.life -= 0.035;
      cp.x += cp.vx;
      cp.y += cp.vy;
      if (cp.life <= 0) {
        r.crunchParticles.splice(i, 1);
        continue;
      }
      ctx.save();
      ctx.fillStyle = cp.color;
      ctx.globalAlpha = cp.life;
      ctx.fillRect(cp.x, cp.y, 2.2, 2.2);
      ctx.restore();
    }

    // === 4. NATURAL BOUNDING GAIT & ANATOMICAL DRAWING ===
    let squashX = 0;
    let gallopY = 0;
    let pawRun = 0;
    let tailWave = 0;

    if (r.state === 'running' && r.pauseTimer <= 0) {
      const step = r.dist * 0.09;
      squashX = Math.sin(step) * 2.2;
      gallopY = -Math.abs(Math.sin(step)) * 3.6; // Bounding arc off bark
      pawRun = Math.sin(step) * 5;
      tailWave = -0.22 + Math.sin(step - 0.75) * 0.38; // Secondary fluid tail motion
    } else if (r.state === 'nibbling') {
      tailWave = -0.12 + Math.sin(time * 12) * 0.20;
    } else if (r.state === 'lookout') {
      tailWave = 0.12 + Math.sin(time * 4) * 0.15;
    } else {
      tailWave = Math.sin(time * 6) * 0.25;
    }

    ctx.save();
    ctx.translate(r.posX, r.posY + r.jumpY + gallopY);

    // Orientation along movement heading with vertical flip when running leftwards
    const isFacingLeft = Math.cos(r.heading) < -0.05;
    ctx.rotate(r.heading);
    if (isFacingLeft) {
      ctx.scale(1, -1);
    }

    // Four galloping paws (synchronized bounding pairs)
    if (r.state === 'running' && r.pauseTimer <= 0) {
      ctx.fillStyle = '#9a3412';
      // Hind paws (push-off)
      ctx.fillRect(-10 - pawRun * 0.6, 4, 3.5, 6.0);
      ctx.fillRect(-6 - pawRun * 0.6, 4, 3.5, 6.0);

      // Front paws (reach forward)
      ctx.fillRect(6 + pawRun * 0.8, 4, 3.2, 6.0);
      ctx.fillRect(10 + pawRun * 0.8, 4, 3.2, 6.0);
    } else {
      // Sitting paws planted on bark
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.ellipse(-6, 5.5, 4.5, 2.5, 0, 0, Math.PI * 2);
      ctx.ellipse(6, 5.5, 4.0, 2.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }

    // Fluffy Arching Squirrel Tail (Scaled Up & Multi-Tone)
    ctx.save();
    ctx.translate(-10, -3);
    ctx.rotate(tailWave);

    // Tail Base & Curve
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-16, -18, -6, -28);
    ctx.quadraticCurveTo(4, -36, -4, -42);
    ctx.quadraticCurveTo(-14, -34, -20, -18);
    ctx.quadraticCurveTo(-14, -6, 0, 0);
    ctx.closePath();
    ctx.fillStyle = '#c2410c';
    ctx.fill();

    // Fluffy Outer Fur Highlights
    ctx.beginPath();
    ctx.moveTo(-2, -4);
    ctx.quadraticCurveTo(-14, -18, -4, -28);
    ctx.quadraticCurveTo(2, -34, -4, -38);
    ctx.quadraticCurveTo(-10, -30, -15, -16);
    ctx.closePath();
    ctx.fillStyle = '#f97316';
    ctx.fill();

    // Cream Tail Tip Highlight
    ctx.beginPath();
    ctx.arc(-4, -40, 5.5, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();

    // Stardust Sparkle at Tail Tip
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(-4, -40, 2.5 + Math.sin(time * 6) * 1.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    ctx.restore(); // Tail

    // Main Plump Body with Bounding Squash & Stretch
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(0, -3, 14 + squashX, 8.5 - squashX * 0.5, -0.05, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Cream / Golden Soft Underbelly
    ctx.beginPath();
    ctx.ellipse(2, 0, 9.5 + squashX * 0.7, 5.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#fef08a';
    ctx.fill();
    ctx.restore();

    // Expressive Head
    ctx.save();
    ctx.translate(11, -8);

    const headBob = r.state === 'nibbling'
      ? Math.sin(time * 26) * 1.5
      : (r.state === 'lookout' ? Math.sin(time * 3) * 1.0 : (r.pauseTimer > 0 ? Math.sin(time * 12) * 0.8 : 0));
    ctx.translate(0, headBob);

    // Head Base
    ctx.beginPath();
    ctx.arc(0, 0, 8.5, 0, Math.PI * 2);
    ctx.fillStyle = '#ea580c';
    ctx.fill();

    // Snout / Cheeks
    ctx.beginPath();
    ctx.ellipse(5, 2, 5.5, 4.0, 0.2, 0, Math.PI * 2);
    ctx.fillStyle = '#fdba74';
    ctx.fill();

    // Dark Little Nose
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    ctx.arc(9.5, 1.5, 1.8, 0, Math.PI * 2);
    ctx.fill();

    // Pointed Tufted Squirrel Ears
    const earTwitch = Math.sin(time * 7) * 0.18;
    // Left Ear
    ctx.save();
    ctx.translate(-4, -6);
    ctx.rotate(-0.2 + earTwitch);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-2, -9);
    ctx.lineTo(4, -3);
    ctx.closePath();
    ctx.fillStyle = '#c2410c';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, -5, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Ear
    ctx.save();
    ctx.translate(1, -7);
    ctx.rotate(0.1 - earTwitch);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(2, -9);
    ctx.lineTo(5, -2);
    ctx.closePath();
    ctx.fillStyle = '#c2410c';
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3, -5, 1.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Shiny Bead Eye with catchlight
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(2.5, -2, 2.6, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(3.2, -2.8, 1.1, 0, Math.PI * 2);
    ctx.arc(1.8, -1.2, 0.5, 0, Math.PI * 2);
    ctx.fill();

    // Whisker lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(6, 3); ctx.lineTo(13, 1);
    ctx.moveTo(6, 4); ctx.lineTo(12, 6);
    ctx.stroke();

    ctx.restore(); // Head

    // Held Golden Norse Acorn (when nibbling)
    if (r.state === 'nibbling' && r.acornScale > 0.05) {
      ctx.save();
      ctx.translate(12, 0);
      ctx.scale(r.acornScale, r.acornScale);

      // Acorn Nut Body
      ctx.beginPath();
      ctx.ellipse(0, 2, 4.5, 6.0, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = '#f59e0b';
      ctx.fill();

      // Golden Glow
      ctx.save();
      ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(0, 2, 2.8, 4.0, 0.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Acorn Cap
      ctx.beginPath();
      ctx.arc(0, -3, 4.5, Math.PI, Math.PI * 2);
      ctx.fillStyle = '#78350f';
      ctx.fill();

      // Little Acorn Stem
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(0, -3);
      ctx.lineTo(-1, -6);
      ctx.stroke();

      // Paws holding acorn
      ctx.fillStyle = '#9a3412';
      ctx.beginPath();
      ctx.arc(-3, 0, 2.2, 0, Math.PI * 2);
      ctx.arc(3, 0, 2.2, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }

    ctx.restore(); // Ratatoskr Master (Back to world coordinate space)

    // === 5. FLOATING SPEECH BUBBLE (ALWAYS UPRIGHT & PERFECTLY LEGIBLE) ===
    if (r.state === 'lookout' && r.bubbleTimer > 0) {
      const bAlpha = Math.min(1.0, r.bubbleTimer * 1.8);
      ctx.save();
      ctx.globalAlpha = bAlpha;
      ctx.font = 'bold 11px "Outfit", -apple-system, sans-serif';
      const textMetrics = ctx.measureText(r.bubbleText);
      const bubbleW = Math.max(54, textMetrics.width + 20);
      const bubbleH = 24;

      // Position bubble centered directly above Ratatoskr in world space
      const bx = r.posX;
      const by = r.posY - 36;

      // Soft pill glow/shadow
      ctx.shadowColor = isLight ? 'rgba(0, 0, 0, 0.12)' : 'rgba(0, 0, 0, 0.50)';
      ctx.shadowBlur = 8;
      ctx.shadowOffsetY = 2;

      // Rounded pill bubble background
      ctx.beginPath();
      ctx.roundRect(bx - bubbleW / 2, by - bubbleH / 2, bubbleW, bubbleH, 12);
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.94)';
      ctx.fill();

      // Frosted cyan/amber border
      ctx.shadowColor = 'transparent';
      ctx.strokeStyle = isLight ? 'rgba(14, 165, 233, 0.85)' : 'rgba(56, 189, 248, 0.90)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Downward pointer towards Ratatoskr
      ctx.beginPath();
      ctx.moveTo(bx - 5, by + bubbleH / 2 - 1);
      ctx.lineTo(bx, by + bubbleH / 2 + 7);
      ctx.lineTo(bx + 5, by + bubbleH / 2 - 1);
      ctx.closePath();
      ctx.fillStyle = isLight ? 'rgba(255, 255, 255, 0.96)' : 'rgba(15, 23, 42, 0.94)';
      ctx.fill();
      ctx.strokeStyle = isLight ? 'rgba(14, 165, 233, 0.85)' : 'rgba(56, 189, 248, 0.90)';
      ctx.stroke();

      // Dialogue Text
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillStyle = isLight ? '#0369a1' : '#f0f9ff';
      ctx.fillText(r.bubbleText, bx, by);

      ctx.restore();
    }
  }

  // Draw The Well of Urd (Sacred Subterranean Waters & Fate Runes) (Theme-Aware)
  drawWellOfUrd(w: number, h: number, time: number, isLight: boolean) {
    const ctx = this.ctx;
    const poolY = this.trunkBaseY + h * 0.04;
    const poolH = h - poolY;

    // Translucent subterranean water reflection
    const waterGrad = ctx.createLinearGradient(0, poolY, 0, h);
    if (isLight) {
      waterGrad.addColorStop(0, 'rgba(186, 230, 253, 0.45)');
      waterGrad.addColorStop(1, 'rgba(125, 211, 252, 0.85)');
    } else {
      waterGrad.addColorStop(0, 'rgba(8, 14, 28, 0.45)');
      waterGrad.addColorStop(1, 'rgba(2, 5, 16, 0.95)');
    }
    ctx.fillStyle = waterGrad;
    ctx.fillRect(0, poolY, w, poolH);

    // Fate Water Ripples
    if (Math.random() < 0.04 && this.waterRipples.length < 5) {
      this.waterRipples.push({
        x: this.trunkCenterX + (Math.random() - 0.5) * w * 0.22,
        y: poolY + Math.random() * poolH * 0.5,
        r: 2,
        maxR: 24 + Math.random() * 26,
        life: 1.0
      });
    }

    for (let i = this.waterRipples.length - 1; i >= 0; i--) {
      const rip = this.waterRipples[i];
      rip.r += 0.45;
      rip.life = 1 - (rip.r / rip.maxR);
      if (rip.life <= 0) {
        this.waterRipples.splice(i, 1);
        continue;
      }
      ctx.beginPath();
      ctx.ellipse(rip.x, rip.y, rip.r, rip.r * 0.35, 0, 0, Math.PI * 2);
      ctx.strokeStyle = isLight ? `rgba(2, 132, 199, ${rip.life * 0.45})` : `rgba(56, 189, 248, ${rip.life * 0.35})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    // Floating Destiny Runes of Urd (ᚢ ᚱ ᛞ)
    const urdRunes = ['ᚢ', 'ᚱ', 'ᛞ'];
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 20px serif';
    for (let i = 0; i < 3; i++) {
      const rx = this.trunkCenterX + (i - 1) * 65;
      const ry = poolY + poolH * 0.5 + Math.sin(time * 1.5 + i) * 2;
      const pulse = 0.35 + 0.25 * Math.sin(time * 2 + i * 2);
      ctx.fillStyle = isLight ? `rgba(3, 105, 161, ${pulse * 1.2})` : `rgba(125, 211, 252, ${pulse})`;
      ctx.fillText(urdRunes[i], rx, ry);
    }
    ctx.restore();
  }

  // Draw Targeted Bifrost Sap Surges ONLY along the active realm path
  drawTargetedBifrostSurge(time: number) {
    if (!this.hoveredRealm) return;
    const ctx = this.ctx;
    const targetRealmId = this.hoveredRealm.id;

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';

    // Target branch only
    const targetBranches = this.branches.filter(br => br.realmId === targetRealmId);

    for (const br of targetBranches) {
      // 1. Wide ethereal outer aura sleeve
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = Math.max(16, br.w1 * 0.9);
      ctx.strokeStyle = `rgba(251, 146, 60, 0.22)`;
      ctx.stroke();

      // 2. Focused vibrant inner glow
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = Math.max(6, br.w1 * 0.35);
      ctx.strokeStyle = `rgba(254, 215, 170, 0.75)`;
      ctx.stroke();

      // 3. Blazing core laser beam
      ctx.beginPath();
      ctx.moveTo(br.x1, br.y1);
      ctx.quadraticCurveTo(br.cx, br.cy, br.x2, br.y2);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = '#ffffff';
      ctx.stroke();

      // 4. Flowing radiant energy comets
      for (let p = 0; p < 3; p++) {
        const pulseT = ((time * 1.5 + p * 0.33) % 1.0);
        const px = this.qbz(br.x1, br.cx, br.x2, pulseT);
        const py = this.qbz(br.y1, br.cy, br.y2, pulseT);

        // Radiant golden flare
        const flare = ctx.createRadialGradient(px, py, 0, px, py, 14);
        flare.addColorStop(0, '#ffffff');
        flare.addColorStop(0.35, '#fbbf24');
        flare.addColorStop(1, 'rgba(249, 115, 22, 0)');
        ctx.fillStyle = flare;
        ctx.beginPath();
        ctx.arc(px, py, 14, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  // Draw Bifrost Warp Entrance Sequence on Click
  drawBifrostWarp(w: number, h: number, time: number) {
    if (!this.transitioningRealm) return;

    this.transitionTimer += 0.2;
    const progress = Math.min(1, this.transitionTimer);
    const r = this.transitioningRealm;
    const ctx = this.ctx;

    const rx = r.x * w;
    const ry = r.y * h;

    ctx.save();
    const maxRadius = Math.max(w, h) * 1.5;
    const vortexR = progress * maxRadius;

    ctx.fillStyle = r.color;
    ctx.globalAlpha = 1 - progress * 0.45;
    ctx.beginPath();
    ctx.arc(rx, ry, Math.max(0, vortexR), 0, Math.PI * 2);
    ctx.fill();

    // Laser speed rays
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(time * 3);
    const rayCount = 20;
    for (let i = 0; i < rayCount; i++) {
      const ang = (i * Math.PI * 2) / rayCount;
      const rayLen = vortexR * (0.7 + sr(i * 13) * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * rayLen, Math.sin(ang) * rayLen);
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2.5;
      ctx.stroke();
    }
    ctx.restore();

    if (progress > 0.8) {
      const flashAlpha = (progress - 0.8) / 0.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }
    ctx.restore();

    if (progress >= 1.0) {
      const realmId = this.transitioningRealm.id;
      this.transitioningRealm = null;
      this.onSelectRealm(realmId);
    }
  }

  draw() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const time = Date.now() / 1000;
    const isLight = document.body.dataset.activeTheme === 'light';

    if (!this.built) this.buildTree(w, h);

    // Parallax
    const targetPX = this.mouseX > 0 ? (this.mouseX - w / 2) * 0.02 : 0;
    const targetPY = this.mouseY > 0 ? (this.mouseY - h / 2) * 0.02 : 0;
    this.parallaxX += (targetPX - this.parallaxX) * 0.05;
    this.parallaxY += (targetPY - this.parallaxY) * 0.05;

    // Hover detection for branches
    for (const br of this.branches) {
      const midX = (br.x1 + br.x2) * 0.5;
      const midY = (br.y1 + br.y2) * 0.5;
      const d = Math.hypot(this.mouseX - midX, this.mouseY - midY);
      const thresh = 65 + br.w1;
      const target = d < thresh ? (1 - d / thresh) : 0;
      br.hover += (target - br.hover) * 0.4;
      if (br.hover < 0.001) br.hover = 0;
    }

    // === 1. ATMOSPHERIC SKY & AURORA BOREALIS ===
    this.drawAtmosphericSky(w, h, time, isLight);

    // === 2. SUBTERRANEAN SACRED WATERS OF URD ===
    this.drawWellOfUrd(w, h, time, isLight);

    // === 3. VOLUMETRIC CANOPY CLOUDS (DEPTH SHADING) ===
    this.drawCanopyClouds(time, isLight);

    // === 4. LUSH NATURAL LEAVES (SINGLE-PASS BATCHED FILLS) ===
    this.drawLushLeaves(time, isLight);

    // === 5. ANCIENT YGGDRASIL TREE STRUCTURE ===
    this.drawYggdrasilWood(time, isLight);

    // === 6. TARGETED BIFROST SAP SURGES ===
    this.drawTargetedBifrostSurge(time);

    // === 7. REALM PARTICLE AMBIENCE ===
    this.drawRealmParticleAmbience(w, h, time, isLight);

    // === 8. MYTHICAL INHABITANT — RATATOSKR (THE CELESTIAL SQUIRREL) ===
    this.drawRatatoskr(time, isLight);

    // === 9. FIMBULWINTER COSMIC SNOWFLAKES & FROST CRYSTALS ===
    const ctx = this.ctx;
    ctx.save();
    ctx.globalCompositeOperation = isLight ? 'source-over' : 'lighter';
    for (const p of this.motes) {
      p.x += p.vx + Math.sin(time * 1.4 + p.y * 0.015) * 0.35;
      p.y += p.vy;
      if (p.y > h + 5) {
        p.y = -8;
        p.x = Math.random() * w;
      }
      ctx.fillStyle = isLight ? p.colorLight : p.colorDark;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();

      // Delicate sparkling core on larger crystalline snowflakes
      if (p.r > 2.0) {
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = p.alpha * 0.85;
        ctx.fillRect(p.x - 0.6, p.y - 0.6, 1.2, 1.2);
      }
    }
    ctx.restore();

    // === 10. NINE REALM MEDALLIONS ===
    for (const r of this.realms) {
      const rx = r.x * w, ry = r.y * h;
      const bR = Math.max(6, Math.min(w, h) * 0.042);
      const oR = Math.max(6, bR + bR * 0.25 * r.pulse);
      r.pulse += ((this.hoveredRealm === r ? 1 : 0) - r.pulse) * 0.2;

      this.drawRealmMedallion(r, rx, ry, oR, time, isLight);
    }

    // === 11. BIFROST WARP TRANSITION ===
    this.drawBifrostWarp(w, h, time);
  }

  loop = () => {
    this.draw();
    this.animationId = requestAnimationFrame(this.loop);
  }

  start() {
    this.built = false;
    this.transitioningRealm = null;
    this.transitionTimer = 0;
    this.loop();
  }

  stop() {
    cancelAnimationFrame(this.animationId);
  }
}
