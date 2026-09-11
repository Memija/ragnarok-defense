import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class PotatoMine extends Defender {
  isArmed: boolean = false;
  armTimer: number = 0;
  armDuration: number = 15000; 

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 25, 50, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    if (!this.isArmed) {
      this.armTimer += deltaTime;
      if (this.armTimer >= this.armDuration) {
        this.isArmed = true;
        game.particles.emit(this.x + this.width / 2, this.y + this.height, '#795548', 10, 3, 2, 300);
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // Ground shadow & runic base circle
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 34, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Ancient Stone Glyph Ward Base (Carved into the ground) ---
      const wardPulse = (Math.sin(this.animTimer / (this.isArmed ? 60 : 180)) + 1) / 2;
      ctx.save();
      ctx.shadowBlur = this.isArmed ? 14 : 6;
      ctx.shadowColor = this.isArmed ? '#ef4444' : '#f59e0b';
      ctx.strokeStyle = this.isArmed ? `rgba(239, 68, 68, ${0.7 + wardPulse * 0.3})` : `rgba(245, 158, 11, ${0.4 + wardPulse * 0.3})`;
      ctx.lineWidth = 1.5;

      // Outer Runic Circle
      ctx.beginPath();
      ctx.ellipse(cx, cy + 31, 20, 7, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Inner Circle
      ctx.beginPath();
      ctx.ellipse(cx, cy + 31, 13, 4.5, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();

      if (!this.isArmed) {
        // --- UNARMED / CHARGING: Low Submerged Monolith emerging ---
        const armProgress = Math.min(1, this.armTimer / this.armDuration);
        const pylonY = cy + 28 - armProgress * 14;

        // Submerged Stone Pylon Cap
        const pylonGrad = ctx.createLinearGradient(cx - 12, pylonY, cx + 12, cy + 31);
        pylonGrad.addColorStop(0, '#334155');
        pylonGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = pylonGrad;
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.roundRect(cx - 12, pylonY, 24, cy + 31 - pylonY, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();

        // Charging rune slit
        const chargeFlash = (Math.sin(this.animTimer / 120) + 1) / 2;
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + chargeFlash * 0.6})`;
        ctx.beginPath();
        ctx.arc(cx, pylonY + 4, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

      } else {
        // --- FULLY ARMED: Towering Runic Monolith Tower ---
        const monoTop = cy - 6;
        const monoHeight = 37;

        // 1. Monolith Granite Tower Body
        const monoGrad = ctx.createLinearGradient(cx - 14, monoTop, cx + 14, monoTop + monoHeight);
        monoGrad.addColorStop(0, '#1e293b');
        monoGrad.addColorStop(0.4, '#334155');
        monoGrad.addColorStop(0.8, '#1e293b');
        monoGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = monoGrad;
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1.5;

        // Tapered stone obelisk shape
        ctx.beginPath();
        ctx.moveTo(cx - 11, monoTop);
        ctx.lineTo(cx + 11, monoTop);
        ctx.lineTo(cx + 14, monoTop + monoHeight);
        ctx.lineTo(cx - 14, monoTop + monoHeight);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // 2. Chiseled Bevels on the Pillar edges
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx - 9, monoTop + 1);
        ctx.lineTo(cx - 12, monoTop + monoHeight - 1);
        ctx.stroke();

        // 3. Blazing Crimson & Gold Norse Runes (ᚦ - Thurisaz / Giant Spike)
        ctx.save();
        const dangerPulse = (Math.sin(this.animTimer / 50) + 1) / 2;
        ctx.shadowBlur = 15 + dangerPulse * 8;
        ctx.shadowColor = '#ef4444';

        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 2.2;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        // Carved Thurisaz rune
        ctx.beginPath();
        ctx.moveTo(cx - 2, monoTop + 8);
        ctx.lineTo(cx - 2, monoTop + 28);
        ctx.moveTo(cx - 2, monoTop + 14);
        ctx.lineTo(cx + 5, monoTop + 18);
        ctx.lineTo(cx - 2, monoTop + 22);
        ctx.stroke();

        // 4. Levitating Runic Danger Core Orb at the Tip
        const orbY = monoTop - 6 + Math.sin(this.animTimer / 70) * 2;
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(cx, orbY, 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, orbY, 2, 0, Math.PI * 2);
        ctx.fill();

        // Arc sparks radiating from orb
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.6 + dangerPulse * 0.4})`;
        ctx.lineWidth = 1.2;
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2 + this.animTimer * 0.05;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * 4, orbY + Math.sin(ang) * 4);
          ctx.lineTo(cx + Math.cos(ang) * 8, orbY + Math.sin(ang) * 8);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  }
}
