import { Entity } from '../entities/Entity';
import { Game } from '../engine/Game';

export class Valkyrie extends Entity {
  speed: number = 800;
  row: number;

  constructor(x: number, y: number, row: number) {
    super(x, y, 60, 80, 1000000); 
    this.row = row;
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    this.x += this.speed * (deltaTime / 1000);
    
    this.y += Math.sin(this.animTimer / 100) * 2;
    
    if (Math.random() < 0.4) {
      game.particles.emit(this.x, this.y + this.height / 2, '#fff59d', 5, 3, 2, 300);
    }
    
    if (this.x > game.canvas.width) {
      this.markedForDeletion = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      
      ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.beginPath();
      ctx.ellipse(cx - 10, cy - 10, 30, 15, -Math.PI / 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(cx - 20, cy + 10, 25, 10, -Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#cfd8dc'; 
      ctx.fillRect(cx - 10, cy - 10, 20, 30);
      
      ctx.fillStyle = '#0288d1';
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy - 10);
      ctx.lineTo(cx - 30, cy + 20);
      ctx.lineTo(cx - 5, cy + 30);
      ctx.fill();

      ctx.fillStyle = '#ffccbc';
      ctx.beginPath();
      ctx.arc(cx, cy - 20, 12, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#ffb300'; 
      ctx.beginPath();
      ctx.arc(cx, cy - 25, 12, Math.PI, 0);
      ctx.fill();
      
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(cx, cy - 25);
      ctx.lineTo(cx - 15, cy - 40);
      ctx.lineTo(cx - 10, cy - 20);
      ctx.fill();
      
      ctx.strokeStyle = '#795548';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(cx - 10, cy + 20);
      ctx.lineTo(cx + 40, cy - 10);
      ctx.stroke();
      
      ctx.fillStyle = '#eceff1';
      ctx.beginPath();
      ctx.moveTo(cx + 35, cy - 5);
      ctx.lineTo(cx + 50, cy - 15);
      ctx.lineTo(cx + 40, cy - 15);
      ctx.fill();
    });
  }
}
