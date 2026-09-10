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

      // Golden aura
      ctx.shadowBlur = 15;
      ctx.shadowColor = 'rgba(255, 215, 0, 0.6)';

      // Robe / Body
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(cx - 14, cy - 5, 28, 38);

      // Gold Cuirass armor plate
      ctx.fillStyle = '#d4af37';
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 4);
      ctx.lineTo(cx + 12, cy - 4);
      ctx.lineTo(cx + 8, cy + 18);
      ctx.lineTo(cx - 8, cy + 18);
      ctx.closePath();
      ctx.fill();

      // Winged Helm
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.arc(cx, cy - 14, 13, Math.PI, 0);
      ctx.fill();

      // Face
      ctx.fillStyle = '#ffedd5';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 8, 0, Math.PI * 2);
      ctx.fill();

      // Helmet Wings
      ctx.fillStyle = '#ffffff';
      // Left Wing
      ctx.beginPath();
      ctx.moveTo(cx - 12, cy - 12);
      ctx.lineTo(cx - 24, cy - 28);
      ctx.lineTo(cx - 10, cy - 20);
      ctx.closePath();
      ctx.fill();

      // Right Wing
      ctx.beginPath();
      ctx.moveTo(cx + 12, cy - 12);
      ctx.lineTo(cx + 24, cy - 28);
      ctx.lineTo(cx + 10, cy - 20);
      ctx.closePath();
      ctx.fill();

      // Spear in hand
      ctx.strokeStyle = '#ffd54f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx + 16, cy + 25);
      ctx.lineTo(cx + 20, cy - 26);
      ctx.stroke();

      // Spear tip
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy - 32);
      ctx.lineTo(cx + 16, cy - 24);
      ctx.lineTo(cx + 24, cy - 24);
      ctx.closePath();
      ctx.fill();

      ctx.shadowBlur = 0;
    });
  }
}
