function hexToRgb(hex: string) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 255, g: 255, b: 255 };
}
function sr(seed: number): number {
  const x = Math.sin(seed * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
}

interface Branch {
  x1: number; y1: number; x2: number; y2: number;
  cx: number; cy: number;
  w1: number; w2: number; depth: number; seed: number;
  realmId?: string; hover: number; isRoot: boolean; hasLeaves: boolean;
}

interface LeafCluster {
  x: number; y: number; radius: number; seed: number; branchIdx: number;
}

interface SparkParticle {
  x: number; y: number; vx: number; vy: number;
  life: number; maxLife: number; size: number;
  r: number; g: number; b: number;
}

export class MainMenu {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  animationId = 0;
  mouseX = -9999; mouseY = -9999;
  branches: Branch[] = [];
  leafClusters: LeafCluster[] = [];
  built = false;
  ambientMotes: any[] = [];
  sparks: SparkParticle[] = [];

  trunkBaseY = 0;
  trunkTopY = 0;
  trunkCenterX = 0;
  treeHoverMax = 0;

  // Interactive Bifrost Warp Sequence
  transitioningRealm: any = null;
  transitionTimer = 0;

  realms = [
    { id: 'asgard',       name: 'Asgard',       title: 'REALM OF THE AESIR',       x: 0.50, y: 0.08, color: '#ffd54f', rune: 'ᚨ', radius: 0.07, particles: [] as any[], pulse: 0 },
    { id: 'alfheim',      name: 'Alfheim',      title: 'REALM OF LIGHT ELVES',     x: 0.25, y: 0.20, color: '#ff80ab', rune: 'ᛉ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'vanaheim',     name: 'Vanaheim',     title: 'REALM OF NATURE',          x: 0.75, y: 0.20, color: '#66bb6a', rune: 'ᚹ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'svartalfheim', name: 'Svartalfheim', title: 'REALM OF DWARVES',         x: 0.15, y: 0.45, color: '#ffb300', rune: 'ᚲ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'midgard',      name: 'Midgard',      title: 'REALM OF MORTALS',         x: 0.50, y: 0.48, color: '#81c784', rune: 'ᛗ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'jotunheim',    name: 'Jotunheim',    title: 'REALM OF FROST GIANTS',    x: 0.85, y: 0.45, color: '#00e5ff', rune: 'ᛃ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'niflheim',     name: 'Niflheim',     title: 'REALM OF ICE AND MIST',    x: 0.25, y: 0.75, color: '#b2ebf2', rune: 'ᛁ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'muspelheim',   name: 'Muspelheim',   title: 'REALM OF FIRE',            x: 0.75, y: 0.75, color: '#ff3d00', rune: 'ᛊ', radius: 0.075, particles: [] as any[], pulse: 0 },
    { id: 'helheim',      name: 'Helheim',      title: 'REALM OF THE DEAD',        x: 0.50, y: 0.92, color: '#ff5722', rune: 'ᚺ', radius: 0.075, particles: [] as any[], pulse: 0 }
  ];

  hoveredRealm: any = null;
  onSelectRealm: (r: string) => void;
  glowColor = { r: 120, g: 210, b: 160 };

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
    this.hoveredRealm = null;
    for (const r of this.realms) {
      if (Math.hypot(nx - r.x, ny - r.y) < r.radius * 1.15) {
        this.hoveredRealm = r;
        this.canvas.style.cursor = 'pointer';
        return;
      }
    }
    let nearBranch = false;
    for (const br of this.branches) {
      if (br.hover > 0.3) {
        nearBranch = true;
        break;
      }
    }
    this.canvas.style.cursor = nearBranch ? 'pointer' : 'default';
  }

  onClick = () => {
    if (this.hoveredRealm && !this.transitioningRealm) {
      this.transitioningRealm = this.hoveredRealm;
      this.transitionTimer = 0;
    }
  }

  qbz(p0: number, p1: number, p2: number, t: number) {
    const m = 1 - t;
    return m * m * p0 + 2 * m * t * p1 + t * t * p2;
  }

  distToBranch(br: Branch, px: number, py: number): number {
    let minD = Infinity;
    for (let i = 0; i <= 16; i++) {
      const t = i / 16;
      minD = Math.min(minD, Math.hypot(px - this.qbz(br.x1, br.cx, br.x2, t), py - this.qbz(br.y1, br.cy, br.y2, t)));
    }
    return minD;
  }

  addBranch(x1: number, y1: number, x2: number, y2: number, w1: number, w2: number, depth: number, seed: number, realmId?: string, isRoot = false) {
    const dx = x2 - x1, dy = y2 - y1, len = Math.hypot(dx, dy);
    if (len < 6) return;
    const px = -dy / len, py = dx / len;
    const br: Branch = {
      x1, y1, x2, y2,
      cx: (x1 + x2) / 2 + px * (sr(seed + 1) - 0.5) * len * 0.35,
      cy: (y1 + y2) / 2 + py * (sr(seed + 1) - 0.5) * len * 0.35,
      w1, w2, depth, seed, realmId, hover: 0, isRoot,
      hasLeaves: !isRoot && w1 < 36
    };
    this.branches.push(br);
    const idx = this.branches.length - 1;

    if (br.hasLeaves && depth <= 3) {
      const n = 5 + Math.floor(sr(seed + 77) * 7);
      for (let c = 0; c < n; c++) {
        const t = 0.35 + sr(seed + c * 41) * 0.65;
        this.leafClusters.push({
          x: this.qbz(x1, br.cx, x2, t) + (sr(seed + c * 23) - 0.5) * 45,
          y: this.qbz(y1, br.cy, y2, t) + (sr(seed + c * 29) - 0.5) * 45,
          radius: 16 + sr(seed + c * 37) * 24,
          seed: seed + c * 100,
          branchIdx: idx
        });
      }
    }

    if (depth > 0 && w2 > 2.5) {
      const n = depth > 3 ? 3 : 2;
      for (let i = 0; i < n; i++) {
        const t = 0.30 + i * (0.42 / n) + sr(seed + i * 13) * 0.10;
        const mx = this.qbz(x1, br.cx, x2, t), my = this.qbz(y1, br.cy, y2, t);
        const side = (i % 2 === 0) ? -1 : 1;
        const ang = Math.atan2(dy, dx) + side * (0.32 + sr(seed + i * 7) * 0.52);
        const sl = len * (0.42 + sr(seed + i * 19) * 0.22);
        this.addBranch(
          mx, my,
          mx + Math.cos(ang) * sl, my + Math.sin(ang) * sl,
          w2 * 0.80, w2 * 0.35,
          depth - 1, seed + 100 + i * 73, undefined, isRoot
        );
      }
    }
  }

  buildTree(w: number, h: number) {
    this.branches = [];
    this.leafClusters = [];
    const cx = w / 2;
    const baseY = h * 0.78;
    const topY = h * 0.18;
    const trunkW = Math.max(100, w * 0.095);
    this.trunkBaseY = baseY;
    this.trunkTopY = topY;
    this.trunkCenterX = cx;

    const midY1 = baseY - (baseY - topY) * 0.35;
    const midY2 = baseY - (baseY - topY) * 0.70;

    // Lower Trunk
    this.addBranch(cx, baseY, cx, midY1, trunkW * 1.15, trunkW * 0.85, 1, 10);
    // Mid Trunk
    this.addBranch(cx, midY1, cx, midY2, trunkW * 0.85, trunkW * 0.65, 1, 20);
    // Upper Trunk
    this.addBranch(cx, midY2, cx, topY, trunkW * 0.65, trunkW * 0.45, 1, 30);

    const tw = trunkW;

    // 0: Asgard
    const aR = this.realms[0];
    this.addBranch(cx, topY, aR.x * w, aR.y * h + h * 0.05, tw * 0.45, tw * 0.10, 5, 500, 'asgard');
    this.addBranch(cx, topY, cx - w * 0.28, topY - h * 0.06, tw * 0.35, tw * 0.06, 4, 510);
    this.addBranch(cx, topY, cx + w * 0.28, topY - h * 0.06, tw * 0.35, tw * 0.06, 4, 520);

    // 1: Alfheim
    const alR = this.realms[1];
    this.addBranch(cx, midY2, alR.x * w + w * 0.03, alR.y * h + h * 0.02, tw * 0.35, tw * 0.08, 4, 1100, 'alfheim');
    
    // 2: Vanaheim
    const vR = this.realms[2];
    this.addBranch(cx, midY2, vR.x * w - w * 0.04, vR.y * h, tw * 0.35, tw * 0.08, 5, 600, 'vanaheim');
    this.addBranch(cx, midY2 + h * 0.04, cx + w * 0.35, vR.y * h + h * 0.06, tw * 0.30, tw * 0.06, 4, 610);

    // 3: Svartalfheim
    const sR = this.realms[3];
    this.addBranch(cx, midY1 - h * 0.05, sR.x * w + w * 0.04, sR.y * h, tw * 0.40, tw * 0.08, 4, 1200, 'svartalfheim');

    // 4: Midgard
    const mR = this.realms[4];
    this.addBranch(cx, midY1, mR.x * w + w * 0.05, mR.y * h, tw * 0.45, tw * 0.08, 4, 800, 'midgard');
    this.addBranch(cx, midY1, mR.x * w - w * 0.05, mR.y * h, tw * 0.45, tw * 0.08, 4, 810, 'midgard');

    // 5: Jotunheim
    const jR = this.realms[5];
    this.addBranch(cx, midY1 - h * 0.05, jR.x * w - w * 0.04, jR.y * h, tw * 0.40, tw * 0.08, 5, 700, 'jotunheim');
    this.addBranch(cx, midY1, cx + w * 0.38, jR.y * h + h * 0.06, tw * 0.30, tw * 0.06, 4, 710);

    // 6: Niflheim
    const nR = this.realms[6];
    this.addBranch(cx, baseY - h * 0.1, nR.x * w + w * 0.03, nR.y * h, tw * 0.45, tw * 0.08, 4, 1300, 'niflheim');

    // 7: Muspelheim
    const muR = this.realms[7];
    this.addBranch(cx, baseY - h * 0.1, muR.x * w - w * 0.03, muR.y * h, tw * 0.45, tw * 0.08, 4, 1400, 'muspelheim');

    // 8: Helheim (Roots)
    const hR = this.realms[8];
    this.addBranch(cx, baseY, hR.x * w, hR.y * h - h * 0.025, tw * 0.70, tw * 0.12, 4, 900, 'helheim', true);
    for (let i = 0; i < 9; i++) {
      const a = Math.PI / 2 + [-1.0, -0.75, -0.45, -0.2, 0.0, 0.2, 0.45, 0.75, 1.0][i];
      const rl = h * (0.16 + sr(i * 53) * 0.14);
      this.addBranch(
        cx, baseY,
        cx + Math.cos(a) * rl, baseY + Math.sin(a) * rl,
        tw * 0.55, tw * 0.03,
        3, 1000 + i * 67, undefined, true
      );
    }

    // Dense Crown Leaf Canopy
    for (let i = 0; i < 90; i++) {
      const angle = sr(i * 57) * Math.PI * 2;
      const dist = sr(i * 43) * w * 0.38;
      const clx = cx + Math.cos(angle) * dist;
      const cly = topY + h * 0.08 + Math.sin(angle) * dist * 0.45 - sr(i * 31) * h * 0.06;
      if (cly < baseY - h * 0.22 && cly > topY - h * 0.10) {
        this.leafClusters.push({
          x: clx, y: cly,
          radius: 18 + sr(i * 67) * 26,
          seed: 5000 + i * 100,
          branchIdx: -1
        });
      }
    }
    this.built = true;
  }

  getBranchCurve(br: Branch, time: number) {
    const h = br.hover;
    const swayAmt = h * (12 - br.depth * 0.9);
    const sway = Math.sin(time * 2.8 + br.seed * 0.3) * swayAmt;
    const sway2 = Math.cos(time * 2.2 + br.seed * 0.5) * swayAmt * 0.45;
    const sf = Math.max(0, 1 - br.depth / 10);
    return {
      x1: br.x1,
      y1: br.y1,
      cx: br.cx + sway * sf * 0.3,
      cy: br.cy + sway2 * sf * 0.2,
      x2: br.x2 + sway * sf,
      y2: br.y2 + sway2 * sf
    };
  }

  fillTaperedBranch(
    c: {x1: number; y1: number; cx: number; cy: number; x2: number; y2: number},
    w1: number,
    w2: number,
    fillStyle: string,
    widthScale = 1.0
  ) {
    const ctx = this.ctx;
    const steps = 12;
    
    ctx.beginPath();
    // Forward path (left edge)
    for (let i = 0; i <= steps; i++) {
       const t = i / steps;
       const px = this.qbz(c.x1, c.cx, c.x2, t);
       const py = this.qbz(c.y1, c.cy, c.y2, t);
       
       const dx = 2 * (1 - t) * (c.cx - c.x1) + 2 * t * (c.x2 - c.cx);
       const dy = 2 * (1 - t) * (c.cy - c.y1) + 2 * t * (c.y2 - c.cy);
       const len = Math.hypot(dx, dy) || 1;
       const nx = -dy / len;
       const ny = dx / len;
       
       const currentW = (w1 + (w2 - w1) * t) * widthScale * 0.5;
       if (i === 0) {
         ctx.moveTo(px + nx * currentW, py + ny * currentW);
       } else {
         ctx.lineTo(px + nx * currentW, py + ny * currentW);
       }
    }
    
    // Backward path (right edge)
    for (let i = steps; i >= 0; i--) {
       const t = i / steps;
       const px = this.qbz(c.x1, c.cx, c.x2, t);
       const py = this.qbz(c.y1, c.cy, c.y2, t);
       
       const dx = 2 * (1 - t) * (c.cx - c.x1) + 2 * t * (c.x2 - c.cx);
       const dy = 2 * (1 - t) * (c.cy - c.y1) + 2 * t * (c.y2 - c.cy);
       const len = Math.hypot(dx, dy) || 1;
       const nx = -dy / len;
       const ny = dx / len;
       
       const currentW = (w1 + (w2 - w1) * t) * widthScale * 0.5;
       ctx.lineTo(px - nx * currentW, py - ny * currentW);
    }
    
    ctx.closePath();
    ctx.fillStyle = fillStyle;
    ctx.fill();
    
    ctx.strokeStyle = fillStyle;
    ctx.lineWidth = 1.0;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(c.x1, c.y1, w1 * widthScale * 0.5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.beginPath();
    ctx.arc(c.x2, c.y2, w2 * widthScale * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }

  drawUnifiedTree(time: number, gr: number, gg: number, gb: number) {
    const ctx = this.ctx;
    const sorted = [...this.branches].sort((a, b) => b.w1 - a.w1);

    // PASS 1: Volumetric Bifrost Aura on Hovered Limbs
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const br of sorted) {
      const h = br.hover;
      if (h > 0.04) {
        const c = this.getBranchCurve(br, time);
        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
        ctx.lineWidth = br.w1 + 55 * h;
        ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${0.15 * h})`;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
        ctx.lineWidth = br.w1 + 22 * h;
        ctx.strokeStyle = `rgba(180, 240, 255, ${0.25 * h})`;
        ctx.stroke();
      }
    }
    ctx.restore();

    // PASS 2: Dark Bark Silhouette Base
    for (const br of sorted) {
      const c = this.getBranchCurve(br, time);
      this.fillTaperedBranch(c, br.w1, br.w2, 'rgb(35, 28, 22)', 1.08);
    }

    // PASS 3 and 4 removed for performance to fix sluggishness

    // PASS 5: Wood Grain Fibers removed for performance

    // PASS 6: Living Ethereal Energy Veins & Norse Runes
    for (const br of sorted) {
      const h = br.hover;
      const c = this.getBranchCurve(br, time);
      const vp = 0.22 + 0.18 * Math.sin(time * 2.2 + br.seed) + h * 0.65;

      ctx.beginPath();
      ctx.moveTo(c.x1, c.y1);
      ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
      ctx.lineWidth = Math.max(1.8, br.w1 * 0.08) + h * 5;
      ctx.strokeStyle = `rgba(${gr}, ${gg}, ${gb}, ${Math.min(1, vp)})`;
      ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, 1)`;
      ctx.shadowBlur = 5 + h * 10;
      ctx.stroke();
      ctx.shadowBlur = 0;

      if (h > 0.08) {
        ctx.save();
        ctx.globalCompositeOperation = 'lighter';

        ctx.beginPath();
        ctx.moveTo(c.x1, c.y1);
        ctx.quadraticCurveTo(c.cx, c.cy, c.x2, c.y2);
        ctx.lineWidth = Math.max(1.2, br.w1 * 0.04) + h * 2.5;
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.4 + h * 0.55})`;
        ctx.stroke();

        const pulseSpeed = 1.6;
        for (let p = 0; p < 2; p++) {
          const pulseT = ((time * pulseSpeed + p * 0.5 + br.seed * 0.1) % 1.0);
          const px = this.qbz(c.x1, c.cx, c.x2, pulseT);
          const py = this.qbz(c.y1, c.cy, c.y2, pulseT);
          const pSize = (4 + br.w1 * 0.25) * h;

          const cGrad = ctx.createRadialGradient(px, py, 0, px, py, pSize * 3);
          cGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
          cGrad.addColorStop(0.3, `rgba(${gr}, ${gg}, ${gb}, 0.9)`);
          cGrad.addColorStop(0.7, 'rgba(180, 240, 255, 0.4)');
          cGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = cGrad;
          ctx.beginPath();
          ctx.arc(px, py, pSize * 3, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();

        if (Math.random() < h * 0.75 && this.sparks.length < 60) {
          const sparkT = Math.random();
          this.sparks.push({
            x: this.qbz(c.x1, c.cx, c.x2, sparkT) + (Math.random() - 0.5) * (br.w1 + 10),
            y: this.qbz(c.y1, c.cy, c.y2, sparkT) + (Math.random() - 0.5) * (br.w1 + 10),
            vx: (Math.random() - 0.5) * 1.5,
            vy: -1.0 - Math.random() * 2.0,
            life: 1.0,
            maxLife: 0.8 + Math.random() * 0.8,
            size: 2.0 + Math.random() * 3.5,
            r: Math.random() > 0.5 ? 255 : gr,
            g: Math.random() > 0.5 ? 245 : gg,
            b: Math.random() > 0.5 ? 210 : gb
          });
        }
      }
    }

    // Norse Runes on the Main Trunk (Spelling YGGDRASIL: ᛃᚷᚷᛞᚱᚨᛊᛁᛚ)
    const cx = this.trunkCenterX;
    const runes = ['ᛃ','ᚷ','ᚷ','ᛞ','ᚱ','ᚨ','ᛊ','ᛁ','ᛚ'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const treeResonance = this.treeHoverMax;
    for (let i = 0; i < 9; i++) {
      const t = 0.04 + (i / 9) * 0.92;
      const ry = this.trunkBaseY - t * (this.trunkBaseY - this.trunkTopY);
      const rx = cx + Math.sin(i * 2.1) * 18;
      const wave = Math.sin(time * 2.0 - i * 0.35);
      const pulse = 0.35 + 0.55 * Math.max(0, wave) + treeResonance * 0.3;
      ctx.font = `bold ${24 + (i % 3) * 5}px serif`;
      ctx.fillStyle = `rgba(${gr}, ${gg}, ${gb}, ${Math.min(1, pulse)})`;
      ctx.fillText(runes[i % runes.length], rx, ry);
    }
  }

  // Draw procedural animated celestial realm orbs (100% Non-Image)
  drawProceduralRealmOrb(r: any, rx: number, ry: number, oR: number, time: number) {
    const ctx = this.ctx;
    const p = r.pulse;

    // 1. Broad outer cosmic aura
    const au = ctx.createRadialGradient(rx, ry, oR * 0.3, rx, ry, oR * 3.4);
    au.addColorStop(0, r.color + Math.floor(25 + p * 60).toString(16).padStart(2, '0'));
    au.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = au;
    ctx.fillRect(rx - oR * 4, ry - oR * 4, oR * 8, oR * 8);

    // 2. Outer Orbiting Runic Rings
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(time * 0.4 * (r.id === 'jotunheim' ? -1 : 1));
    ctx.beginPath();
    ctx.arc(0, 0, oR + 6 + p * 4, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 1.5 + p * 2;
    ctx.setLineDash([8, 12]);
    ctx.shadowColor = r.color;
    ctx.shadowBlur = 5 + p * 10;
    ctx.stroke();
    ctx.restore();

    // 3. Inner Solid Planetary Sphere with Realm Aesthetics
    ctx.save();
    ctx.beginPath();
    ctx.arc(rx, ry, oR, 0, Math.PI * 2);

    if (r.id === 'jotunheim') {
      // Swirling glacial ice vortex
      const iceGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, oR);
      iceGrad.addColorStop(0, '#e0f7fa');
      iceGrad.addColorStop(0.35, '#00e5ff');
      iceGrad.addColorStop(0.75, '#0277bd');
      iceGrad.addColorStop(1, '#001a33');
      ctx.fillStyle = iceGrad;
      ctx.fill();

      // Ice crystal shards
      ctx.strokeStyle = 'rgba(255,255,255,0.7)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 6; i++) {
        const a = (i * Math.PI / 3) + time * 0.3;
        ctx.beginPath();
        ctx.moveTo(rx, ry);
        ctx.lineTo(rx + Math.cos(a) * oR * 0.85, ry + Math.sin(a) * oR * 0.85);
        ctx.stroke();
      }
    } else if (r.id === 'asgard') {
      // Blazing golden solar core
      const sunGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, oR);
      sunGrad.addColorStop(0, '#ffffff');
      sunGrad.addColorStop(0.3, '#ffeb3b');
      sunGrad.addColorStop(0.7, '#ff9800');
      sunGrad.addColorStop(1, '#b71c1c');
      ctx.fillStyle = sunGrad;
      ctx.fill();
    } else if (r.id === 'helheim') {
      // Dark volcanic magma sphere
      const lavaGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, oR);
      lavaGrad.addColorStop(0, '#ff5722');
      lavaGrad.addColorStop(0.4, '#d50000');
      lavaGrad.addColorStop(0.8, '#212121');
      lavaGrad.addColorStop(1, '#0d0d0d');
      ctx.fillStyle = lavaGrad;
      ctx.fill();
    } else if (r.id === 'vanaheim') {
      // Lush enchanted nature sphere
      const natureGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, oR);
      natureGrad.addColorStop(0, '#c8e6c9');
      natureGrad.addColorStop(0.4, '#4caf50');
      natureGrad.addColorStop(0.8, '#1b5e20');
      natureGrad.addColorStop(1, '#051b08');
      ctx.fillStyle = natureGrad;
      ctx.fill();
    } else {
      // Midgard terrestrial blue-green sphere
      const earthGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, oR);
      earthGrad.addColorStop(0, '#81c784');
      earthGrad.addColorStop(0.4, '#2e7d32');
      earthGrad.addColorStop(0.8, '#1565c0');
      earthGrad.addColorStop(1, '#0a2540');
      ctx.fillStyle = earthGrad;
      ctx.fill();
    }

    ctx.restore();

    // 4. Central Sacred Elder Futhark Rune
    ctx.save();
    ctx.font = `bold ${Math.round(oR * 0.95)}px serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = r.color;
    ctx.shadowBlur = 18 + p * 20;
    ctx.fillText(r.rune, rx, ry);
    ctx.restore();

    // 5. Glowing border ring
    ctx.save();
    ctx.beginPath();
    ctx.arc(rx, ry, oR + 2, 0, Math.PI * 2);
    ctx.strokeStyle = r.color;
    ctx.lineWidth = 3 + p * 3;
    ctx.shadowColor = r.color;
    ctx.shadowBlur = 14 + p * 24;
    ctx.stroke();
    ctx.restore();
  }

  // Draw lush, vibrant leaf clusters that glow on branch hover
  drawLeafClusters(time: number, gr: number, gg: number, gb: number) {
    const ctx = this.ctx;
    const greens = [
      [45, 125, 45], [58, 145, 55], [42, 115, 60], [68, 155, 50],
      [52, 135, 65], [74, 160, 55], [38, 108, 50], [64, 148, 60]
    ];

    for (const cl of this.leafClusters) {
      const ph = cl.branchIdx >= 0 && cl.branchIdx < this.branches.length
        ? this.branches[cl.branchIdx].hover : 0;
      const swX = ph * Math.sin(time * 2.8 + cl.seed) * 9;
      const swY = ph * Math.cos(time * 2.2 + cl.seed * 0.7) * 4.5;
      const clx = cl.x + swX, cly = cl.y + swY;
      const leafCount = 2; // Drastically reduced for performance

      for (let l = 0; l < leafCount; l++) {
        const a = sr(cl.seed + l * 41) * Math.PI * 2;
        const d = sr(cl.seed + l * 23) * cl.radius * 0.75;
        const lx = clx + Math.cos(a) * d, ly = cly + Math.sin(a) * d;
        const la = sr(cl.seed + l * 53) * Math.PI + ph * Math.sin(time * 2.5 + l) * 0.55;
        const ls = 6 + sr(cl.seed + l * 37) * 9 + ph * 3;
        const gc = greens[Math.floor(sr(cl.seed + l * 67) * greens.length)];
        const alpha = 0.58 + sr(cl.seed + l * 71) * 0.35 + ph * 0.25;

        ctx.save();
        ctx.translate(lx, ly);
        ctx.rotate(la);
        ctx.beginPath();
        ctx.ellipse(0, 0, ls, ls * 0.42, 0, 0, Math.PI * 2);

        if (ph > 0.08) {
          ctx.fillStyle = `rgba(${Math.min(255, gc[0] + ph * 80)}, ${Math.min(255, gc[1] + ph * 70)}, ${Math.min(255, gc[2] + ph * 90)}, ${alpha})`;
          ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, ${ph * 0.75})`;
          ctx.shadowBlur = 8 + ph * 16;
        } else {
          ctx.fillStyle = `rgba(${gc[0]}, ${gc[1]}, ${gc[2]}, ${alpha})`;
        }
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.beginPath();
        ctx.moveTo(-ls * 0.75, 0);
        ctx.lineTo(ls * 0.75, 0);
        ctx.lineWidth = 0.45;
        ctx.strokeStyle = ph > 0.1
          ? `rgba(255, 255, 255, ${0.4 + ph * 0.4})`
          : `rgba(${gc[0] - 18}, ${gc[1] - 25}, ${gc[2] - 18}, 0.35)`;
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  drawMoss(w: number, h: number, time: number) {
    // Disabled for performance
  }

  updateParticles(w: number, h: number) {
    for (const r of this.realms) {
      // Speed up realm pulse transition
      r.pulse += ((this.hoveredRealm === r ? 1 : 0) - r.pulse) * 0.2;
      r.pulse = Math.max(0, Math.min(1, r.pulse));
      if (Math.random() < (this.hoveredRealm === r ? 0.6 : 0.05)) {
        r.particles.push({
          x: r.x * w + (Math.random() - 0.5) * w * 0.16,
          y: r.y * h + (Math.random() - 0.5) * h * 0.08,
          vx: (Math.random() - 0.5) * 1.2,
          vy: (Math.random() - 0.5) * 1.2,
          life: 1, ml: 1 + Math.random() * 0.5,
          sz: 1.5 + Math.random() * 3.5,
          ang: Math.random() * Math.PI * 2,
          va: (Math.random() - 0.5) * 0.05,
          off: Math.random() * 100
        });
      }
      for (let i = r.particles.length - 1; i >= 0; i--) {
        const p = r.particles[i];
        if (r.id === 'jotunheim') { p.x += 0.6 + Math.sin(Date.now() / 500 + p.off) * 0.6; p.y += 1.1; }
        else if (r.id === 'vanaheim') { p.x += Math.sin(p.ang) * 0.6; p.y += 0.9; p.ang += p.va; }
        else if (r.id === 'helheim') { p.vy -= 0.035; p.y += p.vy; p.x += Math.sin(p.life * 5) * 0.35; }
        else if (r.id === 'asgard') { p.y -= 0.6; p.x += Math.sin(Date.now() / 800 + p.off) * 0.3; }
        else { p.x += Math.sin(Date.now() / 1000 + p.off) * 1.1; p.y += Math.cos(Date.now() / 1000 + p.off) * 1.1; }
        p.life -= 0.007 / p.ml;
        if (p.life <= 0) r.particles.splice(i, 1);
      }
    }

    if (Math.random() < 0.25 && this.ambientMotes.length < 40) {
      this.ambientMotes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -0.15 - Math.random() * 0.25,
        life: 1,
        sz: 0.8 + Math.random() * 2.0,
        off: Math.random() * 100
      });
    }
    for (let i = this.ambientMotes.length - 1; i >= 0; i--) {
      const m = this.ambientMotes[i];
      m.x += m.vx + Math.sin(Date.now() / 2500 + m.off) * 0.25;
      m.y += m.vy;
      m.life -= 0.0025;
      if (m.life <= 0) this.ambientMotes.splice(i, 1);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx;
      sp.y += sp.vy;
      sp.life -= 0.018 / sp.maxLife;
      if (sp.life <= 0) this.sparks.splice(i, 1);
    }
  }

  // Draw God of War Bifrost Realm Warp Entrance Vortex Animation
  drawBifrostWarpTransition(time: number, w: number, h: number) {
    if (!this.transitioningRealm) return;

    // Super speed up the warp entrance animation
    this.transitionTimer += 0.2;
    const progress = Math.min(1, this.transitionTimer);
    const r = this.transitioningRealm;
    const ctx = this.ctx;

    const rx = r.x * w;
    const ry = r.y * h;

    ctx.save();
    // 1. Expanding Warp Vortex from Realm Node
    const maxRadius = Math.max(w, h) * 1.5;
    const vortexR = progress * maxRadius;

    // Outer cosmic shockwave
    const shockGrad = ctx.createRadialGradient(rx, ry, 0, rx, ry, vortexR);
    shockGrad.addColorStop(0, '#ffffff');
    shockGrad.addColorStop(0.2, r.color);
    shockGrad.addColorStop(0.6, 'rgba(0, 229, 255, 0.4)');
    shockGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = shockGrad;
    ctx.beginPath();
    ctx.arc(rx, ry, vortexR, 0, Math.PI * 2);
    ctx.fill();

    // 2. High-speed Bifrost laser speed lines radiating outward
    ctx.globalCompositeOperation = 'lighter';
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(time * 3);
    const rayCount = 36;
    for (let i = 0; i < rayCount; i++) {
      const ang = (i * Math.PI * 2) / rayCount;
      const rayLen = vortexR * (0.6 + sr(i * 13) * 0.6);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(ang) * rayLen, Math.sin(ang) * rayLen);
      ctx.strokeStyle = i % 2 === 0 ? '#ffffff' : r.color;
      ctx.lineWidth = 3 + Math.sin(time * 10 + i) * 2;
      ctx.stroke();
    }
    ctx.restore();

    // 3. Orbiting Giant Futhark Runes speeding past
    const warpRunes = ['ᚠ','ᚢ','ᚦ','ᚨ','ᚱ','ᚲ','ᚷ','ᚹ','ᚺ','ᚾ','ᛁ','ᛃ','ᛇ','ᛈ','ᛉ','ᛊ'];
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    for (let i = 0; i < 16; i++) {
      const ang = (i * Math.PI * 2) / 16 + time * 2.5;
      const dist = vortexR * (0.3 + (i % 3) * 0.25);
      const px = rx + Math.cos(ang) * dist;
      const py = ry + Math.sin(ang) * dist;
      ctx.font = `bold ${Math.round(28 + progress * 24)}px serif`;
      ctx.fillStyle = '#ffffff';
      ctx.shadowColor = r.color;
      ctx.shadowBlur = 10;
      ctx.fillText(warpRunes[i], px, py);
    }

    // 4. Whiteout flash at apex
    if (progress > 0.8) {
      const flashAlpha = (progress - 0.8) / 0.2;
      ctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
      ctx.fillRect(0, 0, w, h);
    }

    ctx.restore();

    // Complete transition
    if (progress >= 1.0) {
      const realmId = this.transitioningRealm.id;
      this.transitioningRealm = null;
      this.onSelectRealm(realmId);
    }
  }

  draw() {
    const w = this.canvas.clientWidth, h = this.canvas.clientHeight;
    const time = Date.now() / 1000;
    const ctx = this.ctx;
    if (!this.built) this.buildTree(w, h);

    let maxH = 0;
    for (const br of this.branches) {
      const d = this.distToBranch(br, this.mouseX, this.mouseY);
      const thresh = 85 + br.w1 * 1.3;
      const target = d < thresh ? Math.pow(1 - d / thresh, 1.1) : 0;
      // Speed up branch hover transition
      br.hover += (target - br.hover) * 0.5;
      if (br.hover < 0.002) br.hover = 0;
      if (br.hover > maxH) maxH = br.hover;
    }
    // Speed up tree hover max transition
    this.treeHoverMax += (maxH - this.treeHoverMax) * 0.3;

    // === TOWERING COSMIC REALM BACKGROUND ===
    const bg = ctx.createLinearGradient(0, 0, 0, h);
    bg.addColorStop(0.00, '#0c1a2d');
    bg.addColorStop(0.18, '#14273d');
    bg.addColorStop(0.35, '#0e2235');
    bg.addColorStop(0.52, '#12262d');
    bg.addColorStop(0.75, '#161922');
    bg.addColorStop(0.92, '#1f100c');
    bg.addColorStop(1.00, '#100604');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);

    // Dynamic celestial nebulas
    for (let i = 0; i < 7; i++) {
      const nx = w * (0.12 + (i % 4) * 0.26) + Math.sin(time * 0.08 + i * 1.5) * 30;
      const ny = h * (0.10 + i * 0.13) + Math.cos(time * 0.06 + i * 2.3) * 22;
      const ng = ctx.createRadialGradient(nx, ny, 0, nx, ny, w * 0.28);
      const nAlpha = 0.07 + Math.sin(time * 0.2 + i) * 0.03;
      ng.addColorStop(0, i > 4 ? `rgba(90, 35, 20, ${nAlpha})` : `rgba(40, 75, 110, ${nAlpha})`);
      ng.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = ng;
      ctx.fillRect(0, 0, w, h);
    }

    // Twinkling stars across cosmic heights
    for (let i = 0; i < 110; i++) {
      const sx = sr(i * 13) * w, sy = sr(i * 17 + 5) * h * 0.75;
      ctx.fillStyle = `rgba(190, 215, 255, ${0.2 + 0.25 * Math.sin(time * (1.5 + i * 0.1) + i)})`;
      ctx.fillRect(sx, sy, 1.2 + sr(i * 23) * 1.0, 1.2 + sr(i * 23) * 1.0);
    }

    // Volumetric divine light shafts streaming from Asgard above
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 7; i++) {
      const shX = w * (0.20 + i * 0.10) + Math.sin(time * 0.1 + i * 1.7) * 35;
      const sg = ctx.createLinearGradient(shX, 0, shX, h * 0.55);
      const sa = 0.03 + 0.018 * Math.sin(time * 0.22 + i);
      sg.addColorStop(0, `rgba(255, 235, 180, ${sa * 1.4})`);
      sg.addColorStop(0.4, `rgba(140, 190, 240, ${sa * 0.7})`);
      sg.addColorStop(1, 'rgba(0,0,0,0)');
      ctx.fillStyle = sg;
      ctx.fillRect(shX - 35, 0, 70, h * 0.55);
    }
    ctx.restore();

    // Dynamic glow color (Sped up transition)
    const tgt = hexToRgb(this.hoveredRealm ? this.hoveredRealm.color : '#68cf9a');
    this.glowColor.r += (tgt.r - this.glowColor.r) * 0.2;
    this.glowColor.g += (tgt.g - this.glowColor.g) * 0.2;
    this.glowColor.b += (tgt.b - this.glowColor.b) * 0.2;
    const gr = Math.round(this.glowColor.r), gg = Math.round(this.glowColor.g), gb = Math.round(this.glowColor.b);

    // === RENDER WORLD TREE LAYERS ===
    // 1. Crown leaf canopy
    this.drawLeafClusters(time, gr, gg, gb);

    // 2. Seamless continuous multi-pass tree strokes
    this.drawUnifiedTree(time, gr, gg, gb);

    // 3. Swaying ancient moss
    this.drawMoss(w, h, time);

    // 4. Rising Bifrost sparks / stardust
    this.updateParticles(w, h);
    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    for (const sp of this.sparks) {
      ctx.globalAlpha = Math.max(0, sp.life) * 0.85;
      ctx.fillStyle = `rgb(${sp.r}, ${sp.g}, ${sp.b})`;
      ctx.shadowColor = `rgb(${sp.r}, ${sp.g}, ${sp.b})`;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 5. Subterranean fiery fog at Helheim base
    const fog = ctx.createLinearGradient(0, h * 0.82, 0, h);
    fog.addColorStop(0, 'rgba(8, 15, 25, 0)');
    fog.addColorStop(0.4, 'rgba(60, 20, 10, 0.18)');
    fog.addColorStop(1, 'rgba(25, 8, 4, 0.85)');
    ctx.fillStyle = fog;
    ctx.fillRect(0, h * 0.82, w, h * 0.18);

    // 6. Ambient cosmic motes
    for (const m of this.ambientMotes) {
      ctx.globalAlpha = m.life * 0.35;
      ctx.fillStyle = `rgb(${gr}, ${gg}, ${gb})`;
      ctx.shadowColor = `rgba(${gr}, ${gg}, ${gb}, 0.6)`;
      ctx.shadowBlur = 5;
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.sz, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;

    // === 7. PROCEDURAL CELESTIAL REALM NODES (Non-Image) ===
    for (const r of this.realms) {
      const rx = r.x * w, ry = r.y * h;
      const bR = Math.min(w, h) * 0.045, oR = bR + bR * 0.32 * r.pulse;

      // Draw procedural living planetary sphere & rune
      this.drawProceduralRealmOrb(r, rx, ry, oR, time);

      // Atmospheric Realm Particles
      ctx.globalCompositeOperation = 'lighter';
      for (const p of r.particles) {
        ctx.globalAlpha = Math.max(0, p.life) * 0.7;
        ctx.shadowBlur = 6;
        ctx.shadowColor = r.color;
        if (r.id === 'jotunheim') {
          ctx.fillStyle = `rgba(210, 240, 255, ${p.life})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz * 0.55, 0, Math.PI * 2);
          ctx.fill();
        } else if (r.id === 'vanaheim') {
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate(p.ang);
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.sz, p.sz * 0.38, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        } else if (r.id === 'helheim') {
          ctx.fillStyle = p.life > 0.5 ? '#ffab00' : '#d50000';
          const s = p.sz * p.life;
          ctx.fillRect(p.x - s / 2, p.y - s / 2, s, s);
        } else if (r.id === 'asgard') {
          ctx.fillStyle = r.color;
          ctx.beginPath();
          const s = p.sz * 1.2;
          ctx.moveTo(p.x, p.y - s);
          ctx.lineTo(p.x + s * 0.2, p.y - s * 0.2);
          ctx.lineTo(p.x + s, p.y);
          ctx.lineTo(p.x + s * 0.2, p.y + s * 0.2);
          ctx.lineTo(p.x, p.y + s);
          ctx.lineTo(p.x - s * 0.2, p.y + s * 0.2);
          ctx.lineTo(p.x - s, p.y);
          ctx.lineTo(p.x - s * 0.2, p.y - s * 0.2);
          ctx.closePath();
          ctx.fill();
        } else {
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.sz, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
      ctx.globalCompositeOperation = 'source-over';
    }

    // Navigation and Realm Exploration Hints removed.

    // 8. Render Bifrost Warp Transition on Realm Click
    this.drawBifrostWarpTransition(time, w, h);
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
