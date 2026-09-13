import { Attacker } from '../entities/Attacker';


export class BasicZombie extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1000;

  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 100, 30, 20, row);
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime);
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
      ctx.fillStyle = '#261c14'; // Dark leather boots
      // Left leg
      ctx.fillRect(cx - 10 + walkCycle * 5, cy + 22, 8, 18);
      // Right leg
      ctx.fillRect(cx + 2 - walkCycle * 5, cy + 22, 8, 18);

      // ── Tattered Chainmail & Runic Tunic ──
      const bodyGrad = ctx.createLinearGradient(cx - 16, cy - 8, cx + 16, cy + 24);
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.5, '#1e293b');
      bodyGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 16, cy - 8, 32, 32, 4);
      ctx.fill();

      // Rusted Iron Breastplate with bronze studs
      ctx.fillStyle = '#475569';
      ctx.fillRect(cx - 12, cy - 6, 24, 18);
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.arc(cx - 8, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(cx + 8, cy - 2, 1.5, 0, Math.PI * 2);
      ctx.arc(cx, cy + 6, 1.5, 0, Math.PI * 2);
      ctx.fill();

      // Ragged Frost Cloak Trim (torn fabric)
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.moveTo(cx - 16, cy + 24);
      ctx.lineTo(cx - 12, cy + 30);
      ctx.lineTo(cx - 8, cy + 24);
      ctx.lineTo(cx, cy + 31);
      ctx.lineTo(cx + 8, cy + 24);
      ctx.lineTo(cx + 12, cy + 30);
      ctx.lineTo(cx + 16, cy + 24);
      ctx.closePath();
      ctx.fill();

      // ── Draugr Head (Gaunt frosty bone tone) ──
      const headY = cy - 22 + eatCycle;
      const headGrad = ctx.createLinearGradient(cx - 16, headY - 16, cx + 16, headY + 16);
      headGrad.addColorStop(0, '#94a3b8');
      headGrad.addColorStop(0.5, '#64748b');
      headGrad.addColorStop(1, '#475569');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(cx, headY, 15, 0, Math.PI * 2);
      ctx.fill();

      // Sunken jaw
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(cx - 9, headY + 4, 18, 10, 3);
      ctx.fill();

      // Jagged teeth
      ctx.fillStyle = '#f1f5f9';
      for (let t = 0; t < 4; t++) {
        ctx.fillRect(cx - 6 + t * 4, headY + 5, 2, 4);
        ctx.fillRect(cx - 6 + t * 4, headY + 10, 2, 3);
      }

      // ── Cursed Glowing Eyes ──
      ctx.shadowColor = '#00e5ff';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#38bdf8';
      ctx.beginPath();
      ctx.arc(cx - 6, headY - 2, 3.2, 0, Math.PI * 2);
      ctx.arc(cx + 6, headY - 2, 3.2, 0, Math.PI * 2);
      ctx.fill();
      // Pupil core
      ctx.fillStyle = '#f0fdf4';
      ctx.beginPath();
      ctx.arc(cx - 6, headY - 2, 1.2, 0, Math.PI * 2);
      ctx.arc(cx + 6, headY - 2, 1.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── Weathered Horned Skullcap ──
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.arc(cx, headY - 4, 16, Math.PI, 0);
      ctx.fill();
      // Bronze brow band
      ctx.fillStyle = '#ca8a04';
      ctx.fillRect(cx - 15, headY - 7, 30, 4);
      // Nasal guard
      ctx.fillRect(cx - 2, headY - 5, 4, 8);

      // Curved Iron Horns
      ctx.fillStyle = '#cbd5e1';
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 6);
      ctx.quadraticCurveTo(cx - 24, headY - 14, cx - 18, headY - 20);
      ctx.quadraticCurveTo(cx - 16, headY - 12, cx - 11, headY - 8);
      ctx.closePath();
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 14, headY - 6);
      ctx.quadraticCurveTo(cx + 24, headY - 14, cx + 18, headY - 20);
      ctx.quadraticCurveTo(cx + 16, headY - 12, cx + 11, headY - 8);
      ctx.closePath();
      ctx.fill();

      // ── Arms & Rusted Broadsword ──
      const armSwing = this.isEating ? Math.sin(this.animTimer / 100) * 0.4 : walkCycle * 0.3;
      ctx.save();
      ctx.translate(cx - 12, cy - 2);
      ctx.rotate(-0.3 + armSwing);
      // Forearm
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 14);
      ctx.stroke();
      // Rusted Sword
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-10, 10);
      ctx.lineTo(-24, 28);
      ctx.lineTo(-21, 30);
      ctx.lineTo(-7, 12);
      ctx.closePath();
      ctx.fill();
      // Sword crossguard
      ctx.fillStyle = '#b45309';
      ctx.fillRect(-14, 11, 8, 3);
      ctx.restore();
    });
  }
}
