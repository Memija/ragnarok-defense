import { Attacker } from '../entities/Attacker';

export class SmallTroll extends Attacker {
  constructor(x: number, y: number, row: number) {
    super(x, y + 15, 45, 75, 140, 20, 18, row);
    this.enemyKind = 'small_troll';
    this.attackStyle = 'blunt';
    this.mass = 0.75;
  }

  override getHeadClearance(): number {
    return 14;
  }

  private drawBeastLeg(
    c: CanvasRenderingContext2D,
    hipX: number,
    hipY: number,
    strideAngle: number,
    lift: number,
    isBack: boolean
  ) {
    const footX = hipX + Math.sin(strideAngle) * 9.5;
    const footY = hipY + 18 - lift * 5.5;
    // Digitigrade dog-leg hock bent backward (right)
    const hockX = (hipX + footX) * 0.5 + 3.5;
    const hockY = (hipY + footY) * 0.5 - 1 - lift * 2;

    c.save();
    c.strokeStyle = '#090d16';
    c.lineWidth = 8.2;
    c.lineCap = 'round';
    c.lineJoin = 'round';
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(hockX, hockY);
    c.lineTo(footX, footY);
    c.stroke();

    c.strokeStyle = isBack ? '#1e293b' : '#475569';
    c.lineWidth = 5.4;
    c.beginPath();
    c.moveTo(hipX, hipY);
    c.lineTo(hockX, hockY);
    c.lineTo(footX, footY);
    c.stroke();

    // Pale Stone Claws (pointing left)
    c.fillStyle = '#fef3c7';
    c.strokeStyle = '#090d16';
    c.lineWidth = 0.9;
    for (let cl = 0; cl < 2; cl++) {
      c.beginPath();
      c.moveTo(footX - 2, footY - 1 + cl * 2.2);
      c.lineTo(footX - 7.5, footY + 1 + cl * 2.2);
      c.lineTo(footX - 1.5, footY + 2 + cl * 2.2);
      c.closePath();
      c.fill();
      c.stroke();
    }
    c.restore();
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, (c) => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;
      const animT = this.getAnimTime();
      const stride = this.isEating || this.isStunned ? 0 : animT / 115;
      const walkSin = Math.sin(stride);
      const walkCos = Math.cos(stride);
      const bound = this.isEating ? Math.sin(animT / 95) * 1.5 : Math.abs(walkSin) * 3.8;
      const pose = this.getMeleePose();

      // ── 1. Dynamic Ground Shadow ──
      const shadowScale = 1 - bound * 0.04;
      c.fillStyle = 'rgba(2, 6, 23, 0.44)';
      c.beginPath();
      c.ellipse(cx, this.y + this.height - 3, 21 * shadowScale, 6 * shadowScale, 0, 0, Math.PI * 2);
      c.fill();

      // ── 2. Back Clawed Arm (Low Feral Balance) ──
      c.save();
      c.translate(cx - 8, cy + 2 - bound);
      c.rotate(0.25 - walkSin * 0.35);
      c.strokeStyle = '#090d16';
      c.lineWidth = 6.5;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 12);
      c.stroke();
      c.strokeStyle = '#334155';
      c.lineWidth = 4.2;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-9, 12);
      c.stroke();
      c.restore();

      // ── 3. Scuttling Digitigrade Stone Legs ──
      const backLift = Math.max(0, -walkCos);
      const frontLift = Math.max(0, walkCos);
      this.drawBeastLeg(c, cx - 3, cy + 16 - bound * 0.4, -walkSin * 0.75, backLift, true);
      this.drawBeastLeg(c, cx + 6, cy + 16 - bound * 0.4, walkSin * 0.75, frontLift, false);

      // ── 4. Jagged Dorsal Slate Spines Along Arched Back ──
      const bodyY = cy - 4 - bound;
      const spines = [
        { ox: 8, oy: -10, dx: 7, dy: -8 },
        { ox: 13, oy: -2, dx: 9, dy: -4 },
        { ox: 14, oy: 6, dx: 8, dy: -1 },
      ];
      for (const sp of spines) {
        c.fillStyle = '#94a3b8';
        c.strokeStyle = '#090d16';
        c.lineWidth = 1.2;
        c.beginPath();
        c.moveTo(cx + sp.ox, bodyY + sp.oy - 3.5);
        c.lineTo(cx + sp.ox + sp.dx, bodyY + sp.oy + sp.dy);
        c.lineTo(cx + sp.ox, bodyY + sp.oy + 3.5);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // ── 5. Hunched Crag-Slate Torso & Cave-Moss ──
      const torsoGrad = c.createLinearGradient(cx - 16, bodyY - 12, cx + 16, bodyY + 20);
      torsoGrad.addColorStop(0, '#64748b');
      torsoGrad.addColorStop(0.55, '#334155');
      torsoGrad.addColorStop(1, '#0f172a');
      c.fillStyle = torsoGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.5;
      c.beginPath();
      c.ellipse(cx + 1, bodyY + 4, 16, 15, -0.28, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Bioluminescent Cave-Moss Patches on Hunched Shoulder
      c.fillStyle = '#65a30d';
      c.strokeStyle = '#365314';
      c.lineWidth = 1;
      c.beginPath();
      c.ellipse(cx + 4, bodyY - 5, 7, 3.8, 0.25, 0, Math.PI * 2);
      c.fill();
      c.stroke();
      c.fillStyle = '#a3e635';
      c.beginPath();
      c.arc(cx + 3, bodyY - 6, 1.8, 0, Math.PI * 2);
      c.arc(cx + 7, bodyY - 4.5, 1.3, 0, Math.PI * 2);
      c.fill();

      // Hemp Rope Belt & Bone Fetish Trinket
      c.strokeStyle = '#78350f';
      c.lineWidth = 2.6;
      c.beginPath();
      c.moveTo(cx - 12, bodyY + 13);
      c.quadraticCurveTo(cx + 1, bodyY + 16, cx + 14, bodyY + 12);
      c.stroke();

      c.fillStyle = '#fef3c7';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1;
      c.beginPath();
      c.arc(cx - 3, bodyY + 16, 3.2, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // ── 6. Forward-Jutting Feral Troll Head & Notched Bat-Ears ──
      const headX = cx - 7;
      const headY = cy - 17 - bound * 0.92;
      const jawDrop = pose.jawOpen * 4.2 + (this.isEating ? 0 : Math.max(0, walkSin) * 1.1);

      // Back Pointed Troll Ear
      c.fillStyle = '#334155';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.moveTo(headX - 6, headY - 6);
      c.lineTo(headX - 16, headY - 16);
      c.lineTo(headX - 2, headY - 11);
      c.closePath();
      c.fill();
      c.stroke();

      // Snapping Fanged Underbite Jaw
      c.fillStyle = '#1e293b';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.roundRect(headX - 12, headY + 3 + jawDrop * 0.7, 16, 8, 2.5);
      c.fill();
      c.stroke();

      // Dark Maw & Protruding Lower Fangs
      c.fillStyle = '#020617';
      c.fillRect(headX - 10.5, headY + 3, 12, 3.5 + jawDrop * 0.65);

      c.fillStyle = '#fef3c7';
      c.strokeStyle = '#090d16';
      c.lineWidth = 0.85;
      // Big lower canine tusks jutting up!
      for (const fx of [-10, -5, 0]) {
        c.beginPath();
        c.moveTo(headX + fx, headY + 7 + jawDrop * 0.65);
        c.lineTo(headX + fx + 1.8, headY + 1 + jawDrop * 0.35);
        c.lineTo(headX + fx + 3.6, headY + 7 + jawDrop * 0.65);
        c.closePath();
        c.fill();
        c.stroke();
      }

      // Craggy Feral Cranium & Hooked Goblin/Troll Snout
      const headGrad = c.createRadialGradient(headX - 3, headY - 3, 2, headX, headY, 15);
      headGrad.addColorStop(0, '#64748b');
      headGrad.addColorStop(0.65, '#334155');
      headGrad.addColorStop(1, '#1e293b');
      c.fillStyle = headGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.4;
      c.beginPath();
      c.arc(headX + 1, headY - 1, 12.5, 0, Math.PI * 2);
      c.fill();
      c.stroke();

      // Hooked Crag Nose pointing left
      c.fillStyle = '#475569';
      c.beginPath();
      c.moveTo(headX - 9, headY - 3);
      c.lineTo(headX - 16, headY + 1.5);
      c.lineTo(headX - 8, headY + 3);
      c.closePath();
      c.fill();
      c.stroke();

      // Swept-Back Notched Front Troll Ear + Copper Ring
      c.fillStyle = '#475569';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(headX + 7, headY - 5);
      c.lineTo(headX + 22, headY - 13);
      c.lineTo(headX + 17, headY - 6); // Ear notch
      c.lineTo(headX + 19, headY - 4);
      c.lineTo(headX + 8, headY + 1);
      c.closePath();
      c.fill();
      c.stroke();

      c.strokeStyle = '#f59e0b';
      c.lineWidth = 1.3;
      c.beginPath();
      c.arc(headX + 13, headY - 2, 2.2, 0, Math.PI * 2);
      c.stroke();

      // Glowing Feral Sulfur-Yellow Slit Eyes + Furrowed Brow
      c.save();
      c.shadowColor = '#eab308';
      c.shadowBlur = 9;
      c.fillStyle = '#fde047';
      c.beginPath();
      c.ellipse(headX - 7, headY - 2, 2.6, 3.0, -0.15, 0, Math.PI * 2);
      c.ellipse(headX + 0.5, headY - 2, 3.0, 3.2, -0.1, 0, Math.PI * 2);
      c.fill();

      // Vertical reptile/cat slit pupils
      c.fillStyle = '#9a3412';
      c.fillRect(headX - 7.5, headY - 4, 1.2, 4);
      c.fillRect(headX - 0.1, headY - 4.2, 1.3, 4.4);
      c.restore();

      // Angry rock brow ridge
      c.strokeStyle = '#090d16';
      c.lineWidth = 2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(headX - 10, headY - 4.5);
      c.lineTo(headX - 4, headY - 3.5);
      c.lineTo(headX + 4, headY - 5.5);
      c.stroke();

      // ── 7. Foreground Sinewy Arm & Jagged Obsidian/Flint Cudgel ──
      const walkSwing = this.isEating ? 0 : -walkSin * 0.35;
      const armRot = pose.armSwing + walkSwing;
      const shoulderX = cx + 6;
      const shoulderY = bodyY + 1;

      c.save();
      c.translate(shoulderX, shoulderY);
      c.rotate(armRot);

      c.strokeStyle = '#090d16';
      c.lineWidth = 7.2;
      c.lineCap = 'round';
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 11);
      c.stroke();

      c.strokeStyle = '#475569';
      c.lineWidth = 4.6;
      c.beginPath();
      c.moveTo(0, 0);
      c.lineTo(-10, 11);
      c.stroke();

      // Flint-Shard Cudgel at (-10, 11)
      c.save();
      c.translate(-10, 11);
      c.rotate(-0.45);

      // Gnarled Club Wood Handle
      c.fillStyle = '#78350f';
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.2;
      c.beginPath();
      c.roundRect(-2.2, -19, 4.5, 24, 1.8);
      c.fill();
      c.stroke();

      // Jagged Knapped Flint / Obsidian Stone Head
      const flintGrad = c.createLinearGradient(-9, -29, 9, -15);
      flintGrad.addColorStop(0, '#cbd5e1');
      flintGrad.addColorStop(0.5, '#475569');
      flintGrad.addColorStop(1, '#0f172a');
      c.fillStyle = flintGrad;
      c.strokeStyle = '#090d16';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(0, -30);
      c.lineTo(-9, -23);
      c.lineTo(-6, -15);
      c.lineTo(6, -15);
      c.lineTo(9, -22);
      c.closePath();
      c.fill();
      c.stroke();

      // Rawhide cross-lashing binding the flint stone
      c.strokeStyle = '#d97706';
      c.lineWidth = 1.3;
      c.beginPath();
      c.moveTo(-5, -16);
      c.lineTo(5, -22);
      c.moveTo(-5, -22);
      c.lineTo(5, -16);
      c.stroke();

      c.restore();
      c.restore();

      // ── 8. Feral Smash Arc ──
      if (pose.slashAlpha > 0.04) {
        c.save();
        c.globalAlpha = pose.slashAlpha * 0.85;
        c.strokeStyle = '#bef264';
        c.shadowColor = '#eab308';
        c.shadowBlur = 10;
        c.lineWidth = 3.2;
        c.lineCap = 'round';
        c.beginPath();
        c.arc(cx - 8, cy, 22, Math.PI * 0.72, Math.PI * 1.3);
        c.stroke();
        c.restore();
      }
    });
  }
}
