import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class Chomper extends Defender {
  isDigesting: boolean = false;
  digestTimer: number = 0;
  digestDuration: number = 20000; 
  range: number = 60; 

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 150, 150, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    if (this.isDigesting) {
      this.digestTimer += deltaTime;
      if (this.digestTimer >= this.digestDuration) {
        this.isDigesting = false;
        this.digestTimer = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.fillStyle = '#2e7d32';
      ctx.fillRect(cx - 5, cy, 10, this.height / 2);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#ab47bc';
      
      const grad = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 30);
      grad.addColorStop(0, '#ab47bc');
      grad.addColorStop(1, '#6a1b9a');
      
      ctx.fillStyle = grad;
      ctx.beginPath();
      if (this.isDigesting) {
        ctx.ellipse(cx, cy - 10, 35 + Math.sin(this.animTimer / 200) * 5, 25 + Math.cos(this.animTimer / 200) * 5, 0, 0, Math.PI * 2);
      } else {
        ctx.arc(cx, cy - 10, 30, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.shadowBlur = 0;
      
      if (!this.isDigesting) {
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy - 25);
        ctx.lineTo(cx + 35, cy - 15);
        ctx.lineTo(cx + 5, cy - 5);
        ctx.fill();
        
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.moveTo(cx + 5, cy - 25);
        ctx.lineTo(cx + 15, cy - 20);
        ctx.lineTo(cx + 8, cy - 15);
        
        ctx.moveTo(cx + 5, cy - 5);
        ctx.lineTo(cx + 15, cy - 10);
        ctx.lineTo(cx + 8, cy - 15);
        ctx.fill();
      }
    });
  }
}
