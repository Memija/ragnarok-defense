import { Attacker } from '../entities/Attacker';

export class ShieldwallDraugr extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 56, 90, 320, 14, 18, row);
    this.enemyKind = 'shieldbearer';
    this.attackStyle = 'blade';
    this.armorStyle = 'tower_shield';
    this.armorThreshold = 110;
    this.mass = 1.8;
  }

  override getHeadClearance(): number {
    return 18;
  }

  override getEffectiveSpeed(): number {
    return this.hasArmor() ? this.speed : this.speed * 1.45;
  }

  override modifyProjectileDamage(amount: number, isFire: boolean, isStunning: boolean): number {
    if (!this.hasArmor()) return amount;
    if (isFire) {
      // Fire projectiles scorch and splinter the oak-and-iron tower shield
      return Math.round(amount * 1.25);
    }
    if (isStunning) {
      // Lobbed butter arcs over the shield rim unreduced
      return amount;
    }
    // Front phalanx shield deflects ~28% of direct ranged kinetic/frost bolts
    return Math.max(6, Math.round(amount * 0.72));
  }

  private drawGreaveLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 8;
    const footY = hipY + 21 - lift * 4.2;
    const kneeX = (hipX + footX) * 0.5 - 1.8;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.3;

    c.save();
    c.strokeStyle = '#090d16';
    c.lineWidth = 9.2;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#1e293b' : '#475569';
    c.lineWidth = 6.4;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Riveted steel shin band
    c.fillStyle = isBack ? '#334155' : '#94a3b8';
    c.fillRect(kneeX - 3.2, kneeY + 1, 6.4, 3);

    // Iron-strapped Huscarl boot
    c.fillStyle = isBack ? '#1c1917' : '#292524';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(footX + 4, footY - 2);
    c.lineTo(footX - 7.2, footY + 0.6);
    c.lineTo(footX - 6, footY + 4);
    c.lineTo(footX + 4.2, footY + 3.6);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  private drawTowerShield(c: CanvasRenderingContext2D, sx: number, sy: number, integrity: number) {
    c.save();
    c.translate(sx, sy);

    // Shield drop shadow against body
    c.fillStyle = 'rgba(2, 6, 23, 0.45)';
    c.beginPath();
    c.roundRect(-8, -25, 22, 52, [9, 7, 10, 12]);
    c.fill();

    // Curved Norse Oak & Iron Pavise Board (angled 3/4 facing left)
    const boardGrad = c.createLinearGradient(-11, -26, 11, 26);
    boardGrad.addColorStop(0, '#0f766e');
    boardGrad.addColorStop(0.48, '#115e59');
    boardGrad.addColorStop(0.52, '#1e293b');
    boardGrad.addColorStop(1, '#0f172a');
    c.fillStyle = boardGrad;
    c.strokeStyle = '#94a3b8';
    c.lineWidth = 2.6;
    c.beginPath();
    c.roundRect(-11, -26, 21, 52, [8, 6, 9, 11]);
    c.fill();
    c.stroke();

    // Outer dark outline around steel rim
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.1;
    c.beginPath();
    c.roundRect(-12.2, -27.2, 23.4, 54.4, [9, 7, 10, 12]);
    c.stroke();

    // Vertical & horizontal iron cross-straps
    c.fillStyle = '#64748b';
    c.fillRect(-2.5, -25, 3.2, 50);
    c.fillRect(-10, -2, 19, 3.4);

    // Rim rivets
    c.fillStyle = '#e2e8f0';
    for (const ry of [-21, -11, 11, 21]) {
      c.beginPath();
      c.arc(-8.2, ry, 1.1, 0, Math.PI * 2);
      c.arc(6.8, ry, 1.1, 0, Math.PI * 2);
      c.fill();
    }

    // Glowing Algiz (ᛉ) Ward Rune painted above boss
    c.save();
    c.strokeStyle = integrity > 0.35 ? '#38bdf8' : '#7dd3fc';
    c.shadowColor = '#0284c7';
    c.shadowBlur = 6;
    c.lineWidth = 1.7;
    c.lineCap = 'round';
    c.beginPath();
    c.moveTo(-1, -9);
    c.lineTo(-1, -19);
    c.moveTo(-1, -14);
    c.lineTo(-5.5, -18.5);
    c.moveTo(-1, -14);
    c.lineTo(3.5, -18.5);
    c.stroke();
    c.restore();

    // Domed Bronze Shield-Boss (Umbo) jutting left
    const bossGrad = c.createRadialGradient(-4, -1, 1, -2, 0, 7.5);
    bossGrad.addColorStop(0, '#fef08a');
    bossGrad.addColorStop(0.55, '#d97706');
    bossGrad.addColorStop(1, '#78350f');
    c.fillStyle = bossGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.ellipse(-2.5, 0, 6.2, 7.5, 0, 0, Math.PI * 2);
    c.fill();
    c.stroke();

    // Progressive battle damage cracks & splinters
    if (integrity < 0.68) {
      c.strokeStyle = '#020617';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(-10, -16);
      c.lineTo(-4, -11);
      c.lineTo(-6, -6);
      c.stroke();
    }
    if (integrity < 0.36) {
      c.strokeStyle = '#020617';
      c.lineWidth = 1.9;
      c.beginPath();
      c.moveTo(8, 15);
      c.lineTo(0, 9);
      c.lineTo(-5, 17);
      c.moveTo(-10, 8);
      c.lineTo(-3, 5);
      c.stroke();
    }

    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const armored = this.hasArmor();
      const armorIntegrity = this.getArmorIntegrity();
      const stridePeriod = armored ? 162 : 118;
      const stride = this.isEating || this.isStunned ? 0 : animT / stridePeriod;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating ? Math.sin(animT / 115) * 1.2 : Math.abs(walkCos) * (armored ? 1.8 : 2.8);
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow ──
      c.fillStyle = 'rgba(2, 6, 23, 0.52)';
      c.beginPath();
      c.ellipse(cx - 2, this.y + this.height - 3, armored ? 25 : 21, 6, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Fjord-Teal Huscarl Cloak (Streaming Behind Right) ──
      const cloakWave = Math.sin(animT / 175) * (armored ? 2.2 : 4.2);
      c.fillStyle = '#134e4a';
      c.strokeStyle = '#042f2e';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx + 4, cy - 13 - bob);
      c.quadraticCurveTo(cx + 19, cy + 4, cx + 22 + cloakWave, cy + 26);
      c.lineTo(cx + 11 + cloakWave * 0.6, cy + 28);
      c.lineTo(cx + 3, cy + 22);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Articulated Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawGreaveLeg(c, cx - 2, cy + 19 - bob * 0.3, -walkSin, backLift, true);
      this.drawGreaveLeg(c, cx + 5, cy + 20 - bob * 0.3, walkSin, frontLift, false);

      // ── 4. Riveted Chainmail Hauberk & Leather Baldric ──
      const mailGrad = c.createLinearGradient(cx - 13, cy - 14 - bob, cx + 14, cy + 21 - bob);
      mailGrad.addColorStop(0, '#64748b');
      mailGrad.addColorStop(0.5, '#334155');
      mailGrad.addColorStop(1, '#1e293b');
      c.fillStyle = mailGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(cx - 12, cy - 13 - bob, 25, 33, 5);
      c.fill();
      c.stroke();

      // Fjord-teal surcoat tabard & studded belt
      c.fillStyle = '#0f766e';
      c.fillRect(cx - 7, cy - 11 - bob, 14, 28);
      c.fillStyle = '#291d12';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.fillRect(cx - 12.5, cy + 8 - bob, 26, 4.8);
      c.strokeRect(cx - 12.5, cy + 8 - bob, 26, 4.8);
      c.fillStyle = '#fbbf24';
      c.fillRect(cx - 3, cy + 7.5 - bob, 5, 5.8);

      // ── 5. Nordic Nasal Spangenhelm & Glowing Draugr Eyes ──
      const headX = cx - 1;
      const headY = cy - 24 - bob;

      // Chainmail aventail curtain protecting neck
      c.fillStyle = '#334155';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(headX - 10, headY + 2, 21, 12, 3);
      c.fill();
      c.stroke();

      // Shadowed face beneath helm
      c.fillStyle = '#0f172a';
      c.beginPath();
      c.arc(headX - 2, headY + 2, 8.5, 0, Math.PI * 2);
      c.fill();

      // Glowing Frost-Cyan Draugr Eyes
      c.save();
      c.fillStyle = '#38bdf8';
      c.shadowColor = '#0ea5e9';
      c.shadowBlur = 7;
      c.beginPath();
      c.arc(headX - 6.5, headY + 1.5, 1.9, 0, Math.PI * 2);
      c.arc(headX - 1.2, headY + 1.5, 2.1, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Conical Steel Spangenhelm Dome
      const helmGrad = c.createLinearGradient(headX - 12, headY - 13, headX + 12, headY + 1);
      helmGrad.addColorStop(0, '#cbd5e1');
      helmGrad.addColorStop(0.55, '#64748b');
      helmGrad.addColorStop(1, '#334155');
      c.fillStyle = helmGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(headX - 11.5, headY - 0.5);
      c.quadraticCurveTo(headX - 9, headY - 13, headX + 0.5, headY - 14.5);
      c.quadraticCurveTo(headX + 10, headY - 13, headX + 11.5, headY - 0.5);
      c.closePath();
      c.fill();
      c.stroke();

      // Bronze brow-band & nasal bar jutting down between eyes
      c.fillStyle = '#d97706';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1;
      c.fillRect(headX - 11.8, headY - 2.2, 23.6, 3);
      c.strokeRect(headX - 11.8, headY - 2.2, 23.6, 3);
      c.fillRect(headX - 5.2, headY - 1.5, 2.8, 7.5);
      c.strokeRect(headX - 5.2, headY - 1.5, 2.8, 7.5);

      // ── 6. Thrusting Winged Norse War-Spear (Right/Front Arm) ──
      // Positive armSwing = drawn back right to coil; negative = violent horizontal lunge left!
      const thrustOffset = this.isEating || this.strikeFlashTimer > 0
        ? -pose.armSwing * 11
        : walkSin * 2.5;
      const spearTilt = this.isEating || this.strikeFlashTimer > 0
        ? pose.armSwing * 0.16
        : -0.05 + walkSin * 0.04;

      c.save();
      c.translate(cx + 8 - thrustOffset * 0.45, cy - 1 - bob * 0.7);
      c.rotate(spearTilt);

      // Ash-wood spear shaft extending forward-left past the shield
      c.strokeStyle = '#090d16';
      c.lineWidth = 5.2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(14, 2);
      c.lineTo(-28 - thrustOffset * 0.65, 1);
      c.stroke();

      c.strokeStyle = '#78350f';
      c.lineWidth = 3.1;
      c.beginPath();
      c.moveTo(14, 2);
      c.lineTo(-28 - thrustOffset * 0.65, 1);
      c.stroke();

      // Winged steel spearhead (Krókspjót lugs + leaf blade)
      const tipBaseX = -27 - thrustOffset * 0.65;
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      // Side wings
      c.beginPath();
      c.moveTo(tipBaseX + 2, 1);
      c.lineTo(tipBaseX - 2, -5.5);
      c.lineTo(tipBaseX - 4, -0.5);
      c.lineTo(tipBaseX - 2, 7.5);
      c.closePath();
      c.fill();
      c.stroke();
      // Leaf spear point
      c.beginPath();
      c.moveTo(tipBaseX - 1, -3.2);
      c.lineTo(tipBaseX - 15, 1);
      c.lineTo(tipBaseX - 1, 5.2);
      c.closePath();
      c.fill();
      c.stroke();

      // Rear mail arm gripping the shaft
      c.strokeStyle = '#090d16';
      c.lineWidth = 7.4;
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(-4, 2);
      c.stroke();
      c.strokeStyle = '#64748b';
      c.lineWidth = 4.8;
      c.beginPath();
      c.moveTo(0, -4);
      c.lineTo(-4, 2);
      c.stroke();
      c.restore();

      // ── 7. Front Phalanx Tower Shield (Until Shattered!) ──
      if (armored) {
        const shieldBrace = this.isEating ? Math.max(0, -pose.armSwing) * 2.5 : walkSin * 1.2;
        this.drawTowerShield(c, cx - 13 - shieldBrace, cy + 1 - bob * 0.6, armorIntegrity);
      } else {
        // Unshielded left mail arm pumping aggressively as he charges
        c.save();
        c.translate(cx - 9, cy - 5 - bob * 0.6);
        c.rotate(-0.55 - walkSin * 0.35);
        c.strokeStyle = '#090d16';
        c.lineWidth = 7.2;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-8, 10);
        c.stroke();
        c.strokeStyle = '#475569';
        c.lineWidth = 4.6;
        c.beginPath();
        c.moveTo(0, 0);
        c.lineTo(-8, 10);
        c.stroke();
        c.restore();
      }

      // ── 8. Piercing Spear-Lunge Streak on Impact ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = Math.min(1, pose.slashAlpha * 0.92);
        const lanceGrad = c.createLinearGradient(cx - 8, cy, cx - 44, cy);
        lanceGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
        lanceGrad.addColorStop(0.6, 'rgba(186, 230, 253, 0.85)');
        lanceGrad.addColorStop(1, '#ffffff');
        c.strokeStyle = lanceGrad;
        c.lineWidth = 3.6;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(cx - 8, cy - bob * 0.6);
        c.lineTo(cx - 44, cy - bob * 0.6);
        c.stroke();
        c.restore();
      }
    });

    this.drawHealthBar(ctx);
  }
}

