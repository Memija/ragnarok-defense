import { Projectile } from '../entities/Projectile';

export class Pea extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 20, row);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    // 1. Vanaheim Emerald Motion Tail
    const tailGrad = ctx.createLinearGradient(cx - 24, cy, cx, cy);
    tailGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
    tailGrad.addColorStop(0.6, 'rgba(74, 222, 128, 0.35)');
    tailGrad.addColorStop(1, 'rgba(134, 239, 172, 0.75)');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 24, cy);
    ctx.lineTo(cx, cy - 5.5);
    ctx.lineTo(cx, cy + 5.5);
    ctx.closePath();
    ctx.fill();

    // 2. Luminous Emerald Orb Body
    const grad = ctx.createRadialGradient(cx - 2, cy - 3, 1.5, cx, cy, 9.5);
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(0.35, '#86efac');
    grad.addColorStop(0.75, '#22c55e');
    grad.addColorStop(1, '#14532d');

    ctx.shadowBlur = 10;
    ctx.shadowColor = '#4ade80';
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#052e16';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.arc(cx, cy, 8.8, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 3. Specular Glint
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(cx - 2.5, cy - 2.8, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
