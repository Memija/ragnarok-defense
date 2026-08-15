import { Projectile } from './Projectile';

export class SnowProjectile extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 20, row);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    
    const grad = ctx.createRadialGradient(cx, cy - 2, 2, cx, cy, 10);
    grad.addColorStop(0, '#81d4fa');
    grad.addColorStop(1, '#0288d1');
    
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#03a9f4';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 10, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
