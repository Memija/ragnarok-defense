import { Attacker } from '../entities/Attacker';

export class SmallTroll extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1000;

  constructor(x: number, y: number, row: number) {
    super(x, y + 15, 45, 75, 150, 25, 20, row); // Weaker, slightly faster than big troll, less damage
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#33691e';
      
      const grad = ctx.createLinearGradient(cx, cy - 20, cx, cy + 30);
      grad.addColorStop(0, '#689f38'); 
      grad.addColorStop(1, '#33691e'); 
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(cx - 20, cy - 5, 40, 45, 8); 
      ctx.fill();
      
      ctx.fillStyle = '#c5e1a5'; 
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#b71c1c'; 
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 25, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 25, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#5d4037'; 
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 5);
      ctx.lineTo(cx - 25, cy + 20);
      ctx.stroke();
    });
  }
}
