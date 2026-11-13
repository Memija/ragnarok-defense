import { Attacker } from '../entities/Attacker';

export class FlameDrake extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y - 4, 68, 86, 265, 22, 22, row);
    this.enemyKind = 'flame_drake';
    this.attackStyle = 'fire_breath';
    this.attackRate = 1150;
    this.attackReach = 58;
    this.isFlying = true;
    this.frostResistance = 0.65;
    this.mass = 1.45;
  }

  override getHeadClearance(): number {
    return 18;
  }

  private drawDrakeWing(
    c: CanvasRenderingContext2D,
    shoulderX: number,
    shoulderY: number,
    flap: number,
    isBack: boolean
  ) {
    // flap in [-1..1]: +1 = swept high up-right, -1 = powerful downstroke
    const elbowX = shoulderX + (isBack ? 4 : 9);
    const elbowY = shoulderY - 16 - flap * 14;
    const tipX = shoulderX + (isBack ? 24 : 31);
    const tipY = shoulderY - 12 - flap * 23;
    const midRibX = shoulderX + (isBack ? 19 : 24);
    const midRibY = shoulderY + 3 - flap * 10;
    const innerRibX = shoulderX + (isBack ? 9 : 12);
    const innerRibY = shoulderY + 10 - flap * 4;

    c.save();

    // Glowing Muspelheim wing membrane
    const memGrad = c.createLinearGradient(shoulderX, elbowY, tipX, innerRibY);
    if (isBack) {
      memGrad.addColorStop(0, '#450a0a');
      memGrad.addColorStop(0.65, '#7c2d12');
      memGrad.addColorStop(1, '#431407');
    } else {
      memGrad.addColorStop(0, '#7f1d1d');
      memGrad.addColorStop(0.5, '#ea580c');
      memGrad.addColorStop(1, '#9a3412');
    }

    c.fillStyle = memGrad;
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.4;
    c.beginPath();
    c.moveTo(shoulderX, shoulderY);
    c.lineTo(elbowX, elbowY);
    c.lineTo(tipX, tipY);
    c.quadraticCurveTo((tipX + midRibX) * 0.5 - 3, (tipY + midRibY) * 0.5 + 3, midRibX, midRibY);
    c.quadraticCurveTo((midRibX + innerRibX) * 0.5 - 2, (midRibY + innerRibY) * 0.5 + 3, innerRibX, innerRibY);
    c.quadraticCurveTo(shoulderX + 3, shoulderY + 7, shoulderX, shoulderY + 4);
    c.closePath();
    c.fill();
    c.stroke();

    // Volcanic basalt wing-spar bone & finger ribs
    c.strokeStyle = isBack ? '#1c1917' : '#292524';
    c.lineWidth = isBack ? 3.2 : 4.0;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(shoulderX, shoulderY);
    c.lineTo(elbowX, elbowY);
    c.lineTo(tipX, tipY);
    c.stroke();

    c.lineWidth = 1.8;
    c.strokeStyle = isBack ? '#451a03' : '#fb923c';
    c.beginPath();
    c.moveTo(elbowX, elbowY);
    c.lineTo(midRibX, midRibY);
    c.moveTo(elbowX, elbowY);
    c.lineTo(innerRibX, innerRibY);
    c.stroke();

    // Wing-thumb obsidian claw at elbow
    c.fillStyle = '#fef08a';
    c.strokeStyle = '#090d16';
    c.lineWidth = 0.9;
    c.beginPath();
    c.moveTo(elbowX - 1, elbowY + 1);
    c.lineTo(elbowX - 6, elbowY - 4);
    c.lineTo(elbowX + 2, elbowY - 1);
    c.closePath();
    c.fill();
    c.stroke();

    c.restore();
  }

  private drawFireBreathJet(
    c: CanvasRenderingContext2D,
    mouthX: number,
    mouthY: number,
    animT: number,
    intensity: number
  ) {
    const reach = 34 + intensity * 38;
    const flutter = Math.sin(animT / 28) * 3.5;
    const spread = 8 + intensity * 8.5;

    c.save();
    c.globalAlpha = Math.min(1, 0.35 + intensity * 0.65);

    // Outer crimson-ember dragonfire plume
    const outerGrad = c.createLinearGradient(mouthX, mouthY, mouthX - reach, mouthY + 6);
    outerGrad.addColorStop(0, 'rgba(251, 146, 60, 0.95)');
    outerGrad.addColorStop(0.55, 'rgba(239, 68, 68, 0.85)');
    outerGrad.addColorStop(1, 'rgba(153, 27, 27, 0)');
    c.fillStyle = outerGrad;
    c.beginPath();
    c.moveTo(mouthX, mouthY - 2.5);
    c.quadraticCurveTo(
      mouthX - reach * 0.55,
      mouthY - spread + flutter,
      mouthX - reach,
      mouthY + 4 + flutter * 0.8
    );
    c.quadraticCurveTo(
      mouthX - reach * 0.5,
      mouthY + spread + 5 - flutter * 0.6,
      mouthX,
      mouthY + 3.5
    );
    c.closePath();
    c.fill();

    // Inner incandescent white-gold core lance
    const coreReach = reach * 0.72;
    const coreGrad = c.createLinearGradient(mouthX, mouthY, mouthX - coreReach, mouthY + 3);
    coreGrad.addColorStop(0, '#ffffff');
    coreGrad.addColorStop(0.5, '#fef08a');
    coreGrad.addColorStop(1, 'rgba(251, 146, 60, 0)');
    c.fillStyle = coreGrad;
    c.beginPath();
    c.moveTo(mouthX, mouthY - 1.4);
    c.quadraticCurveTo(
      mouthX - coreReach * 0.5,
      mouthY - spread * 0.42 - flutter * 0.5,
      mouthX - coreReach,
      mouthY + 2 + flutter * 0.4
    );
    c.quadraticCurveTo(
      mouthX - coreReach * 0.45,
      mouthY + spread * 0.45 + 2,
      mouthX,
      mouthY + 1.8
    );
    c.closePath();
    c.fill();

    // Dancing flame tongues / sparks along the jet
    c.fillStyle = '#fde047';
    for (let i = 0; i < 4; i++) {
      const t = ((animT / 140 + i * 0.25) % 1);
      const sx = mouthX - 8 - t * (reach - 6);
      const sy = mouthY + Math.sin(animT / 35 + i * 2.1) * (3 + t * 5) + t * 3;
      c.beginPath();
      c.arc(sx, sy, (1 - t * 0.5) * 2.4, 0, Math.PI * 2);
      c.fill();
    }

    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const wingPhase = this.isStunned ? 0 : animT / 135;
      const flap = Math.sin(wingPhase);
      const hoverBob = this.isStunned ? 0 : flap * 5.2;
      const pose = this.getMeleePose();

      // Ground plane matches ground attackers (spawnY + 87)
      const floorY = this.y + this.height + 5;
      const shadowScale = 1 - flap * 0.08;

      // ── 1. Ground Shadow & Molten Updraft Shimmer on Floor ──
      c.fillStyle = 'rgba(2, 6, 23, 0.36)';
      c.beginPath();
      c.ellipse(cx + 2, floorY, 24 * shadowScale, 5.2 * shadowScale, 0, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = 'rgba(249, 115, 22, 0.16)';
      c.beginPath();
      c.ellipse(cx, floorY, 16 * shadowScale, 3.2 * shadowScale, 0, 0, Math.PI * 2);
      c.fill();

      const bodyX = cx + 2;
      const bodyY = cy - 6 - hoverBob;

      // ── 2. Far Wing (Behind Torso) ──
      this.drawDrakeWing(c, bodyX + 1, bodyY - 5, flap * 0.92, true);

      // ── 3. Sinuous Whipping Dragon Tail (Streaming Right) ──
      const tailWave = Math.cos(wingPhase - 0.8) * 5.5;
      c.save();
      c.strokeStyle = '#090d16';
      c.lineWidth = 8.4;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bodyX + 14, bodyY + 4);
      c.bezierCurveTo(
        bodyX + 25,
        bodyY + 9 + tailWave * 0.4,
        bodyX + 28,
        bodyY - 2 + tailWave,
        bodyX + 35,
        bodyY + 2 + tailWave * 1.15
      );
      c.stroke();

      c.strokeStyle = '#292524';
      c.lineWidth = 5.4;
      c.beginPath();
      c.moveTo(bodyX + 14, bodyY + 4);
      c.bezierCurveTo(
        bodyX + 25,
        bodyY + 9 + tailWave * 0.4,
        bodyX + 28,
        bodyY - 2 + tailWave,
        bodyX + 35,
        bodyY + 2 + tailWave * 1.15
      );
      c.stroke();

      // Blazing magma spade tip on tail
      const tipX = bodyX + 35;
      const tipY = bodyY + 2 + tailWave * 1.15;
      c.fillStyle = '#fb923c';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(tipX - 2, tipY);
      c.lineTo(tipX + 4, tipY - 4.5);
      c.lineTo(tipX + 8.5, tipY);
      c.lineTo(tipX + 4, tipY + 4.5);
      c.closePath();
      c.fill();
      c.stroke();
      c.restore();

      // ── 4. Tucked Obsidian Hind Talons ──
      for (const legOff of [
        { dx: 5, dy: 11, dark: true },
        { dx: 10, dy: 12, dark: false }
      ]) {
        const lx = bodyX + legOff.dx;
        const ly = bodyY + legOff.dy;
        c.strokeStyle = '#090d16';
        c.lineWidth = 6.2;
        c.lineCap = 'round';
        c.beginPath();
        c.moveTo(lx, ly);
        c.lineTo(lx + 3, ly + 8);
        c.lineTo(lx - 3, ly + 13);
        c.stroke();

        c.strokeStyle = legOff.dark ? '#1c1917' : '#44403c';
        c.lineWidth = 3.8;
        c.beginPath();
        c.moveTo(lx, ly);
        c.lineTo(lx + 3, ly + 8);
        c.lineTo(lx - 3, ly + 13);
        c.stroke();
      }

      // ── 5. Volcanic Scaled Wyrm Torso & Molten Belly Plates ──
      const torsoGrad = c.createLinearGradient(bodyX - 18, bodyY - 12, bodyX + 18, bodyY + 14);
      torsoGrad.addColorStop(0, '#44403c');
      torsoGrad.addColorStop(0.45, '#1c1917');
      torsoGrad.addColorStop(1, '#7c2d12');
      c.fillStyle = torsoGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.6;
      c.beginPath();
      c.ellipse(bodyX, bodyY + 2, 18, 11.5, -0.18, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Glowing magma chest/belly scutes
      c.save();
      c.fillStyle = '#fb923c';
      c.shadowColor = '#ea580c';
      c.shadowBlur = 6;
      for (let s = 0; s < 4; s++) {
        c.beginPath();
        c.ellipse(bodyX - 11 + s * 6, bodyY + 7.5 - s * 0.7, 3.2, 1.9, -0.2, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      // Dorsal obsidian spines along back
      c.fillStyle = '#f97316';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1;
      for (let sp = 0; sp < 4; sp++) {
        const sx = bodyX - 8 + sp * 6.5;
        const sy = bodyY - 8 + sp * 1.1;
        c.beginPath();
        c.moveTo(sx - 2.5, sy + 2);
        c.lineTo(sx + 1, sy - 4.5);
        c.lineTo(sx + 3, sy + 2.5);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 6. Arched Serpentine Neck & Horned Dragon Skull (Left) ──
      const neckLunge = this.isEating || this.strikeFlashTimer > 0 ? -pose.armSwing * 5.5 : 0;
      const headX = bodyX - 20 - neckLunge;
      const headY = bodyY - 8 + Math.max(0, -pose.armSwing) * 3;

      // Muscular neck curve
      c.strokeStyle = '#090d16';
      c.lineWidth = 12.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(bodyX - 11, bodyY - 1);
      c.quadraticCurveTo(bodyX - 17, bodyY - 10, headX + 3, headY + 1);
      c.stroke();

      c.strokeStyle = '#292524';
      c.lineWidth = 9;
      c.beginPath();
      c.moveTo(bodyX - 11, bodyY - 1);
      c.quadraticCurveTo(bodyX - 17, bodyY - 10, headX + 3, headY + 1);
      c.stroke();

      // Glowing throat ember-sac when inhaling or breathing fire
      const throatGlow = this.isEating ? 0.45 + pose.jawOpen * 0.55 : 0.25;
      c.fillStyle = `rgba(251, 146, 60, ${throatGlow.toFixed(2)})`;
      c.beginPath();
      c.ellipse(bodyX - 16, bodyY - 3, 4.5, 2.5, -0.5, 0, Math.PI * 2);
      c.fill();

      const jawOpen = this.isEating || this.strikeFlashTimer > 0
        ? Math.max(pose.jawOpen, pose.slashAlpha * 0.9)
        : 0.1 + Math.max(0, flap) * 0.08;

      // Fire breath cone rendered just behind/out of the open jaws
      const breathIntensity = this.strikeFlashTimer > 0
        ? Math.max(0.55, this.strikeFlashTimer / 220)
        : (this.isEating && pose.armSwing < -0.1 ? Math.min(1, -pose.armSwing) : 0);
      if (breathIntensity > 0.05) {
        this.drawFireBreathJet(c, headX - 11, headY + 3.5, animT, breathIntensity);
      }

      c.save();
      c.translate(headX, headY);

      // Swept-back twin Muspelheim horns (pointing right-up)
      c.fillStyle = '#1c1917';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(1, -5);
      c.quadraticCurveTo(10, -13, 18, -12);
      c.quadraticCurveTo(11, -7, 3, -2);
      c.closePath();
      c.fill();
      c.stroke();

      c.fillStyle = '#fb923c';
      c.beginPath();
      c.moveTo(10, -10.5);
      c.lineTo(18, -12);
      c.lineTo(12, -8);
      c.closePath();
      c.fill();

      // Articulated lower dragon jaw
      c.save();
      c.translate(-1, 3);
      c.rotate(-jawOpen * 0.55);
      c.fillStyle = '#292524';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(3, -1);
      c.lineTo(-12.5, 1.5);
      c.lineTo(-10, 5);
      c.lineTo(3, 3.5);
      c.closePath();
      c.fill();
      c.stroke();

      // Molten tongue/gullet glow inside open mouth
      if (jawOpen > 0.22) {
        c.fillStyle = '#fef08a';
        c.beginPath();
        c.ellipse(-5, 0.5, 4.5, 1.8, 0, 0, Math.PI * 2);
        c.fill();
      }
      c.restore();

      // Upper horned dragon snout & brow ridge
      c.fillStyle = '#292524';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(6, 2);
      c.lineTo(5, -5.5);
      c.lineTo(-5, -6);
      c.lineTo(-14.5, -1.5);
      c.lineTo(-13.5, 2.2);
      c.lineTo(2, 2.5);
      c.closePath();
      c.fill();
      c.stroke();

      // Upper fangs & nasal hornlet
      c.fillStyle = '#fef3c7';
      c.beginPath();
      c.moveTo(-12, -2);
      c.lineTo(-14, -5.5);
      c.lineTo(-9.5, -2.5);
      c.closePath();
      c.fill();
      c.beginPath();
      c.moveTo(-11.5, 2);
      c.lineTo(-10.5, 5.2);
      c.lineTo(-9, 2);
      c.closePath();
      c.fill();

      // Blazing Molten-Gold Slit Eye
      c.save();
      c.fillStyle = '#fef08a';
      c.shadowColor = '#f97316';
      c.shadowBlur = 8;
      c.beginPath();
      c.ellipse(-3.5, -2.2, 2.7, 1.8, -0.15, 0, Math.PI * 2);
      c.fill();
      c.restore();

      c.restore(); // end head

      // ── 7. Near Wing (Foreground Sweep) ──
      this.drawDrakeWing(c, bodyX + 4, bodyY - 2, flap, false);
    });

    this.drawHealthBar(ctx);
  }
}

