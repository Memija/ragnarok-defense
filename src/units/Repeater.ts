import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';

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
        this.recoilX = -10;
      }
    } else if (this.fireTimer >= this.fireRate) {
      const isZombieInRow = game.attackers.some(z => z.row === this.row && z.x > this.x);
      if (isZombieInRow) {
        this.fireTimer = 0;
        game.projectiles.push(new Pea(this.x + this.width, this.y + 10, this.row));
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
      
      ctx.fillStyle = '#1b5e20';
      ctx.fillRect(cx - 4, cy, 8, this.height / 2);
      
      ctx.fillStyle = '#388e3c';
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy - 5, 20, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.ellipse(cx + 5, cy + 5, 20, 10, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 15;
      ctx.shadowColor = '#4caf50';
      const grad = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 25);
      grad.addColorStop(0, '#a5d6a7');
      grad.addColorStop(1, '#2e7d32');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#1b5e20';
      ctx.beginPath();
      ctx.ellipse(cx + 25, cy - 10, 15, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.ellipse(cx + 35, cy - 10, 5, 12, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx + 10, cy - 22);
      ctx.lineTo(cx + 10, cy - 20);
      ctx.lineTo(cx, cy - 23);
      ctx.fill();

      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 18, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });
  }
}
