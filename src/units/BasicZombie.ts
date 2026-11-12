import { Attacker } from '../entities/Attacker';

export class BasicZombie extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y, 50, 90, 100, 18, 18, row);
    this.enemyKind = 'basic';
    this.attackStyle = 'blade';
    this.mass = 1.0;
  }

  override getHeadClearance(): number {
    return 18;
  }

  private drawArticulatedLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 8;
    const footY = hipY + 21 - lift * 4.5;
    const kneeX = (hipX + footX) * 0.5 - 2.2;
    const kneeY = (hipY + footY) * 0.5 - lift * 1.5;

    c.save();
    // Thigh & Fur-bound Shin
    c.strokeStyle = '#090d16';
    c.lineWidth = 8.5;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#1e293b' : '#334155';
    c.lineWidth = 5.8;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(kneeX, kneeY);
    c.lineTo(footX, footY);
    c.stroke();

    // Leather shin criss-cross wraps
    c.strokeStyle = isBack ? '#3f2e21' : '#5c4028';
    c.lineWidth = 1.3;
    c.beginPath();
    c.moveTo(kneeX - 2, kneeY + 3);
    c.lineTo(footX + 2, footY - 4);
    c.moveTo(kneeX + 2, kneeY + 5);
    c.lineTo(footX - 2, footY - 2);
    c.stroke();

    // Viking Boot (pointing left)
    c.fillStyle = isBack ? '#1c140d' : '#291d12';
    c.strokeStyle = '#090d16';
    c.lineWidth = 1.2;
    c.beginPath();
    c.moveTo(footX + 3.5, footY - 2);
    c.lineTo(footX - 6.5, footY + 0.5);
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
      const stride = this.isEating || this.isStunned ? 0 : animT / 150;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bob = this.isEating ? Math.sin(animT / 110) * 1.2 : Math.abs(walkCos) * 2.4;
      const hpRatio = Math.max(0, this.health / this.maxHealth);
      const pose = this.getMeleePose();

      // ── 1. Ground Shadow & Helheim Frost Mist ──
      c.fillStyle = 'rgba(2, 6, 23, 0.46)';
      c.beginPath();
      c.ellipse(cx, cy + 42, 21, 5.8, 0, 0, Math.PI * 2);
      c.fill();

      const mistPulse = 0.16 + Math.sin(animT / 240) * 0.05;
      c.fillStyle = `rgba(56, 189, 248, ${mistPulse})`;
      c.beginPath();
      c.ellipse(cx + 2, cy + 40, 16, 3.8, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Tattered Raven Cloak (Trailing Right) ──
      const cloakWave = Math.sin(animT / 170) * 3.2;
      const cloakGrad = c.createLinearGradient(cx - 4, cy - 12, cx + 22, cy + 28);
      cloakGrad.addColorStop(0, '#1e293b');
      cloakGrad.addColorStop(0.6, '#0f172a');
      cloakGrad.addColorStop(1, '#020617');
      c.fillStyle = cloakGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(cx + 4, cy - 11 - bob);
      c.quadraticCurveTo(cx + 19, cy + 4 + cloakWave * 0.4, cx + 23 + cloakWave, cy + 24);
      c.lineTo(cx + 16 + cloakWave * 0.7, cy + 20);
      c.lineTo(cx + 14 + cloakWave * 0.5, cy + 28);
      c.lineTo(cx + 7 + cloakWave * 0.3, cy + 22);
      c.lineTo(cx + 2, cy + 26);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 3. Back Arm & Splintered Norse Round-Shield ──
      const shieldX = cx - 15;
      const shieldY = cy + 4 - bob * 0.6 + walkSin * 1.5;
      c.save();
      c.translate(shieldX, shieldY);
      c.rotate(-0.15 + pose.bodyLean * 0.5);

      const shieldGrad = c.createRadialGradient(-2, -2, 2, 0, 0, 12);
      shieldGrad.addColorStop(0, '#1e3a5f');
      shieldGrad.addColorStop(0.7, '#0f2942');
      shieldGrad.addColorStop(1, '#1e293b');
      c.fillStyle = shieldGrad;
      c.strokeStyle = '#64748b';
      c.lineWidth = 1.8;
      c.beginPath();
      c.ellipse(0, 0, 7.5, 12.5, 0.12, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Shield planks & dented bronze boss
      c.strokeStyle = 'rgba(2, 6, 23, 0.7)';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-6, -4); c.lineTo(6, -4);
      c.moveTo(-6, 4);  c.lineTo(6, 4);
      c.stroke();

      c.fillStyle = '#b45309';
      c.strokeStyle = '#451a03';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(-1.5, 0, 2.8, 4.2, 0, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      if (hpRatio < 0.6) {
        // Battle notch & crack in shield
        c.strokeStyle = '#020617';
        c.lineWidth = 1.5;
        c.beginPath();
        c.moveTo(-6, -7);
        c.lineTo(-1, -2);
        c.lineTo(-4, 5);
        c.stroke();
      }
      c.restore();

      // ── 4. Articulated Striding Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawArticulatedLeg(c, cx - 4, cy + 17 - bob * 0.4, -walkSin * 0.65, backLift, true);
      this.drawArticulatedLeg(c, cx + 4, cy + 18 - bob * 0.4, walkSin * 0.65, frontLift, false);

      // ── 5. Tattered Chainmail & Rusted Rib-Armor Torso ──
      const torsoY = cy - 9 - bob;
      const bodyGrad = c.createLinearGradient(cx - 14, torsoY, cx + 14, torsoY + 30);
      bodyGrad.addColorStop(0, '#334155');
      bodyGrad.addColorStop(0.55, '#1e293b');
      bodyGrad.addColorStop(1, '#0f172a');
      c.fillStyle = bodyGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.moveTo(cx - 11, torsoY + 2);
      c.quadraticCurveTo(cx, torsoY - 3, cx + 12, torsoY + 2);
      c.lineTo(cx + 10, torsoY + 27);
      c.lineTo(cx - 10, torsoY + 27);
      c.closePath();
      c.fill();
      c.stroke();

      // Ragged Mail Tunic Skirt
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.1;
      c.beginPath();
      c.moveTo(cx - 11, torsoY + 25);
      c.lineTo(cx - 8, torsoY + 32);
      c.lineTo(cx - 3, torsoY + 27);
      c.lineTo(cx + 2, torsoY + 33);
      c.lineTo(cx + 7, torsoY + 27);
      c.lineTo(cx + 11, torsoY + 31);
      c.lineTo(cx + 10, torsoY + 25);
      c.closePath();
      c.fill();
      c.stroke();

      // Corroded Iron Breastplate & Rib-Bands
      const plateGrad = c.createLinearGradient(cx - 11, torsoY + 3, cx + 9, torsoY + 19);
      plateGrad.addColorStop(0, '#64748b');
      plateGrad.addColorStop(0.5, '#475569');
      plateGrad.addColorStop(1, '#1e293b');
      c.fillStyle = plateGrad;
      c.strokeStyle = '#0f172a';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(cx - 10.5, torsoY + 3, 19, 15, 3);
      c.fill();
      c.stroke();

      // Diagonal leather baldric & bronze belt buckle
      c.strokeStyle = '#451a03';
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(cx + 8, torsoY + 2);
      c.lineTo(cx - 9, torsoY + 22);
      c.stroke();

      c.fillStyle = '#291d12';
      c.fillRect(cx - 10.5, torsoY + 21, 21, 4);
      c.fillStyle = '#d97706';
      c.strokeStyle = '#451a03';
      c.lineWidth = 0.9;
      c.strokeRect(cx - 5, torsoY + 20.5, 5.5, 5);
      c.fillRect(cx - 5, torsoY + 20.5, 5.5, 5);

      // ── 6. 3/4 Left-Facing Gaunt Draugr Skull & Horned Nasal-Helm ──
      const headX = cx - 2;
      const headY = cy - 23 - bob * 0.9;

      // Ragged frost-white Draugr beard wisps
      c.fillStyle = '#cbd5e1';
      c.strokeStyle = '#334155';
      c.lineWidth = 0.9;
      c.beginPath();
      c.moveTo(headX - 9, headY + 9);
      c.lineTo(headX - 13, headY + 19);
      c.lineTo(headX - 6, headY + 14);
      c.lineTo(headX - 5, headY + 21);
      c.lineTo(headX + 1, headY + 12);
      c.closePath();
      c.fill();
      c.stroke();

      // Articulated Lower Undead Jaw (drops open on melee roar!)
      const jawDrop = pose.jawOpen * 3.8 + (this.isEating ? 0 : Math.max(0, walkSin) * 0.6);
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.roundRect(headX - 10.5, headY + 4 + jawDrop * 0.7, 14, 8.5, 2.5);
      c.fill();
      c.stroke();

      // Dark mouth cavity & jagged bone teeth
      c.fillStyle = '#020617';
      c.fillRect(headX - 9.5, headY + 4, 11, 3.5 + jawDrop * 0.7);
      c.fillStyle = '#e2e8f0';
      for (let t = 0; t < 3; t++) {
        c.fillRect(headX - 8.5 + t * 3.5, headY + 3.5, 2, 2.6);
        c.fillRect(headX - 8 + t * 3.5, headY + 6 + jawDrop * 0.65, 1.8, 2.4);
      }

      // Sculpted Cranium & Gaunt Cheekbone
      const skullGrad = c.createRadialGradient(headX - 4, headY - 4, 2, headX, headY, 15);
      skullGrad.addColorStop(0, '#cbd5e1');
      skullGrad.addColorStop(0.55, '#64748b');
      skullGrad.addColorStop(1, '#334155');
      c.fillStyle = skullGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX, headY - 1, 13.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Deep dark eye sockets (3/4 left perspective: left eye further left, right eye closer to center)
      c.fillStyle = '#090d16';
      c.beginPath();
      c.ellipse(headX - 8.5, headY - 1.5, 3.2, 2.8, -0.1, 0, Math.PI * 2);
      c.ellipse(headX - 0.5, headY - 1.5, 3.6, 3.0, 0.08, 0, Math.PI * 2);
      c.fill();

      // Blazing Cyan Helheim Soul-Fire Eyes + Trailing Wisp
      c.save();
      c.shadowColor = '#00e5ff';
      c.shadowBlur = 10;
      c.fillStyle = '#38bdf8';
      c.beginPath();
      c.arc(headX - 8.8, headY - 1.5, 2.2, 0, Math.PI * 2);
      c.arc(headX - 0.8, headY - 1.5, 2.5, 0, Math.PI * 2);
      c.fill();

      c.fillStyle = '#f0f9ff';
      c.beginPath();
      c.arc(headX - 9.0, headY - 1.7, 1.0, 0, Math.PI * 2);
      c.arc(headX - 1.0, headY - 1.7, 1.1, 0, Math.PI * 2);
      c.fill();

      // Faint spectral eye-trail drifting right
      c.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      c.lineWidth = 1.6;
      c.beginPath();
      c.moveTo(headX + 1, headY - 2);
      c.quadraticCurveTo(headX + 8, headY - 5 + Math.sin(animT / 120) * 2, headX + 14, headY - 3);
      c.stroke();
      c.restore();

      // Back Horn (behind iron skullcap)
      c.fillStyle = '#94a3b8';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(headX - 9, headY - 8);
      c.quadraticCurveTo(headX - 20, headY - 15, headX - 16, headY - 23);
      c.quadraticCurveTo(headX - 13, headY - 15, headX - 5, headY - 11);
      c.closePath();
      c.fill();
      c.stroke();

      // Weathered Iron Nasal-Helm Dome
      const helmGrad = c.createLinearGradient(headX - 14, headY - 16, headX + 14, headY - 2);
      helmGrad.addColorStop(0, '#64748b');
      helmGrad.addColorStop(0.5, '#334155');
      helmGrad.addColorStop(1, '#0f172a');
      c.fillStyle = helmGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX + 0.5, headY - 4, 14.2, Math.PI * 0.96, Math.PI * 0.04, false);
      c.closePath();
      c.fill();
      c.stroke();

      // Tarnished Bronze Brow Band & Nasal Guard
      c.fillStyle = '#ca8a04';
      c.strokeStyle = '#451a03';
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(headX - 13.5, headY - 6.5, 28, 3.6, 1);
      c.fill();
      c.stroke();
      // Nasal guard between eyes
      c.beginPath();
      c.roundRect(headX - 6.2, headY - 6, 3.2, 8.5, 1);
      c.fill();
      c.stroke();

      // Foreground Curved Horn (battle-notched bone/iron)
      const hornGrad = c.createLinearGradient(headX + 6, headY - 8, headX + 21, headY - 24);
      hornGrad.addColorStop(0, '#94a3b8');
      hornGrad.addColorStop(0.6, '#e2e8f0');
      hornGrad.addColorStop(1, '#cbd5e1');
      c.fillStyle = hornGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(headX + 7, headY - 7);
      c.quadraticCurveTo(headX + 22, headY - 13, headX + 18, headY - 24);
      c.quadraticCurveTo(headX + 14, headY - 15, headX + 4, headY - 10);
      c.closePath();
      c.fill();
      c.stroke();

      // ── 7. Foreground Sword Arm & Notched Runic Broadsword ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.28;
      const armRot = pose.armSwing + walkSwing;
      const shoulderX = cx + 6;
      const shoulderY = torsoY + 5;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      // Fur-trimmed Iron Pauldron
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.ellipse(0, 0, 6.5, 5.2, 0.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Sinewy Forearm reaching forward-left
      c.strokeStyle = '#090d16';
      c.lineWidth = 7;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();

      c.strokeStyle = '#64748b';
      c.lineWidth = 4.4;
      c.beginPath();
      c.moveTo(0, 1);
      c.lineTo(-10, 11);
      c.stroke();

      // Sword Hilt & Crossguard at hand (-10, 11)
      c.save();
      c.translate(-10, 11);
      c.rotate(-0.45);

      // Notched Broadsword Blade pointing forward-up-left
      const bladeGrad = c.createLinearGradient(-2, 0, -26, -22);
      bladeGrad.addColorStop(0, '#64748b');
      bladeGrad.addColorStop(0.5, '#cbd5e1');
      bladeGrad.addColorStop(1, '#f8fafc');
      c.fillStyle = bladeGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(-2, -2);
      c.lineTo(-14, -14);
      c.lineTo(-15, -11); // Battle chip notch!
      c.lineTo(-26, -22); // Sharp tip
      c.lineTo(-24, -15);
      c.lineTo(-5, 2);
      c.closePath();
      c.fill();
      c.stroke();

      // Blood-fuller groove along blade
      c.strokeStyle = '#334155';
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(-5, -1);
      c.lineTo(-20, -16);
      c.stroke();

      // Tarnished Bronze Crossguard & Pommel
      c.fillStyle = '#d97706';
      c.strokeStyle = '#451a03';
      c.lineWidth = 1;
      c.beginPath();
      c.roundRect(-6, -5, 4, 10, 1.2);
      c.fill();
      c.stroke();

      c.fillStyle = '#451a03';
      c.fillRect(-2, -1.5, 5, 3);
      c.fillStyle = '#b45309';
      c.beginPath();
      c.arc(4, 0, 2.2, 0, Math.PI * 2);
      c.fill();

      c.restore();
      c.restore();

      // ── 8. Melee Cleave Slash Arc (On Strike) ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.85;
        c.strokeStyle = '#7dd3fc';
        c.shadowColor = '#00e5ff';
        c.shadowBlur = 10;
        c.lineWidth = 3.2;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 6, cy - 2, 24, Math.PI * 0.72, Math.PI * 1.32);
        c.stroke();

        c.strokeStyle = '#ffffff';
        c.lineWidth = 1.4;
        c.beginPath();
        c.arc(cx - 6, cy - 2, 25.5, Math.PI * 0.78, Math.PI * 1.26);
        c.stroke();
        c.restore();
      }
    });
  }
}
