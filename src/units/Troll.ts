import { Attacker } from '../entities/Attacker';

export class Troll extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y - 10, 70, 110, 300, 12, 32, row);
    this.attackRate = 1550;
    this.enemyKind = 'troll';
    this.attackStyle = 'heavy';
    this.mass = 3.2;
  }

  override getHeadClearance(): number {
    return 18;
  }

  private drawPillarLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 10;
    const footY = hipY + 25 - lift * 5.5;
    const kneeX = (hipX + footX) * 0.5 - 2.5;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.8;

    c.save();
    // Massive Granite Pillar Leg Outline
    c.strokeStyle = '#090d16';
    c.lineWidth = 15.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#1e293b' : '#475569';
    c.lineWidth = 12;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Craggy Stone Knee Shelf
    c.fillStyle = isBack ? '#334155' : '#64748b';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.roundRect(kneeX - 6.5, kneeY - 3, 11, 6, 2);
    c.fill();
    c.stroke();

    // Heavy Megalithic Stone Foot & Toe Claws
    c.fillStyle = isBack ? '#0f172a' : '#334155';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(footX + 6.5, footY - 3);
    c.lineTo(footX - 10, footY + 0.5);
    c.lineTo(footX - 9, footY + 5.5);
    c.lineTo(footX + 7, footY + 5);
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
      const stride = this.isEating || this.isStunned ? 0 : animT / 210;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const stompBob = this.isEating
        ? Math.sin(animT / 150) * 1.6
        : Math.pow(Math.abs(walkCos), 1.4) * 3.4;
      const hpRatio = Math.max(0, this.health / this.maxHealth);
      const rageRatio = Math.max(0, Math.min(1, (0.75 - hpRatio) / 0.6));
      const pose = this.getMeleePose();

      // ── 1. Colossal Ground Shadow & Slam Shockwave Ring ──
      c.fillStyle = 'rgba(2, 6, 23, 0.56)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 4, 34, 9.5, 0, 0, Math.PI * 2);
      c.fill();

      if (pose.slashAlpha > 0.08) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.75;
        c.strokeStyle = '#fbbf24';
        c.lineWidth = 2.5;
        const ringR = 18 + (1 - pose.slashAlpha) * 26;
        c.beginPath();
        c.ellipse(cx - 22, this.y + this.height - 3, ringR, ringR * 0.32, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }

      // ── 2. Back Basalt Arm (Heavy Counter-Balance) ──
      c.save();
      c.translate(cx - 18, cy - 10 - stompBob);
      c.rotate(0.2 - walkSin * 0.28 + pose.bodyLean * 0.6);
      c.strokeStyle = '#090d16';
      c.lineWidth = 13.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 22);
      c.stroke();
      c.strokeStyle = '#334155';
      c.lineWidth = 10;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 22);
      c.stroke();
      c.restore();

      // ── 3. Animated Pillar-Like Cragstone Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawPillarLeg(c, cx - 10, cy + 23 - stompBob * 0.35, -walkSin * 0.6, backLift, true);
      this.drawPillarLeg(c, cx + 10, cy + 24 - stompBob * 0.35, walkSin * 0.6, frontLift, false);

      // ── 4. Dorsal Quartz / Ice-Rock Crags on Upper Back ──
      const bodyY = cy - 6 - stompBob;
      const dorsalCrags = [
        { ox: 14, oy: -20, dx: 9, dy: -11 },
        { ox: 22, oy: -10, dx: 11, dy: -6 },
        { ox: 24, oy: 2, dx: 9, dy: -2 },
      ];
      for (const cr of dorsalCrags) {
        c.fillStyle = '#94a3b8';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(cx + cr.ox, bodyY + cr.oy - 5);
        c.lineTo(cx + cr.ox + cr.dx, bodyY + cr.oy + cr.dy);
        c.lineTo(cx + cr.ox + 2, bodyY + cr.oy + 5);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 5. Hulking Faceted Cragstone Jötunn Torso ──
      const bodyGrad = c.createLinearGradient(cx - 30, bodyY - 22, cx + 30, bodyY + 32);
      bodyGrad.addColorStop(0, '#64748b');
      bodyGrad.addColorStop(0.45, '#475569');
      bodyGrad.addColorStop(0.8, '#1e293b');
      bodyGrad.addColorStop(1, '#0f172a');
      c.fillStyle = bodyGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(cx - 26, bodyY - 12);
      c.quadraticCurveTo(cx + 2, bodyY - 24, cx + 27, bodyY - 10);
      c.lineTo(cx + 23, bodyY + 26);
      c.quadraticCurveTo(cx, bodyY + 31, cx - 22, bodyY + 26);
      c.closePath();
      c.fill();
      c.stroke();

      // Sculpted Pectoral Crag Planes & Runic Magma Fissures
      c.strokeStyle = 'rgba(9, 13, 22, 0.7)';
      c.lineWidth = 1.4;
      c.beginPath();
      c.moveTo(cx - 21, bodyY + 3);
      c.lineTo(cx - 6, bodyY + 6);
      c.lineTo(cx + 12, bodyY + 2);
      c.moveTo(cx - 6, bodyY - 8);
      c.lineTo(cx - 6, bodyY + 18);
      c.stroke();

      // Glowing Jötunn Chest Rune Fissures (blaze hotter as damaged!)
      const runeGlowAlpha = 0.28 + rageRatio * 0.65 + Math.sin(animT / 180) * 0.08;
      c.save();
      c.strokeStyle = `rgba(251, 191, 36, ${runeGlowAlpha})`;
      if (rageRatio > 0.15) {
        c.shadowColor = '#f59e0b';
        c.shadowBlur = 10 * rageRatio;
      }
      c.lineWidth = 1.6 + rageRatio * 0.8;
      c.beginPath();
      c.moveTo(cx - 14, bodyY - 4);
      c.lineTo(cx - 7, bodyY + 4);
      c.lineTo(cx - 12, bodyY + 12);
      c.moveTo(cx + 4, bodyY - 6);
      c.lineTo(cx + 1, bodyY + 5);
      c.lineTo(cx + 9, bodyY + 11);
      c.stroke();
      c.restore();

      // Tundra Moss & Lichen Shelves on Shoulders
      c.fillStyle = '#4d7c0f';
      c.strokeStyle = '#1a2e05';
      c.lineWidth = 1.1;
      c.beginPath();
      c.ellipse(cx - 16, bodyY - 12, 9, 4.2, -0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.beginPath();
      c.ellipse(cx + 14, bodyY - 11, 11, 4.8, 0.25, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Fur Pelt Skirt & Forged Runic Megalith Belt
      c.fillStyle = '#291d12';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(cx - 22, bodyY + 22);
      c.lineTo(cx - 16, bodyY + 33);
      c.lineTo(cx - 7, bodyY + 27);
      c.lineTo(cx + 1, bodyY + 34);
      c.lineTo(cx + 10, bodyY + 27);
      c.lineTo(cx + 19, bodyY + 33);
      c.lineTo(cx + 22, bodyY + 22);
      c.closePath();
      c.fill();
      c.stroke();

      c.fillStyle = '#0f172a';
      c.strokeStyle = '#475569';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(cx - 23, bodyY + 19, 46, 7.5, 2);
      c.fill();
      c.stroke();

      // Bronze Sun-Wheel Giant Buckle
      const buckleGrad = c.createRadialGradient(cx - 5, bodyY + 22.5, 1, cx - 5, bodyY + 22.5, 7);
      buckleGrad.addColorStop(0, '#fef08a');
      buckleGrad.addColorStop(0.6, '#d97706');
      buckleGrad.addColorStop(1, '#78350f');
      c.fillStyle = buckleGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(cx - 5, bodyY + 22.8, 6.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // ── 6. Massive Cragstone Jötunn Head, Cliff-Brow & Mammoth Tusks ──
      const headX = cx - 6;
      const headY = cy - 34 - stompBob * 0.85;
      const jawDrop = pose.jawOpen * 5.2;

      // Craggy Stone Jaw & Stalactite Chin Beard
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(headX - 15, headY + 5 + jawDrop * 0.7);
      c.lineTo(headX + 12, headY + 5 + jawDrop * 0.7);
      c.lineTo(headX + 9, headY + 17 + jawDrop * 0.7);
      c.lineTo(headX + 2, headY + 15 + jawDrop * 0.7);
      c.lineTo(headX - 3, headY + 21 + jawDrop * 0.7); // Stone chin stalactite!
      c.lineTo(headX - 9, headY + 16 + jawDrop * 0.7);
      c.lineTo(headX - 14, headY + 18 + jawDrop * 0.7);
      c.closePath();
      c.fill();
      c.stroke();

      // Dark Roaring Maw
      c.fillStyle = '#020617';
      c.fillRect(headX - 13, headY + 5, 20, 4.5 + jawDrop * 0.65);

      // Massive Granite Cranium
      const headGrad = c.createRadialGradient(headX - 4, headY - 6, 3, headX, headY, 22);
      headGrad.addColorStop(0, '#94a3b8');
      headGrad.addColorStop(0.45, '#475569');
      headGrad.addColorStop(1, '#1e293b');
      c.fillStyle = headGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.7;
      c.beginPath();
      c.arc(headX + 1, headY - 2, 19.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Overhanging Granite Cliff-Brow
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(headX - 18, headY - 3);
      c.lineTo(headX - 16, headY - 9);
      c.lineTo(headX + 13, headY - 8);
      c.lineTo(headX + 15, headY - 2);
      c.quadraticCurveTo(headX - 2, headY + 0.5, headX - 18, headY - 3);
      c.closePath();
      c.fill();
      c.stroke();

      // Piercing Molten Amber-Crimson Jötunn Eyes
      c.save();
      c.shadowColor = '#f59e0b';
      c.shadowBlur = 12;
      c.fillStyle = '#fbbf24';
      c.beginPath();
      c.ellipse(headX - 11, headY - 1, 3.4, 2.8, -0.1, 0, Math.PI * 2);
      c.ellipse(headX + 1.5, headY - 1, 3.8, 3.0, 0.08, 0, Math.PI * 2);
      c.fill();
      c.fillStyle = '#dc2626';
      c.beginPath();
      c.arc(headX - 11.3, headY - 1, 1.5, 0, Math.PI * 2);
      c.arc(headX + 1.2, headY - 1, 1.6, 0, Math.PI * 2);
      c.fill();
      c.restore();

      // Curved Mammoth-Ivory Tusks Framing the Jaw!
      const tuskGrad = c.createLinearGradient(0, headY + 14, 0, headY - 2);
      tuskGrad.addColorStop(0, '#d97706');
      tuskGrad.addColorStop(0.45, '#fef08a');
      tuskGrad.addColorStop(1, '#ffffff');
      c.fillStyle = tuskGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;

      // Left (far) tusk
      c.beginPath();
      c.moveTo(headX - 15, headY + 11 + jawDrop * 0.65);
      c.quadraticCurveTo(headX - 19, headY + 4, headX - 15, headY - 2);
      c.quadraticCurveTo(headX - 13, headY + 5, headX - 10.5, headY + 11 + jawDrop * 0.65);
      c.closePath();
      c.fill();
      c.stroke();

      // Right (near) tusk
      c.beginPath();
      c.moveTo(headX + 1, headY + 12 + jawDrop * 0.65);
      c.quadraticCurveTo(headX - 1, headY + 4, headX + 3, headY - 2);
      c.quadraticCurveTo(headX + 6, headY + 5, headX + 6.5, headY + 12 + jawDrop * 0.65);
      c.closePath();
      c.fill();
      c.stroke();

      // Glowing Forehead Elder Rune (ᚦ - Thurisaz / Jötunn)
      c.save();
      c.fillStyle = `rgba(254, 240, 138, ${0.6 + rageRatio * 0.4})`;
      c.shadowColor = '#f59e0b';
      c.shadowBlur = 10;
      c.font = 'bold 12px serif';
      c.textAlign = 'center';
      c.fillText('ᚦ', headX - 2, headY - 10);
      c.restore();

      // ── 7. Foreground Boulder Pauldron, Arm & Colossal Spiked Menhir Club ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.22;
      const armRot = pose.armSwing * 1.05 + walkSwing;
      const shoulderX = cx + 15;
      const shoulderY = bodyY - 6;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      // Mossy Crag Boulder Shoulder Pauldron
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.6;
      c.beginPath();
      c.ellipse(0, 0, 11.5, 9, 0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = '#65a30d';
      c.beginPath();
      c.ellipse(1, -5, 6.5, 2.8, 0.15, 0, Math.PI * 2);
      c.fill();

      // Massive Granite Forearm
      c.strokeStyle = '#090d16';
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-15, 18);
      c.stroke();

      c.strokeStyle = '#64748b';
      c.lineWidth = 10.2;
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-15, 18);
      c.stroke();

      // Colossal Spiked Crag-Boulder War-Club at (-15, 18)
      c.save();
      c.translate(-15, 18);
      c.rotate(-0.42);

      // Gnarled Ironwood Trunk Shaft with Leather & Chain Wraps
      c.fillStyle = '#451a03';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.roundRect(-4.5, -36, 9, 46, 3);
      c.fill();
      c.stroke();

      c.strokeStyle = '#b45309';
      c.lineWidth = 1.6;
      for (let wy = -16; wy <= 4; wy += 7) {
        c.beginPath();
        c.moveTo(-4.5, wy);
        c.lineTo(4.5, wy + 3);
        c.stroke();
      }

      // Colossal Spiked Megalith Boulder Head centered at (0, -38)
      const rockY = -38;
      // Forged Iron Spikes jutting out of boulder
      c.fillStyle = '#e2e8f0';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      const spikeAngles = [-Math.PI * 0.85, -Math.PI * 0.5, -Math.PI * 0.15, Math.PI * 0.2, Math.PI * 0.82];
      for (const ang of spikeAngles) {
        const r = 16;
        const bx = Math.cos(ang) * r;
        const by = rockY + Math.sin(ang) * r;
        c.beginPath();
        c.moveTo(Math.cos(ang - 0.25) * (r - 2), rockY + Math.sin(ang - 0.25) * (r - 2));
        c.lineTo(bx + Math.cos(ang) * 9, by + Math.sin(ang) * 9);
        c.lineTo(Math.cos(ang + 0.25) * (r - 2), rockY + Math.sin(ang + 0.25) * (r - 2));
        c.closePath();
        c.fill();
        c.stroke();
      }

      // Faceted Crag-Boulder Polygon
      const rockGrad = c.createRadialGradient(-5, rockY - 5, 2, 0, rockY, 20);
      rockGrad.addColorStop(0, '#94a3b8');
      rockGrad.addColorStop(0.55, '#475569');
      rockGrad.addColorStop(1, '#0f172a');
      c.fillStyle = rockGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.7;
      c.beginPath();
      c.moveTo(-16, rockY - 4);
      c.lineTo(-11, rockY - 16);
      c.lineTo(3, rockY - 18);
      c.lineTo(15, rockY - 11);
      c.lineTo(17, rockY + 3);
      c.lineTo(9, rockY + 14);
      c.lineTo(-8, rockY + 15);
      c.lineTo(-17, rockY + 6);
      c.closePath();
      c.fill();
      c.stroke();

      // Iron Chain Binding Around Boulder
      c.strokeStyle = '#cbd5e1';
      c.lineWidth = 2;
      c.beginPath();
      c.moveTo(-14, rockY + 7);
      c.lineTo(13, rockY - 7);
      c.moveTo(-12, rockY - 9);
      c.lineTo(12, rockY + 8);
      c.stroke();

      c.restore();
      c.restore();

      // ── 8. Earth-Shaking Jötunn Slam Arc ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.92;
        c.strokeStyle = '#f59e0b';
        c.shadowColor = '#ea580c';
        c.shadowBlur = 16;
        c.lineWidth = 5.2;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 10, cy - 6, 36, Math.PI * 0.68, Math.PI * 1.32);
        c.stroke();

        c.strokeStyle = '#fef08a';
        c.lineWidth = 2;
        c.beginPath();
        c.arc(cx - 10, cy - 6, 38, Math.PI * 0.74, Math.PI * 1.26);
        c.stroke();
        c.restore();
      }
    });
  }
}
