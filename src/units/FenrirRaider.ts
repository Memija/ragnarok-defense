import { Attacker } from '../entities/Attacker';

export class FenrirRaider extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y + 18, 64, 72, 95, 34, 16, row);
    this.enemyKind = 'fenrir_wolf';
    this.attackStyle = 'bite';
    this.attackRate = 850;
    this.mass = 0.68;
  }

  override getHeadClearance(): number {
    return 12;
  }

  private drawWolfLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    phase: number,
    isHind: boolean,
    isBack: boolean
  ) {
    const strideX = Math.sin(phase) * (isHind ? 11 : 10);
    const lift = Math.max(0, Math.cos(phase));
    const pawX = hipX + strideX;
    const pawY = hipY + 19 - lift * 6.5;
    const jointX = (hipX + pawX) * 0.5 + (isHind ? 4.2 : -2.6);
    const jointY = (hipY + pawY) * 0.5 - 1.5 - lift * 2.2;

    c.save();
    c.strokeStyle = '#090d16';
    c.lineWidth = 7.4;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(jointX, jointY);
    c.lineTo(pawX, pawY);
    c.stroke();

    c.strokeStyle = isBack ? '#1e293b' : '#334155';
    c.lineWidth = 4.8;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(jointX, jointY);
    c.lineTo(pawX, pawY);
    c.stroke();

    // Frost-bone wolf claws pointing left
    c.fillStyle = '#e0f2fe';
    c.strokeStyle = '#090d16';
    c.lineWidth = 0.85;
    for (let cl = 0; cl < 2; cl++) {
      c.beginPath();
      c.moveTo(pawX - 1.5, pawY - 1 + cl * 2);
      c.lineTo(pawX - 7.5, pawY + 0.8 + cl * 2);
      c.lineTo(pawX - 1, pawY + 2 + cl * 2);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const gallop = this.isEating || this.isStunned ? 0 : animT / 92;
      const gSin = Math.sin(gallop);
      const gCos = Math.cos(gallop);
      const bound = this.isEating ? Math.sin(animT / 80) * 1.8 : Math.abs(gSin) * 4.2;
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow & Spectral Frost-Mist Wake ──
      const shadowScale = 1 - bound * 0.035;
      c.fillStyle = 'rgba(2, 6, 23, 0.46)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 3, 27 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = 'rgba(45, 212, 191, 0.16)';
      c.beginPath();
      c.ellipse(cx + 8, this.y + this.height - 4, 19, 3.6, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Streaming Bushy Dire-Wolf Tail (Right) ──
      const bodyY = cy + 3 - bound;
      const tailWave = Math.sin(animT / 110) * 3.8;
      const tailGrad = c.createLinearGradient(cx + 15, bodyY - 2, cx + 35, bodyY + 6);
      tailGrad.addColorStop(0, '#1e293b');
      tailGrad.addColorStop(0.65, '#475569');
      tailGrad.addColorStop(1, '#cbd5e1');
      c.fillStyle = tailGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx + 16, bodyY - 3);
      c.quadraticCurveTo(cx + 28, bodyY - 9 + tailWave * 0.6, cx + 36, bodyY - 2 + tailWave);
      c.lineTo(cx + 31, bodyY + 3 + tailWave * 0.7);
      c.lineTo(cx + 34, bodyY + 7 + tailWave * 0.8);
      c.quadraticCurveTo(cx + 24, bodyY + 8, cx + 15, bodyY + 3);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Far-Side Wolf Legs (Rotary Gallop) ──
      this.drawWolfLeg(c, cx + 12, bodyY + 11, gallop + Math.PI * 0.85, true, true);
      this.drawWolfLeg(c, cx - 10, bodyY + 11, gallop + Math.PI * 0.15, false, true);

      // ── 4. Muscular Dire-Wolf Ribcage, Hackles & Broken Gleipnir Chain ──
      const furGrad = c.createLinearGradient(cx - 18, bodyY - 14, cx + 20, bodyY + 14);
      furGrad.addColorStop(0, '#64748b');
      furGrad.addColorStop(0.45, '#334155');
      furGrad.addColorStop(1, '#0f172a');
      c.fillStyle = furGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      // Deep lupine chest tapering to tucked waist
      c.moveTo(cx - 18, bodyY - 5);
      c.quadraticCurveTo(cx - 6, bodyY - 15, cx + 8, bodyY - 10);
      c.quadraticCurveTo(cx + 19, bodyY - 6, cx + 18, bodyY + 4);
      c.quadraticCurveTo(cx + 8, bodyY + 8, cx - 2, bodyY + 12);
      c.quadraticCurveTo(cx - 14, bodyY + 14, cx - 18, bodyY - 5);
      c.closePath();
      c.fill();
      c.stroke();

      // Bristling Frost-Silver Shoulder Hackle Spikes
      c.fillStyle = '#cbd5e1';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      const hackles = [
        { x: -11, y: -11, dx: 5, dy: -8 },
        { x: -4, y: -12, dx: 6, dy: -7 },
        { x: 3, y: -10, dx: 6, dy: -6 }
      ];
      for (const hk of hackles) {
        c.beginPath();
        c.moveTo(cx + hk.x - 2, bodyY + hk.y + 2);
        c.lineTo(cx + hk.x + hk.dx, bodyY + hk.y + hk.dy);
        c.lineTo(cx + hk.x + 4, bodyY + hk.y + 3);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // Near-Side Wolf Legs
      this.drawWolfLeg(c, cx + 14, bodyY + 12, gallop, true, false);
      this.drawWolfLeg(c, cx - 8, bodyY + 12, gallop + Math.PI * 1.15, false, false);

      // Runic Iron Collar & Trailing Broken Gleipnir Chain Links
      c.save();
      c.translate(cx - 14, bodyY - 2);
      c.rotate(0.45);
      c.fillStyle = '#b45309';
      c.strokeStyle = '#451a03';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-3, -9, 5.5, 18, 2);
      c.fill();
      c.stroke();
      c.restore();

      // Broken chain links whipping behind collar
      c.strokeStyle = '#94a3b8';
      c.lineWidth = 1.6;
      for (let lk = 0; lk < 3; lk++) {
        const lx = cx - 9 + lk * 5.2;
        const ly = bodyY + 4 + Math.sin(animT / 90 + lk) * 2.2;
        c.beginPath();
        c.ellipse(lx, ly, 2.8, 1.6, 0.25, 0, Math.PI * 2);
        c.stroke();
      }

      // ── 5. Snarling Fenrir Wolf Head & Articulated Snapping Jaws ──
      const lungeX = pose.bodyLean * 18;
      const headX = cx - 21 + lungeX;
      const headY = bodyY - 8 - gCos * 1.2;
      const jawOpen = pose.jawOpen * 6.2 + (this.isEating ? 0 : Math.max(0, gSin) * 1.2);

      // Far Pointed Wolf Ear
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(headX - 1, headY - 7);
      c.lineTo(headX + 2, headY - 18);
      c.lineTo(headX + 6, headY - 8);
      c.closePath();
      c.fill();
      c.stroke();

      // Articulated Lower Snapping Jaw & Fangs
      c.save();
      c.translate(headX - 1, headY + 3);
      c.rotate(-jawOpen * 0.085);
      c.fillStyle = '#334155';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(2, 0);
      c.lineTo(-14, 2.5 + jawOpen * 0.35);
      c.lineTo(-12, 6.5 + jawOpen * 0.35);
      c.lineTo(3, 5);
      c.closePath();
      c.fill();
      c.stroke();

      // Lower razor fangs
      c.fillStyle = '#f8fafc';
      c.beginPath();
      c.moveTo(-12, 2.5 + jawOpen * 0.3);
      c.lineTo(-10.5, -2 + jawOpen * 0.2);
      c.lineTo(-9, 2.5 + jawOpen * 0.3);
      c.moveTo(-7, 2 + jawOpen * 0.2);
      c.lineTo(-5.8, -1 + jawOpen * 0.15);
      c.lineTo(-4.5, 2 + jawOpen * 0.2);
      c.closePath();
      c.fill();
      c.restore();

      // Upper Snarling Wolf Skull & Muzzle
      const headGrad = c.createLinearGradient(headX - 16, headY - 10, headX + 10, headY + 6);
      headGrad.addColorStop(0, '#94a3b8');
      headGrad.addColorStop(0.5, '#475569');
      headGrad.addColorStop(1, '#1e293b');
      c.fillStyle = headGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(headX + 9, headY - 7);
      c.quadraticCurveTo(headX, headY - 12, headX - 7, headY - 6);
      c.lineTo(headX - 16, headY - 2); // Elongated wolf snout
      c.lineTo(headX - 15, headY + 3);
      c.lineTo(headX - 2, headY + 3.5);
      c.lineTo(headX + 8, headY + 4);
      c.closePath();
      c.fill();
      c.stroke();

      // Black wolf nose & upper carnassial fangs
      c.fillStyle = '#020617';
      c.beginPath();
      c.arc(headX - 15.5, headY - 1, 2, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(headX - 13, headY + 2.8);
      c.lineTo(headX - 11.5, headY + 7.2);
      c.lineTo(headX - 9.8, headY + 2.8);
      c.moveTo(headX - 8, headY + 3);
      c.lineTo(headX - 6.8, headY + 6.2);
      c.lineTo(headX - 5.5, headY + 3);
      c.closePath();
      c.fill();

      // Near Swept-Back Wolf Ear
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(headX + 3, headY - 7);
      c.lineTo(headX + 11, headY - 18);
      c.lineTo(headX + 9, headY - 5);
      c.closePath();
      c.fill();
      c.stroke();

      // Blazing Ice-Emerald Fenrir Eye & Spectral Trail
      c.save();
      c.shadowColor = '#2dd4bf';
      c.shadowBlur = 10;
      c.fillStyle = '#5eead4';
      c.beginPath();
      c.ellipse(headX - 4.5, headY - 3.5, 3.0, 2.0, -0.2, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.arc(headX - 5.2, headY - 3.6, 1.0, 0, Math.PI * 2);
      c.fill();

      c.strokeStyle = 'rgba(45, 212, 191, 0.5)';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(headX - 2, headY - 3.5);
      c.quadraticCurveTo(headX + 7, headY - 6 + Math.sin(animT / 95) * 1.8, headX + 15, headY - 4);
      c.stroke();
      c.restore();

      // ── 6. Savage Fang & Frost-Claw Rend Arcs (On Strike) ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.9;
        c.strokeStyle = '#2dd4bf';
        c.shadowColor = '#14b8a6';
        c.shadowBlur = 10;
        c.lineCap = 'round';
        for (let r = 0; r < 2; r++) {
          c.lineWidth = 2.6 - r * 0.6;
          c.beginPath();
          c.arc(headX - 10, headY + 2 + r * 5, 16, Math.PI * 0.72, Math.PI * 1.28);
          c.stroke();
        }
        c.restore();
      }
    });
  }
}

