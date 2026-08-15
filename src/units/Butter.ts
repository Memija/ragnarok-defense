import { Projectile } from '../entities/Projectile';

export class Butter extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 25, 20, 1, 300, 40, row); // Normal speed, 40 damage
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    
    // Draw Butter
    ctx.fillStyle = '#fff59d'; // Light yellow
    ctx.fillRect(cx - 12, cy - 10, 24, 20);
    ctx.fillStyle = '#fbc02d'; // Darker yellow shading
    ctx.fillRect(cx - 12, cy, 24, 10);
    
    ctx.strokeStyle = '#f9a825';
    ctx.lineWidth = 1;
    ctx.strokeRect(cx - 12, cy - 10, 24, 20);
  }
}
