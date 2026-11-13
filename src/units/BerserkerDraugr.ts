import { Attacker } from '../entities/Attacker';

export class BerserkerDraugr extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 54, 90, 195, 21, 20, row);
    this.enemyKind = 'berserker';
    this.attackStyle = 'blade';
    this.attackRate = 940;
    this.mass = 1.2;
  }

  override getHeadClearance(): number {
    return 22;
  }

  override getEffectiveSpeed(): number {
    return this.enraged ? this.speed * 1.52 : this.speed;
  }

  override getEffectiveAttackRate(): number {
    return this.enraged ? 620 : this.attackRate;
  }

  override takeDamage(amount: number) {
    const wasEnraged = this.enraged;
    super.takeDamage(amount);
    if (!wasEnraged && this.health > 0 && this.health <= this.maxHealth * 0.65) {
      this.enraged = true;
      this.justEnraged = true;
      this.scaleX = 1.16;
      this.scaleY = 0.88;
    }
  }

  private drawFurBootLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 9.5;
    const footY = hipY + 21 - lift * 5;
    const kneeX = (hipX + footX) * 0.5 - 2.2;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.6;

    c.save();
    c.strokeStyle = '#090d16';
    c.lineWidth = 8.8;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#291d12' : '#451a03';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Bear-fur shin cuff
    c.fillStyle = isBack ? '#3f2e21' : '#573d28';
    c.beginPath();
    c.ellipse(kneeX, kneeY + 4, 4.2, 3, 0, 0, Math.PI * 2);
    c.fill();

    // Rawhide Raider Boot
    c.fillStyle = isBack ? '#1c140d' : '#291d12';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(footX + 3.5, footY - 2);
    c.lineTo(footX - 7, footY + 0.5);
    c.quadraticCurveTo(footX - 8, footY + 3.5, footX - 4, footY + 4);
    c.lineTo(footX + 4, footY + 3.5);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  private drawHandAxe(c: CanvasRenderingContext2D, glowingRage: boolean) {
    // Curved hickory haft
    c.fillStyle = '#451a03';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.1;
    c.beginPath();
    c.roundRect(-2, -20, 4, 24, 1.5);
    c.fill();
    c.stroke();

    // Bearded Viking Skeggöx Blade pointing forward-left
    const bladeGrad = c.createLinearGradient(0, -19, -15, -10);
    bladeGrad.addColorStop(0, '#475569');
    bladeGrad.addColorStop(0.55, '#cbd5e1');
    bladeGrad.addColorStop(1, glowingRage ? '#fed7aa' : '#f8fafc');
    c.fillStyle = bladeGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.25;
    c.beginPath();
    c.moveTo(-1, -19);
    c.quadraticCurveTo(-12, -22, -15.5, -17);
    c.quadraticCurveTo(-17.5, -11, -11, -5.5);
    c.quadraticCurveTo(-6, -10, -1, -11);
    c.closePath();
    c.fill();
    c.stroke();

    if (glowingRage) {
      c.strokeStyle = 'rgba(249, 115, 22, 0.85)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(-9, -17);
      c.lineTo(-9, -10);
      c.stroke();
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stridePeriod = this.enraged ? 96 : 128;
      const stride = this.isEating || this.isStunned ? 0 : animT / stridePeriod;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating ? Math.sin(animT / 85) * 1.6 : Math.abs(walkCos) * 2.8;
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow & Blood-Rage Ember Aura ──
      c.fillStyle = 'rgba(2, 6, 23, 0.48)';
      c.beginPath();
      c.ellipse(cx, cy + 42, 22, 6, 0, 0, Math.PI * 2);
      c.fill();

      if (this.enraged) {
        const ragePulse = 0.25 + 0.12 * Math.sin(animT / 95);
        c.save();
        c.fillStyle = `rgba(239, 68, 68, ${ragePulse})`;
        c.strokeStyle = 'rgba(249, 115, 22, 0.6)';
        c.lineWidth = 1.4;
        c.beginPath();
        c.ellipse(cx, cy + 41, 24, 6.8, 0, 0, Math.PI * 2);
        c.fill();
        c.stroke();
        c.restore();
      }

      // ── 2. Shaggy Cave-Bear Pelt Cloak (Trailing Right) ──
      const peltWave = Math.sin(animT / 140) * 3.5;
      const peltGrad = c.createLinearGradient(cx - 2, cy - 15, cx + 24, cy + 28);
      peltGrad.addColorStop(0, '#573d28');
      peltGrad.addColorStop(0.55, '#291d12');
      peltGrad.addColorStop(1, '#140d07');
      c.fillStyle = peltGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx + 3, cy - 13 - bob);
      c.quadraticCurveTo(cx + 21, cy + 1 + peltWave * 0.4, cx + 25 + peltWave, cy + 22);
      c.lineTo(cx + 18 + peltWave * 0.7, cy + 19);
      c.lineTo(cx + 16 + peltWave * 0.6, cy + 27);
      c.lineTo(cx + 9 + peltWave * 0.3, cy + 21);
      c.lineTo(cx + 3, cy + 25);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Off-Hand Muscular Arm & Second Viking Hand-Axe ──
      const offSwing = this.isEating ? -pose.armSwing * 0.72 + 0.25 : walkSin * 0.38;
      c.save();
      c.translate(cx - 9, cy - 4 - bob);
      c.rotate(-0.28 + offSwing);
      c.strokeStyle = '#090d16';
      c.lineWidth = 7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 9);
      c.stroke();
      c.strokeStyle = '#64748b';
      c.lineWidth = 4.6;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 9);
      c.stroke();

      c.save();
      c.translate(-9, 9);
      c.rotate(-0.55);
      this.drawHandAxe(c, this.enraged);
      c.restore();
      c.restore();

      // ── 4. Striding Fur-Bound Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawFurBootLeg(c, cx - 4, cy + 17 - bob * 0.4, -walkSin * 0.72, backLift, true);
      this.drawFurBootLeg(c, cx + 4, cy + 18 - bob * 0.4, walkSin * 0.72, frontLift, false);

      // ── 5. Bare Scarred Berserker Chest & Glowing Blood-Runes ──
      const torsoY = cy - 10 - bob;
      const chestGrad = c.createLinearGradient(cx - 13, torsoY, cx + 13, torsoY + 26);
      chestGrad.addColorStop(0, '#94a3b8');
      chestGrad.addColorStop(0.55, '#64748b');
      chestGrad.addColorStop(1, '#334155');
      c.fillStyle = chestGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(cx - 12, torsoY, 24, 23, 5);
      c.fill();
      c.stroke();

      // Crimson Woad War-Paint Stripes (ignite orange-red in Blood-Rage!)
      c.save();
      c.strokeStyle = this.enraged ? '#fb923c' : '#b91c1c';
      if (this.enraged) {
        c.shadowColor = '#ef4444';
        c.shadowBlur = 9;
      }
      c.lineWidth = 2.2;
      c.beginPath();
      c.moveTo(cx - 9, torsoY + 4);
      c.lineTo(cx + 3, torsoY + 17);
      c.moveTo(cx + 4, torsoY + 4);
      c.lineTo(cx - 8, torsoY + 17);
      c.stroke();
      c.restore();

      // Shaggy Fur Loincloth & Skull-Buckled Champion Belt
      c.fillStyle = '#291d12';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(cx - 12.5, torsoY + 20, 25, 9, 2);
      c.fill();
      c.stroke();

      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx - 3, torsoY + 22, 3.8, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // ── 6. Bearded Berserker Head & Snarling Cave-Bear Skull Hood ──
      const headX = cx - 2;
      const headY = cy - 23 - bob * 0.9;
      const jawDrop = pose.jawOpen * 4.2 + (this.enraged ? 1.5 : 0);

      // Wild Braided Rust-Red & Frost Beard
      c.fillStyle = '#9a3412';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(headX - 11, headY + 4);
      c.lineTo(headX - 15, headY + 18);
      c.lineTo(headX - 8, headY + 14);
      c.lineTo(headX - 6, headY + 21);
      c.lineTo(headX + 2, headY + 12);
      c.closePath();
      c.fill();
      c.stroke();

      // Snarling Face & Fangs
      c.fillStyle = '#64748b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(headX, headY, 12.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.fillStyle = '#020617';
      c.fillRect(headX - 10, headY + 3.5, 11, 3.5 + jawDrop * 0.6);

      // Blazing Berserker Eyes
      c.save();
      c.shadowColor = this.enraged ? '#ff1744' : '#f97316';
      c.shadowBlur = this.enraged ? 14 : 9;
      c.fillStyle = this.enraged ? '#ff5252' : '#fb923c';
      c.beginPath();
      c.arc(headX - 8.2, headY - 1, 2.4, 0, Math.PI * 2);
      c.arc(headX - 0.5, headY - 1, 2.6, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Cave-Bear Pelt Hood & Upper Bear Skull Trophy Crown
      c.fillStyle = '#451a03';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX + 1.5, headY - 4, 14.5, Math.PI * 0.92, Math.PI * 0.12, false);
      c.closePath();
      c.fill();
      c.stroke();

      // Round Bear Ear on Hood
      c.fillStyle = '#291d12';
      c.beginPath();
      c.arc(headX + 7, headY - 16, 4.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Bleached Bear-Snout Bone & Upper Bear Canines Over Forehead
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(headX - 15, headY - 6);
      c.quadraticCurveTo(headX - 8, headY - 16, headX + 3, headY - 11);
      c.lineTo(headX - 2, headY - 5);
      c.closePath();
      c.fill();
      c.stroke();

      // Bear skull fangs jutting down over brow
      c.fillStyle = '#ffffff';
      c.beginPath();
      c.moveTo(headX - 13.5, headY - 6);
      c.lineTo(headX - 12, headY - 1.5);
      c.lineTo(headX - 10, headY - 6);
      c.moveTo(headX - 6.5, headY - 5.5);
      c.lineTo(headX - 5, headY - 1.5);
      c.lineTo(headX - 3.5, headY - 5.5);
      c.closePath();
      c.fill();

      // ── 7. Foreground Muscular Arm & Primary Viking Hand-Axe ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.36;
      const armRot = pose.armSwing * 1.08 + walkSwing;
      const shoulderX = cx + 7;
      const shoulderY = torsoY + 5;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      // Bear-fur shoulder tuft
      c.fillStyle = '#451a03';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.ellipse(0, 0, 6.8, 5.2, 0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.strokeStyle = '#090d16';
      c.lineWidth = 7.4;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();
      c.strokeStyle = '#64748b';
      c.lineWidth = 4.8;
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();

      c.save();
      c.translate(-10, 11);
      c.rotate(-0.42);
      this.drawHandAxe(c, this.enraged);
      c.restore();
      c.restore();

      // ── 8. Twin Whirlwind Axe Cleave Arcs ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.9;
        c.strokeStyle = this.enraged ? '#fb923c' : '#f87171';
        c.shadowColor = '#ef4444';
        c.shadowBlur = 13;
        c.lineWidth = 3.6;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 7, cy - 2, 25, Math.PI * 0.68, Math.PI * 1.34);
        c.stroke();

        c.strokeStyle = '#fef2f2';
        c.lineWidth = 1.6;
        c.beginPath();
        c.arc(cx - 9, cy + 2, 21, Math.PI * 0.78, Math.PI * 1.25);
        c.stroke();
        c.restore();
      }
    });
  }
}

