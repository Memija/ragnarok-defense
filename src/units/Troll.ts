import { Attacker } from '../entities/Attacker';

export class Troll extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1200;

  constructor(x: number, y: number, row: number) {
    super(x, y - 10, 70, 110, 300, 15, 40, row); // Tanky, slow, heavy damage
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#1b5e20';
      
      const grad = ctx.createLinearGradient(cx, cy - 30, cx, cy + 40);
      grad.addColorStop(0, '#558b2f'); 
      grad.addColorStop(1, '#33691e'); 
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(cx - 30, cy - 10, 60, 60, 10); 
      ctx.fill();
      
      ctx.fillStyle = '#aed581'; 
      ctx.beginPath();
      ctx.arc(cx, cy - 30, 25, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#b71c1c'; 
      ctx.beginPath();
      ctx.arc(cx - 10, cy - 35, 5, 0, Math.PI * 2);
      ctx.arc(cx + 10, cy - 35, 5, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = '#5d4037'; 
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx - 15, cy + 10);
      ctx.lineTo(cx - 35, cy + 30);
      ctx.stroke();
      
      // Spikes on club
      ctx.fillStyle = '#bdbdbd';
      ctx.beginPath(); ctx.arc(cx - 30, cy + 25, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx - 38, cy + 28, 3, 0, Math.PI * 2); ctx.fill();
    });
  }
}
