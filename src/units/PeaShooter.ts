import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';
import { SoundManager } from '../engine/SoundManager';

export class PeaShooter extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1500;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 100, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    const zombieInRow = game.hasAttackerInRow(this.row, this.x);
    if (zombieInRow) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireRate) {
        this.fireTimer = 0;
        game.projectiles.push(new Pea(this.x + this.width, this.y + this.height / 2 - 10, this.row));
        SoundManager.getInstance().playShoot('pea');
        
        this.recoilX = -15;
        this.scaleX = 0.8;
        this.scaleY = 1.2;
      }
    } else {
      this.fireTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const sway = Math.sin(this.animTimer / 280 + this.col) * 2.2;
      const chargeRatio = Math.min(1, this.fireTimer / this.fireRate);

      // 1. Ground Shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 22, 6.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // 2. Vanaheim Rooted Leaf Base (3 sculpted leaves with golden veins)
      const baseLeaves = [
        { angle: -0.42, rx: 15, ry: 6, ox: -9, oy: 30 },
        { angle: 0.42, rx: 15, ry: 6, ox: 9, oy: 30 },
        { angle: 0, rx: 13, ry: 5.2, ox: 0, oy: 32 },
      ];
      for (const leaf of baseLeaves) {
        ctx.save();
        ctx.translate(cx + leaf.ox, cy + leaf.oy);
        ctx.rotate(leaf.angle);
        const leafGrad = ctx.createLinearGradient(-leaf.rx, -leaf.ry, leaf.rx, leaf.ry);
        leafGrad.addColorStop(0, '#4ade80');
        leafGrad.addColorStop(0.55, '#16a34a');
        leafGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = leafGrad;
        ctx.strokeStyle = '#052e16';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.rx, leaf.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Golden Vanaheim central leaf vein
        ctx.strokeStyle = 'rgba(250, 204, 21, 0.55)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(-leaf.rx * 0.65, 0);
        ctx.lineTo(leaf.rx * 0.65, 0);
        ctx.stroke();
        ctx.restore();
      }

      // 3. Curved Swaying Vine Stem
      const headX = cx + sway;
      const headY = cy - 9 + Math.abs(sway) * 0.25;

      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 10;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 29);
      ctx.quadraticCurveTo(cx - 5 + sway * 0.4, cy + 12, headX - 2, headY + 9);
      ctx.stroke();

      const stemGrad = ctx.createLinearGradient(cx - 5, cy - 5, cx + 5, cy + 30);
      stemGrad.addColorStop(0, '#4ade80');
      stemGrad.addColorStop(0.5, '#16a34a');
      stemGrad.addColorStop(1, '#14532d');
      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 7.2;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 29);
      ctx.quadraticCurveTo(cx - 5 + sway * 0.4, cy + 12, headX - 2, headY + 9);
      ctx.stroke();

      // 4. Neck Leaf Collar (Calyx)
      ctx.fillStyle = '#15803d';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.1;
      ctx.beginPath();
      ctx.moveTo(headX - 12, headY + 9);
      ctx.quadraticCurveTo(headX - 2, headY + 17, headX + 10, headY + 9);
      ctx.quadraticCurveTo(headX - 2, headY + 12, headX - 12, headY + 9);
      ctx.fill();
      ctx.stroke();

      // 5. Dorsal Leaf Crest (Sweeping back leaves behind head)
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(headX - 11, headY - 9);
      ctx.quadraticCurveTo(headX - 27, headY - 19, headX - 24, headY - 4);
      ctx.quadraticCurveTo(headX - 20, headY + 2, headX - 13, headY);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#16a34a';
      ctx.beginPath();
      ctx.moveTo(headX - 13, headY - 2);
      ctx.quadraticCurveTo(headX - 25, headY - 4, headX - 20, headY + 6);
      ctx.quadraticCurveTo(headX - 16, headY + 7, headX - 11, headY + 3);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // 6. Main Floral Pod Head
      const podGrad = ctx.createRadialGradient(headX - 6, headY - 7, 3, headX - 2, headY, 18);
      podGrad.addColorStop(0, '#bbf7d0');
      podGrad.addColorStop(0.28, '#4ade80');
      podGrad.addColorStop(0.72, '#16a34a');
      podGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = podGrad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.ellipse(headX - 2, headY, 16.5, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Subtle Vanaheim glowing rune mark on cheek
      ctx.strokeStyle = `rgba(250, 204, 21, ${0.42 + chargeRatio * 0.45})`;
      ctx.lineWidth = 1.3;
      ctx.beginPath();
      ctx.moveTo(headX - 8, headY + 2);
      ctx.lineTo(headX - 4.5, headY - 1);
      ctx.lineTo(headX - 4.5, headY + 6.5);
      ctx.stroke();

      // 7. Trumpet Snout / Barrel
      const snoutGrad = ctx.createLinearGradient(headX + 6, headY - 10, headX + 24, headY + 10);
      snoutGrad.addColorStop(0, '#4ade80');
      snoutGrad.addColorStop(0.5, '#16a34a');
      snoutGrad.addColorStop(1, '#14532d');
      ctx.fillStyle = snoutGrad;
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(headX + 9, headY - 7.5);
      ctx.quadraticCurveTo(headX + 16, headY - 8.5, headX + 22, headY - 10.5);
      ctx.lineTo(headX + 22, headY + 10.5);
      ctx.quadraticCurveTo(headX + 16, headY + 8.5, headX + 9, headY + 7.5);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Golden Runic Collar Band around the Barrel
      const bandGrad = ctx.createLinearGradient(headX + 15, headY - 9, headX + 15, headY + 9);
      bandGrad.addColorStop(0, '#fef08a');
      bandGrad.addColorStop(0.5, '#eab308');
      bandGrad.addColorStop(1, '#854d0e');
      ctx.fillStyle = bandGrad;
      ctx.fillRect(headX + 14, headY - 8.2, 3, 16.4);

      // Flared Muzzle Lip & Dark Bore
      ctx.fillStyle = '#22c55e';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.ellipse(headX + 22, headY, 4.8, 10.5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#02180b';
      ctx.beginPath();
      ctx.ellipse(headX + 22.5, headY, 3, 7.6, 0, 0, Math.PI * 2);
      ctx.fill();

      // Glowing Emerald Energy Orb charging inside the bore
      if (chargeRatio > 0.25) {
        const orbAlpha = (chargeRatio - 0.25) / 0.75;
        ctx.save();
        ctx.fillStyle = `rgba(134, 239, 172, ${orbAlpha * 0.92})`;
        ctx.shadowColor = '#4ade80';
        ctx.shadowBlur = 9 * orbAlpha;
        ctx.beginPath();
        ctx.arc(headX + 22, headY, 2.2 + orbAlpha * 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 8. Expressive Fierce Eye & Brow
      ctx.fillStyle = '#052e16';
      ctx.beginPath();
      ctx.ellipse(headX + 4, headY - 5, 3.6, 4.4, -0.1, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(headX + 5, headY - 6.5, 1.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#86efac';
      ctx.beginPath();
      ctx.arc(headX + 3, headY - 3.2, 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(headX - 1, headY - 10);
      ctx.lineTo(headX + 8.5, headY - 8);
      ctx.stroke();
    });
  }
}
