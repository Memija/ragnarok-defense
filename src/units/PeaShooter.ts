import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';

export class PeaShooter extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1500;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 100, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    const zombieInRow = game.attackers.some(a => a.row === this.row && a.x > this.x);
    if (zombieInRow) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireRate) {
        this.fireTimer = 0;
        game.projectiles.push(new Pea(this.x + this.width, this.y + this.height / 2 - 10, this.row));
        
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
      
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(cx - 5, cy, 10, this.height / 2);
      
      const grad = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 25);
      grad.addColorStop(0, '#81c784');
      grad.addColorStop(1, '#388e3c');
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4caf50';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.ellipse(cx + 20, cy - 10, 15, 10, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx + 25, cy - 10, 8, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#4caf50';
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy + 20, 15, 5, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
