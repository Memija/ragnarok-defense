import { Attacker } from '../entities/Attacker';

export class JotunnFrostbreaker extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y - 18, 68, 108, 460, 11.5, 38, row);
    this.enemyKind = 'frost_giant';
    this.attackStyle = 'heavy';
    this.armorStyle = 'frost_helm';
    this.armorThreshold = 250;
    this.attackRate = 1650;
    this.attackReach = 14;
    this.frostResistance = 0.75;
    this.stunResistance = 0.35;
    this.mass = 3.6;
  }

  override getHeadClearance(): number {
    return 20;
  }

  override modifyProjectileDamage(
    amount: number,
    isFire: boolean,
    _isStunning: boolean,
    isIce?: boolean
  ): number {
    if (isFire && this.hasArmor()) {
      // Forge-fire & flame bolts fracture and melt its Niflheim rime-plate armor!
      return Math.round(amount * 1.3);
    }
    if (isIce && this.hasArmor()) {
      // Native glacier armor absorbs part of incoming frost bolts
      return Math.max(8, Math.round(amount * 0.85));
    }
    return amount;
  }

  private drawFrostPillarLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 10;
    const footY = hipY + 23 - lift * 5.2;
    const kneeX = (hipX + footX) * 0.5 - 2.4;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.7;

    c.save();
    // Deep frozen slate outline
    c.strokeStyle = '#090d16';
    c.lineWidth = 15;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Frost-blue Jötunn leg & rime greave
    c.strokeStyle = isBack ? '#0c4a6e' : '#0284c7';
    c.lineWidth = 11.5;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Jagged Glacier Ice Knee-Spike
    c.fillStyle = isBack ? '#38bdf8' : '#bae6fd';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(kneeX + 5, kneeY - 3);
    c.lineTo(kneeX - 9, kneeY - 1.5);
    c.lineTo(kneeX - 4, kneeY + 4);
    c.lineTo(kneeX + 5, kneeY + 3);
    c.closePath();
    c.fill();
    c.stroke();

    // Iron-banded mammoth-hide frost boot
    c.fillStyle = isBack ? '#0f172a' : '#1e293b';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.35;
    c.beginPath();
    c.moveTo(footX + 6, footY - 2.5);
    c.lineTo(footX - 9.5, footY + 0.5);
    c.lineTo(footX - 8.5, footY + 5.5);
    c.lineTo(footX + 6.5, footY + 5);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  private drawGlacialMaul(c: CanvasRenderingContext2D, animT: number) {
    // Thick iron-bound frost-oak siege handle
    c.fillStyle = '#334155';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.4;
    c.beginPath();
    c.roundRect(-3.2, -46, 6.4, 58, 2);
    c.fill();
    c.stroke();

    // Colossal Niflheim Permafrost Crystal & Runic Iron Maul Head
    const headGrad = c.createLinearGradient(-22, -52, 16, -28);
    headGrad.addColorStop(0, '#f0f9ff');
    headGrad.addColorStop(0.35, '#7dd3fc');
    headGrad.addColorStop(0.75, '#0284c7');
    headGrad.addColorStop(1, '#0c4a6e');
    c.fillStyle = headGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.55;
    c.beginPath();
    // Jagged forward strike-face on left + crystal rear crown on right
    c.moveTo(-19, -50);
    c.lineTo(-24, -44);
    c.lineTo(-21, -39);
    c.lineTo(-25, -34);
    c.lineTo(-18, -28);
    c.lineTo(13, -30);
    c.lineTo(18, -39);
    c.lineTo(13, -49);
    c.closePath();
    c.fill();
    c.stroke();

    // Dark forged iron reinforcing band & Isa rune glow
    c.fillStyle = '#1e293b';
    c.fillRect(-5, -50, 10, 21);
    c.strokeRect(-5, -50, 10, 21);

    const runeAlpha = 0.65 + Math.sin(animT / 160) * 0.25;
    c.strokeStyle = `rgba(224, 242, 254, ${runeAlpha})`;
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(0, -46);
    c.lineTo(0, -33);
    c.moveTo(-4, -42);
    c.lineTo(4, -37);
    c.stroke();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stride = this.isEating || this.isStunned ? 0 : animT / 220;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const stompBob = this.isEating
        ? Math.sin(animT / 155) * 1.6
        : Math.pow(Math.abs(walkCos), 1.4) * 3.2;
      const armored = this.hasArmor();
      const armorInt = this.getArmorIntegrity();
      const hpRatio = Math.max(0, this.health / this.maxHealth);
      const frostFury = Math.max(0, Math.min(1, (0.7 - hpRatio) / 0.55));
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow & Permafrost Shatter Shockwave ──
      c.fillStyle = 'rgba(2, 6, 23, 0.56)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 4, 33, 9, 0, 0, Math.PI * 2);
      c.fill();

      if (pose.slashAlpha > 0.08) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.82;
        c.strokeStyle = '#7dd3fc';
        c.lineWidth = 2.6;
        const ringR = 18 + (1 - pose.slashAlpha) * 26;
        c.beginPath();
        c.ellipse(cx - 22, this.y + this.height - 3, ringR, ringR * 0.32, 0, 0, Math.PI * 2);
        c.stroke();

        // Erupting ground ice shards on slam
        c.fillStyle = '#e0f2fe';
        for (let i = 0; i < 3; i++) {
          const ix = cx - 34 + i * 10;
          const iy = this.y + this.height - 3;
          const ih = (10 + (i % 2) * 5) * pose.slashAlpha;
          c.beginPath();
          c.moveTo(ix - 3.5, iy);
          c.lineTo(ix - 1, iy - ih);
          c.lineTo(ix + 3.5, iy);
          c.closePath();
          c.fill();
        }
        c.restore();
      }

      // ── 2. Back Rime-Giant Arm ──
      c.save();
      c.translate(cx - 17, cy - 11 - stompBob);
      c.rotate(0.22 - walkSin * 0.26 + pose.bodyLean * 0.6);
      c.strokeStyle = '#090d16';
      c.lineWidth = 13;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 21);
      c.stroke();
      c.strokeStyle = '#0369a1';
      c.lineWidth = 9.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 21);
      c.stroke();
      c.restore();

      // ── 3. Articulated Frost-Plate Pillar Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawFrostPillarLeg(c, cx - 10, cy + 23 - stompBob * 0.35, -walkSin * 0.6, backLift, true);
      this.drawFrostPillarLeg(c, cx + 9, cy + 24 - stompBob * 0.35, walkSin * 0.6, frontLift, false);

      // ── 4. Jagged Translucent Glacier Spires on Upper Back ──
      const bodyY = cy - 6 - stompBob;
      const spires = [
        { ox: 12, oy: -22, dx: 9, dy: -15 },
        { ox: 20, oy: -12, dx: 13, dy: -9 },
        { ox: 23, oy: 0, dx: 10, dy: -3 },
      ];
      for (const sp of spires) {
        const spGrad = c.createLinearGradient(
          cx + sp.ox,
          bodyY + sp.oy,
          cx + sp.ox + sp.dx,
          bodyY + sp.oy + sp.dy
        );
        spGrad.addColorStop(0, '#0284c7');
        spGrad.addColorStop(0.6, '#7dd3fc');
        spGrad.addColorStop(1, '#f0f9ff');
        c.fillStyle = spGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.35;
        c.beginPath();
        c.moveTo(cx + sp.ox - 1, bodyY + sp.oy - 5);
        c.lineTo(cx + sp.ox + sp.dx, bodyY + sp.oy + sp.dy);
        c.lineTo(cx + sp.ox + 2, bodyY + sp.oy + 6);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 5. Hulking Rime-Jötunn Torso & Hoarfrost Carapace ──
      const torsoGrad = c.createLinearGradient(cx - 28, bodyY - 22, cx + 28, bodyY + 30);
      torsoGrad.addColorStop(0, '#7dd3fc');
      torsoGrad.addColorStop(0.32, '#0284c7');
      torsoGrad.addColorStop(0.75, '#0c4a6e');
      torsoGrad.addColorStop(1, '#082f49');
      c.fillStyle = torsoGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.75;
      c.beginPath();
      c.moveTo(cx - 25, bodyY - 13);
      c.quadraticCurveTo(cx + 1, bodyY - 24, cx + 26, bodyY - 11);
      c.lineTo(cx + 22, bodyY + 25);
      c.quadraticCurveTo(cx, bodyY + 30, cx - 21, bodyY + 25);
      c.closePath();
      c.fill();
      c.stroke();

      // Glowing Cyan Elder-Rune Chest Fissures
      const runeGlow = 0.4 + frostFury * 0.5 + Math.sin(animT / 170) * 0.1;
      c.save();
      c.strokeStyle = `rgba(224, 242, 254, ${runeGlow})`;
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 8 + frostFury * 6;
      c.lineWidth = 1.7;
      c.beginPath();
      c.moveTo(cx - 8, bodyY - 8);
      c.lineTo(cx - 8, bodyY + 13);
      c.moveTo(cx - 14, bodyY - 2);
      c.lineTo(cx - 2, bodyY + 6);
      c.moveTo(cx + 6, bodyY - 6);
      c.lineTo(cx + 2, bodyY + 4);
      c.lineTo(cx + 9, bodyY + 11);
      c.stroke();
      c.restore();

      // Snow-dusted Polar Bear Fur Mantle & Forged Runic Ice-Belt
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.25;
      c.beginPath();
      c.ellipse(cx - 16, bodyY - 13, 10, 4.8, -0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(cx + 14, bodyY - 12, 11, 5.2, 0.22, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Fur kilt & iron war-girdle
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx - 21, bodyY + 21);
      c.lineTo(cx - 16, bodyY + 32);
      c.lineTo(cx - 6, bodyY + 26);
      c.lineTo(cx + 2, bodyY + 33);
      c.lineTo(cx + 11, bodyY + 26);
      c.lineTo(cx + 19, bodyY + 31);
      c.lineTo(cx + 21, bodyY + 21);
      c.closePath();
      c.fill();
      c.stroke();

      c.fillStyle = '#0f172a';
      c.strokeStyle = '#38bdf8';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(cx - 22, bodyY + 18, 44, 7, 2);
      c.fill();
      c.stroke();

      // Diamond Ice-Core Belt Buckle
      c.fillStyle = '#bae6fd';
      c.strokeStyle = '#090d16';
      c.beginPath();
      c.moveTo(cx - 4, bodyY + 15.5);
      c.lineTo(cx + 2, bodyY + 21.5);
      c.lineTo(cx - 4, bodyY + 27.5);
      c.lineTo(cx - 10, bodyY + 21.5);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 6. Frost-Giant Head, Icicle Beard & Horned Glacial Greathelm ──
      const headX = cx - 5;
      const headY = cy - 33 - stompBob * 0.85;
      const jawDrop = pose.jawOpen * 4.5;

      // Freezing Breath Plume when roaring or marching
      const breathAlpha = 0.22 + pose.jawOpen * 0.45 + Math.max(0, Math.sin(animT / 320)) * 0.18;
      c.save();
      c.globalAlpha = breathAlpha;
      c.fillStyle = '#e0f2fe';
      c.beginPath();
      c.ellipse(headX - 18, headY + 6, 8 + pose.jawOpen * 5, 4.2, -0.18, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Braided Hoarfrost & Icicle Giant Beard
      c.fillStyle = '#f0f9ff';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(headX - 13, headY + 4 + jawDrop * 0.6);
      c.lineTo(headX - 15, headY + 17 + jawDrop * 0.6);
      c.lineTo(headX - 9, headY + 13 + jawDrop * 0.6);
      c.lineTo(headX - 5, headY + 22 + jawDrop * 0.6);
      c.lineTo(headX + 1, headY + 14 + jawDrop * 0.6);
      c.lineTo(headX + 6, headY + 19 + jawDrop * 0.6);
      c.lineTo(headX + 10, headY + 5 + jawDrop * 0.6);
      c.closePath();
      c.fill();
      c.stroke();

      // Rime-Jötunn Cranium
      const faceGrad = c.createRadialGradient(headX - 3, headY - 4, 2, headX, headY, 18);
      faceGrad.addColorStop(0, '#7dd3fc');
      faceGrad.addColorStop(0.55, '#0284c7');
      faceGrad.addColorStop(1, '#0c4a6e');
      c.fillStyle = faceGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.55;
      c.beginPath();
      c.arc(headX, headY - 2, 16, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Piercing White-Cyan Glacial Eyes
      c.save();
      c.shadowColor = '#38bdf8';
      c.shadowBlur = 11;
      c.fillStyle = '#f0f9ff';
      c.beginPath();
      c.ellipse(headX - 8.5, headY - 1.5, 3.1, 2.4, -0.08, 0, Math.PI * 2);
      c.ellipse(headX + 1.5, headY - 1.5, 3.3, 2.5, 0.08, 0, Math.PI * 2);
      c.fill();
      c.restore();

      if (armored) {
        // Heavy Horned Glacial-Iron Greathelm Encasing Upper Head
        const helmGrad = c.createLinearGradient(headX - 17, headY - 20, headX + 17, headY + 4);
        helmGrad.addColorStop(0, '#e0f2fe');
        helmGrad.addColorStop(0.4, '#7dd3fc');
        helmGrad.addColorStop(0.8, '#334155');
        helmGrad.addColorStop(1, '#0f172a');
        c.fillStyle = helmGrad;
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(headX - 17, headY + 2);
        c.lineTo(headX - 16, headY - 13);
        c.quadraticCurveTo(headX, headY - 22, headX + 16, headY - 13);
        c.lineTo(headX + 16, headY + 3);
        c.lineTo(headX + 7, headY + 3);
        c.lineTo(headX + 5, headY - 4);
        c.lineTo(headX - 2, headY + 4); // Thick iron nose-guard
        c.lineTo(headX - 5, headY + 4);
        c.lineTo(headX - 7, headY - 4);
        c.lineTo(headX - 13, headY + 2);
        c.closePath();
        c.fill();
        c.stroke();

        // Central Ice-Crystal Crest & Sweeping Rime-Horns
        c.fillStyle = '#f0f9ff';
        c.beginPath();
        c.moveTo(headX - 4, headY - 16);
        c.lineTo(headX, headY - 27);
        c.lineTo(headX + 4, headY - 16);
        c.closePath();
        c.fill();
        c.stroke();

        c.fillStyle = '#bae6fd';
        c.beginPath();
        c.moveTo(headX - 14, headY - 9);
        c.quadraticCurveTo(headX - 27, headY - 14, headX - 23, headY - 25);
        c.quadraticCurveTo(headX - 17, headY - 15, headX - 10, headY - 12);
        c.closePath();
        c.fill();
        c.stroke();

        c.beginPath();
        c.moveTo(headX + 13, headY - 9);
        c.quadraticCurveTo(headX + 26, headY - 14, headX + 22, headY - 25);
        c.quadraticCurveTo(headX + 16, headY - 15, headX + 9, headY - 12);
        c.closePath();
        c.fill();
        c.stroke();

        // Progressive fractures when glacial helm takes heavy damage
        if (armorInt < 0.6) {
          c.strokeStyle = '#082f49';
          c.lineWidth = 1.4;
          c.beginPath();
          c.moveTo(headX - 9, headY - 15);
          c.lineTo(headX - 4, headY - 8);
          c.lineTo(headX - 7, headY - 3);
          if (armorInt < 0.3) {
            c.moveTo(headX + 8, headY - 14);
            c.lineTo(headX + 3, headY - 6);
          }
          c.stroke();
        }
      } else {
        // Shattered helm reveals jagged frost-crown brow & glowing Isa forehead brand
        c.fillStyle = '#bae6fd';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(headX - 12, headY - 9);
        c.lineTo(headX - 8, headY - 18);
        c.lineTo(headX - 3, headY - 12);
        c.lineTo(headX + 2, headY - 19);
        c.lineTo(headX + 8, headY - 10);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 7. Front Rime-Arm & Colossal Permafrost Siege Maul ──
      c.save();
      c.translate(cx + 12, cy - 12 - stompBob);
      const armRot = this.isEating
        ? 0.4 + pose.armSwing * 1.05
        : 0.32 + walkSin * 0.22 + pose.armSwing * 0.9;
      c.rotate(armRot);

      // Spiked Ice Pauldron
      c.fillStyle = '#38bdf8';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(-9, 1);
      c.lineTo(-4, -11);
      c.lineTo(4, -7);
      c.lineTo(10, -13);
      c.lineTo(11, 2);
      c.closePath();
      c.fill();
      c.stroke();

      // Massive Forearm
      c.strokeStyle = '#090d16';
      c.lineWidth = 13.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-11, 18);
      c.stroke();
      c.strokeStyle = '#0284c7';
      c.lineWidth = 10;
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-11, 18);
      c.stroke();

      c.translate(-11, 18);
      c.rotate(-0.62);
      this.drawGlacialMaul(c, animT);
      c.restore();

      // ── 8. Glacial Smash Arc on Strike ──
      if (pose.slashAlpha > 0.05) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.82;
        c.strokeStyle = '#bae6fd';
        c.lineWidth = 4.6;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 10, cy - 4, 36, Math.PI * 0.72, Math.PI * 1.34);
        c.stroke();
        c.restore();
      }
    });
  }
}
