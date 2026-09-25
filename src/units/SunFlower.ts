import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { SoundManager } from '../engine/SoundManager';
import { getRealmCurrency, type RealmCurrency } from '../engine/Currency';

export class SunFlower extends Defender {
  produceTimer: number = 0;
  produceRate: number = 10000;
  realm: string = 'midgard';
  currentRealm: string = 'midgard';

  constructor(x: number, y: number, row: number, col: number, realm?: string) {
    super(x, y, 60, 80, 200, 50, row, col);
    if (realm) {
      this.realm = realm.toLowerCase().trim();
      this.currentRealm = this.realm;
    }
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.currentRealm = (this.realm || game.realm || 'midgard').toLowerCase().trim();
    this.produceTimer += deltaTime;
    if (this.produceTimer >= this.produceRate) {
      this.produceTimer = 0;
      game.sun += 25;
      game.updateUI();
      const currency = getRealmCurrency(this.currentRealm);
      game.addFloatingText(this.x + this.width / 2, this.y, `+25 ${currency.symbol}`, currency.color, true);
      this.emitRealmParticles(game, currency);
      SoundManager.getInstance().playSun();
    }
  }

  private emitRealmParticles(game: Game, currency: RealmCurrency) {
    const px = this.x + this.width / 2;
    const py = this.y + 15;
    switch (this.currentRealm) {
      case 'asgard':
        game.particles.emit(px, py, '#fbbf24', 16, 5, 3.5, 450);
        game.particles.emit(px, py, '#fde047', 10, 3, 2, 350);
        game.particles.emit(px, py, '#ffffff', 8, 4, 1.5, 300);
        break;
      case 'svartalfheim':
        game.particles.emit(px, py + 10, '#f97316', 14, 5, 3, 400);
        game.particles.emit(px, py + 10, '#fb923c', 10, 3, 2, 350);
        game.particles.emit(px, py + 10, '#cbd5e1', 8, 4, 1.5, 300);
        break;
      case 'alfheim':
        game.particles.emit(px, py, '#38bdf8', 16, 4.5, 3, 450);
        game.particles.emit(px, py, '#7dd3fc', 10, 3, 2, 350);
        game.particles.emit(px, py, '#f0abfc', 8, 3.5, 2, 300);
        break;
      case 'vanaheim':
        game.particles.emit(px, py, '#f59e0b', 16, 4, 3, 400);
        game.particles.emit(px, py, '#fbbf24', 10, 3, 2, 350);
        game.particles.emit(px, py, '#84cc16', 8, 3.5, 2, 300);
        break;
      case 'jotunheim':
        game.particles.emit(px, py, '#22d3ee', 16, 5, 3, 450);
        game.particles.emit(px, py, '#67e8f9', 10, 3.5, 2.5, 350);
        game.particles.emit(px, py, '#ffffff', 8, 4, 1.5, 300);
        break;
      case 'niflheim':
        game.particles.emit(px, py + 10, '#cffafe', 16, 3.5, 3.5, 450);
        game.particles.emit(px, py + 10, '#38bdf8', 10, 3, 2, 350);
        game.particles.emit(px, py + 10, '#e0f2fe', 8, 4, 2, 300);
        break;
      case 'muspelheim':
        game.particles.emit(px, py, '#ef4444', 18, 5.5, 3.5, 500);
        game.particles.emit(px, py, '#f97316', 12, 4, 2.5, 400);
        game.particles.emit(px, py, '#fde047', 8, 3, 1.5, 300);
        break;
      case 'helheim':
        game.particles.emit(px, py, '#c084fc', 16, 4, 3, 450);
        game.particles.emit(px, py, '#d8b4fe', 10, 3, 2, 350);
        game.particles.emit(px, py, '#38bdf8', 6, 3, 1.5, 300);
        break;
      case 'midgard':
      default:
        game.particles.emit(px, py, currency.particleColor, 14, 4, 3, 400);
        game.particles.emit(px, py, '#fef08a', 8, 3, 2, 300);
        break;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const currency = getRealmCurrency(this.currentRealm);
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const t = this.animTimer / 1000;

      switch (this.currentRealm) {
        case 'asgard':
          this.drawAsgard(ctx, cx, cy, t, currency);
          break;
        case 'svartalfheim':
          this.drawSvartalfheim(ctx, cx, cy, t, currency);
          break;
        case 'alfheim':
          this.drawAlfheim(ctx, cx, cy, t, currency);
          break;
        case 'vanaheim':
          this.drawVanaheim(ctx, cx, cy, t, currency);
          break;
        case 'jotunheim':
          this.drawJotunheim(ctx, cx, cy, t, currency);
          break;
        case 'niflheim':
          this.drawNiflheim(ctx, cx, cy, t, currency);
          break;
        case 'muspelheim':
          this.drawMuspelheim(ctx, cx, cy, t, currency);
          break;
        case 'helheim':
          this.drawHelheim(ctx, cx, cy, t, currency);
          break;
        case 'midgard':
        default:
          this.drawMidgard(ctx, cx, cy, t, currency);
          break;
      }
    });
  }

  // ═════════════════════════════════════════════════════════════
  // 1. MIDGARD: Solflower (Sacred Flora)
  // ═════════════════════════════════════════════════════════════
  private drawMidgard(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    const sway = Math.sin(t * 2) * 2.5;

    // Green natural stem
    ctx.strokeStyle = '#4caf50';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 34);
    ctx.quadraticCurveTo(cx - sway * 0.5, cy + 12, cx + sway, cy - 8);
    ctx.stroke();

    // Leaves
    ctx.fillStyle = '#388e3c';
    ctx.beginPath();
    ctx.ellipse(cx - 14, cy + 18, 12, 6, -0.4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + 14, cy + 14, 12, 6, 0.4, 0, Math.PI * 2);
    ctx.fill();

    // Solar Petal Halo
    const headX = cx + sway;
    const headY = cy - 10;
    ctx.shadowBlur = 18;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#fde047';

    const numPetals = 10;
    const petalRotation = t * 0.4;
    for (let i = 0; i < numPetals; i++) {
      const angle = (Math.PI * 2 / numPetals) * i + petalRotation;
      const px = headX + Math.cos(angle) * 19;
      const py = headY + Math.sin(angle) * 19;
      ctx.beginPath();
      ctx.ellipse(px, py, 11, 7, angle, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;

    // Brown Sun-Heart Center Disk
    ctx.fillStyle = '#854d0e';
    ctx.beginPath();
    ctx.arc(headX, headY, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ca8a04';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Smiling face with shiny eyes
    ctx.fillStyle = '#1c1917';
    ctx.beginPath();
    ctx.arc(headX - 5, headY - 3, 2.5, 0, Math.PI * 2);
    ctx.arc(headX + 5, headY - 3, 2.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(headX - 6, headY - 4, 1, 0, Math.PI * 2);
    ctx.arc(headX + 4, headY - 4, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.6;
    ctx.beginPath();
    ctx.arc(headX, headY + 3, 4.5, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }

  // ═════════════════════════════════════════════════════════════
  // 2. ASGARD: Draupnir Font (Divine Relic Tower)
  // ═════════════════════════════════════════════════════════════
  private drawAsgard(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Stepped Marble & Gold Altar Pedestal
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(cx - 24, cy + 26, 48, 10, 3);
    ctx.fill();
    ctx.stroke();

    // Pedestal Pillar with Gold Inlay
    ctx.fillStyle = '#f1f5f9';
    ctx.fillRect(cx - 12, cy + 6, 24, 20);
    ctx.strokeRect(cx - 12, cy + 6, 24, 20);

    // Glowing Golden Fehu Rune ᚠ
    ctx.fillStyle = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b';
    ctx.font = 'bold 12px serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('ᚠ', cx, cy + 16);
    ctx.shadowBlur = 0;

    // Gilded Font Basin
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, 22, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Molten Gold in Basin
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 5, 17, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Levitating Draupnir Golden Ring
    const ringY = cy - 18 + Math.sin(t * 2) * 3;
    const ringScaleX = 14 + Math.sin(t * 3) * 2;
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = currency.color;
    ctx.strokeStyle = '#fde047';
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.ellipse(cx, ringY, ringScaleX, 8, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.ellipse(cx, ringY, ringScaleX - 2, 6, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Falling Molten Gold Droplet
    const dropPhase = (t * 1.6) % 1;
    const dropY = ringY + 6 + dropPhase * (cy + 4 - (ringY + 6));
    if (dropPhase < 0.95) {
      ctx.fillStyle = '#fde047';
      ctx.beginPath();
      ctx.ellipse(cx, dropY, 2.5, 3.5, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ═════════════════════════════════════════════════════════════
  // 3. SVARTALFHEIM: Forge Bellows (Dwarven Tower)
  // ═════════════════════════════════════════════════════════════
  private drawSvartalfheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Heavy Dwarven Basalt Furnace Chassis
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy - 2, 44, 38, 5);
    ctx.fill();
    ctx.stroke();

    // Riveted Bronze Reinforcing Bands
    ctx.fillStyle = '#b45309';
    ctx.fillRect(cx - 22, cy + 4, 44, 3);
    ctx.fillRect(cx - 22, cy + 30, 44, 3);

    // Glowing Molten Fire Hearth Arch
    const heatPulse = (Math.sin(t * 5) + 1) / 2;
    ctx.save();
    ctx.shadowBlur = 16 + heatPulse * 8;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.arc(cx, cy + 22, 10, Math.PI, 0, false);
    ctx.lineTo(cx + 10, cy + 30);
    ctx.lineTo(cx - 10, cy + 30);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(cx, cy + 22, 6, Math.PI, 0, false);
    ctx.lineTo(cx + 6, cy + 30);
    ctx.lineTo(cx - 6, cy + 30);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // Hearth iron grate
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 6, cy + 18);
    ctx.lineTo(cx - 6, cy + 30);
    ctx.moveTo(cx, cy + 14);
    ctx.lineTo(cx, cy + 30);
    ctx.moveTo(cx + 6, cy + 18);
    ctx.lineTo(cx + 6, cy + 30);
    ctx.stroke();

    // Exhaust Chimney on top
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 16, cy - 18, 10, 16);
    ctx.strokeRect(cx - 16, cy - 18, 10, 16);

    // Chimney Smoke Ring puff
    const smokePhase = (t * 2.2) % 1;
    const smokeY = cy - 18 - smokePhase * 18;
    ctx.fillStyle = `rgba(203, 213, 225, ${0.7 - smokePhase * 0.7})`;
    ctx.beginPath();
    ctx.ellipse(cx - 11, smokeY, 4 + smokePhase * 5, 2.5 + smokePhase * 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Mechanical Bellows on right side (animated compression)
    const bellowsCompress = Math.sin(t * 3.5) * 4;
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx + 22, cy + 8);
    ctx.lineTo(cx + 34 + bellowsCompress, cy + 12);
    ctx.lineTo(cx + 34 + bellowsCompress, cy + 26);
    ctx.lineTo(cx + 22, cy + 28);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Handle
    ctx.strokeStyle = '#d97706';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx + 34 + bellowsCompress, cy + 19);
    ctx.lineTo(cx + 39 + bellowsCompress, cy + 19);
    ctx.stroke();

    // Glowing newly-cast Dwarven Ingot sitting in front
    ctx.fillStyle = '#fde047';
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy + 35);
    ctx.lineTo(cx + 8, cy + 35);
    ctx.lineTo(cx + 6, cy + 31);
    ctx.lineTo(cx - 6, cy + 31);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  // ═════════════════════════════════════════════════════════════
  // 4. ALFHEIM: Sunstone Prism (Sacred Flora)
  // ═════════════════════════════════════════════════════════════
  private drawAlfheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Ethereal crystalline pedicel stem
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 35);
    ctx.lineTo(cx, cy);
    ctx.stroke();

    // Crystalline leaves
    ctx.fillStyle = 'rgba(56, 189, 248, 0.4)';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(cx, cy + 24);
    ctx.lineTo(cx - 16, cy + 14);
    ctx.lineTo(cx - 6, cy + 22);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, cy + 18);
    ctx.lineTo(cx + 16, cy + 8);
    ctx.lineTo(cx + 6, cy + 16);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Rotating Crystal Lotus Petals
    const lotusRotation = t * 0.5;
    ctx.save();
    ctx.translate(cx, cy - 8);
    ctx.shadowBlur = 18;
    ctx.shadowColor = currency.color;

    for (let i = 0; i < 8; i++) {
      const angle = (Math.PI * 2 / 8) * i + lotusRotation;
      const petLen = 20 + Math.sin(t * 3 + i) * 2;
      ctx.save();
      ctx.rotate(angle);
      ctx.fillStyle = i % 2 === 0 ? 'rgba(224, 242, 254, 0.85)' : 'rgba(56, 189, 248, 0.75)';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(6, -petLen * 0.6);
      ctx.lineTo(0, -petLen);
      ctx.lineTo(-6, -petLen * 0.6);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // Central Sunstone Prism Diamond Gem
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(7, 0);
    ctx.lineTo(0, 9);
    ctx.lineTo(-7, 0);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Prismatic facet lines
    ctx.strokeStyle = '#7dd3fc';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(0, -9);
    ctx.lineTo(0, 9);
    ctx.moveTo(-7, 0);
    ctx.lineTo(7, 0);
    ctx.stroke();

    ctx.restore();
  }

  // ═════════════════════════════════════════════════════════════
  // 5. VANAHEIM: Amber Sapling (Sacred Flora)
  // ═════════════════════════════════════════════════════════════
  private drawVanaheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    const sway = Math.sin(t * 1.8) * 2;

    // Twisting Golden Tree Trunk
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 7;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(cx, cy + 35);
    ctx.quadraticCurveTo(cx - 4, cy + 18, cx + sway, cy);
    ctx.stroke();

    // Branches
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.moveTo(cx + sway, cy);
    ctx.quadraticCurveTo(cx - 14, cy - 8, cx - 18 + sway, cy - 14);
    ctx.moveTo(cx + sway, cy);
    ctx.quadraticCurveTo(cx + 14, cy - 8, cx + 18 + sway, cy - 14);
    ctx.moveTo(cx + sway, cy);
    ctx.lineTo(cx + sway, cy - 20);
    ctx.stroke();

    // Vibrant Golden-Emerald Leaf Foliage
    ctx.fillStyle = '#84cc16';
    ctx.strokeStyle = '#4d7c0f';
    ctx.lineWidth = 1;

    const leafClusters = [
      { x: cx - 18 + sway, y: cy - 16, r: 8 },
      { x: cx + 18 + sway, y: cy - 16, r: 8 },
      { x: cx + sway, y: cy - 22, r: 10 },
      { x: cx - 8 + sway, y: cy - 10, r: 6 },
      { x: cx + 8 + sway, y: cy - 10, r: 6 }
    ];

    leafClusters.forEach(c => {
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    });

    // Hanging Translucent Amber Teardrop Resin Jewel
    const dripPhase = (t * 1.5) % 1;
    const tearY = cy - 4 + dripPhase * 24;
    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.moveTo(cx + sway, tearY);
    ctx.quadraticCurveTo(cx - 4 + sway, tearY + 6, cx + sway, tearY + 9);
    ctx.quadraticCurveTo(cx + 4 + sway, tearY + 6, cx + sway, tearY);
    ctx.fill();
    ctx.restore();

    // Golden Amber Pool at base
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 34, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();
  }

  // ═════════════════════════════════════════════════════════════
  // 6. JÖTUNHEIM: Rime Geyser (Glacial Tower)
  // ═════════════════════════════════════════════════════════════
  private drawJotunheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Jagged Craggy Ice Base
    ctx.fillStyle = '#0891b2';
    ctx.strokeStyle = '#155e75';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy + 35);
    ctx.lineTo(cx - 18, cy + 24);
    ctx.lineTo(cx + 18, cy + 24);
    ctx.lineTo(cx + 24, cy + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Chiseled Glacial Ice Monolith Spire
    ctx.save();
    ctx.shadowBlur = 16;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.moveTo(cx - 14, cy + 24);
    ctx.lineTo(cx - 10, cy - 14);
    ctx.lineTo(cx, cy - 28);
    ctx.lineTo(cx + 10, cy - 14);
    ctx.lineTo(cx + 14, cy + 24);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Facet shading
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(cx, cy - 28);
    ctx.lineTo(cx + 10, cy - 14);
    ctx.lineTo(cx + 14, cy + 24);
    ctx.lineTo(cx, cy + 24);
    ctx.closePath();
    ctx.fill();

    // Inscribed Glowing Isa Frost Rune ᛁ
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 14);
    ctx.stroke();
    ctx.restore();

    // Frost Vapor plumes swirling from fissures
    const plumeCycle = (t * 2) % 1;
    ctx.fillStyle = `rgba(207, 250, 254, ${0.6 - plumeCycle * 0.6})`;
    ctx.beginPath();
    ctx.arc(cx - 12 - plumeCycle * 6, cy - 4 - plumeCycle * 10, 4 + plumeCycle * 4, 0, Math.PI * 2);
    ctx.arc(cx + 12 + plumeCycle * 6, cy - 6 - plumeCycle * 10, 4 + plumeCycle * 4, 0, Math.PI * 2);
    ctx.fill();
  }

  // ═════════════════════════════════════════════════════════════
  // 7. NIFLHEIM: Hvergelmir Well (Primordial Shrine)
  // ═════════════════════════════════════════════════════════════
  private drawNiflheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Ancient Slate Stone Basin
    ctx.fillStyle = '#334155';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(cx - 22, cy + 10, 44, 25, 4);
    ctx.fill();
    ctx.stroke();

    // Stone Brick Fissures
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 18);
    ctx.lineTo(cx + 8, cy + 18);
    ctx.moveTo(cx - 18, cy + 26);
    ctx.lineTo(cx + 18, cy + 26);
    ctx.stroke();

    // Well Lip Rim
    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Deep Dark Well Hole
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 18, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Overflowing Cascading Mist
    const mistWave = Math.sin(t * 2) * 2;
    ctx.save();
    ctx.shadowBlur = 14;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = 'rgba(207, 250, 254, 0.75)';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 10, 20 + mistWave, 5.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cascading mist curls over edges
    ctx.beginPath();
    ctx.arc(cx - 16, cy + 14, 5, 0, Math.PI);
    ctx.arc(cx, cy + 15, 6, 0, Math.PI);
    ctx.arc(cx + 16, cy + 14, 5, 0, Math.PI);
    ctx.fill();
    ctx.restore();

    // Levitating Mist Crystal Vapor Orb
    const orbY = cy - 8 + Math.sin(t * 1.8) * 3;
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = 'rgba(165, 243, 252, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, orbY, 9, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 2, orbY - 2, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // ═════════════════════════════════════════════════════════════
  // 8. MUSPELHEIM: Magma Font (Volcanic Tower)
  // ═════════════════════════════════════════════════════════════
  private drawMuspelheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Volcanic Basalt Pedestal Base
    ctx.fillStyle = '#1c1917';
    ctx.strokeStyle = '#450a0a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx - 22, cy + 35);
    ctx.lineTo(cx - 14, cy + 18);
    ctx.lineTo(cx + 14, cy + 18);
    ctx.lineTo(cx + 22, cy + 35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Glowing Lava Fissure cracks
    ctx.strokeStyle = '#f97316';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 10, cy + 32);
    ctx.lineTo(cx - 4, cy + 24);
    ctx.lineTo(cx + 6, cy + 28);
    ctx.stroke();

    // Volcanic Brazier Bowl
    ctx.fillStyle = '#292524';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Bubbling Molten Lava Surface
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 16, 18, 4.5, 0, 0, Math.PI * 2);
    ctx.fill();

    // Dancing Fire Flames leaping upward
    const flameY = cy + 16;
    ctx.save();
    ctx.shadowBlur = 20;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#f97316';

    const f1 = Math.sin(t * 8) * 3;
    const f2 = Math.cos(t * 7) * 3;
    const f3 = Math.sin(t * 9) * 2;

    ctx.beginPath();
    ctx.moveTo(cx - 16, flameY);
    ctx.quadraticCurveTo(cx - 12 + f1, flameY - 18, cx - 8, flameY - 26 + f1);
    ctx.quadraticCurveTo(cx - 4, flameY - 14, cx, flameY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx - 4, flameY);
    ctx.quadraticCurveTo(cx + f2, flameY - 24, cx + 4, flameY - 32 + f2);
    ctx.quadraticCurveTo(cx + 8, flameY - 16, cx + 12, flameY);
    ctx.closePath();
    ctx.fill();

    ctx.beginPath();
    ctx.moveTo(cx + 6, flameY);
    ctx.quadraticCurveTo(cx + 12 + f3, flameY - 16, cx + 14, flameY - 24 + f3);
    ctx.quadraticCurveTo(cx + 16, flameY - 10, cx + 18, flameY);
    ctx.closePath();
    ctx.fill();

    // Bright yellow inner core flame
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.moveTo(cx - 8, flameY);
    ctx.quadraticCurveTo(cx + f2, flameY - 16, cx, flameY - 22 + f2);
    ctx.quadraticCurveTo(cx + 4, flameY - 10, cx + 8, flameY);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // ═════════════════════════════════════════════════════════════
  // 9. HELHEIM: Soul Beacon (Necrotic Tower)
  // ═════════════════════════════════════════════════════════════
  private drawHelheim(ctx: CanvasRenderingContext2D, cx: number, cy: number, t: number, currency: RealmCurrency) {
    // Tombstone Base
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.roundRect(cx - 18, cy + 28, 36, 8, 3);
    ctx.fill();
    ctx.stroke();

    // Wrought Iron Lantern Post
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(cx - 3, cy + 12, 6, 18);

    // Spectral Chain draped around post
    ctx.strokeStyle = '#a855f7';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(cx, cy + 20, 7, 0, Math.PI);
    ctx.stroke();

    // Gothic Lantern Cage
    ctx.fillStyle = 'rgba(15, 23, 42, 0.7)';
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy + 12);
    ctx.lineTo(cx + 12, cy + 12);
    ctx.lineTo(cx + 9, cy - 8);
    ctx.lineTo(cx - 9, cy - 8);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Lantern Roof & Loop
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.moveTo(cx - 12, cy - 8);
    ctx.lineTo(cx + 12, cy - 8);
    ctx.lineTo(cx, cy - 20);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(cx, cy - 23, 3, 0, Math.PI * 2);
    ctx.stroke();

    // Dancing Violet Soul Flame inside cage
    ctx.save();
    ctx.shadowBlur = 18;
    ctx.shadowColor = currency.color;
    ctx.fillStyle = '#c084fc';
    const flameFlicker = Math.sin(t * 6) * 1.5;
    ctx.beginPath();
    ctx.ellipse(cx + flameFlicker * 0.5, cy + 2, 4.5, 7 + flameFlicker, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(cx, cy + 3, 2, 3.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Ghostly Spirit Wisps orbiting
    const wispAngle = t * 2.5;
    const wx = cx + Math.cos(wispAngle) * 18;
    const wy = cy - 2 + Math.sin(wispAngle * 1.5) * 8;
    ctx.fillStyle = 'rgba(216, 180, 254, 0.8)';
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#c084fc';
    ctx.beginPath();
    ctx.arc(wx, wy, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
