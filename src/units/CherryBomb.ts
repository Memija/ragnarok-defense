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

      // Progress ratio (0 to 1)
      const fuseRatio = Math.min(1, this.fuseTimer / this.fuseTime);
      const flash = (Math.sin(this.fuseTimer / (40 - fuseRatio * 25)) + 1) / 2;

      // Ground shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 32, 24, 7, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Heavy Svartalfheim Iron Base Ring ---
      const baseGrad = ctx.createLinearGradient(cx - 24, cy + 20, cx + 24, cy + 30);
      baseGrad.addColorStop(0, '#1c1917');
      baseGrad.addColorStop(0.5, '#292524');
      baseGrad.addColorStop(1, '#0c0a09');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 22, cy + 20, 44, 11, 3);
      ctx.fill();
      ctx.stroke();

      // Base armor spikes
      ctx.fillStyle = '#78716c';
      for (const ox of [-16, -5, 5, 16]) {
        ctx.beginPath();
        ctx.moveTo(cx + ox, cy + 20);
        ctx.lineTo(cx + ox - 3, cy + 30);
        ctx.lineTo(cx + ox + 3, cy + 30);
        ctx.closePath();
        ctx.fill();
      }

      // --- 2. Fortified Cast-Iron Magma Ordnance Dome ---
      ctx.save();
      ctx.shadowBlur = 15 + fuseRatio * 25;
      ctx.shadowColor = `rgba(239, 68, 68, ${0.5 + flash * 0.5})`;

      const domeGrad = ctx.createRadialGradient(cx - 6, cy - 2, 4, cx, cy + 4, 25);
      domeGrad.addColorStop(0, '#44403c');
      domeGrad.addColorStop(0.5, '#292524');
      domeGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = domeGrad;
      ctx.strokeStyle = '#78716c';
      ctx.lineWidth = 2;

      ctx.beginPath();
      ctx.arc(cx, cy + 4, 22, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // --- 3. Overheating Magma Pressure Fissures ---
      ctx.strokeStyle = `rgba(255, 214, 0, ${0.6 + flash * 0.4})`;
      ctx.lineWidth = 2 + fuseRatio * 2.5;
      ctx.shadowBlur = 14 * fuseRatio;
      ctx.shadowColor = '#ff6d00';

      ctx.beginPath();
      // Center branching fissure
      ctx.moveTo(cx - 8, cy - 12);
      ctx.lineTo(cx - 2, cy - 2);
      ctx.lineTo(cx + 6, cy + 4);
      ctx.lineTo(cx + 1, cy + 16);
      // Branch left
      ctx.moveTo(cx - 2, cy - 2);
      ctx.lineTo(cx - 14, cy + 2);
      ctx.lineTo(cx - 12, cy + 12);
      // Branch right
      ctx.moveTo(cx + 6, cy + 4);
      ctx.lineTo(cx + 15, cy - 2);
      ctx.stroke();

      // Inner white-hot crack glow
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(cx - 6, cy - 10);
      ctx.lineTo(cx - 2, cy - 2);
      ctx.lineTo(cx + 6, cy + 4);
      ctx.stroke();

      // --- 4. Heavy Brass Compression Bands & Rivets ---
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 4, 23, 7, 0, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      for (const bx of [-18, -9, 0, 9, 18]) {
        ctx.beginPath();
        ctx.arc(cx + bx, cy + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 5. Blast Turret Exhaust Chimney & Sizzling Fuse ---
      ctx.fillStyle = '#292524';
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 7, cy - 24, 14, 8, 2);
      ctx.fill();
      ctx.stroke();

      // Burning Runic Fuse
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy - 24);
      ctx.quadraticCurveTo(cx + 8, cy - 30, cx + 2, cy - 35);
      ctx.stroke();

      // Sizzling Fuse Spark
      ctx.shadowBlur = 18;
      ctx.shadowColor = '#ffff00';
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 35, 3 + flash * 2, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#ff9100';
      ctx.beginPath();
      ctx.arc(cx + 2, cy - 35, 5 + flash * 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
