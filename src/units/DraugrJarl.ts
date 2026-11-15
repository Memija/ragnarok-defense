import { Attacker } from '../entities/Attacker';

export class DraugrJarl extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y - 8, 60, 98, 440, 13.5, 28, row);
    this.enemyKind = 'draugr_jarl';
    this.attackStyle = 'heavy';
    this.armorStyle = 'runic_plate';
    this.armorThreshold = 220;
    this.attackRate = 1350;
    this.attackReach = 18;
    this.stunResistance = 0.25;
    this.mass = 2.6;
  }

  override getHeadClearance(): number {
    return 22;
  }

  override getEffectiveSpeed(): number {
    return this.enraged ? this.speed * 1.44 : this.speed;
  }

  override getEffectiveAttackRate(): number {
    return this.enraged ? Math.max(420, Math.round(this.attackRate * 0.71)) : this.attackRate;
  }

  override modifyProjectileDamage(amount: number, isFire: boolean, isStunning: boolean): number {
    if (!this.hasArmor()) return amount;
    if (isStunning) {
      // Lobbed heavy stun bolts arc onto the Jarl unreduced
      return amount;
    }
    if (isFire) {
      // Searing forge-fire superheats black-iron plate slightly better than kinetic bolts
      return Math.max(8, Math.round(amount * 0.92));
    }
    // Gilded black-iron runic plate deflects 20% of standard direct bolts
    return Math.max(8, Math.round(amount * 0.8));
  }

  override takeDamage(amount: number) {
    const wasEnraged = this.enraged;
    super.takeDamage(amount);
    if (!wasEnraged && this.health > 0 && !this.hasArmor()) {
      this.enraged = true;
      this.justEnraged = true;
      this.mass = 1.9;
      this.scaleX = 1.15;
      this.scaleY = 0.88;
    }
  }

  private drawJarlGreaveLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 9;
    const footY = hipY + 21 - lift * 4.8;
    const kneeX = (hipX + footX) * 0.5 - 2;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.5;

    c.save();
    // Black-iron greave outline
    c.strokeStyle = '#090d16';
    c.lineWidth = 10.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Forged dark steel leg plate
    c.strokeStyle = isBack ? '#1e293b' : '#334155';
    c.lineWidth = 7.5;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Gilded Jarl knee poleyn
    c.fillStyle = isBack ? '#b45309' : '#f59e0b';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.1;
    c.beginPath();
    c.moveTo(kneeX - 4.5, kneeY - 3);
    c.lineTo(kneeX + 4, kneeY - 2);
    c.lineTo(kneeX + 2.5, kneeY + 3.5);
    c.lineTo(kneeX - 5.5, kneeY + 1.5);
    c.closePath();
    c.fill();
    c.stroke();

    // Plated sabaton war-boot
    c.fillStyle = isBack ? '#0f172a' : '#1e293b';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.25;
    c.beginPath();
    c.moveTo(footX + 4.5, footY - 2.5);
    c.lineTo(footX - 8.5, footY + 0.5);
    c.lineTo(footX - 7.5, footY + 4.5);
    c.lineTo(footX + 5, footY + 4);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  private drawDaneAxe(c: CanvasRenderingContext2D, enragedGlow: boolean, animT: number) {
    // Long iron-shod ash polearm haft
    const haftGrad = c.createLinearGradient(-3, -44, 3, 18);
    haftGrad.addColorStop(0, '#78350f');
    haftGrad.addColorStop(0.5, '#451a03');
    haftGrad.addColorStop(1, '#1c1917');
    c.fillStyle = haftGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.3;
    c.beginPath();
    c.roundRect(-2.6, -44, 5.2, 60, 2);
    c.fill();
    c.stroke();

    // Gilded grip bands & pommel spike
    c.fillStyle = '#f59e0b';
    c.fillRect(-3, -16, 6, 2.5);
    c.fillRect(-3, -2, 6, 2.5);
    c.beginPath();
    c.moveTo(-3.2, 15);
    c.lineTo(0, 21);
    c.lineTo(3.2, 15);
    c.closePath();
    c.fill();
    c.stroke();

    // Top spear-finial spike
    c.fillStyle = '#cbd5e1';
    c.beginPath();
    c.moveTo(-2.4, -43);
    c.lineTo(0, -52);
    c.lineTo(2.4, -43);
    c.closePath();
    c.fill();
    c.stroke();

    // Sweeping two-handed royal Dane-Axe crescent blade (facing left toward defenders)
    const bladeGrad = c.createLinearGradient(0, -40, -24, -24);
    bladeGrad.addColorStop(0, '#1e293b');
    bladeGrad.addColorStop(0.45, '#94a3b8');
    bladeGrad.addColorStop(0.82, enragedGlow ? '#fde047' : '#e2e8f0');
    bladeGrad.addColorStop(1, enragedGlow ? '#ef4444' : '#ffffff');
    c.fillStyle = bladeGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.45;
    c.beginPath();
    c.moveTo(-2, -41);
    c.quadraticCurveTo(-15, -46, -22, -39);
    c.quadraticCurveTo(-26.5, -29, -19, -17);
    c.quadraticCurveTo(-11, -23, -2, -26);
    c.closePath();
    c.fill();
    c.stroke();

    // Counter-hook spike on back of axe head
    c.fillStyle = '#64748b';
    c.beginPath();
    c.moveTo(2.2, -38);
    c.lineTo(9.5, -34);
    c.lineTo(2.2, -30);
    c.closePath();
    c.fill();
    c.stroke();

    // Glowing Elder Futhark war-rune etched into the Dane-axe cheek
    const pulse = 0.65 + Math.sin(animT / 140) * 0.25;
    c.save();
    c.strokeStyle = enragedGlow
      ? `rgba(239, 68, 68, ${Math.min(1, pulse + 0.2)})`
      : `rgba(251, 191, 36, ${pulse})`;
    if (enragedGlow) {
      c.shadowColor = '#ef4444';
      c.shadowBlur = 9;
    }
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(-13, -38);
    c.lineTo(-13, -24);
    c.moveTo(-13, -35);
    c.lineTo(-18, -31);
    c.moveTo(-13, -30);
    c.lineTo(-17.5, -26);
    c.stroke();
    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stridePeriod = this.enraged ? 120 : 172;
      const stride = this.isEating || this.isStunned ? 0 : animT / stridePeriod;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating
        ? Math.sin(animT / 130) * 1.4
        : Math.pow(Math.abs(walkCos), 1.3) * 2.8;
      const armored = this.hasArmor();
      const armorInt = this.getArmorIntegrity();
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow & Cleave Shockwave Arc ──
      c.fillStyle = 'rgba(2, 6, 23, 0.54)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 4, 27, 7.5, 0, 0, Math.PI * 2);
      c.fill();

      if (pose.slashAlpha > 0.08) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.78;
        c.strokeStyle = this.enraged ? '#ef4444' : '#fbbf24';
        c.lineWidth = 2.4;
        const ringR = 15 + (1 - pose.slashAlpha) * 22;
        c.beginPath();
        c.ellipse(cx - 22, this.y + this.height - 3.5, ringR, ringR * 0.3, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }

      // ── 2. Billowing Royal Crimson Warlord Cloak ──
      const cloakWave = Math.sin(animT / 190) * 3.5 + (this.enraged ? 3.5 : 0);
      const cloakGrad = c.createLinearGradient(cx, cy - 22, cx + 26, cy + 36);
      cloakGrad.addColorStop(0, '#991b1b');
      cloakGrad.addColorStop(0.6, '#7f1d1d');
      cloakGrad.addColorStop(1, '#450a0a');
      c.fillStyle = cloakGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(cx - 8, cy - 20 - bob);
      c.quadraticCurveTo(cx + 22, cy - 12 - bob, cx + 25 + cloakWave, cy + 30);
      c.lineTo(cx + 17 + cloakWave * 0.7, cy + 25);
      c.lineTo(cx + 12 + cloakWave * 0.5, cy + 33);
      c.lineTo(cx + 4 + cloakWave * 0.3, cy + 26);
      c.lineTo(cx - 4, cy + 31);
      c.closePath();
      c.fill();
      c.stroke();

      // Gold trim along cloak edge
      c.strokeStyle = 'rgba(245, 158, 11, 0.75)';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(cx + 13, cy - 15 - bob);
      c.quadraticCurveTo(cx + 21, cy + 5, cx + 23 + cloakWave, cy + 28);
      c.stroke();

      // ── 3. Articulated Black-Iron & Gold Greave Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawJarlGreaveLeg(c, cx - 7, cy + 20 - bob * 0.35, -walkSin * 0.65, backLift, true);
      this.drawJarlGreaveLeg(c, cx + 7, cy + 21 - bob * 0.35, walkSin * 0.65, frontLift, false);

      // ── 4. Back Support Arm ──
      c.save();
      c.translate(cx - 13, cy - 10 - bob);
      c.rotate(0.28 - walkSin * 0.25 + pose.armSwing * 0.55);
      c.strokeStyle = '#090d16';
      c.lineWidth = 9.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 17);
      c.stroke();
      c.strokeStyle = '#334155';
      c.lineWidth = 6.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 17);
      c.stroke();
      c.restore();

      // ── 5. Broad Jarl Torso (Gilded Runic Plate vs Shattered Doom-Hearth) ──
      const bodyY = cy - 4 - bob;

      // Crimson chainmail & lamellar tassets below waist
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx - 17, bodyY + 16);
      c.lineTo(cx - 19, bodyY + 27);
      c.lineTo(cx - 9, bodyY + 24);
      c.lineTo(cx, bodyY + 28);
      c.lineTo(cx + 9, bodyY + 24);
      c.lineTo(cx + 18, bodyY + 27);
      c.lineTo(cx + 16, bodyY + 16);
      c.closePath();
      c.fill();
      c.stroke();

      // Main Cuirass / Chest
      const chestGrad = c.createLinearGradient(cx - 20, bodyY - 18, cx + 20, bodyY + 22);
      if (armored) {
        chestGrad.addColorStop(0, '#475569');
        chestGrad.addColorStop(0.45, '#1e293b');
        chestGrad.addColorStop(1, '#0f172a');
      } else {
        chestGrad.addColorStop(0, '#334155');
        chestGrad.addColorStop(0.5, '#1e1b4b');
        chestGrad.addColorStop(1, '#090d16');
      }
      c.fillStyle = chestGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(cx - 19, bodyY - 13);
      c.quadraticCurveTo(cx, bodyY - 20, cx + 19, bodyY - 12);
      c.lineTo(cx + 16, bodyY + 19);
      c.quadraticCurveTo(cx, bodyY + 23, cx - 16, bodyY + 19);
      c.closePath();
      c.fill();
      c.stroke();

      if (armored) {
        // Ornate Gilded Norse Knotwork Breastplate Trim
        c.strokeStyle = '#f59e0b';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(cx - 14, bodyY - 8);
        c.lineTo(cx - 2, bodyY + 12);
        c.lineTo(cx + 12, bodyY - 8);
        c.moveTo(cx - 2, bodyY - 12);
        c.lineTo(cx - 2, bodyY + 15);
        c.stroke();

        // Progressive battle cracks as runic plate weakens
        if (armorInt < 0.65) {
          c.strokeStyle = '#020617';
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(cx - 11, bodyY - 4);
          c.lineTo(cx - 5, bodyY + 3);
          c.lineTo(cx - 9, bodyY + 9);
          if (armorInt < 0.35) {
            c.moveTo(cx + 9, bodyY - 5);
            c.lineTo(cx + 3, bodyY + 4);
            c.lineTo(cx + 8, bodyY + 11);
          }
          c.stroke();
        }
      } else {
        // Shattered plate exposing blazing crimson-gold undead warlord rib-hearth!
        c.save();
        c.shadowColor = '#ef4444';
        c.shadowBlur = 10;
        c.strokeStyle = '#fb923c';
        c.lineWidth = 1.8;
        c.beginPath();
        c.moveTo(cx - 10, bodyY - 5);
        c.lineTo(cx + 6, bodyY - 3);
        c.moveTo(cx - 11, bodyY + 1);
        c.lineTo(cx + 7, bodyY + 3);
        c.moveTo(cx - 9, bodyY + 7);
        c.lineTo(cx + 5, bodyY + 8);
        c.stroke();
        c.restore();
      }

      // White Dire-Wolf Fur Mantle & Golden Cloak Discs
      c.fillStyle = '#cbd5e1';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx - 22, bodyY - 11);
      c.quadraticCurveTo(cx, bodyY - 22, cx + 22, bodyY - 10);
      c.lineTo(cx + 19, bodyY - 3);
      c.lineTo(cx + 11, bodyY - 6);
      c.lineTo(cx + 2, bodyY - 2);
      c.lineTo(cx - 8, bodyY - 6);
      c.lineTo(cx - 18, bodyY - 2);
      c.closePath();
      c.fill();
      c.stroke();

      // Twin Gilded Wolf-Brooches & Runic War-Belt
      c.fillStyle = '#fbbf24';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.arc(cx - 11, bodyY - 9, 3.3, 0, Math.PI * 2);
      c.arc(cx + 10, bodyY - 9, 3.3, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      c.fillStyle = '#78350f';
      c.fillRect(cx - 16, bodyY + 14, 32, 5);
      c.fillStyle = '#fbbf24';
      c.strokeStyle = '#090d16';
      c.beginPath();
      c.roundRect(cx - 6, bodyY + 13, 9, 7, 1.5);
      c.fill();
      c.stroke();

      // ── 6. Undead Warlord Head, Braided Frost-White Beard & Horned Jarl Crown-Helm ──
      const headX = cx - 3;
      const headY = cy - 30 - bob * 0.85;
      const jawDrop = pose.jawOpen * 3.8;

      // Twin-braided silver-white Jarl beard sweeping over chest
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(headX - 10, headY + 4 + jawDrop * 0.5);
      c.lineTo(headX - 13, headY + 18 + jawDrop * 0.6);
      c.lineTo(headX - 6, headY + 13 + jawDrop * 0.6);
      c.lineTo(headX - 2, headY + 20 + jawDrop * 0.6);
      c.lineTo(headX + 4, headY + 12 + jawDrop * 0.5);
      c.lineTo(headX + 8, headY + 4 + jawDrop * 0.5);
      c.closePath();
      c.fill();
      c.stroke();

      // Gaunt Draugr Skull Visage
      c.fillStyle = '#64748b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX, headY - 1, 11.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Blazing Warlord Eyes (amber-gold while armored, raging crimson when plate shatters)
      c.save();
      c.shadowColor = this.enraged ? '#ef4444' : '#f59e0b';
      c.shadowBlur = 10;
      c.fillStyle = this.enraged ? '#fca5a5' : '#fef08a';
      c.beginPath();
      c.arc(headX - 5.5, headY - 1, 2.3, 0, Math.PI * 2);
      c.arc(headX + 2, headY - 1, 2.4, 0, Math.PI * 2);
      c.fill();
      c.restore();

      if (armored) {
        // Imposing Black-Iron & Gold Vendel Jarl Crown-Helm with Sweeping Horns
        const helmGrad = c.createLinearGradient(headX - 13, headY - 16, headX + 13, headY + 2);
        helmGrad.addColorStop(0, '#475569');
        helmGrad.addColorStop(0.55, '#1e293b');
        helmGrad.addColorStop(1, '#0f172a');
        c.fillStyle = helmGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(headX, headY - 3, 12.8, Math.PI, 0);
        c.lineTo(headX + 12.8, headY + 1);
        c.lineTo(headX - 12.8, headY + 1);
        c.closePath();
        c.fill();
        c.stroke();

        // Gilded Jarl Crown Points & Spectacle Face-Guard
        c.fillStyle = '#fbbf24';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.15;
        c.beginPath();
        c.moveTo(headX - 12, headY - 3);
        c.lineTo(headX - 9, headY - 10);
        c.lineTo(headX - 5, headY - 5);
        c.lineTo(headX - 1, headY - 12);
        c.lineTo(headX + 3, headY - 5);
        c.lineTo(headX + 8, headY - 10);
        c.lineTo(headX + 11, headY - 3);
        c.closePath();
        c.fill();
        c.stroke();

        // Nasal bar
        c.fillRect(headX - 3, headY - 3, 2.8, 7.5);

        // Sweeping Gilded-Tip War Horns
        c.fillStyle = '#fef3c7';
        c.beginPath();
        c.moveTo(headX - 10, headY - 7);
        c.quadraticCurveTo(headX - 21, headY - 13, headX - 17, headY - 23);
        c.quadraticCurveTo(headX - 13, headY - 14, headX - 6, headY - 9);
        c.closePath();
        c.fill();
        c.stroke();

        c.beginPath();
        c.moveTo(headX + 8, headY - 7);
        c.quadraticCurveTo(headX + 20, headY - 13, headX + 17, headY - 23);
        c.quadraticCurveTo(headX + 13, headY - 14, headX + 5, headY - 9);
        c.closePath();
        c.fill();
        c.stroke();
      } else {
        // Unhelmed Enraged Doom-Jarl Flame Aura & Flowing White Mane
        c.save();
        c.globalAlpha = 0.65 + Math.sin(animT / 90) * 0.2;
        c.fillStyle = '#ef4444';
        c.beginPath();
        c.moveTo(headX - 10, headY - 8);
        c.lineTo(headX - 6, headY - 20);
        c.lineTo(headX - 1, headY - 12);
        c.lineTo(headX + 3, headY - 22);
        c.lineTo(headX + 9, headY - 9);
        c.closePath();
        c.fill();
        c.restore();
      }

      // ── 7. Front Plated Pauldron, Arm & Two-Handed Runic Dane-Axe ──
      c.save();
      c.translate(cx + 6, cy - 11 - bob);
      const baseArmRot = this.isEating
        ? 0.42 + pose.armSwing * 1.05
        : 0.35 + walkSin * 0.2 + pose.armSwing * 0.9;
      c.rotate(baseArmRot);

      // Layered Black-Iron & Gold Shoulder Pauldron
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#f59e0b';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(0, -2, 9.5, Math.PI * 0.85, Math.PI * 2.15);
      c.closePath();
      c.fill();
      c.stroke();

      // Forearm & Gauntlet
      c.strokeStyle = '#090d16';
      c.lineWidth = 9.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-10, 15);
      c.stroke();
      c.strokeStyle = '#475569';
      c.lineWidth = 6.5;
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-10, 15);
      c.stroke();

      c.translate(-10, 15);
      c.rotate(-0.62);
      this.drawDaneAxe(c, this.enraged, animT);
      c.restore();

      // ── 8. Crimson-Gold Dane-Axe Cleave Arc on Strike ──
      if (pose.slashAlpha > 0.05) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.85;
        c.strokeStyle = this.enraged ? '#ef4444' : '#fde047';
        c.lineWidth = 4.2;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 10, cy - 4, 34, Math.PI * 0.72, Math.PI * 1.34);
        c.stroke();
        c.restore();
      }
    });
  }
}
