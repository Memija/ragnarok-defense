import { Attacker } from '../entities/Attacker';


export class BasicZombie extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1000;

  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 100, 30, 20, row);
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#607d8b';
      
      const grad = ctx.createLinearGradient(cx, cy - 20, cx, cy + 30);
      grad.addColorStop(0, '#78909c');
      grad.addColorStop(1, '#455a64');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(cx - 15, cy - 10, 30, 40, 5);
      ctx.fill();
      
      ctx.fillStyle = '#81c784';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#d32f2f';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 22, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 22, 3, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#4caf50';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 5, cy);
      ctx.lineTo(cx - 20, cy + 5);
      ctx.stroke();
    });
  }
}
