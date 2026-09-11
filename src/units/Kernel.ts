import { Projectile } from '../entities/Projectile';

export class Kernel extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 15, 15, 1, 300, 20, row); // Normal damage 20
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    // Rolling boulder rotation based on x position
    ctx.translate(cx, cy);
    ctx.rotate(this.x * 0.08);

    // Stone sphere shadow & core
    const boulderGrad = ctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
    boulderGrad.addColorStop(0, '#78716c');
    boulderGrad.addColorStop(0.5, '#44403c');
    boulderGrad.addColorStop(1, '#1c1917');
    ctx.fillStyle = boulderGrad;
    ctx.strokeStyle = '#292524';
    ctx.lineWidth = 1;

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing impact rune fissure
    ctx.strokeStyle = '#f59e0b';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, -3);
    ctx.lineTo(0, 0);
    ctx.lineTo(3, -2);
    ctx.moveTo(0, 0);
    ctx.lineTo(-1, 3);
    ctx.stroke();

    ctx.restore();
  }
}
