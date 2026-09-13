import { Attacker } from '../entities/Attacker';

export class BucketheadZombie extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 400, 30, 20, row);
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

      // ── Stride Legs & Heavy Iron Greaves ──
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(cx - 10 + walkCycle * 5, cy + 22, 8, 18);
      ctx.fillRect(cx + 2 - walkCycle * 5, cy + 22, 8, 18);
      // Knee iron caps
      ctx.fillStyle = '#64748b';
      ctx.fillRect(cx - 11 + walkCycle * 5, cy + 26, 10, 4);
      ctx.fillRect(cx + 1 - walkCycle * 5, cy + 26, 10, 4);

      // ── Heavy Iron Plate Armor Body ──
      const bodyGrad = ctx.createLinearGradient(cx - 17, cy - 8, cx + 17, cy + 24);
      bodyGrad.addColorStop(0, '#475569');
      bodyGrad.addColorStop(0.5, '#334155');
      bodyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 17, cy - 8, 34, 32, 4);
      ctx.fill();
      ctx.strokeStyle = '#64748b';
      ctx.lineWidth = 1.2;
      ctx.stroke();

      // Massive Riveted Iron Greathelm
      const headY = cy - 22 + eatCycle;
      const helmGrad = ctx.createLinearGradient(cx - 18, headY - 30, cx + 18, headY + 12);
      helmGrad.addColorStop(0, '#64748b');
      helmGrad.addColorStop(0.4, '#475569');
      helmGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = helmGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 17, headY - 24, 34, 36, 4);
      ctx.fill();
      ctx.strokeStyle = '#94a3b8';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Horizontal Visor Slit
      ctx.fillStyle = '#090d16';
      ctx.fillRect(cx - 14, headY - 6, 28, 5);

      // Glowing Cursed Red Eyes peering through visor slit
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#f87171';
      ctx.fillRect(cx - 9, headY - 5, 5, 3);
      ctx.fillRect(cx + 4, headY - 5, 5, 3);
      ctx.shadowBlur = 0;

      // Vertical Breathing Slits on Greathelm Lower Face
      ctx.fillStyle = '#0f172a';
      for (let s = 0; s < 5; s++) {
        ctx.fillRect(cx - 10 + s * 5, headY + 3, 2, 6);
      }

      // Bronze Reinforcement Cross Band on Helmet
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 17, headY - 10, 34, 3); // Horizontal band above visor
      ctx.fillRect(cx - 2, headY - 24, 4, 36);   // Vertical nasal band

      // Iron Rivets along the band
      ctx.fillStyle = '#e2e8f0';
      [-13, -7, 7, 13].forEach(rx => {
        ctx.beginPath();
        ctx.arc(cx + rx, headY - 8.5, 1.2, 0, Math.PI * 2);
        ctx.fill();
      });

      // ── Arms & Heavy Battle Axe ──
      const armSwing = this.isEating ? Math.sin(this.animTimer / 100) * 0.4 : walkCycle * 0.3;
      ctx.save();
      ctx.translate(cx - 12, cy - 2);
      ctx.rotate(-0.3 + armSwing);
      ctx.strokeStyle = '#475569';
      ctx.lineWidth = 7;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-12, 14);
      ctx.stroke();

      // Battle Axe Shaft
      ctx.fillStyle = '#3e2723';
      ctx.fillRect(-15, 6, 5, 34);

      // Crescent Iron Axe Blade
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-15, 26);
      ctx.quadraticCurveTo(-34, 28, -30, 42);
      ctx.lineTo(-10, 38);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();
    });
  }
}
