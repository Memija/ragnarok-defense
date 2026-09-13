import { Attacker } from '../entities/Attacker';

export class Troll extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1200;

  constructor(x: number, y: number, row: number) {
    super(x, y - 10, 70, 110, 300, 15, 40, row); // Tanky, slow, heavy damage
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const t = this.animTimer / 200;
      const sway = Math.sin(t) * 2;
      const breathe = Math.cos(t * 0.8) * 1.5;

      // Drop shadow on ground
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, this.y + this.height - 4, 34, 12, 0, 0, Math.PI * 2);
      ctx.fill();

      // Stone Legs
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy + 26, 18, 26, 4);
      ctx.roundRect(cx + 6, cy + 26, 18, 26, 4);
      ctx.fill();

      // Torso - Cragstone Mountain Jötunn
      const bodyGrad = ctx.createLinearGradient(cx - 30, cy - 20, cx + 30, cy + 35);
      bodyGrad.addColorStop(0, '#475569');
      bodyGrad.addColorStop(0.5, '#334155');
      bodyGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.roundRect(cx - 32, cy - 14 + breathe, 64, 46, 10);
      ctx.fill();

      // Moss & Lichen Patches
      ctx.fillStyle = '#4d7c0f';
      ctx.beginPath();
      ctx.ellipse(cx - 18, cy - 6 + breathe, 8, 4, 0.2, 0, Math.PI * 2);
      ctx.ellipse(cx + 16, cy + 8 + breathe, 10, 5, -0.3, 0, Math.PI * 2);
      ctx.fill();

      // Heavy Runic Stone Belt
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(cx - 30, cy + 22 + breathe, 60, 8);
      ctx.fillStyle = '#d97706';
      ctx.fillRect(cx - 6, cy + 20 + breathe, 12, 12); // Bronze buckle

      // Left Arm (holding weapon back or supporting)
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.roundRect(cx + 24, cy - 10 + breathe, 14, 34, 6);
      ctx.fill();

      // Spiked Boulder Club & Right Arm
      const clubX = cx - 28;
      const clubY = cy - 2 + sway;
      // Club Handle (thick gnarled wood with leather wraps)
      ctx.save();
      ctx.translate(clubX, clubY);
      ctx.rotate(-0.35 + Math.sin(t) * 0.1);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-6, -15, 12, 58);
      ctx.strokeStyle = '#b45309';
      ctx.lineWidth = 1.5;
      for (let i = -8; i < 35; i += 8) {
        ctx.beginPath();
        ctx.moveTo(-6, i);
        ctx.lineTo(6, i + 4);
        ctx.stroke();
      }

      // Massive Spiked Crag Boulder Head
      const rockGrad = ctx.createRadialGradient(0, 42, 2, 0, 42, 22);
      rockGrad.addColorStop(0, '#64748b');
      rockGrad.addColorStop(0.7, '#334155');
      rockGrad.addColorStop(1, '#0f172a');
      ctx.fillStyle = rockGrad;
      ctx.beginPath();
      ctx.arc(0, 42, 19, 0, Math.PI * 2);
      ctx.fill();

      // Iron Spikes on boulder
      ctx.fillStyle = '#cbd5e1';
      const spikeAngles = [-Math.PI * 0.75, -Math.PI * 0.25, 0, Math.PI * 0.35, Math.PI * 0.75];
      spikeAngles.forEach(ang => {
        const sx = Math.cos(ang) * 19;
        const sy = 42 + Math.sin(ang) * 19;
        ctx.beginPath();
        ctx.moveTo(sx - 3, sy);
        ctx.lineTo(sx + Math.cos(ang) * 10, sy + Math.sin(ang) * 10);
        ctx.lineTo(sx + 3, sy);
        ctx.fill();
      });
      ctx.restore();

      // Right shoulder / arm (foreground)
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.roundRect(cx - 36, cy - 12 + breathe, 16, 36, 7);
      ctx.fill();

      // Massive Cragstone Head & Heavy Brow
      const headY = cy - 36 + breathe * 0.7;
      const headGrad = ctx.createRadialGradient(cx, headY, 4, cx, headY, 24);
      headGrad.addColorStop(0, '#64748b');
      headGrad.addColorStop(0.8, '#334155');
      headGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(cx, headY, 22, 0, Math.PI * 2);
      ctx.fill();

      // Heavy granite brow
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 18, headY - 8, 36, 9, 3);
      ctx.fill();

      // Piercing glowing amber/fiery eyes
      ctx.shadowBlur = 8;
      ctx.shadowColor = '#f59e0b';
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.arc(cx - 9, headY - 2, 4, 0, Math.PI * 2);
      ctx.arc(cx + 9, headY - 2, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.arc(cx - 9, headY - 2, 1.8, 0, Math.PI * 2);
      ctx.arc(cx + 9, headY - 2, 1.8, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Rugged Stone Jaw & Protruding Ivory Tusks
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 14, headY + 8, 28, 11, 4);
      ctx.fill();

      // Ivory Tusks
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.moveTo(cx - 11, headY + 12);
      ctx.lineTo(cx - 8, headY + 2);
      ctx.lineTo(cx - 5, headY + 12);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 5, headY + 12);
      ctx.lineTo(cx + 8, headY + 2);
      ctx.lineTo(cx + 11, headY + 12);
      ctx.fill();

      // Forehead Runes (Nordic Giant)
      ctx.fillStyle = 'rgba(251, 191, 36, 0.4)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('ᚦ', cx, headY - 11);
    });
  }
}
