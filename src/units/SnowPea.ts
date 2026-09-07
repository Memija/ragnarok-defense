import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { SnowProjectile } from '../entities/SnowProjectile';
import { SoundManager } from '../engine/SoundManager';

export class SnowPea extends Defender {
  fireTimer: number = 0;
  fireRate: number = 1500;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 175, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.fireTimer += deltaTime;
    
    this.scaleY = 1 + Math.sin(this.animTimer / 200) * 0.05;
    this.scaleX = 1 - Math.sin(this.animTimer / 200) * 0.02;
    
    if (this.fireTimer >= this.fireRate) {
      const isZombieInRow = game.attackers.some(z => z.row === this.row && z.x > this.x);
      if (isZombieInRow) {
        this.fireTimer = 0;
        game.projectiles.push(new SnowProjectile(this.x + this.width, this.y + 10, this.row));
        SoundManager.getInstance().playShoot('ice');
        this.recoilX = -10; 
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.fillStyle = '#4dd0e1';
      ctx.fillRect(cx - 4, cy, 8, this.height / 2);
      
      ctx.shadowBlur = 15;
      ctx.shadowColor = '#00bcd4';
      const grad = ctx.createRadialGradient(cx, cy - 10, 5, cx, cy - 10, 25);
      grad.addColorStop(0, '#84ffff');
      grad.addColorStop(1, '#00bcd4');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 25, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#0097a7';
      ctx.beginPath();
      ctx.ellipse(cx + 25, cy - 10, 15, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#006064';
      ctx.beginPath();
      ctx.ellipse(cx + 35, cy - 10, 5, 8, 0, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx + 5, cy - 20, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 35);
      ctx.lineTo(cx - 5, cy - 45);
      ctx.lineTo(cx, cy - 35);
      ctx.fill();
    });
  }
}
