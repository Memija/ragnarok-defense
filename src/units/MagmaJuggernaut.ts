import { Attacker } from '../entities/Attacker';

export class MagmaJuggernaut extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y - 16, 72, 106, 520, 10.5, 44, row);
    this.enemyKind = 'magma_juggernaut';
    this.attackStyle = 'heavy';
    this.attackRate = 1750;
    this.attackReach = 12;
    this.frostResistance = 0.45;
    this.stunResistance = 0.45;
    this.mass = 4.2;
  }

  override getHeadClearance(): number {
    return 19;
  }

  override modifyProjectileDamage(
    amount: number,
    isFire: boolean,
    _isStunning: boolean,
    isIce?: boolean
  ): number {
    if (isIce) {
      // Thermal shock cracks superheated volcanic obsidian for 25% bonus damage!
      return Math.round(amount * 1.25);
    }
    if (isFire) {
      // Living Muspelheim slag absorbs part of incoming fire bolts
      return Math.max(8, Math.round(amount * 0.8));
    }
    return amount;
  }

  private drawObsidianLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 9.5;
    const footY = hipY + 23 - lift * 5;
    const kneeX = (hipX + footX) * 0.5 - 2.5;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.6;

    c.save();
    // Volcanic basalt outline
    c.strokeStyle = '#090d16';
    c.lineWidth = 16.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Charred obsidian pillar leg
    c.strokeStyle = isBack ? '#1c1917' : '#292524';
    c.lineWidth = 13;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Glowing magma knee fissure
    c.fillStyle = isBack ? '#ea580c' : '#fb923c';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.roundRect(kneeX - 6.5, kneeY - 2.8, 11, 5.5, 2);
    c.fill();
    c.stroke();

    // Heavy iron-rimmed basalt stomp foot
    c.fillStyle = isBack ? '#0c0a09' : '#1c1917';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(footX + 7, footY - 2.5);
    c.lineTo(footX - 10, footY + 0.5);
    c.lineTo(footX - 9, footY + 5.5);
    c.lineTo(footX + 7.5, footY + 5);
    c.closePath();
    c.fill();
    c.stroke();
    c.restore();
  }

  private drawMoltenSiegeHammer(c: CanvasRenderingContext2D, corePulse: number) {
    // Dark forged iron siege haft
    c.fillStyle = '#1c1917';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.4;
    c.beginPath();
    c.roundRect(-3.4, -44, 6.8, 56, 2);
    c.fill();
    c.stroke();

    // Colossal Obsidian & Molten-Slag Anvil Siege Head
    const anvilGrad = c.createLinearGradient(-24, -49, 16, -27);
    anvilGrad.addColorStop(0, '#44403c');
    anvilGrad.addColorStop(0.5, '#292524');
    anvilGrad.addColorStop(1, '#0c0a09');
    c.fillStyle = anvilGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-22, -48);
    c.lineTo(-26, -38);
    c.lineTo(-22, -28);
    c.lineTo(13, -29);
    c.lineTo(17, -38);
    c.lineTo(13, -47);
    c.closePath();
    c.fill();
    c.stroke();

    // Incandescent Magma Strike-Face & Lava Fissures
    c.save();
    c.fillStyle = `rgba(251, 146, 60, ${0.8 + corePulse * 0.2})`;
    c.shadowColor = '#ea580c';
    c.shadowBlur = 9;
    c.beginPath();
    c.moveTo(-21, -46);
    c.lineTo(-25, -38);
    c.lineTo(-21, -30);
    c.lineTo(-16, -33);
    c.lineTo(-18, -38);
    c.lineTo(-16, -43);
    c.closePath();
    c.fill();

    // Surtr forge-rune glowing in center of hammer block
    c.strokeStyle = '#fef08a';
    c.lineWidth = 1.6;
    c.beginPath();
    c.moveTo(-10, -38);
    c.lineTo(6, -38);
    c.moveTo(-3, -44);
    c.lineTo(-3, -32);
    c.stroke();
    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stride = this.isEating || this.isStunned ? 0 : animT / 235;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const stompBob = this.isEating
        ? Math.sin(animT / 155) * 1.6
        : Math.pow(Math.abs(walkCos), 1.45) * 3.5;
      const hpRatio = Math.max(0, this.health / this.maxHealth);
      const meltdown = Math.max(0, Math.min(1, (0.8 - hpRatio) / 0.65));
      const corePulse = 0.5 + 0.5 * Math.sin(animT / 150);
      const pose = this.getMeleePose();

      // ── 1. Colossal Ground Shadow & Volcanic Impact Ring ──
      c.fillStyle = 'rgba(2, 6, 23, 0.58)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 4, 35, 9.5, 0, 0, Math.PI * 2);
      c.fill();

      if (pose.slashAlpha > 0.08) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.85;
        c.strokeStyle = '#f97316';
        c.lineWidth = 3;
        const ringR = 19 + (1 - pose.slashAlpha) * 28;
        c.beginPath();
        c.ellipse(cx - 23, this.y + this.height - 3, ringR, ringR * 0.32, 0, 0, Math.PI * 2);
        c.stroke();
        c.strokeStyle = '#fef08a';
        c.lineWidth = 1.5;
        c.beginPath();
        c.ellipse(cx - 23, this.y + this.height - 3, ringR * 0.6, ringR * 0.2, 0, 0, Math.PI * 2);
        c.stroke();
        c.restore();
      }

      // ── 2. Back Obsidian Siege Arm ──
      c.save();
      c.translate(cx - 19, cy - 10 - stompBob);
      c.rotate(0.24 - walkSin * 0.25 + pose.bodyLean * 0.6);
      c.strokeStyle = '#090d16';
      c.lineWidth = 14;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 22);
      c.stroke();
      c.strokeStyle = '#292524';
      c.lineWidth = 10.5;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 22);
      c.stroke();
      c.restore();

      // ── 3. Basalt Pillar Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawObsidianLeg(c, cx - 11, cy + 22 - stompBob * 0.35, -walkSin * 0.58, backLift, true);
      this.drawObsidianLeg(c, cx + 10, cy + 23 - stompBob * 0.35, walkSin * 0.58, frontLift, false);

      // ── 4. Twin Volcanic Dorsal Forge-Chimney Vents ──
      const bodyY = cy - 6 - stompBob;
      const vents = [
        { ox: 8, oy: -23, rot: 0.14 },
        { ox: 20, oy: -15, rot: 0.32 },
      ];
      for (const v of vents) {
        c.save();
        c.translate(cx + v.ox, bodyY + v.oy);
        c.rotate(v.rot);
        c.fillStyle = '#1c1917';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.4;
        c.beginPath();
        c.moveTo(-5, 8);
        c.lineTo(-4, -9);
        c.lineTo(4, -9);
        c.lineTo(6, 8);
        c.closePath();
        c.fill();
        c.stroke();

        // Glowing vent rim
        c.fillStyle = '#fb923c';
        c.beginPath();
        c.ellipse(0, -9, 4.2, 1.8, 0, 0, Math.PI * 2);
        c.fill();
        c.restore();
      }

      // ── 5. Hulking Obsidian Carapace & Incandescent Magma Furnace Core ──
      const torsoGrad = c.createLinearGradient(cx - 31, bodyY - 22, cx + 31, bodyY + 30);
      torsoGrad.addColorStop(0, '#44403c');
      torsoGrad.addColorStop(0.45, '#292524');
      torsoGrad.addColorStop(0.85, '#1c1917');
      torsoGrad.addColorStop(1, '#0c0a09');
      c.fillStyle = torsoGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.85;
      c.beginPath();
      c.moveTo(cx - 28, bodyY - 12);
      c.quadraticCurveTo(cx + 2, bodyY - 25, cx + 28, bodyY - 10);
      c.lineTo(cx + 24, bodyY + 25);
      c.quadraticCurveTo(cx, bodyY + 30, cx - 23, bodyY + 25);
      c.closePath();
      c.fill();
      c.stroke();

      // Blazing Molten Furnace Core in Center of Chest
      c.save();
      const coreR = 11.5 + corePulse * 1.4 + meltdown * 2;
      const coreGrad = c.createRadialGradient(cx - 4, bodyY + 2, 1.5, cx - 4, bodyY + 2, coreR);
      coreGrad.addColorStop(0, '#fef9c3');
      coreGrad.addColorStop(0.4, '#fb923c');
      coreGrad.addColorStop(0.8, '#dc2626');
      coreGrad.addColorStop(1, 'rgba(127, 29, 29, 0)');
      c.fillStyle = coreGrad;
      c.shadowColor = '#f97316';
      c.shadowBlur = 12 + meltdown * 8;
      c.beginPath();
      c.arc(cx - 4, bodyY + 2, coreR, 0, Math.PI * 2);
      c.fill();

      // Radiating Magma Veins across Obsidian Plates
      c.strokeStyle = `rgba(251, 146, 60, ${0.55 + meltdown * 0.4})`;
      c.lineWidth = 1.8;
      c.beginPath();
      c.moveTo(cx - 4, bodyY + 2);
      c.lineTo(cx - 19, bodyY - 7);
      c.moveTo(cx - 4, bodyY + 2);
      c.lineTo(cx + 15, bodyY - 6);
      c.moveTo(cx - 4, bodyY + 2);
      c.lineTo(cx - 16, bodyY + 15);
      c.moveTo(cx - 4, bodyY + 2);
      c.lineTo(cx + 14, bodyY + 14);
      c.stroke();
      c.restore();

      // Dark-Iron Furnace Rib Bars Caging the Core
      c.strokeStyle = '#0c0a09';
      c.lineWidth = 2.4;
      c.beginPath();
      c.moveTo(cx - 14, bodyY - 2);
      c.lineTo(cx + 6, bodyY - 2);
      c.moveTo(cx - 15, bodyY + 4);
      c.lineTo(cx + 7, bodyY + 4);
      c.moveTo(cx - 13, bodyY + 10);
      c.lineTo(cx + 5, bodyY + 10);
      c.stroke();

      // Riveted Iron Siege-Chain Girdle & Obsidian Loin-Plate
      c.fillStyle = '#1c1917';
      c.strokeStyle = '#57534e';
      c.lineWidth = 1.3;
      c.beginPath();
      c.roundRect(cx - 24, bodyY + 18, 48, 7.5, 2);
      c.fill();
      c.stroke();

      c.fillStyle = '#fb923c';
      c.strokeStyle = '#090d16';
      c.beginPath();
      c.arc(cx - 4, bodyY + 21.8, 5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // ── 6. Horned Obsidian Siege Head & Furnace-Grate Maw ──
      const headX = cx - 6;
      const headY = cy - 31 - stompBob * 0.85;
      const jawDrop = pose.jawOpen * 4.5;

      // Swept-Back Volcanic Basalt Horns with Glowing Tips
      const hornGrad = c.createLinearGradient(headX, headY - 8, headX, headY - 26);
      hornGrad.addColorStop(0, '#292524');
      hornGrad.addColorStop(0.7, '#ea580c');
      hornGrad.addColorStop(1, '#fef08a');
      c.fillStyle = hornGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.35;

      c.beginPath();
      c.moveTo(headX - 12, headY - 7);
      c.quadraticCurveTo(headX - 24, headY - 14, headX - 19, headY - 25);
      c.quadraticCurveTo(headX - 13, headY - 15, headX - 7, headY - 10);
      c.closePath();
      c.fill();
      c.stroke();

      c.beginPath();
      c.moveTo(headX + 10, headY - 7);
      c.quadraticCurveTo(headX + 23, headY - 14, headX + 19, headY - 25);
      c.quadraticCurveTo(headX + 13, headY - 15, headX + 6, headY - 10);
      c.closePath();
      c.fill();
      c.stroke();

      // Faceted Obsidian Head Block
      c.fillStyle = '#1c1917';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.65;
      c.beginPath();
      c.moveTo(headX - 15, headY - 11);
      c.lineTo(headX, headY - 16);
      c.lineTo(headX + 15, headY - 10);
      c.lineTo(headX + 14, headY + 9 + jawDrop * 0.6);
      c.lineTo(headX - 14, headY + 9 + jawDrop * 0.6);
      c.closePath();
      c.fill();
      c.stroke();

      // Blazing Furnace-Grate Maw
      c.fillStyle = '#f97316';
      c.fillRect(headX - 11, headY + 2, 19, 5 + jawDrop * 0.55);
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      for (let gx = -8; gx <= 5; gx += 4.3) {
        c.beginPath();
        c.moveTo(headX + gx, headY + 1.5);
        c.lineTo(headX + gx, headY + 7.5 + jawDrop * 0.55);
        c.stroke();
      }

      // Piercing White-Hot Visor Slit Eyes
      c.save();
      c.shadowColor = '#fb923c';
      c.shadowBlur = 11;
      c.fillStyle = '#fef08a';
      c.beginPath();
      c.moveTo(headX - 12, headY - 4);
      c.lineTo(headX - 4, headY - 2.5);
      c.lineTo(headX - 11, headY - 1);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(headX + 9, headY - 4);
      c.lineTo(headX + 1, headY - 2.5);
      c.lineTo(headX + 8, headY - 1);
      c.closePath();
      c.fill();
      c.restore();

      // ── 7. Front Volcanic Pauldron, Arm & Molten Anvil Siege-Hammer ──
      c.save();
      c.translate(cx + 13, cy - 11 - stompBob);
      const armRot = this.isEating
        ? 0.42 + pose.armSwing * 1.05
        : 0.34 + walkSin * 0.2 + pose.armSwing * 0.9;
      c.rotate(armRot);

      // Jagged Obsidian & Lava Shoulder Pauldron
      c.fillStyle = '#292524';
      c.strokeStyle = '#f97316';
      c.lineWidth = 1.35;
      c.beginPath();
      c.arc(0, -2, 11, Math.PI * 0.85, Math.PI * 2.15);
      c.closePath();
      c.fill();
      c.stroke();

      // Massive Basalt Forearm
      c.strokeStyle = '#090d16';
      c.lineWidth = 14.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-11, 18);
      c.stroke();
      c.strokeStyle = '#292524';
      c.lineWidth = 11;
      c.beginPath();
      c.moveTo(0, 2);
      c.lineTo(-11, 18);
      c.stroke();

      c.translate(-11, 18);
      c.rotate(-0.62);
      this.drawMoltenSiegeHammer(c, corePulse);
      c.restore();

      // ── 8. Molten Magma Smash Arc on Strike ──
      if (pose.slashAlpha > 0.05) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.88;
        c.strokeStyle = '#fb923c';
        c.lineWidth = 4.8;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 11, cy - 4, 37, Math.PI * 0.72, Math.PI * 1.34);
        c.stroke();
        c.restore();
      }
    });
  }
}
