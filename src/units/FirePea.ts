import { Projectile } from '../entities/Projectile';
import { Game } from '../engine/Game';

export class FirePea extends Projectile {
  animTimer: number = 0;

  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 40, row); // Double damage (40 instead of 20)
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.animTimer += deltaTime;
    if (Math.random() < 0.3) {
      game.particles.emit(this.x + this.width / 2, this.y + this.height / 2, '#ff9800', 3, 2, 1, 200);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width / 2;
    const cy = this.y + this.height / 2;
    const flicker = Math.sin(this.animTimer / 35) * 2.5;

    ctx.save();
    // 1. Roaring Muspelheim Flame Comet Tail
    const tailGrad = ctx.createLinearGradient(cx - 32, cy, cx + 4, cy);
    tailGrad.addColorStop(0, 'rgba(220, 38, 38, 0)');
    tailGrad.addColorStop(0.45, 'rgba(239, 68, 68, 0.55)');
    tailGrad.addColorStop(0.8, 'rgba(249, 115, 22, 0.85)');
    tailGrad.addColorStop(1, '#fef08a');
    ctx.fillStyle = tailGrad;
    ctx.beginPath();
    ctx.moveTo(cx - 32, cy + flicker);
    ctx.quadraticCurveTo(cx - 14, cy - 10, cx + 2, cy - 9.5);
    ctx.lineTo(cx + 2, cy + 9.5);
    ctx.quadraticCurveTo(cx - 14, cy + 10, cx - 32, cy + flicker);
    ctx.closePath();
    ctx.fill();

    // 2. Blazing Fireball Core
    const grad = ctx.createRadialGradient(cx + 1, cy, 1.5, cx, cy, 11.5);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.65, '#f97316');
    grad.addColorStop(1, '#dc2626');

    ctx.shadowBlur = 16;
    ctx.shadowColor = '#f97316';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 10.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}
