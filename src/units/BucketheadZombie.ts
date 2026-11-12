import { Attacker } from '../entities/Attacker';

export class BucketheadZombie extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 380, 15, 20, row);
    this.enemyKind = 'buckethead';
    this.attackStyle = 'blade';
    this.armorStyle = 'iron_bucket';
    this.armorThreshold = 100;
    this.mass = 1.85;
  }

  override getHeadClearance(): number {
    return this.hasArmor() ? 21 : 16;
  }

  private drawPlateLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 7.5;
    const footY = hipY + 21 - lift * 4;
    const kneeX = (hipX + footX) * 0.5 - 1.8;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.2;

    c.save();
    // Heavy Iron Greave Outline
    c.strokeStyle = '#090d16';
    c.lineWidth = 9.6;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#334155' : '#64748b';
    c.lineWidth = 6.8;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Hinged Steel Knee-Cop
    c.fillStyle = isBack ? '#475569' : '#94a3b8';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.1;
    c.beginPath();
    c.roundRect(kneeX - 4.5, kneeY - 2.5, 8, 5, 1.5);
    c.fill();
    c.stroke();

    // Heavy Plated Sabaton Boot
    c.fillStyle = isBack ? '#1e293b' : '#475569';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(footX + 4, footY - 2);
    c.lineTo(footX - 7.5, footY + 0.5);
    c.lineTo(footX - 6, footY + 4.2);
    c.lineTo(footX + 4.5, footY + 3.8);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stride = this.isEating || this.isStunned ? 0 : animT / 168;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating ? Math.sin(animT / 120) * 1.1 : Math.abs(walkCos) * 2.0;
      const pose = this.getMeleePose();
      const armored = this.hasArmor();
      const armorIntegrity = this.getArmorIntegrity();

      // ── 1. Heavy Ground Shadow ──
      c.fillStyle = 'rgba(2, 6, 23, 0.54)';
      c.beginPath();
      c.ellipse(cx, cy + 42, 24, 6.5, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Heavy Dark Siege Mantle (Behind Shoulders) ──
      const capeWave = Math.sin(animT / 190) * 2.5;
      c.fillStyle = '#0f172a';
      c.strokeStyle = '#020617';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx + 5, cy - 12 - bob);
      c.quadraticCurveTo(cx + 21, cy + 5, cx + 23 + capeWave, cy + 27);
      c.lineTo(cx + 13 + capeWave * 0.6, cy + 29);
      c.lineTo(cx + 4, cy + 25);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Back Iron-Gauntleted Arm (Guard Stance) ──
      c.save();
      c.translate(cx - 12, cy - 2 - bob * 0.6);
      c.rotate(-0.35 + walkSin * 0.2);
      c.strokeStyle = '#090d16';
      c.lineWidth = 7.6;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-8, 11);
      c.stroke();
      c.strokeStyle = '#475569';
      c.lineWidth = 5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-8, 11);
      c.stroke();
      c.restore();

      // ── 4. Heavy Plated Iron Greaves & Sabatons ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawPlateLeg(c, cx - 4.5, cy + 17 - bob * 0.4, -walkSin * 0.6, backLift, true);
      this.drawPlateLeg(c, cx + 4.5, cy + 18 - bob * 0.4, walkSin * 0.6, frontLift, false);

      // ── 5. Hulking Svartalfheim Iron Plate Cuirass & Tassets ──
      const torsoY = cy - 10 - bob;
      const plateGrad = c.createLinearGradient(cx - 16, torsoY, cx + 16, torsoY + 28);
      plateGrad.addColorStop(0, '#94a3b8');
      plateGrad.addColorStop(0.32, '#475569');
      plateGrad.addColorStop(0.75, '#334155');
      plateGrad.addColorStop(1, '#0f172a');
      c.fillStyle = plateGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.6;
      c.beginPath();
      c.roundRect(cx - 15, torsoY, 30, 25, 4.5);
      c.fill();
      c.stroke();

      // Central chest plate ridge & brass rivets
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(cx - 3, torsoY + 2);
      c.lineTo(cx - 3, torsoY + 20);
      c.stroke();

      c.fillStyle = '#d97706';
      for (const ry of [5, 11, 17]) {
        c.beginPath();
        c.arc(cx - 10, torsoY + ry, 1.3, 0, Math.PI * 2);
        c.arc(cx + 8, torsoY + ry, 1.3, 0, Math.PI * 2);
        c.fill();
      }

      // Hanging Riveted Tasset Plates
      c.fillStyle = '#334155';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(cx - 14, torsoY + 22, 12, 8, 2);
      c.roundRect(cx + 1, torsoY + 22, 13, 8, 2);
      c.fill();
      c.stroke();

      // Forged Iron Waist Belt
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.roundRect(cx - 15.5, torsoY + 19.5, 31, 4.5, 1.5);
      c.fill();
      c.stroke();
      c.fillStyle = '#b45309';
      c.fillRect(cx - 6, torsoY + 19, 6.5, 5.5);

      // ── 6. Massive Cylindrical Riveted Iron Greathelm ("Buckethead") ──
      const headX = cx - 1.5;
      const headY = cy - 23 - bob * 0.9;

      if (armored) {
        const dentShift = armorIntegrity < 0.65 ? 1.5 : 0;
        const helmGrad = c.createLinearGradient(headX - 17, headY - 22, headX + 17, headY + 11);
        helmGrad.addColorStop(0, '#cbd5e1');
        helmGrad.addColorStop(0.28, '#64748b');
        helmGrad.addColorStop(0.68, '#334155');
        helmGrad.addColorStop(1, '#0f172a');
        c.fillStyle = helmGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.7;

        // Cylindrical bucket greathelm silhouette with slight 3/4 perspective crown
        c.beginPath();
        c.moveTo(headX - 16, headY - 19 + dentShift);
        c.quadraticCurveTo(headX, headY - 24, headX + 16, headY - 19);
        c.lineTo(headX + 16.5, headY + 10);
        c.quadraticCurveTo(headX - 1, headY + 14, headX - 16.5, headY + 9.5);
        c.closePath();
        c.fill();
        c.stroke();

        // Top flat crown bevel rim
        c.strokeStyle = '#e2e8f0';
        c.lineWidth = 1.2;
        c.beginPath();
        c.ellipse(headX, headY - 19 + dentShift * 0.5, 15.5, 3.2, 0, 0, Math.PI * 2);
        c.stroke();

        // Brass Cross-Reinforcement Bands on Greathelm
        c.fillStyle = '#b45309';
        c.strokeStyle = '#451a03';
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(headX - 16.5, headY - 9, 33, 3.8, 1);
        c.roundRect(headX - 5.5, headY - 21 + dentShift, 4.2, 33 - dentShift, 1);
        c.fill();
        c.stroke();

        // Deep Dark Horizontal Visor Slit (3/4 left offset)
        c.fillStyle = '#020617';
        c.beginPath();
        c.roundRect(headX - 15, headY - 5.5, 25, 5, 1.2);
        c.fill();

        // Blazing Crimson Juggernaut Eyes Inside Visor + Red Glare Trail
        c.save();
        c.shadowColor = '#ef4444';
        c.shadowBlur = 13;
        c.fillStyle = '#f87171';
        c.fillRect(headX - 12.5, headY - 4.4, 4.8, 2.8);
        c.fillRect(headX - 1.5, headY - 4.4, 5.2, 2.8);
        c.fillStyle = '#fef2f2';
        c.fillRect(headX - 11.2, headY - 3.8, 2, 1.5);
        c.fillRect(headX - 0.2, headY - 3.8, 2.2, 1.5);
        c.restore();

        // Vertical Breathing Vents on Lower Faceplate
        c.fillStyle = '#090d16';
        for (let s = 0; s < 5; s++) {
          c.fillRect(headX - 12 + s * 5, headY + 2.5, 2, 6);
        }

        // Steel Rivets along Crown & Rim
        c.fillStyle = '#e2e8f0';
        for (const rx of [-13, -9, 2, 8, 13]) {
          c.beginPath();
          c.arc(headX + rx, headY - 7.1, 1.2, 0, Math.PI * 2);
          c.fill();
        }

        // Progressive Battle Dents & Gashes
        if (armorIntegrity < 0.65) {
          c.strokeStyle = '#090d16';
          c.lineWidth = 1.8;
          c.beginPath();
          c.moveTo(headX - 13, headY - 18);
          c.lineTo(headX - 6, headY - 12);
          c.lineTo(headX - 9, headY - 9);
          c.stroke();
        }
        if (armorIntegrity < 0.35) {
          c.strokeStyle = '#020617';
          c.lineWidth = 2.2;
          c.beginPath();
          c.moveTo(headX + 9, headY - 20);
          c.lineTo(headX + 3, headY - 10);
          c.lineTo(headX + 6, headY + 4);
          c.stroke();

          // Red soul-glare leaking from visor crack
          c.strokeStyle = 'rgba(248, 113, 113, 0.75)';
          c.lineWidth = 1;
          c.beginPath();
          c.moveTo(headX + 3, headY - 10);
          c.lineTo(headX + 6, headY + 2);
          c.stroke();
        }
      } else {
        // ── Unhelmed Scarred Draugr Champion with Iron Jaw-Clamp (After Greathelm Breaks!) ──
        const jawDrop = pose.jawOpen * 3.8;
        const skullGrad = c.createRadialGradient(headX - 4, headY - 4, 2, headX, headY, 15);
        skullGrad.addColorStop(0, '#cbd5e1');
        skullGrad.addColorStop(0.6, '#64748b');
        skullGrad.addColorStop(1, '#1e293b');
        c.fillStyle = skullGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(headX, headY - 1, 13.8, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Riveted Iron Jaw-Trap Mandible
        c.fillStyle = '#334155';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.4;
        c.beginPath();
        c.roundRect(headX - 11.5, headY + 3.5 + jawDrop * 0.7, 16, 9.5, 2);
        c.fill();
        c.stroke();

        // Iron jaw spikes
        c.fillStyle = '#cbd5e1';
        for (let t = 0; t < 3; t++) {
          c.fillRect(headX - 9.5 + t * 4.2, headY + 2.5 + jawDrop * 0.5, 2.4, 3.5);
        }

        // Blazing Crimson Unmasked Eyes
        c.save();
        c.shadowColor = '#ef4444';
        c.shadowBlur = 14;
        c.fillStyle = '#ef4444';
        c.beginPath();
        c.arc(headX - 8.5, headY - 2, 2.7, 0, Math.PI * 2);
        c.arc(headX - 0.5, headY - 2, 3.0, 0, Math.PI * 2);
        c.fill();
        c.fillStyle = '#ffffff';
        c.beginPath();
        c.arc(headX - 8.8, headY - 2.2, 1.1, 0, Math.PI * 2);
        c.arc(headX - 0.8, headY - 2.2, 1.2, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // ── 7. Spiked Iron Pauldron & Bearded Norse Great-Axe ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.25;
      const armRot = pose.armSwing + walkSwing;
      const shoulderX = cx + 7;
      const shoulderY = torsoY + 5;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      // Spiked Layered Iron Pauldron
      c.fillStyle = '#64748b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.ellipse(0, 0, 8, 6.2, 0.15, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      // Pauldron spike
      c.fillStyle = '#cbd5e1';
      c.beginPath();
      c.moveTo(-2, -5);
      c.lineTo(1, -11);
      c.lineTo(4, -5);
      c.closePath();
      c.fill();
      c.stroke();

      // Armored Forearm
      c.strokeStyle = '#090d16';
      c.lineWidth = 8;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-11, 11);
      c.stroke();
      c.strokeStyle = '#475569';
      c.lineWidth = 5.2;
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-11, 11);
      c.stroke();

      // Bearded Norse Great-Axe at hand (-11, 11)
      c.save();
      c.translate(-11, 11);
      c.rotate(-0.42);

      // Heavy Ashwood Shaft & Iron Langet
      c.fillStyle = '#291d12';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-2.2, -26, 4.6, 34, 1.5);
      c.fill();
      c.stroke();

      // Sweeping Crescent Bearded Axe Blade (pointing forward-left!)
      const axeGrad = c.createLinearGradient(0, -24, -20, -14);
      axeGrad.addColorStop(0, '#475569');
      axeGrad.addColorStop(0.55, '#94a3b8');
      axeGrad.addColorStop(1, '#f8fafc');
      c.fillStyle = axeGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(-1, -24);
      c.quadraticCurveTo(-15, -28, -20, -22);
      c.quadraticCurveTo(-23, -14, -15, -6); // Bearded hook!
      c.quadraticCurveTo(-9, -11, -1, -14);
      c.closePath();
      c.fill();
      c.stroke();

      // Back Armor-Piercing Fluke Spike
      c.fillStyle = '#94a3b8';
      c.beginPath();
      c.moveTo(2, -22);
      c.lineTo(9, -19);
      c.lineTo(2, -16);
      c.closePath();
      c.fill();
      c.stroke();

      // Glowing Blood-Rune Etching on Axe Cheek
      c.strokeStyle = 'rgba(239, 68, 68, 0.8)';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(-11, -21);
      c.lineTo(-11, -13);
      c.lineTo(-8, -17);
      c.stroke();

      c.restore();
      c.restore();

      // ── 8. Melee Crimson-Steel Cleave Arc ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.9;
        c.strokeStyle = '#ef4444';
        c.shadowColor = '#dc2626';
        c.shadowBlur = 14;
        c.lineWidth = 4.2;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 7, cy - 2, 26, Math.PI * 0.7, Math.PI * 1.34);
        c.stroke();

        c.strokeStyle = '#fecaca';
        c.lineWidth = 1.5;
        c.beginPath();
        c.arc(cx - 7, cy - 2, 27.5, Math.PI * 0.76, Math.PI * 1.28);
        c.stroke();
        c.restore();
      }
    });
  }
}
