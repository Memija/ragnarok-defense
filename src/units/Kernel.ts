import { Projectile } from '../entities/Projectile';

export class Kernel extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 15, 15, 1, 300, 20, row); // Normal damage 20
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    
    // Draw Corn Kernel (yellow drop shape)
    ctx.fillStyle = '#ffeb3b';
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 10, cx + 5, cy + 5);
    ctx.lineTo(cx, cy - 8);
    ctx.fill();
    
    ctx.strokeStyle = '#fbc02d';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy + 5);
    ctx.quadraticCurveTo(cx, cy + 10, cx + 5, cy + 5);
    ctx.lineTo(cx, cy - 8);
    ctx.closePath();
    ctx.stroke();
  }
}
