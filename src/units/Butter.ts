import { Projectile } from '../entities/Projectile';

export class Butter extends Projectile {
  constructor(x: number, y: number, row: number) {
    super(x, y, 25, 20, 1, 300, 40, row); // Normal speed, 40 damage
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.x * 0.05);

    // Glowing Amber Aura
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#f59e0b';

    // Flask bulb body (round glass)
    const bulbGrad = ctx.createRadialGradient(-3, -3, 2, 0, 0, 10);
    bulbGrad.addColorStop(0, '#fef08a');
    bulbGrad.addColorStop(0.5, '#f59e0b');
    bulbGrad.addColorStop(1, '#b45309');
    ctx.fillStyle = bulbGrad;
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.arc(0, 2, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Flask neck & cork
    ctx.fillStyle = '#92400e';
    ctx.fillRect(-3, -11, 6, 5);
    ctx.fillStyle = '#d97706';
    ctx.fillRect(-4, -13, 8, 3);

    // Iron reinforcement band
    ctx.strokeStyle = '#44403c';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(0, 2, 9, 3, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
