import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';

export class Chomper extends Defender {
  isDigesting: boolean = false;
  digestTimer: number = 0;
  digestDuration: number = 20000; 
  range: number = 60; 

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 150, 150, row, col); 
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    if (this.isDigesting) {
      this.digestTimer += deltaTime;
      if (this.digestTimer >= this.digestDuration) {
        this.isDigesting = false;
        this.digestTimer = 0;
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const sway = Math.sin(this.animTimer / 260 + this.col) * 2.4;

      // 1. Dark Helheim Ground Shadow & Underworld Rune Circle
      ctx.fillStyle = 'rgba(18, 4, 36, 0.52)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 24, 7.5, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(192, 132, 252, 0.45)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(cx, cy + 33, 19, 5.2, 0, 0, Math.PI * 2);
      ctx.stroke();

      // 2. Cursed Helheim Root Tendrils at Base
      const roots = [
        { angle: -0.45, rx: 16, ry: 5.5, ox: -10, oy: 31 },
        { angle: 0.45, rx: 16, ry: 5.5, ox: 10, oy: 31 },
        { angle: 0, rx: 13, ry: 5, ox: 0, oy: 33 },
      ];
      for (const r of roots) {
        ctx.save();
        ctx.translate(cx + r.ox, cy + r.oy);
        ctx.rotate(r.angle);
        const rGrad = ctx.createLinearGradient(-r.rx, 0, r.rx, 0);
        rGrad.addColorStop(0, '#581c87');
        rGrad.addColorStop(0.5, '#3b0764');
        rGrad.addColorStop(1, '#14532d');
        ctx.fillStyle = rGrad;
        ctx.strokeStyle = '#1e0236';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.ellipse(0, 0, r.rx, r.ry, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
      }

      // 3. Coiled Thorny Stem
      const headX = cx + sway;
      const headY = cy - 9;

      ctx.strokeStyle = '#1e0236';
      ctx.lineWidth = 10.5;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(cx, cy + 30);
      ctx.bezierCurveTo(cx - 12, cy + 18, cx + 8, cy + 5, headX - 2, headY + 10);
      ctx.stroke();

      const stemGrad = ctx.createLinearGradient(cx - 8, cy - 5, cx + 8, cy + 30);
      stemGrad.addColorStop(0, '#7e22ce');
      stemGrad.addColorStop(0.5, '#4c1d95');
      stemGrad.addColorStop(1, '#14532d');
      ctx.strokeStyle = stemGrad;
      ctx.lineWidth = 7.5;
      ctx.beginPath();
      ctx.moveTo(cx, cy + 30);
      ctx.bezierCurveTo(cx - 12, cy + 18, cx + 8, cy + 5, headX - 2, headY + 10);
      ctx.stroke();

      // Sharp pale thorns along the stem
      ctx.fillStyle = '#e9d5ff';
      ctx.strokeStyle = '#3b0764';
      ctx.lineWidth = 0.9;
      const thorns = [
        { x: cx - 6, y: cy + 20, dx: -6, dy: -3 },
        { x: cx + 2, y: cy + 11, dx: 6, dy: -3 },
        { x: headX - 5, y: headY + 14, dx: -6, dy: -2 },
      ];
      for (const th of thorns) {
        ctx.beginPath();
        ctx.moveTo(th.x, th.y - 2.5);
        ctx.lineTo(th.x + th.dx, th.y + th.dy);
        ctx.lineTo(th.x, th.y + 2.5);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      // 4. Spiked Neck Collar Frill
      ctx.fillStyle = '#4ade80';
      ctx.strokeStyle = '#052e16';
      ctx.lineWidth = 1.1;
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(headX - 4, headY + 7);
        ctx.lineTo(headX - 16 + i * 4, headY + 4 + i * 6);
        ctx.lineTo(headX - 6, headY + 12);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }

      if (!this.isDigesting) {
        // === READY TO DEVOUR: Wide-Open Articulated Abyssal Jaws ===
        const jawBreath = Math.sin(this.animTimer / 180) * 1.6;

        // Deep glowing abyssal throat cavity
        const throatGrad = ctx.createRadialGradient(headX + 4, headY, 2, headX + 2, headY, 17);
        throatGrad.addColorStop(0, '#f0abfc');
        throatGrad.addColorStop(0.4, '#9333ea');
        throatGrad.addColorStop(0.8, '#3b0764');
        throatGrad.addColorStop(1, '#090114');
        ctx.fillStyle = throatGrad;
        ctx.beginPath();
        ctx.ellipse(headX + 2, headY, 15, 14 + jawBreath * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Glowing Helheim Soul Lure Orb inside throat
        ctx.save();
        ctx.fillStyle = '#f5d0fe';
        ctx.shadowColor = '#e879f9';
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(headX + 1, headY, 3.2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        // Upper Jaw Hood
        const jawGrad = ctx.createLinearGradient(headX - 18, headY - 22, headX + 22, headY + 18);
        jawGrad.addColorStop(0, '#a855f7');
        jawGrad.addColorStop(0.45, '#6b21a8');
        jawGrad.addColorStop(0.85, '#3b0764');
        jawGrad.addColorStop(1, '#1e0236');

        ctx.fillStyle = jawGrad;
        ctx.strokeStyle = '#1e0236';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(headX - 15, headY + 2);
        ctx.bezierCurveTo(headX - 18, headY - 20 - jawBreath, headX + 14, headY - 24 - jawBreath, headX + 23, headY - 7 - jawBreath);
        ctx.quadraticCurveTo(headX + 6, headY - 3, headX - 15, headY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Upper Jaw Fangs (4 curved ivory teeth pointing down)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 0.9;
        const upperFangs = [
          { x: -1, y: -3, w: 4.5, h: 6.5 },
          { x: 5.5, y: -4.5, w: 4.8, h: 7.5 },
          { x: 12, y: -5.5, w: 5, h: 8 },
          { x: 18, y: -6.5, w: 4.5, h: 7 },
        ];
        for (const f of upperFangs) {
          ctx.beginPath();
          ctx.moveTo(headX + f.x, headY + f.y - jawBreath * 0.6);
          ctx.lineTo(headX + f.x + f.w * 0.5, headY + f.y + f.h - jawBreath * 0.6);
          ctx.lineTo(headX + f.x + f.w, headY + f.y - 0.5 - jawBreath * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Lower Jaw Mandible
        ctx.fillStyle = jawGrad;
        ctx.strokeStyle = '#1e0236';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(headX - 14, headY + 2);
        ctx.bezierCurveTo(headX - 16, headY + 21 + jawBreath, headX + 14, headY + 24 + jawBreath, headX + 23, headY + 8 + jawBreath);
        ctx.quadraticCurveTo(headX + 6, headY + 4, headX - 14, headY + 2);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();

        // Lower Jaw Fangs (3 curved ivory teeth pointing up)
        ctx.fillStyle = '#f8fafc';
        ctx.strokeStyle = '#3b0764';
        ctx.lineWidth = 0.9;
        const lowerFangs = [
          { x: 2, y: 4.5, w: 4.5, h: 6.5 },
          { x: 9, y: 5.5, w: 5, h: 7.5 },
          { x: 16, y: 6.5, w: 4.8, h: 7 },
        ];
        for (const f of lowerFangs) {
          ctx.beginPath();
          ctx.moveTo(headX + f.x, headY + f.y + jawBreath * 0.6);
          ctx.lineTo(headX + f.x + f.w * 0.5, headY + f.y - f.h + jawBreath * 0.6);
          ctx.lineTo(headX + f.x + f.w, headY + f.y + 0.5 + jawBreath * 0.6);
          ctx.closePath();
          ctx.fill();
          ctx.stroke();
        }

        // Glowing Helheim Rune & Dorsal Spikes on Upper Hood
        ctx.strokeStyle = '#e879f9';
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(headX - 6, headY - 9 - jawBreath * 0.5);
        ctx.lineTo(headX - 2, headY - 13 - jawBreath * 0.5);
        ctx.lineTo(headX + 2, headY - 9 - jawBreath * 0.5);
        ctx.stroke();
      } else {
        // === DIGESTING PREY: Clamped Jaws, Pulsing Bulb & Helheim Spore Bubbles ===
        const pulseRx = 20 + Math.sin(this.animTimer / 140) * 2.8;
        const pulseRy = 16 + Math.cos(this.animTimer / 140) * 2.4;
        const digestProgress = Math.min(1, this.digestTimer / this.digestDuration);

        const bulbGrad = ctx.createRadialGradient(headX - 4, headY - 5, 3, headX, headY, pulseRx);
        bulbGrad.addColorStop(0, '#c084fc');
        bulbGrad.addColorStop(0.45, '#7e22ce');
        bulbGrad.addColorStop(0.85, '#3b0764');
        bulbGrad.addColorStop(1, '#1e0236');

        ctx.save();
        ctx.shadowColor = '#a855f7';
        ctx.shadowBlur = 12;
        ctx.fillStyle = bulbGrad;
        ctx.strokeStyle = '#1e0236';
        ctx.lineWidth = 1.7;
        ctx.beginPath();
        ctx.ellipse(headX + 1, headY, pulseRx, pulseRy, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.restore();

        // Clamped Mouth Seam with Interlocking Fangs
        ctx.strokeStyle = '#1e0236';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(headX - 4, headY + 1);
        ctx.quadraticCurveTo(headX + 8, headY - 2, headX + pulseRx - 1, headY + 1);
        ctx.stroke();

        ctx.fillStyle = '#f8fafc';
        for (let t = 0; t < 4; t++) {
          const tx = headX + 1 + t * 4.5;
          const dir = t % 2 === 0 ? 1 : -1;
          ctx.beginPath();
          ctx.moveTo(tx, headY);
          ctx.lineTo(tx + 2, headY + dir * 4.5);
          ctx.lineTo(tx + 4, headY);
          ctx.closePath();
          ctx.fill();
        }

        // Rising Digestive Acid / Spore Bubbles & Progress Arc
        for (let b = 0; b < 3; b++) {
          const bPhase = ((this.animTimer * 0.0015 + b * 0.33) % 1);
          const bx = headX - 6 + b * 7 + Math.sin(bPhase * 6 + b) * 3;
          const by = headY - pulseRy - bPhase * 14;
          ctx.fillStyle = `rgba(192, 132, 252, ${(1 - bPhase) * 0.8})`;
          ctx.beginPath();
          ctx.arc(bx, by, 2 + (1 - bPhase) * 1.8, 0, Math.PI * 2);
          ctx.fill();
        }

        // Subtle digestion progress arc around base
        ctx.strokeStyle = '#4ade80';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(cx, cy + 33, 12, -Math.PI / 2, -Math.PI / 2 + digestProgress * Math.PI * 2);
        ctx.stroke();
      }
    });
  }
}
