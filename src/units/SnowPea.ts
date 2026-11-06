import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { SnowProjectile } from '../entities/SnowProjectile';
import { SoundManager } from '../engine/SoundManager';

export class SnowPea extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1500;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 175, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.fireTimer += deltaTime;
    
    this.scaleY = 1 + Math.sin(this.animTimer / 200) * 0.05;
    this.scaleX = 1 - Math.sin(this.animTimer / 200) * 0.02;
    
    if (this.fireTimer >= this.fireRate) {
      const isZombieInRow = game.hasAttackerInRow(this.row, this.x);
      if (isZombieInRow) {
        this.fireTimer = 0;
        game.projectiles.push(new SnowProjectile(this.x + this.width, this.y + 10, this.row));
        SoundManager.getInstance().playShoot('ice');
        this.recoilX = -10; 
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const floatY = Math.sin(this.animTimer / 220 + this.col) * 3.2;
      const chargeRatio = Math.min(1, this.fireTimer / this.fireRate);

      // 1. Frozen Ground Shadow & Niflheim Rime Frost Ring
      ctx.fillStyle = 'rgba(2, 132, 199, 0.25)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(186, 230, 253, 0.55)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 20, 5.5, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Jagged Glacial Ice Pedestal at Base
      const baseSpikes = [
        { x1: -18, y1: 33, x2: -12, y2: 20, x3: -5, y3: 33, c: '#38bdf8' },
        { x1: 5, y1: 33, x2: 12, y2: 20, x3: 18, y3: 33, c: '#38bdf8' },
        { x1: -10, y1: 34, x2: 0, y2: 14, x3: 10, y3: 34, c: '#7dd3fc' },
      ];
      for (const sp of baseSpikes) {
        const spGrad = ctx.createLinearGradient(cx + sp.x2, cy + sp.y2, cx + sp.x2, cy + sp.y1);
        spGrad.addColorStop(0, '#e0f2fe');
        spGrad.addColorStop(0.5, sp.c);
        spGrad.addColorStop(1, '#0369a1');
        ctx.fillStyle = spGrad;
        ctx.strokeStyle = '#0c4a6e';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cx + sp.x1, cy + sp.y1);
        ctx.lineTo(cx + sp.x2, cy + sp.y2);
        ctx.lineTo(cx + sp.x3, cy + sp.y3);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 3. Ethereal Frost Conduit Stem
      const headX = cx;
      const headY = cy - 11 + floatY;

      const stemGrad = ctx.createLinearGradient(cx, headY + 10, cx, cy + 28);
      stemGrad.addColorStop(0, '#bae6fd');
      stemGrad.addColorStop(0.5, '#38bdf8');
      stemGrad.addColorStop(1, '#0284c7');
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 8.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 28);
      ctx.lineTo(headX - 1, headY + 10);
      ctx.stroke();

      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 28);
      ctx.lineTo(headX - 1, headY + 10);
      ctx.stroke();

      // 4. Niflheim 8-Point Frost Star Halo Behind Head
      ctx.save();
      ctx.translate(headX - 2, headY);
      ctx.rotate(this.animTimer * 0.0008);
      ctx.strokeStyle = `rgba(186, 230, 253, ${0.38 + chargeRatio * 0.35})`;
      ctx.lineWidth = 1.3;
      for (let i = 0; i < 4; i++) {
        const ang = (i * Math.PI) / 4;
        ctx.beginPath();
        ctx.moveTo(Math.cos(ang) * -22, Math.sin(ang) * -22);
        ctx.lineTo(Math.cos(ang) * 22, Math.sin(ang) * 22);
        ctx.stroke();
      }
      ctx.restore();

      // 5. Crown of 3 Sharp Ice Crystal Spires
      const crownSpires = [
        { bx1: -15, by1: -5, tx: -25, ty: -16, bx2: -9, by2: -12 },
        { bx1: -11, by1: -11, tx: -16, ty: -26, bx2: -2, by2: -15 },
        { bx1: -4, by1: -14, tx: -3, ty: -27, bx2: 5, by2: -14 },
      ];
      for (const cr of crownSpires) {
        const crGrad = ctx.createLinearGradient(headX + cr.tx, headY + cr.ty, headX + cr.bx1, headY + cr.by1);
        crGrad.addColorStop(0, '#ffffff');
        crGrad.addColorStop(0.5, '#7dd3fc');
        crGrad.addColorStop(1, '#0284c7');
        ctx.fillStyle = crGrad;
        ctx.strokeStyle = '#075985';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(headX + cr.bx1, headY + cr.by1);
        ctx.lineTo(headX + cr.tx, headY + cr.ty);
        ctx.lineTo(headX + cr.bx2, headY + cr.by2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 6. Crystalline Frost Sprite Head (Luminous Glacial Sphere with Facets)
      ctx.save();
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12 + chargeRatio * 8;
      const bodyGrad = ctx.createRadialGradient(headX - 6, headY - 6, 2, headX - 2, headY, 18);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.32, '#bae6fd');
      bodyGrad.addColorStop(0.7, '#0ea5e9');
      bodyGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(headX - 2, headY, 16.5, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();

      // Internal geometric crystal facet lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(headX - 12, headY - 4);
      ctx.lineTo(headX - 5, headY - 10);
      ctx.lineTo(headX + 2, headY - 4);
      ctx.lineTo(headX - 5, headY + 5);
      ctx.closePath();
      ctx.stroke();

      // 7. Faceted Ice Cannon Nozzle
      const nozzleGrad = ctx.createLinearGradient(headX + 8, headY - 9, headX + 24, headY + 9);
      nozzleGrad.addColorStop(0, '#e0f2fe');
      nozzleGrad.addColorStop(0.5, '#38bdf8');
      nozzleGrad.addColorStop(1, '#0369a1');
      ctx.fillStyle = nozzleGrad;
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(headX + 9, headY - 7);
      ctx.lineTo(headX + 22, headY - 9.5);
      ctx.lineTo(headX + 22, headY + 9.5);
      ctx.lineTo(headX + 9, headY + 7);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Frosted Silver-Gold Collar Band
      ctx.fillStyle = '#e0f2fe';
      ctx.strokeStyle = '#0284c7';
      ctx.lineWidth = 1;
      ctx.fillRect(headX + 14, headY - 8, 3, 16);

      // Crystalline Muzzle Aperture
      ctx.fillStyle = '#7dd3fc';
      ctx.strokeStyle = '#0c4a6e';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.ellipse(headX + 22, headY, 4.4, 9.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#082f49';
      ctx.beginPath();
      ctx.ellipse(headX + 22.5, headY, 2.6, 6.8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Charging Frost Shard Core inside Muzzle
      if (chargeRatio > 0.2) {
        const frostAlpha = (chargeRatio - 0.2) / 0.8;
        ctx.save();
        ctx.fillStyle = `rgba(224, 242, 254, ${frostAlpha * 0.95})`;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 10 * frostAlpha;
        ctx.beginPath();
        ctx.arc(headX + 22, headY, 2.2 + frostAlpha * 2.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. Piercing Luminous Ice Eye
      ctx.fillStyle = '#082f49';
      ctx.beginPath();
      ctx.ellipse(headX + 4, headY - 4.8, 3.5, 4.2, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 4.8, headY - 6.2, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#7dd3fc';
      ctx.beginPath();
      ctx.arc(headX + 3, headY - 3.2, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // 9. Orbiting Niflheim Ice Motes
      for (let m = 0; m < 3; m++) {
        const mAngle = this.animTimer * 0.003 + (m * Math.PI * 2) / 3;
        const mx = headX - 2 + Math.cos(mAngle) * 21;
        const my = headY + Math.sin(mAngle) * 11;
        ctx.fillStyle = '#e0f2fe';
        ctx.beginPath();
        ctx.arc(mx, my, 1.8, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}
