import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class PotatoMine extends Defender {
  isArmed: boolean = false;
  armTimer: number = 0;
  armDuration: number = 15000; 

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 25, 50, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    if (!this.isArmed) {
      this.armTimer += deltaTime;
      if (this.armTimer >= this.armDuration) {
        this.isArmed = true;
        game.particles.emit(this.x + this.width / 2, this.y + this.height, '#795548', 10, 3, 2, 300);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height - 15; 
      
      if (!this.isArmed) {
        ctx.fillStyle = '#795548';
        ctx.beginPath();
        ctx.ellipse(cx, cy + 10, 20, 10, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const flash = (Math.sin(this.animTimer / 100) + 1) / 2;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `rgba(255, 0, 0, ${flash})`;
        ctx.fillStyle = `rgba(255, 0, 0, ${0.5 + flash * 0.5})`;
        ctx.beginPath();
        ctx.arc(cx, cy + 5, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else {
        const grad = ctx.createRadialGradient(cx, cy, 5, cx, cy, 25);
        grad.addColorStop(0, '#ffb74d');
        grad.addColorStop(1, '#e65100');
        
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ff9800';
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.roundRect(cx - 20, cy - 25, 40, 40, 10);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        const flash = (Math.sin(this.animTimer / 50) + 1) / 2;
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#ff0000';
        ctx.fillStyle = `rgba(255, 0, 0, ${0.8 + flash * 0.2})`;
        ctx.beginPath();
        ctx.arc(cx, cy - 30, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
        
        ctx.fillStyle = '#000000';
        ctx.beginPath();
        ctx.arc(cx - 8, cy - 10, 3, 0, Math.PI * 2);
        ctx.arc(cx + 8, cy - 10, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }
}
