import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Projectile } from '../entities/Projectile';
import { SoundManager } from '../engine/SoundManager';

class LightSpear extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 24, 12, 1, 380, 45, row);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.shadowBlur = 12;
    ctx.shadowColor = '#ffd54f';

    // Glowing golden lance beam
    const grad = ctx.createLinearGradient(this.x, cy, this.x + this.width, cy);
    grad.addColorStop(0, 'rgba(255, 235, 59, 0.4)');
    grad.addColorStop(0.7, '#fff59d');
    grad.addColorStop(1, '#ffffff');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(this.x + this.width, cy);
    ctx.lineTo(this.x, cy - 5);
    ctx.lineTo(this.x + 4, cy);
    ctx.lineTo(this.x, cy + 5);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

export class Einherjar extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1300;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 350, 225, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    const hasEnemy = game.attackers.some(a => a.row === this.row && a.x > this.x);
    if (hasEnemy) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireRate) {
        this.fireTimer = 0;
        game.projectiles.push(new LightSpear(this.x + this.width, this.y + this.height / 2 - 8, this.row));
        SoundManager.getInstance().playShoot('pea');
        this.recoilX = -10;
        this.scaleX = 0.9;
        this.scaleY = 1.15;
      }
    } else {
      this.fireTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 36, 26, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Asgardian White Marble Watchtower Pedestal ---
      // Stepped Base
      const baseGrad = ctx.createLinearGradient(cx - 24, cy + 24, cx + 24, cy + 35);
      baseGrad.addColorStop(0, '#e2e8f0');
      baseGrad.addColorStop(0.5, '#f8fafc');
      baseGrad.addColorStop(1, '#cbd5e1');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 23, cy + 26, 46, 10, 2);
      ctx.fill();
      ctx.stroke();

      // Watchtower Turret Balustrade / Column Shaft
      const colGrad = ctx.createLinearGradient(cx - 18, cy + 10, cx + 18, cy + 26);
      colGrad.addColorStop(0, '#cbd5e1');
      colGrad.addColorStop(0.5, '#f1f5f9');
      colGrad.addColorStop(1, '#94a3b8');
      ctx.fillStyle = colGrad;
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - 18, cy + 12, 36, 14, 2);
      ctx.fill();
      ctx.stroke();

      // Golden fluting & Bifrost runes
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(cx - 11, cy + 13); ctx.lineTo(cx - 11, cy + 25);
      ctx.moveTo(cx, cy + 13);      ctx.lineTo(cx, cy + 25);
      ctx.moveTo(cx + 11, cy + 13); ctx.lineTo(cx + 11, cy + 25);
      ctx.stroke();

      // Golden Parapet Railing
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#d4af37';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(cx - 20, cy + 8, 40, 5, 2);
      ctx.fill();
      ctx.stroke();

      // --- 2. Celestial Einherjar Standing Atop Watchtower ---
      ctx.save();
      const auraPulse = 0.8 + Math.sin(this.animTimer / 120) * 0.2;
      ctx.shadowBlur = 18 * auraPulse;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.7)';

      // Robe / Body
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - 12, cy - 14, 24, 24);

      // Gold Cuirass armor plate
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 13);
      ctx.lineTo(cx + 10, cy - 13);
      ctx.lineTo(cx + 6, cy + 4);
      ctx.lineTo(cx - 6, cy + 4);
      ctx.closePath();
      ctx.fill();

      // Winged Helm
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy - 23, 11, Math.PI, 0);
      ctx.fill();

      // Face
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(cx, cy - 19, 7, 0, Math.PI * 2);
      ctx.fill();

      // Helmet Wings
      ctx.fillStyle = '#ffffff';
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 21);
      ctx.lineTo(cx - 21, cy - 35);
      ctx.lineTo(cx - 8, cy - 28);
      ctx.closePath();
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy - 21);
      ctx.lineTo(cx + 21, cy - 35);
      ctx.lineTo(cx + 8, cy - 28);
      ctx.closePath();
      ctx.fill();

      // Spear in hand
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 14, cy + 18);
      ctx.lineTo(cx + 18, cy - 36);
      ctx.stroke();

      // Radiant Spear tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx + 18, cy - 43);
      ctx.lineTo(cx + 14, cy - 34);
      ctx.lineTo(cx + 22, cy - 34);
      ctx.closePath();
      ctx.fill();

      ctx.restore();
    });
  }
}
