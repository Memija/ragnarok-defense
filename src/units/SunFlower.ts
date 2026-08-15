import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class SunFlower extends Defender {
  produceTimer: number = 0;
  produceRate: number = 10000;

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 50, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    this.produceTimer += deltaTime;
    if (this.produceTimer >= this.produceRate) {
      this.produceTimer = 0;
      game.sun += 25; 
      game.updateUI();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      ctx.fillStyle = '#4caf50';
      ctx.fillRect(cx - 4, cy, 8, this.height / 2);

      ctx.shadowBlur = 20;
      ctx.shadowColor = '#ffeb3b';
      ctx.fillStyle = '#fff59d';
      
      const numPetals = 8;
      const petalRotation = this.animTimer / 1000;
      for (let i = 0; i < numPetals; i++) {
        const angle = (Math.PI * 2 / numPetals) * i + petalRotation;
        const px = cx + Math.cos(angle) * 20;
        const py = cy - 10 + Math.sin(angle) * 20;
        ctx.beginPath();
        ctx.arc(px, py, 12, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.shadowBlur = 0;

      ctx.fillStyle = '#795548';
      ctx.beginPath();
      ctx.arc(cx, cy - 10, 18, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.fillStyle = '#000000';
      ctx.beginPath();
      ctx.arc(cx - 6, cy - 12, 3, 0, Math.PI * 2);
      ctx.arc(cx + 6, cy - 12, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
}
