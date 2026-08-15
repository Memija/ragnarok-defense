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
    
    const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, 12);
    grad.addColorStop(0, '#ffff00'); // Yellow core
    grad.addColorStop(0.5, '#ff9800'); // Orange mid
    grad.addColorStop(1, '#f44336'); // Red edge
    
    ctx.shadowBlur = 15;
    ctx.shadowColor = '#ff9800';
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cx, cy, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
}
