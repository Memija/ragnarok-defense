import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Kernel } from './Kernel';
import { Butter } from './Butter';

export class KernelPult extends Defender {
  fireTimer: number = 0;
  fireRate: number = 3000; // Slower fire rate than peashooter

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 100, row, col); // Cost 100 sun
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    const zombieInRow = game.attackers.some(a => a.row === this.row && a.x > this.x);
    if (zombieInRow) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireRate) {
        this.fireTimer = 0;
        
        // 25% chance to shoot butter
        const isButter = Math.random() < 0.25;
        
        if (isButter) {
           game.projectiles.push(new Butter(this.x + this.width, this.y + 10, this.row));
        } else {
           game.projectiles.push(new Kernel(this.x + this.width, this.y + 10, this.row));
        }
        
        this.recoilX = -15;
        this.scaleY = 0.8;
      }
    } else {
      this.fireTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      // Draw corn body (yellow cob)
      ctx.fillStyle = '#ffeb3b';
      ctx.beginPath();
      ctx.ellipse(cx, cy, 20, 30, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Draw corn kernels texture
      ctx.strokeStyle = '#fbc02d';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 20); ctx.lineTo(cx - 10, cy + 20);
      ctx.moveTo(cx, cy - 25); ctx.lineTo(cx, cy + 25);
      ctx.moveTo(cx + 10, cy - 20); ctx.lineTo(cx + 10, cy + 20);
      ctx.moveTo(cx - 15, cy - 10); ctx.lineTo(cx + 15, cy - 10);
      ctx.moveTo(cx - 18, cy); ctx.lineTo(cx + 18, cy);
      ctx.moveTo(cx - 15, cy + 10); ctx.lineTo(cx + 15, cy + 10);
      ctx.stroke();

      // Leaves (green husks)
      ctx.fillStyle = '#8bc34a';
      ctx.beginPath(); ctx.moveTo(cx - 20, cy); ctx.quadraticCurveTo(cx - 30, cy + 20, cx, cy + 35); ctx.quadraticCurveTo(cx - 10, cy + 20, cx - 15, cy); ctx.fill();
      ctx.beginPath(); ctx.moveTo(cx + 20, cy); ctx.quadraticCurveTo(cx + 30, cy + 20, cx, cy + 35); ctx.quadraticCurveTo(cx + 10, cy + 20, cx + 15, cy); ctx.fill();

      // Catapult spoon (brown)
      ctx.fillStyle = '#795548';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 10);
      ctx.lineTo(cx + 25, cy - 25);
      ctx.lineTo(cx + 20, cy - 30);
      ctx.lineTo(cx - 5, cy - 15);
      ctx.fill();
      
      // Spoon bucket
      ctx.fillStyle = '#5d4037';
      ctx.beginPath(); ctx.arc(cx + 22, cy - 28, 8, 0, Math.PI * 2); ctx.fill();
      
      // Eyes
      ctx.fillStyle = '#000000';
      ctx.beginPath(); ctx.arc(cx - 5, cy - 5, 3, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(cx + 5, cy - 5, 3, 0, Math.PI * 2); ctx.fill();
    });
  }
}
