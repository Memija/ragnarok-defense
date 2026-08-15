import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class WallNut extends Defender {
  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 500, 50, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      const grad = ctx.createRadialGradient(cx, cy, 10, cx, cy, 35);
      grad.addColorStop(0, '#a1887f');
      grad.addColorStop(1, '#5d4037');

      ctx.shadowBlur = 10;
      ctx.shadowColor = '#795548';
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, 30, 40, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 5, 4, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 5, 4, 0, Math.PI * 2);
      ctx.fill();
      
      if (this.health < 250) {
        ctx.strokeStyle = '#3e2723';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(cx - 20, cy - 20);
        ctx.lineTo(cx - 10, cy - 15);
        ctx.lineTo(cx - 15, cy - 5);
        ctx.stroke();
      }
    });
  }
}
