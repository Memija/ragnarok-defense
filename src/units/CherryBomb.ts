import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class CherryBomb extends Defender {
  fuseTimer: number = 0;
  fuseTime: number = 2000;
  exploded: boolean = false;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 1000, 150, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.fuseTimer += deltaTime;

    this.scaleX = 1 + (this.fuseTimer / this.fuseTime) * 0.5;
    this.scaleY = 1 + (this.fuseTimer / this.fuseTime) * 0.5;
    
    const shakeIntensity = (this.fuseTimer / this.fuseTime) * 10;
    this.offsetX = (Math.random() - 0.5) * shakeIntensity;
    this.offsetY = (Math.random() - 0.5) * shakeIntensity;
    
    if (Math.random() < 0.1) {
       game.particles.emit(this.x + this.width / 2, this.y, '#ffeb3b', 1, 2, 2, 200); // Spark
    }

    if (this.fuseTimer >= this.fuseTime && !this.exploded) {
      this.exploded = true;
      this.markedForDeletion = true;
      
      const explosionRadius = 150;
      const centerX = this.x + this.width / 2;
      const centerY = this.y + this.height / 2;
      game.particles.emitExplosion(centerX, centerY);

      game.attackers.forEach(a => {
        const ax = a.x + a.width / 2;
        const ay = a.y + a.height / 2;
        const dist = Math.hypot(ax - centerX, ay - centerY);
        if (dist <= explosionRadius) {
          a.takeDamage(1000);
        }
      });
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.strokeStyle = '#388e3c';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 35);
      ctx.quadraticCurveTo(cx - 20, cy - 40, cx - 15, cy - 5);
      ctx.moveTo(cx, cy - 35);
      ctx.quadraticCurveTo(cx + 20, cy - 40, cx + 15, cy - 5);
      ctx.stroke();
      
      const flash = (Math.sin(this.fuseTimer / 50) + 1) / 2;
      const glowColor = `rgba(255, 0, 0, ${flash})`;
      
      ctx.shadowBlur = 20 + flash * 20;
      ctx.shadowColor = glowColor;

      const leftGrad = ctx.createRadialGradient(cx - 15, cy - 10, 5, cx - 15, cy, 20);
      leftGrad.addColorStop(0, '#ef5350');
      leftGrad.addColorStop(1, '#c62828');
      ctx.fillStyle = leftGrad;
      ctx.beginPath();
      ctx.arc(cx - 15, cy, 20, 0, Math.PI * 2);
      ctx.fill();
      
      const rightGrad = ctx.createRadialGradient(cx + 15, cy - 10, 5, cx + 15, cy, 20);
      rightGrad.addColorStop(0, '#ef5350');
      rightGrad.addColorStop(1, '#c62828');
      ctx.fillStyle = rightGrad;
      ctx.beginPath();
      ctx.arc(cx + 15, cy, 20, 0, Math.PI * 2);
      ctx.fill();

      ctx.shadowBlur = 0;
      
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 22, cy - 5); ctx.lineTo(cx - 12, cy);
      ctx.moveTo(cx + 12, cy); ctx.lineTo(cx + 22, cy - 5);
      ctx.stroke();
    });
  }
}
