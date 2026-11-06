import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class PotatoMine extends Defender {
  isArmed: boolean = false;
  armTimer: number = 0;
  armDuration: number = 12000; 

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 120, 25, row, col); 
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

      // 1. Subterranean Crater & Scorched Earth Base
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 28, 25, 8.5, 0, 0, Math.PI * 2);
      ctx.fill();

      // Radiating magma fissures in the soil around the mine
      const wardPulse = (Math.sin(this.animTimer / (this.isArmed ? 55 : 180)) + 1) / 2;
      ctx.save();
      ctx.strokeStyle = this.isArmed
        ? `rgba(249, 115, 22, ${0.55 + wardPulse * 0.4})`
        : `rgba(245, 158, 11, ${0.25 + wardPulse * 0.25})`;
      ctx.lineWidth = 1.4;
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3 + 0.3;
        ctx.beginPath();
        ctx.moveTo(cx + Math.cos(ang) * 14, cy + 27 + Math.sin(ang) * 4);
        ctx.lineTo(cx + Math.cos(ang) * 23, cy + 27 + Math.sin(ang) * 7.5);
        ctx.stroke();
      }
      ctx.restore();

      if (!this.isArmed) {
        // --- UNARMED / ARMING: Burrowed Dwarven Mine Casing Rising from the Earth ---
        const armProgress = Math.min(1, this.armTimer / this.armDuration);
        const liftY = cy + 27 - armProgress * 5;

        // Outer Bronze & Iron Rim (partially buried)
        const rimGrad = ctx.createLinearGradient(cx - 18, liftY - 4, cx + 18, liftY + 6);
        rimGrad.addColorStop(0, '#475569');
        rimGrad.addColorStop(0.5, '#1e293b');
        rimGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = rimGrad;
        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.ellipse(cx, liftY, 18, 6.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Arming progress ring
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.ellipse(cx, liftY - 1, 13, 4.5, 0, -Math.PI / 2, -Math.PI / 2 + armProgress * Math.PI * 2);
        ctx.stroke();

        // Recessed Amber Charging Core
        const chargeFlash = (Math.sin(this.animTimer / 110) + 1) / 2;
        ctx.save();
        ctx.shadowBlur = 8;
        ctx.shadowColor = '#f59e0b';
        ctx.fillStyle = `rgba(245, 158, 11, ${0.4 + chargeFlash * 0.55})`;
        ctx.beginPath();
        ctx.ellipse(cx, liftY - 2, 5.5, 2.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else {
        // --- FULLY ARMED: Dwarven Forged Runic Pressure Mine ---
        const mineY = cy + 22;
        const dangerPulse = (Math.sin(this.animTimer / 50) + 1) / 2;

        // 1. Outer Crimson/Amber Proximity Ward Ring
        ctx.save();
        ctx.shadowBlur = 14;
        ctx.shadowColor = '#ef4444';
        ctx.strokeStyle = `rgba(239, 68, 68, ${0.55 + dangerPulse * 0.45})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, mineY + 4, 23, 8, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();

        // 2. Heavy Forged Iron & Burnished Bronze Base Flange
        const baseGrad = ctx.createLinearGradient(cx - 20, mineY - 4, cx + 20, mineY + 7);
        baseGrad.addColorStop(0, '#475569');
        baseGrad.addColorStop(0.45, '#1e293b');
        baseGrad.addColorStop(1, '#090d16');
        ctx.fillStyle = baseGrad;
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.ellipse(cx, mineY + 3, 20, 7.5, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // 3. Domed Dwarven Mine Hull
        const hullGrad = ctx.createRadialGradient(cx - 5, mineY - 6, 2, cx, mineY, 18);
        hullGrad.addColorStop(0, '#64748b');
        hullGrad.addColorStop(0.45, '#334155');
        hullGrad.addColorStop(0.85, '#1e293b');
        hullGrad.addColorStop(1, '#0f172a');
        ctx.fillStyle = hullGrad;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(cx - 18, mineY + 2);
        ctx.quadraticCurveTo(cx - 16, mineY - 11, cx, mineY - 11);
        ctx.quadraticCurveTo(cx + 16, mineY - 11, cx + 18, mineY + 2);
        ctx.ellipse(cx, mineY + 2, 18, 6, 0, 0, Math.PI);
        ctx.fill();
        ctx.stroke();

        // 4. Brass Rivets Around the Mine Rim
        ctx.fillStyle = '#fbbf24';
        for (let r = 0; r < 6; r++) {
          const rAng = (r * Math.PI) / 5 - Math.PI * 0.1;
          const rx = cx + Math.cos(rAng) * 14.5;
          const ry = mineY + 1 + Math.sin(rAng) * 4.5;
          ctx.beginPath();
          ctx.arc(rx, ry, 1.4, 0, Math.PI * 2);
          ctx.fill();
        }

        // 5. Glowing Magma Vent Seams on the Dome
        ctx.save();
        ctx.shadowBlur = 10 + dangerPulse * 6;
        ctx.shadowColor = '#ef4444';
        ctx.strokeStyle = '#f97316';
        ctx.lineWidth = 1.6;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(cx - 11, mineY - 2);
        ctx.lineTo(cx - 5, mineY - 5);
        ctx.moveTo(cx + 11, mineY - 2);
        ctx.lineTo(cx + 5, mineY - 5);
        ctx.moveTo(cx, mineY + 4);
        ctx.lineTo(cx, mineY - 1);
        ctx.stroke();

        // 6. Central Volatile Magma-Crystal Pressure Plate & Beacon
        const coreGrad = ctx.createRadialGradient(cx, mineY - 7, 1, cx, mineY - 7, 7.5);
        coreGrad.addColorStop(0, '#ffffff');
        coreGrad.addColorStop(0.35, '#fef08a');
        coreGrad.addColorStop(0.7, '#ef4444');
        coreGrad.addColorStop(1, '#7f1d1d');
        ctx.fillStyle = coreGrad;
        ctx.strokeStyle = '#fbbf24';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(cx, mineY - 7, 7.5, 3.8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Faceted Volatile Ruby/Magma Detonator Crystal Spike
        const spikeBounce = Math.sin(this.animTimer / 65) * 1.2;
        ctx.fillStyle = '#ef4444';
        ctx.strokeStyle = '#fef08a';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(cx, mineY - 19 + spikeBounce);
        ctx.lineTo(cx + 4.5, mineY - 11 + spikeBounce);
        ctx.lineTo(cx, mineY - 7 + spikeBounce);
        ctx.lineTo(cx - 4.5, mineY - 11 + spikeBounce);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(cx, mineY - 12 + spikeBounce, 1.8, 0, Math.PI * 2);
        ctx.fill();

        // Crackling energy arcs around the armed crystal
        ctx.strokeStyle = `rgba(254, 240, 138, ${0.6 + dangerPulse * 0.4})`;
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 4; i++) {
          const ang = (i * Math.PI) / 2 + this.animTimer * 0.04;
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * 5, mineY - 12 + spikeBounce + Math.sin(ang) * 3);
          ctx.lineTo(cx + Math.cos(ang) * 9, mineY - 12 + spikeBounce + Math.sin(ang) * 5);
          ctx.stroke();
        }
        ctx.restore();
      }
    });
  }
}
