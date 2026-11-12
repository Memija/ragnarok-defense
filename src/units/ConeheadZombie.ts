import { Attacker } from '../entities/Attacker';

export class ConeheadZombie extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 240, 17, 18, row);
    this.enemyKind = 'conehead';
    this.attackStyle = 'blunt';
    this.armorStyle = 'bronze_cone';
    this.armorThreshold = 100;
    this.mass = 1.35;
  }

  override getHeadClearance(): number {
    return this.hasArmor() ? 34 : 16;
  }

  private drawGreavedLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 8;
    const footY = hipY + 21 - lift * 4.5;
    const kneeX = (hipX + footX) * 0.5 - 2;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.5;

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

    c.strokeStyle = isBack ? '#1e293b' : '#334155';
    c.lineWidth = 6;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Burnished Bronze Shin Greave
    c.strokeStyle = isBack ? '#92400e' : '#d97706';
    c.lineWidth = 3.2;
    c.beginPath();
    c.moveTo(kneeX - 1, kneeY + 1);
    c.lineTo(footX - 1, footY - 2);
    c.stroke();

    // Armored Boot
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

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stride = this.isEating || this.isStunned ? 0 : animT / 152;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating ? Math.sin(animT / 110) * 1.2 : Math.abs(walkCos) * 2.3;
      const pose = this.getMeleePose();
      const armored = this.hasArmor();
      const armorIntegrity = this.getArmorIntegrity();

      // ── 1. Ground Shadow ──
      c.fillStyle = 'rgba(2, 6, 23, 0.48)';
      c.beginPath();
      c.ellipse(cx, cy + 42, 22, 6, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Tattered Crimson Vanguard Cloak ──
      const cloakWave = Math.sin(animT / 165) * 3.5;
      const cloakGrad = c.createLinearGradient(cx - 2, cy - 12, cx + 24, cy + 28);
      cloakGrad.addColorStop(0, '#7f1d1d');
      cloakGrad.addColorStop(0.6, '#450a0a');
      cloakGrad.addColorStop(1, '#1c0404');
      c.fillStyle = cloakGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(cx + 4, cy - 11 - bob);
      c.quadraticCurveTo(cx + 20, cy + 3 + cloakWave * 0.4, cx + 24 + cloakWave, cy + 25);
      c.lineTo(cx + 17 + cloakWave * 0.7, cy + 21);
      c.lineTo(cx + 14 + cloakWave * 0.5, cy + 29);
      c.lineTo(cx + 6 + cloakWave * 0.3, cy + 23);
      c.lineTo(cx + 2, cy + 26);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Back Arm & Bronze-Rimmed Targe Buckler ──
      const bucklerX = cx - 15;
      const bucklerY = cy + 3 - bob * 0.6 + walkSin * 1.4;
      c.save();
      c.translate(bucklerX, bucklerY);
      c.rotate(-0.12 + pose.bodyLean * 0.5);
      c.fillStyle = '#78350f';
      c.strokeStyle = '#f59e0b';
      c.lineWidth = 2;
      c.beginPath();
      c.ellipse(0, 0, 7, 11.5, 0.1, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.ellipse(-1.5, 0, 2.5, 4, 0, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // ── 4. Articulated Bronze-Greaved Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawGreavedLeg(c, cx - 4, cy + 17 - bob * 0.4, -walkSin * 0.65, backLift, true);
      this.drawGreavedLeg(c, cx + 4, cy + 18 - bob * 0.4, walkSin * 0.65, frontLift, false);

      // ── 5. Burnished Bronze Scale Cuirass & Chainmail Skirt ──
      const torsoY = cy - 9 - bob;
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.roundRect(cx - 12, torsoY + 18, 24, 12, 2);
      c.fill();
      c.stroke();

      const scaleGrad = c.createLinearGradient(cx - 13, torsoY, cx + 13, torsoY + 23);
      scaleGrad.addColorStop(0, '#f59e0b');
      scaleGrad.addColorStop(0.45, '#b45309');
      scaleGrad.addColorStop(1, '#78350f');
      c.fillStyle = scaleGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(cx - 12.5, torsoY, 25, 22, 4);
      c.fill();
      c.stroke();

      // Overlapping scalloped bronze scale rows
      c.strokeStyle = 'rgba(69, 26, 3, 0.75)';
      c.lineWidth = 1.1;
      for (let row = 0; row < 3; row++) {
        const sy = torsoY + 5 + row * 5.5;
        for (let col = -2; col <= 1; col++) {
          c.beginPath();
          c.arc(cx + col * 5.5 + (row % 2) * 2.5, sy, 3, 0, Math.PI);
          c.stroke();
        }
      }

      // Studded War Belt
      c.fillStyle = '#1c1917';
      c.fillRect(cx - 12.5, torsoY + 19, 25, 4.2);
      c.fillStyle = '#fbbf24';
      c.fillRect(cx - 5.5, torsoY + 18.5, 6, 5.2);

      // ── 6. 3/4 Left Draugr Head & Dynamic Conical Spire-Helm ──
      const headX = cx - 2;
      const headY = cy - 23 - bob * 0.9;
      const jawDrop = pose.jawOpen * 3.6;

      // Chainmail Aventail behind neck
      c.fillStyle = '#334155';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.roundRect(headX + 2, headY - 2, 12, 14, 2);
      c.fill();
      c.stroke();

      // Sunken Undead Jaw & Fangs
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.roundRect(headX - 10.5, headY + 4 + jawDrop * 0.7, 14, 8.5, 2.5);
      c.fill();
      c.stroke();

      c.fillStyle = '#020617';
      c.fillRect(headX - 9.5, headY + 4, 11, 3.5 + jawDrop * 0.7);
      c.fillStyle = '#f1f5f9';
      for (let t = 0; t < 3; t++) {
        c.fillRect(headX - 8.5 + t * 3.5, headY + 3.5, 2, 2.6);
        c.fillRect(headX - 8 + t * 3.5, headY + 6 + jawDrop * 0.65, 1.8, 2.4);
      }

      // Gaunt Frosty Skull
      const skullGrad = c.createRadialGradient(headX - 4, headY - 3, 2, headX, headY, 15);
      skullGrad.addColorStop(0, '#cbd5e1');
      skullGrad.addColorStop(0.6, '#64748b');
      skullGrad.addColorStop(1, '#334155');
      c.fillStyle = skullGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX, headY - 1, 13.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Blazing Cursed Amber Eyes
      c.fillStyle = '#090d16';
      c.beginPath();
      c.ellipse(headX - 8.5, headY - 1.5, 3.2, 2.8, 0, 0, Math.PI * 2);
      c.ellipse(headX - 0.5, headY - 1.5, 3.5, 3.0, 0, 0, Math.PI * 2);
      c.fill();

      c.save();
      c.shadowColor = '#f59e0b';
      c.shadowBlur = 12;
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.arc(headX - 8.8, headY - 1.5, 2.3, 0, Math.PI * 2);
      c.arc(headX - 0.8, headY - 1.5, 2.6, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#fef9c3';
      c.beginPath();
      c.arc(headX - 9, headY - 1.7, 1.0, 0, Math.PI * 2);
      c.arc(headX - 1, headY - 1.7, 1.1, 0, Math.PI * 2);
      c.fill();
      c.restore();

      if (armored) {
        // ── Forged Conical Iron & Bronze Spangenhelm ("Conehead") ──
        const tipDentX = armorIntegrity < 0.65 ? 3.5 : 0;
        const tipDentY = armorIntegrity < 0.35 ? 3 : 0;
        const coneTopX = headX + 1 + tipDentX;
        const coneTopY = headY - 47 + tipDentY;

        const helmGrad = c.createLinearGradient(headX - 16, coneTopY, headX + 16, headY - 5);
        helmGrad.addColorStop(0, '#fbbf24');
        helmGrad.addColorStop(0.28, '#d97706');
        helmGrad.addColorStop(0.62, '#475569');
        helmGrad.addColorStop(1, '#1e293b');
        c.fillStyle = helmGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(headX - 15.5, headY - 5.5);
        c.quadraticCurveTo(headX - 10, headY - 26, coneTopX - 2.5, coneTopY);
        c.lineTo(coneTopX + 2.5, coneTopY);
        c.quadraticCurveTo(headX + 11, headY - 26, headX + 15.5, headY - 5.5);
        c.closePath();
        c.fill();
        c.stroke();

        // Spire Finial Knob
        c.fillStyle = '#fef08a';
        c.strokeStyle = '#451a03';
        c.lineWidth = 1;
        c.beginPath();
        c.arc(coneTopX, coneTopY - 1.5, 3, 0, Math.PI * 2);
        c.fill();
        c.stroke();

        // Vertical Spangen Ridge & Tiered Bronze Rings
        c.strokeStyle = '#f59e0b';
        c.lineWidth = 1.6;
        c.beginPath();
        c.moveTo(headX - 2, headY - 6);
        c.lineTo(coneTopX - 0.5, coneTopY + 2);
        c.stroke();

        c.fillStyle = '#f59e0b';
        c.strokeStyle = '#451a03';
        c.lineWidth = 1;
        c.beginPath();
        c.roundRect(headX - 16.5, headY - 8, 33, 4, 1.2);
        c.roundRect(headX - 11, headY - 22, 22.5, 3.2, 1);
        c.roundRect(coneTopX - 6, headY - 35, 12, 2.8, 1);
        c.fill();
        c.stroke();

        // Nasal Guard
        c.fillStyle = '#d97706';
        c.beginPath();
        c.roundRect(headX - 6.2, headY - 6, 3.4, 9.5, 1);
        c.fill();
        c.stroke();

        // Glowing Tyr Rune (ᛏ) on Cone Front
        c.save();
        c.fillStyle = `rgba(254, 240, 138, ${0.55 + armorIntegrity * 0.4})`;
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 6;
        c.font = 'bold 9px serif';
        c.textAlign = 'center';
        c.fillText('ᛏ', headX - 3, headY - 11);
        c.restore();

        // Progressive Battle Dents & Cracks on Cone
        if (armorIntegrity < 0.65) {
          c.strokeStyle = '#090d16';
          c.lineWidth = 1.6;
          c.beginPath();
          c.moveTo(headX - 10, headY - 25);
          c.lineTo(headX - 3, headY - 19);
          c.lineTo(headX - 6, headY - 14);
          c.stroke();
        }
        if (armorIntegrity < 0.35) {
          c.strokeStyle = '#020617';
          c.lineWidth = 2;
          c.beginPath();
          c.moveTo(headX + 11, headY - 8);
          c.lineTo(headX + 4, headY - 17);
          c.lineTo(headX + 7, headY - 28);
          c.stroke();
        }
      } else {
        // ── Unhelmed Battle-Scarred Draugr Skull (After Spire-Helm Breaks!) ──
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(headX - 6, headY - 11);
        c.lineTo(headX - 1, headY - 6);
        c.stroke();

        // Wild frost-white undead hair tufts
        c.fillStyle = '#cbd5e1';
        c.strokeStyle = '#334155';
        c.lineWidth = 1;
        c.beginPath();
        c.moveTo(headX - 2, headY - 13);
        c.lineTo(headX + 7, headY - 20);
        c.lineTo(headX + 5, headY - 12);
        c.lineTo(headX + 13, headY - 16);
        c.lineTo(headX + 9, headY - 8);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 7. Foreground Bronze-Pauldron Arm & Radial-Spiked War Mace ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.28;
      const armRot = pose.armSwing + walkSwing;
      const shoulderX = cx + 6;
      const shoulderY = torsoY + 5;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      // Bronze Pauldron
      c.fillStyle = '#d97706';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.ellipse(0, 0, 7, 5.5, 0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Forearm
      c.strokeStyle = '#090d16';
      c.lineWidth = 7.2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();

      c.strokeStyle = '#64748b';
      c.lineWidth = 4.5;
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();

      // Spiked War Mace at hand (-10, 11)
      c.save();
      c.translate(-10, 11);
      c.rotate(-0.4);

      // Oak Shaft with Brass Bands
      c.fillStyle = '#451a03';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-2, -19, 4.4, 24, 1.5);
      c.fill();
      c.stroke();

      c.fillStyle = '#f59e0b';
      c.fillRect(-2.4, -8, 5.2, 2.2);
      c.fillRect(-2.4, 1, 5.2, 2.2);

      // Heavy Flanged Iron Mace Head at (-0, -22)
      const mhX = 0.2;
      const mhY = -22;
      // Radial forged spikes!
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1;
      for (let s = 0; s < 7; s++) {
        const ang = (s * Math.PI * 2) / 7 - 0.3;
        const sx = mhX + Math.cos(ang) * 7;
        const sy = mhY + Math.sin(ang) * 7;
        c.beginPath();
        c.moveTo(mhX + Math.cos(ang - 0.35) * 6.5, mhY + Math.sin(ang - 0.35) * 6.5);
        c.lineTo(sx + Math.cos(ang) * 5.2, sy + Math.sin(ang) * 5.2);
        c.lineTo(mhX + Math.cos(ang + 0.35) * 6.5, mhY + Math.sin(ang + 0.35) * 6.5);
        c.closePath();
        c.fill();
        c.stroke();
      }

      const maceGrad = c.createRadialGradient(mhX - 2, mhY - 2, 1, mhX, mhY, 8);
      maceGrad.addColorStop(0, '#94a3b8');
      maceGrad.addColorStop(0.6, '#475569');
      maceGrad.addColorStop(1, '#1e293b');
      c.fillStyle = maceGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(mhX, mhY, 7.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Bronze center ring on mace head
      c.fillStyle = '#f59e0b';
      c.beginPath();
      c.arc(mhX, mhY, 2.4, 0, Math.PI * 2);
      c.fill();

      c.restore();
      c.restore();

      // ── 8. Melee Smash Arc (Amber Shock Trail) ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.88;
        c.strokeStyle = '#fbbf24';
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 12;
        c.lineWidth = 3.6;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 6, cy - 2, 24, Math.PI * 0.72, Math.PI * 1.3);
        c.stroke();
        c.restore();
      }
    });
  }
}
