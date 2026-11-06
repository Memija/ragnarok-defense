import { Projectile } from './Projectile';

export class SnowProjectile extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 20, row);
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    // 1. Niflheim Rime Vapor Trail
    const tailGrad = ctx.createLinearGradient(cx - 28, cy, cx, cy);
    tailGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    tailGrad.addColorStop(0.55, 'rgba(125, 211, 252, 0.4)');
    tailGrad.addColorStop(1, 'rgba(224, 242, 254, 0.85)');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 28, cy);
    ctx.lineTo(cx, cy - 6);
    ctx.lineTo(cx, cy + 6);
    ctx.closePath();
    ctx.fill();

    // 2. Faceted Ice Crystal Lance Head
    const grad = ctx.createLinearGradient(cx - 10, cy - 8, cx + 11, cy + 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#7dd3fc');
    grad.addColorStop(0.85, '#0284c7');
    grad.addColorStop(1, '#0c4a6e');

    ctx.shadowBlur = 12;
    ctx.shadowColor = '#38bdf8';
    ctx.fillStyle = grad;
    ctx.strokeStyle = '#075985';
    ctx.lineWidth = 1.1;
    ctx.beginPath();
    ctx.moveTo(cx + 11, cy);
    ctx.lineTo(cx + 2, cy - 7.5);
    ctx.lineTo(cx - 9, cy - 4.5);
    ctx.lineTo(cx - 6, cy);
    ctx.lineTo(cx - 9, cy + 4.5);
    ctx.lineTo(cx + 2, cy + 7.5);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // 3. Inner Crystalline Facet & Core Glint
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(cx + 7, cy);
    ctx.lineTo(cx + 1, cy - 3.2);
    ctx.lineTo(cx - 4, cy);
    ctx.lineTo(cx + 1, cy + 3.2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}
