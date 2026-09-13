import { Attacker } from '../entities/Attacker';

export class SmallTroll extends Attacker {
  attackTimer: number = 0;
  attackRate: number = 1000;

  constructor(x: number, y: number, row: number) {
    super(x, y + 15, 45, 75, 150, 25, 20, row); // Weaker, slightly faster than big troll, less damage
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const t = this.animTimer / 140;
      const trot = Math.sin(t) * 3;
      const legOffset = Math.sin(t) * 4;

      // Drop shadow
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(cx, this.y + this.height - 3, 22, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // Scuttling Legs
      ctx.fillStyle = '#1e293b';
      ctx.beginPath();
      ctx.roundRect(cx - 15, cy + 18 + legOffset, 10, 18, 3);
      ctx.roundRect(cx + 5, cy + 18 - legOffset, 10, 18, 3);
      ctx.fill();

      // Spiky Back Ridges
      ctx.fillStyle = '#475569';
      for (let i = -10; i <= 10; i += 7) {
        ctx.beginPath();
        ctx.moveTo(cx + 14, cy + i + trot);
        ctx.lineTo(cx + 22, cy + i - 3 + trot);
        ctx.lineTo(cx + 14, cy + i + 4 + trot);
        ctx.fill();
      }

      // Wiry Hunched Torso
      const grad = ctx.createLinearGradient(cx - 18, cy - 10, cx + 18, cy + 20);
      grad.addColorStop(0, '#475569');
      grad.addColorStop(0.6, '#334155');
      grad.addColorStop(1, '#0f172a');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.roundRect(cx - 18, cy - 10 + trot, 36, 32, 6);
      ctx.fill();

      // Mossy splotches
      ctx.fillStyle = '#65a30d';
      ctx.beginPath();
      ctx.arc(cx - 6, cy + 2 + trot, 5, 0, Math.PI * 2);
      ctx.fill();

      // Spiked Flint Cudgel & Arm
      const cudgelX = cx - 18;
      const cudgelY = cy + trot;
      ctx.save();
      ctx.translate(cudgelX, cudgelY);
      ctx.rotate(-0.4 + Math.sin(t) * 0.2);
      ctx.fillStyle = '#78350f';
      ctx.fillRect(-3, -10, 6, 34); // shaft
      // Flint Head
      ctx.fillStyle = '#94a3b8';
      ctx.beginPath();
      ctx.moveTo(-10, 20);
      ctx.lineTo(0, 32);
      ctx.lineTo(10, 20);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.restore();

      // Hunched Head
      const headY = cy - 22 + trot * 0.8;
      const headGrad = ctx.createRadialGradient(cx - 2, headY, 2, cx - 2, headY, 18);
      headGrad.addColorStop(0, '#64748b');
      headGrad.addColorStop(0.8, '#334155');
      headGrad.addColorStop(1, '#1e293b');
      ctx.fillStyle = headGrad;
      ctx.beginPath();
      ctx.arc(cx - 2, headY, 16, 0, Math.PI * 2);
      ctx.fill();

      // Jagged Pointed Troll Ears
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(cx - 14, headY - 4);
      ctx.lineTo(cx - 24, headY - 14);
      ctx.lineTo(cx - 10, headY - 10);
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(cx + 10, headY - 4);
      ctx.lineTo(cx + 20, headY - 14);
      ctx.lineTo(cx + 6, headY - 10);
      ctx.fill();

      // Glowing feral amber/yellow eyes
      ctx.shadowBlur = 6;
      ctx.shadowColor = '#eab308';
      ctx.fillStyle = '#fef08a';
      ctx.beginPath();
      ctx.arc(cx - 7, headY - 2, 3, 0, Math.PI * 2);
      ctx.arc(cx + 3, headY - 2, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.arc(cx - 7, headY - 2, 1.4, 0, Math.PI * 2);
      ctx.arc(cx + 3, headY - 2, 1.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Sharp fanged jaw
      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.roundRect(cx - 10, headY + 5, 16, 7, 2);
      ctx.fill();
      ctx.fillStyle = '#fef3c7';
      ctx.beginPath();
      ctx.moveTo(cx - 7, headY + 11);
      ctx.lineTo(cx - 5, headY + 5);
      ctx.lineTo(cx - 3, headY + 11);
      ctx.lineTo(cx + 1, headY + 11);
      ctx.lineTo(cx + 3, headY + 5);
      ctx.lineTo(cx + 5, headY + 11);
      ctx.fill();
    });
  }
}
