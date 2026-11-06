import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';
import { SoundManager } from '../engine/SoundManager';

export class Repeater extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1500;
  isFiringSecond: boolean = false;
  secondFireTimer: number = 0;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 200, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.fireTimer += deltaTime;
    
    this.scaleY = 1 + Math.sin(this.animTimer / 200) * 0.05;
    this.scaleX = 1 - Math.sin(this.animTimer / 200) * 0.02;
    
    if (this.isFiringSecond) {
      this.secondFireTimer += deltaTime;
      if (this.secondFireTimer >= 150) { 
        this.isFiringSecond = false;
        game.projectiles.push(new Pea(this.x + this.width, this.y + 10, this.row));
        SoundManager.getInstance().playShoot('pea');
        this.recoilX = -10;
      }
    } else if (this.fireTimer >= this.fireRate) {
      const isZombieInRow = game.hasAttackerInRow(this.row, this.x);
      if (isZombieInRow) {
        this.fireTimer = 0;
        game.projectiles.push(new Pea(this.x + this.width, this.y + 10, this.row));
        SoundManager.getInstance().playShoot('pea');
        this.recoilX = -10;
        this.isFiringSecond = true;
        this.secondFireTimer = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const sway = Math.sin(this.animTimer / 240 + this.col) * 2.2;
      const chargeRatio = Math.min(1, this.fireTimer / this.fireRate);

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Jagged Vanaheim Battle-Leaf Base (4 armored leaves)
      const battleLeaves = [
        { angle: -0.5, rx: 16, ry: 6.5, ox: -11, oy: 29 },
        { angle: 0.5, rx: 16, ry: 6.5, ox: 11, oy: 29 },
        { angle: -0.2, rx: 14, ry: 5.5, ox: -5, oy: 32 },
        { angle: 0.2, rx: 14, ry: 5.5, ox: 5, oy: 32 },
      ];
      for (const leaf of battleLeaves) {
        ctx.save();
        ctx.translate(cx + leaf.ox, cy + leaf.oy);
        ctx.rotate(leaf.angle);
        const leafGrad = ctx.createLinearGradient(-leaf.rx, 0, leaf.rx, 0);
        leafGrad.addColorStop(0, '#22c55e');
        leafGrad.addColorStop(0.5, '#15803d');
        leafGrad.addColorStop(1, '#052e16');
        ctx.fillStyle = leafGrad;
        ctx.strokeStyle = '#022c22';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.rx, leaf.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(250, 204, 21, 0.6)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-leaf.rx * 0.65, 0);
        ctx.lineTo(leaf.rx * 0.65, 0);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Braided Double-Vine Stem
      const headX = cx + sway;
      const headY = cy - 10 + Math.abs(sway) * 0.25;

      // Back vine
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 7.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy + 29);
      ctx.quadraticCurveTo(cx + 5 + sway * 0.3, cy + 12, headX + 1, headY + 10);
      ctx.stroke();

      ctx.strokeStyle = '#15803d';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(cx + 4, cy + 29);
      ctx.quadraticCurveTo(cx + 5 + sway * 0.3, cy + 12, headX + 1, headY + 10);
      ctx.stroke();

      // Front primary vine
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 29);
      ctx.quadraticCurveTo(cx - 6 + sway * 0.5, cy + 11, headX - 3, headY + 10);
      ctx.stroke();

      const stemGrad = ctx.createLinearGradient(cx - 8, cy, cx + 4, cy + 29);
      stemGrad.addColorStop(0, '#4ade80');
      stemGrad.addColorStop(0.5, '#16a34a');
      stemGrad.addColorStop(1, '#14532d');
      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 6.2;
      ctx.beginPath();
      ctx.moveTo(cx - 4, cy + 29);
      ctx.quadraticCurveTo(cx - 6 + sway * 0.5, cy + 11, headX - 3, headY + 10);
      ctx.stroke();

      // 4. Fierce 3-Point Vanaheim Warrior Leaf Crest on Crown & Back
      const crests = [
        { mx: -6, my: -13, cx1: -18, cy1: -28, tx: -12, ty: -14, color: '#4ade80' },
        { mx: -11, my: -9, cx1: -28, cy1: -22, tx: -23, ty: -6, color: '#22c55e' },
        { mx: -14, my: -3, cx1: -29, cy1: -8, tx: -22, ty: 4, color: '#16a34a' },
      ];
      for (const c of crests) {
        ctx.fillStyle = c.color;
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(headX + c.mx, headY + c.my);
        ctx.quadraticCurveTo(headX + c.cx1, headY + c.cy1, headX + c.tx, headY + c.ty);
        ctx.lineTo(headX - 8, headY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 5. Heavy Armored Floral Pod Head
      const headGrad = ctx.createRadialGradient(headX - 6, headY - 7, 3, headX - 3, headY, 19);
      headGrad.addColorStop(0, '#bbf7d0');
      headGrad.addColorStop(0.25, '#4ade80');
      headGrad.addColorStop(0.68, '#15803d');
      headGrad.addColorStop(1, '#052e16');
      ctx.fillStyle = headGrad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.7;
      ctx.beginPath();
      ctx.ellipse(headX - 3, headY, 17.5, 16, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Golden Dual-Chevron War Rune on Cheek
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.5 + chargeRatio * 0.45})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(headX - 11, headY - 1);
      ctx.lineTo(headX - 7, headY + 3);
      ctx.lineTo(headX - 11, headY + 7);
      ctx.moveTo(headX - 7, headY - 1);
      ctx.lineTo(headX - 3, headY + 3);
      ctx.lineTo(headX - 7, headY + 7);
      ctx.stroke();

      // 6. Twin Over-Under / Offset Heavy Barrels with Brass Runic Collars
      const barrels = [
        // Upper-back barrel (fires second burst shot)
        { ox: 12, oy: -6.5, rx: 11, ry: 6, recoil: this.isFiringSecond ? -2.5 : 0 },
        // Lower-front barrel (fires first burst shot)
        { ox: 10, oy: 5.5, rx: 11, ry: 6.5, recoil: !this.isFiringSecond && this.fireTimer < 140 ? -2.5 : 0 },
      ];

      for (const b of barrels) {
        const bx = headX + b.ox + b.recoil;
        const by = headY + b.oy;

        // Barrel tube
        const bGrad = ctx.createLinearGradient(bx - 4, by - b.ry, bx + 12, by + b.ry);
        bGrad.addColorStop(0, '#4ade80');
        bGrad.addColorStop(0.55, '#15803d');
        bGrad.addColorStop(1, '#052e16');
        ctx.fillStyle = bGrad;
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.moveTo(bx - 3, by - b.ry * 0.8);
        ctx.lineTo(bx + 12, by - b.ry);
        ctx.lineTo(bx + 12, by + b.ry);
        ctx.lineTo(bx - 3, by + b.ry * 0.8);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Burnished Brass Collar Ring
        const brassGrad = ctx.createLinearGradient(bx + 5, by - b.ry, bx + 5, by + b.ry);
        brassGrad.addColorStop(0, '#fef08a');
        brassGrad.addColorStop(0.5, '#d97706');
        brassGrad.addColorStop(1, '#78350f');
        ctx.fillStyle = brassGrad;
        ctx.fillRect(bx + 4.5, by - b.ry * 0.9, 2.8, b.ry * 1.8);

        // Muzzle Lip & Bore
        ctx.fillStyle = '#22c55e';
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.ellipse(bx + 12, by, 3.8, b.ry + 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#02180b';
        ctx.beginPath();
        ctx.ellipse(bx + 12.5, by, 2.4, b.ry - 1.4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Charging emerald plasma in both barrels
        if (chargeRatio > 0.3 || this.isFiringSecond) {
          const glowA = this.isFiringSecond ? 1 : (chargeRatio - 0.3) / 0.7;
          ctx.save();
          ctx.fillStyle = `rgba(134, 239, 172, ${glowA * 0.9})`;
          ctx.shadowColor = '#4ade80';
          ctx.shadowBlur = 7 * glowA;
          ctx.beginPath();
          ctx.arc(bx + 12, by, 1.8 + glowA * 1.8, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Fierce Determined Eye & Angled Warrior Brow
      ctx.fillStyle = '#052e16';
      ctx.beginPath();
      ctx.ellipse(headX + 2.5, headY - 5.5, 3.8, 4.4, -0.15, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 3.6, headY - 7, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(headX + 1.8, headY - 3.8, 0.9, 0, Math.PI * 2);
      ctx.fill();

      // Thick angled warrior brow
      ctx.fillStyle = '#14532d';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(headX - 3.5, headY - 11.5);
      ctx.lineTo(headX + 8.5, headY - 7.5);
      ctx.lineTo(headX + 7.5, headY - 5.2);
      ctx.lineTo(headX - 4, headY - 9);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    });
  }
}
