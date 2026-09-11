import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class WallNut extends Defender {
  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 500, 50, row, col);
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // Health ratio
      const hpRatio = Math.max(0, this.health / this.maxHealth);

      // --- Ground Shadow ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 36, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Stepped Stone Foundation Plinth ---
      const baseGrad = ctx.createLinearGradient(cx - 25, cy + 24, cx + 25, cy + 36);
      baseGrad.addColorStop(0, '#1e293b');
      baseGrad.addColorStop(0.5, '#334155');
      baseGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 25, cy + 24, 50, 13, 3);
      ctx.fill();
      ctx.stroke();

      // Foundation base iron studs
      ctx.fillStyle = '#94a3b8';
      for (const ox of [-18, -6, 6, 18]) {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + 30, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. Main Fortress Tower Body ---
      const bodyGrad = ctx.createLinearGradient(cx - 21, cy - 18, cx + 21, cy + 24);
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.3, '#475569');
      bodyGrad.addColorStop(0.7, '#334155');
      bodyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bodyGrad;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 21, cy - 18, 42, 43, 3);
      ctx.fill();
      ctx.stroke();

      // Stone brick horizontal & vertical mortar lines
      ctx.strokeStyle = 'rgba(15, 23, 42, 0.65)';
      ctx.lineWidth = 1.2;
      // Row 1
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy - 4);
      ctx.lineTo(cx + 20, cy - 4);
      ctx.moveTo(cx - 20, cy + 10);
      ctx.lineTo(cx + 20, cy + 10);
      // Vertical joints
      ctx.moveTo(cx - 7, cy - 18); ctx.lineTo(cx - 7, cy - 4);
      ctx.moveTo(cx + 8, cy - 18); ctx.lineTo(cx + 8, cy - 4);
      ctx.moveTo(cx, cy - 4);       ctx.lineTo(cx, cy + 10);
      ctx.moveTo(cx - 10, cy + 10); ctx.lineTo(cx - 10, cy + 24);
      ctx.moveTo(cx + 10, cy + 10); ctx.lineTo(cx + 10, cy + 24);
      ctx.stroke();

      // --- 3. Fortified Crenellations (Battlements) ---
      const battlementGrad = ctx.createLinearGradient(cx - 23, cy - 32, cx + 23, cy - 18);
      battlementGrad.addColorStop(0, '#475569');
      battlementGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = battlementGrad;
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.5;

      // Overhanging parapet ledge
      ctx.beginPath();
      ctx.roundRect(cx - 23, cy - 20, 46, 5, 2);
      ctx.fill();
      ctx.stroke();

      // 3 Crenellation Merlons (Left, Center, Right)
      const merlonWidth = 11;
      const merlonHeight = 12;
      const merlonY = cy - 31;
      [-17, -5.5, 6].forEach(mx => {
        ctx.beginPath();
        ctx.roundRect(cx + mx, merlonY, merlonWidth, merlonHeight, [3, 3, 0, 0]);
        ctx.fill();
        ctx.stroke();
      });

      // --- 4. Heavy Iron Reinforcement Bands & Rivets ---
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 21, cy + 2, 42, 4);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 21, cy + 2, 42, 4);

      ctx.fillStyle = '#cbd5e1';
      for (const rx of [-16, -8, 0, 8, 16]) {
        ctx.beginPath();
        ctx.arc(cx + rx, cy + 4, 1.5, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 5. Runic Protection Shield Emblem (Centerpiece) ---
      const runePulse = 0.75 + Math.sin(this.animTimer / 180) * 0.25;
      ctx.save();
      ctx.shadowBlur = 12 * runePulse;
      ctx.shadowColor = '#38bdf8';

      // Shield boss plate
      const shieldGrad = ctx.createRadialGradient(cx, cy - 7, 2, cx, cy - 7, 13);
      shieldGrad.addColorStop(0, '#1e293b');
      shieldGrad.addColorStop(1, '#0c4a6e');
      ctx.fillStyle = shieldGrad;
      ctx.strokeStyle = `rgba(56, 189, 248, ${0.6 + runePulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(cx, cy - 7, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Carved Norse Bastion Rune (ᛟ - Odal / Protection)
      ctx.strokeStyle = '#e0f2fe';
      ctx.lineWidth = 2.2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      // Odal Rune shape
      ctx.moveTo(cx, cy - 14);
      ctx.lineTo(cx - 5, cy - 9);
      ctx.lineTo(cx, cy - 4);
      ctx.lineTo(cx + 5, cy - 9);
      ctx.closePath();
      ctx.moveTo(cx - 5, cy - 9);
      ctx.lineTo(cx - 7, cy - 2);
      ctx.moveTo(cx + 5, cy - 9);
      ctx.lineTo(cx + 7, cy - 2);
      ctx.stroke();
      ctx.restore();

      // --- 6. Arrow Slit ---
      ctx.fillStyle = '#020617';
      ctx.beginPath();
      ctx.roundRect(cx - 2, cy + 12, 4, 8, 1);
      ctx.fill();

      // --- 7. Damage Cracks (When under siege) ---
      if (hpRatio < 0.65) {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 1.8;
        ctx.beginPath();
        ctx.moveTo(cx - 16, cy + 18);
        ctx.lineTo(cx - 8, cy + 12);
        ctx.lineTo(cx - 12, cy + 3);
        ctx.lineTo(cx - 6, cy - 3);
        ctx.stroke();
      }
      if (hpRatio < 0.35) {
        ctx.strokeStyle = '#020617';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(cx + 18, cy + 20);
        ctx.lineTo(cx + 10, cy + 8);
        ctx.lineTo(cx + 14, cy - 2);
        ctx.lineTo(cx + 8, cy - 14);
        ctx.moveTo(cx - 14, cy - 26);
        ctx.lineTo(cx - 8, cy - 20);
        ctx.stroke();
      }
    });
  }
}
