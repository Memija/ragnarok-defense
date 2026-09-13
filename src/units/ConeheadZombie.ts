import { Attacker } from '../entities/Attacker';

export class ConeheadZombie extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 250, 30, 20, row);
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const walkCycle = Math.sin(this.animTimer / 140);
      const eatCycle = this.isEating ? Math.sin(this.animTimer / 80) * 4 : 0;

      // ── Ground Shadow ──
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 42, 22, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      // ── Stride Legs & Boots ──
      ctx.fillStyle = '#261c14';
      ctx.fillRect(cx - 10 + walkCycle * 5, cy + 22, 8, 18);
      ctx.fillRect(cx + 2 - walkCycle * 5, cy + 22, 8, 18);

      // ── Tattered Chainmail & Bronze Studded Tunic ──
      const bodyGrad = ctx.createLinearGradient(cx - 16, cy - 8, cx + 16, cy + 24);
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.5, '#1e293b');
      bodyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 8, 32, 32, 4);
      ctx.fill();

      // Hardened Bronze Plated Chest Armor
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 13, cy - 6, 26, 20);
      ctx.strokeStyle = '#f59e0b';
      ctx.lineWidth = 1;
      ctx.strokeRect(cx - 13, cy - 6, 26, 20);

      // ── Draugr Head (Frosty gaunt face) ──
      const headY = cy - 22 + eatCycle;
      const headGrad = ctx.createLinearGradient(cx - 16, headY - 16, cx + 16, headY + 16);
      headGrad.addColorStop(0, '#94a3b8');
      headGrad.addColorStop(0.5, '#64748b');
      headGrad.addColorStop(1, '#475569');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(cx, headY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Sunken jaw & teeth
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(cx - 9, headY + 4, 18, 10, 3);
      ctx.fill();
      ctx.fillStyle = '#f1f5f9';
      for (let t = 0; t < 4; t++) {
        ctx.fillRect(cx - 6 + t * 4, headY + 5, 2, 4);
        ctx.fillRect(cx - 6 + t * 4, headY + 10, 2, 3);
      }

      // ── Cursed Glowing Amber Eyes ──
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx - 6, headY - 2, 3.2, 0, Math.PI * 2);
      ctx.arc(cx + 6, headY - 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Forged Conical Iron Spire War Helm ──
      const helmGrad = ctx.createLinearGradient(cx - 18, headY - 48, cx + 18, headY - 4);
      helmGrad.addColorStop(0, '#d97706'); // Burnished bronze crest tip
      helmGrad.addColorStop(0.4, '#475569');
      helmGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = helmGrad;
      ctx.beginPath();
      ctx.moveTo(cx - 16, headY - 6);
      ctx.lineTo(cx + 16, headY - 6);
      ctx.lineTo(cx + 4, headY - 48);
      ctx.lineTo(cx - 4, headY - 48);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Reinforced Gold/Bronze Ridges along helm cone
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(cx - 17, headY - 8, 34, 4);
      ctx.fillRect(cx - 11, headY - 22, 22, 3);
      ctx.fillRect(cx - 6, headY - 36, 12, 3);

      // Nasal Guard
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(cx - 2, headY - 6, 4, 10);

      // ── Arms & Spiked Mace ──
      const armSwing = this.isEating ? Math.sin(this.animTimer / 100) * 0.4 : walkCycle * 0.3;
      ctx.save();
      ctx.translate(cx - 12, cy - 2);
      ctx.rotate(-0.3 + armSwing);
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 14);
      ctx.stroke();
      // Mace handle
      ctx.fillStyle = '#451a03';
      ctx.fillRect(-14, 10, 5, 24);
      // Iron mace head
      ctx.fillStyle = '#64748b';
      ctx.beginPath();
      ctx.arc(-11.5, 36, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }
}
