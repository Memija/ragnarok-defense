import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';
import { SnowProjectile } from '../entities/SnowProjectile';
import { FirePea } from './FirePea';

export class Torchwood extends Defender {
  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 300, 175, row, col); // Cost 175 sun
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    // Convert passing projectiles to fire peas
    for (let i = 0; i < game.projectiles.length; i++) {
      const p = game.projectiles[i];
      if (p.row === this.row && p.x + p.width > this.x && p.x < this.x + this.width) {
        if (p instanceof Pea || p instanceof SnowProjectile) {
           const firePea = new FirePea(p.x, p.y, p.row);
           game.projectiles[i] = firePea;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // --- Ground Shadow ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 36, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Stepped Basalt Stone Base ---
      const baseGrad = ctx.createLinearGradient(cx - 24, cy + 24, cx + 24, cy + 36);
      baseGrad.addColorStop(0, '#1c1917');
      baseGrad.addColorStop(0.5, '#292524');
      baseGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#44403c';
      ctx.lineWidth = 1.5;
      // Lower Tier
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy + 26, 48, 10, 2);
      ctx.fill();
      ctx.stroke();
      // Upper Tier
      ctx.beginPath();
      ctx.roundRect(cx - 19, cy + 18, 38, 9, 2);
      ctx.fill();
      ctx.stroke();

      // Base runic accents
      ctx.fillStyle = '#f97316';
      for (const ox of [-14, 0, 14]) {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + 31, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. Tapered Obsidian Spire Column ---
      const spireGrad = ctx.createLinearGradient(cx - 14, cy - 8, cx + 14, cy + 18);
      spireGrad.addColorStop(0, '#292524');
      spireGrad.addColorStop(0.3, '#44403c');
      spireGrad.addColorStop(0.7, '#292524');
      spireGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = spireGrad;
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1.5;

      // Tapered tower shaft polygon
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 18);
      ctx.lineTo(cx - 11, cy - 8);
      ctx.lineTo(cx + 11, cy - 8);
      ctx.lineTo(cx + 16, cy + 18);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Spire stone joints
      ctx.strokeStyle = 'rgba(12, 10, 9, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(cx - 14, cy + 6); ctx.lineTo(cx + 14, cy + 6);
      ctx.moveTo(cx - 12, cy - 1); ctx.lineTo(cx + 12, cy - 1);
      ctx.stroke();

      // --- 3. Glowing Flame Runes on the Column (ᚲ - Kaunan / Fire) ---
      const runeFlicker = 0.7 + Math.sin(this.animTimer / 90) * 0.3;
      ctx.save();
      ctx.shadowBlur = 12 * runeFlicker;
      ctx.shadowColor = '#ff5722';
      ctx.strokeStyle = `rgba(255, 183, 77, ${0.8 + runeFlicker * 0.2})`;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      // Kaunan flame rune symbol
      ctx.beginPath();
      ctx.moveTo(cx - 1, cy - 4);
      ctx.lineTo(cx - 1, cy + 14);
      ctx.moveTo(cx - 1, cy + 5);
      ctx.lineTo(cx + 6, cy);
      ctx.moveTo(cx - 1, cy + 5);
      ctx.lineTo(cx + 6, cy + 10);
      ctx.stroke();
      ctx.restore();

      // --- 4. Bronze / Iron Fire Brazier Basin (Crown) ---
      const brazierGrad = ctx.createLinearGradient(cx - 18, cy - 16, cx + 18, cy - 6);
      brazierGrad.addColorStop(0, '#b45309');
      brazierGrad.addColorStop(0.5, '#f59e0b');
      brazierGrad.addColorStop(1, '#78350f');
      ctx.fillStyle = brazierGrad;
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;

      // Flared Brazier Bowl
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 7);
      ctx.lineTo(cx - 18, cy - 15);
      ctx.lineTo(cx + 18, cy - 15);
      ctx.lineTo(cx + 12, cy - 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Brazier rim studs & cutouts
      ctx.fillStyle = '#fef08a';
      for (const bx of [-12, -4, 4, 12]) {
        ctx.fillRect(cx + bx - 1.5, cy - 14, 3, 4);
      }

      // --- 5. Roaring Beacon Fire Vortex (Living Flame) ---
      const fireWiggle1 = Math.sin(this.animTimer / 70) * 4;
      const fireWiggle2 = Math.cos(this.animTimer / 90) * 5;
      const firePulse = Math.sin(this.animTimer / 110) * 4;

      ctx.save();
      // Radiant heat aura
      ctx.shadowBlur = 22;
      ctx.shadowColor = '#ff3d00';

      // Outer Red/Orange Flame Body
      const fireGrad = ctx.createRadialGradient(cx, cy - 22, 4, cx, cy - 30, 26);
      fireGrad.addColorStop(0, '#ffff00');
      fireGrad.addColorStop(0.4, '#ff9100');
      fireGrad.addColorStop(0.8, '#ff3d00');
      fireGrad.addColorStop(1, 'rgba(183, 28, 28, 0)');

      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy - 15);
      ctx.quadraticCurveTo(cx - 22, cy - 32 + fireWiggle1, cx + fireWiggle2, cy - 46 + firePulse);
      ctx.quadraticCurveTo(cx + 22, cy - 32 - fireWiggle1, cx + 16, cy - 15);
      ctx.closePath();
      ctx.fill();

      // Secondary Tongue (Left curl)
      ctx.fillStyle = 'rgba(255, 145, 0, 0.7)';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 15);
      ctx.quadraticCurveTo(cx - 24 + fireWiggle2, cy - 30, cx - 8 + fireWiggle1, cy - 42);
      ctx.quadraticCurveTo(cx - 2, cy - 28, cx, cy - 15);
      ctx.closePath();
      ctx.fill();

      // Secondary Tongue (Right curl)
      ctx.fillStyle = 'rgba(255, 145, 0, 0.7)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 15);
      ctx.quadraticCurveTo(cx + 18 - fireWiggle1, cy - 28, cx + 10 - fireWiggle2, cy - 43);
      ctx.quadraticCurveTo(cx + 20, cy - 28, cx + 12, cy - 15);
      ctx.closePath();
      ctx.fill();

      // White-Hot Intense Inner Core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 8, cy - 15);
      ctx.quadraticCurveTo(cx - 10, cy - 26, cx + fireWiggle1 * 0.5, cy - 34);
      ctx.quadraticCurveTo(cx + 10, cy - 26, cx + 8, cy - 15);
      ctx.closePath();
      ctx.fill();

      // Rising Fire Embers / Sparks
      ctx.fillStyle = '#fff59d';
      const sparkY1 = ((this.animTimer * 0.08) % 25);
      const sparkY2 = ((this.animTimer * 0.06 + 12) % 25);
      ctx.beginPath();
      ctx.arc(cx - 5 + fireWiggle1, cy - 25 - sparkY1, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 6 - fireWiggle2, cy - 25 - sparkY2, 1.5, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    });
  }
}
