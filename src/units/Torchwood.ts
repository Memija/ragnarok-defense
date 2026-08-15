import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Pea } from './Pea';
import { SnowProjectile } from '../entities/SnowProjectile';
import { FirePea } from './FirePea';

export class Torchwood extends Defender {
  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 300, 175, row, col); // Cost 175 sun
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    // Convert passing projectiles to fire peas
    for (let i = 0; i < game.projectiles.length; i++) {
      const p = game.projectiles[i];
      if (p.row === this.row && p.x + p.width > this.x && p.x < this.x + this.width) {
        if (p instanceof Pea || p instanceof SnowProjectile) {
           const firePea = new FirePea(p.x, p.y, p.row);
           game.projectiles[i] = firePea;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      // Tree trunk
      ctx.fillStyle = '#5d4037';
      ctx.fillRect(cx - 15, cy, 30, this.height / 2);
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(cx - 10, cy, 5, this.height / 2);
      ctx.fillRect(cx + 5, cy, 5, this.height / 2);
      
      // Root details
      ctx.fillStyle = '#4e342e';
      ctx.beginPath();
      ctx.ellipse(cx - 15, cy + this.height / 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx + 15, cy + this.height / 2, 10, 5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Fire Animation
      const fireOffset = Math.sin(this.animTimer / 100) * 5;
      
      const fireGrad = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 20, 30);
      fireGrad.addColorStop(0, '#ffff00');
      fireGrad.addColorStop(0.4, '#ff9800');
      fireGrad.addColorStop(1, 'rgba(244, 67, 54, 0)');
      
      ctx.fillStyle = fireGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy);
      ctx.quadraticCurveTo(cx - 25, cy - 30 + fireOffset, cx, cy - 40 - fireOffset);
      ctx.quadraticCurveTo(cx + 25, cy - 30 - fireOffset, cx + 20, cy);
      ctx.fill();
      
      // Inner fire core
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy);
      ctx.quadraticCurveTo(cx - 10, cy - 15, cx, cy - 20);
      ctx.quadraticCurveTo(cx + 10, cy - 15, cx + 10, cy);
      ctx.fill();
      
      // Eyes (angry/fierce)
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 10);
      ctx.lineTo(cx - 2, cy + 15);
      ctx.lineTo(cx - 10, cy + 18);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 10, cy + 10);
      ctx.lineTo(cx + 2, cy + 15);
      ctx.lineTo(cx + 10, cy + 18);
      ctx.fill();
    });
  }
}
