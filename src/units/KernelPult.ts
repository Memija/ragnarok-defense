import { Defender } from '../entities/Defender';
import { Game } from '../engine/Game';
import { Kernel } from './Kernel';
import { Butter } from './Butter';
import { SoundManager } from '../engine/SoundManager';

export class KernelPult extends Defender {
  fireTimer: number = 0;
  fireRate: number = 3000; // Slower fire rate than peashooter

  constructor(x: number, y: number, row: number, col: number) {
    super(x, y, 60, 80, 200, 100, row, col); // Cost 100 sun
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    
    const zombieInRow = game.attackers.some(a => a.row === this.row && a.x > this.x);
    if (zombieInRow) {
      this.fireTimer += deltaTime;
      if (this.fireTimer >= this.fireRate) {
        this.fireTimer = 0;
        
        // 25% chance to shoot butter
        const isButter = Math.random() < 0.25;
        
        if (isButter) {
           game.projectiles.push(new Butter(this.x + this.width, this.y + 10, this.row));
           SoundManager.getInstance().playShoot('butter');
        } else {
           game.projectiles.push(new Kernel(this.x + this.width, this.y + 10, this.row));
           SoundManager.getInstance().playShoot('pea');
        }
        
        this.recoilX = -15;
        this.scaleY = 0.8;
      }
    } else {
      this.fireTimer = 0;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.drawWithTransform(ctx, () => {
      const cx = this.x + this.width / 2;
      const cy = this.y + this.height / 2;

      // --- Ground Shadow ---
      ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
      ctx.beginPath();
      ctx.ellipse(cx, cy + 36, 26, 8, 0, 0, Math.PI * 2);
      ctx.fill();

      // --- 1. Fortified Dwarven Stone Foundation Platform ---
      const baseGrad = ctx.createLinearGradient(cx - 24, cy + 22, cx + 24, cy + 36);
      baseGrad.addColorStop(0, '#292524');
      baseGrad.addColorStop(0.5, '#44403c');
      baseGrad.addColorStop(1, '#1c1917');
      ctx.fillStyle = baseGrad;
      ctx.strokeStyle = '#57534e';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 24, cy + 22, 48, 14, 3);
      ctx.fill();
      ctx.stroke();

      // Base rivets & iron plating
      ctx.fillStyle = '#94a3b8';
      for (const ox of [-18, -6, 6, 18]) {
        ctx.beginPath();
        ctx.arc(cx + ox, cy + 29, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      // --- 2. Fortified Timber & Iron A-Frame Tower Scaffolding ---
      const timberGrad = ctx.createLinearGradient(cx - 20, cy - 10, cx + 20, cy + 22);
      timberGrad.addColorStop(0, '#78350f');
      timberGrad.addColorStop(0.5, '#92400e');
      timberGrad.addColorStop(1, '#451a03');
      ctx.fillStyle = timberGrad;
      ctx.strokeStyle = '#292524';
      ctx.lineWidth = 1.5;

      // Left Strut
      ctx.beginPath();
      ctx.moveTo(cx - 20, cy + 22);
      ctx.lineTo(cx - 6, cy - 8);
      ctx.lineTo(cx - 1, cy - 8);
      ctx.lineTo(cx - 14, cy + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Right Strut
      ctx.beginPath();
      ctx.moveTo(cx + 20, cy + 22);
      ctx.lineTo(cx + 6, cy - 8);
      ctx.lineTo(cx + 1, cy - 8);
      ctx.lineTo(cx + 14, cy + 22);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Crossbeam brace
      ctx.fillStyle = '#b45309';
      ctx.fillRect(cx - 14, cy + 6, 28, 5);
      ctx.strokeRect(cx - 14, cy + 6, 28, 5);

      // --- 3. Large Brass Machinery Cogwheel & Winding Ratchet ---
      const gearSpin = (this.animTimer * 0.05) % (Math.PI * 2);
      ctx.save();
      ctx.translate(cx - 9, cy + 2);
      ctx.rotate(gearSpin);
      ctx.fillStyle = '#d97706';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, 8, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Gear teeth
      for (let i = 0; i < 6; i++) {
        const ang = (i * Math.PI) / 3;
        ctx.fillStyle = '#f59e0b';
        ctx.fillRect(Math.cos(ang) * 7 - 1.5, Math.sin(ang) * 7 - 1.5, 3, 3);
      }
      ctx.fillStyle = '#1c1917';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // --- 4. Catapult Pivot Axle & Bronze Pivot Hub ---
      ctx.fillStyle = '#f59e0b';
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(cx, cy - 8, 5.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // --- 5. Articulated Siege Catapult Throwing Arm ---
      const isRecoil = this.recoilX < -2;
      const armAngle = isRecoil ? -0.55 : 0.45; // Swing forward on recoil, rest back

      ctx.save();
      ctx.translate(cx, cy - 8);
      ctx.rotate(armAngle);

      // Wooden beam
      ctx.fillStyle = '#78350f';
      ctx.strokeStyle = '#451a03';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.roundRect(-3, -28, 6, 36, 2);
      ctx.fill();
      ctx.stroke();

      // Heavy Iron Counterweight (bottom)
      ctx.fillStyle = '#334155';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.2;
      ctx.fillRect(-6, 6, 12, 9);
      ctx.strokeRect(-6, 6, 12, 9);

      // Iron Throwing Basket / Cup (top)
      ctx.fillStyle = '#475569';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(0, -28, 7, Math.PI, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Loaded payload in cup (Gleaming runic magma boulder)
      if (!isRecoil) {
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, -31, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();

      // --- 6. Front Dwarven Defense Mantlet / Runic Armor Plate ---
      const plateGrad = ctx.createLinearGradient(cx - 16, cy + 8, cx + 16, cy + 22);
      plateGrad.addColorStop(0, '#475569');
      plateGrad.addColorStop(0.5, '#64748b');
      plateGrad.addColorStop(1, '#334155');
      ctx.fillStyle = plateGrad;
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(cx - 15, cy + 10, 30, 13, 2);
      ctx.fill();
      ctx.stroke();

      // Carved Dwarven Anvil / Hammer Insignia
      ctx.fillStyle = '#f59e0b';
      ctx.beginPath();
      ctx.fillRect(cx - 4, cy + 13, 8, 3);
      ctx.fillRect(cx - 2, cy + 16, 4, 4);
    });
  }
}
