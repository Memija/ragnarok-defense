import { Projectile } from '../entities/Projectile';
import { getEffectiveDpr } from '../engine/GameConfig';

export class Butter extends Projectile {
  private static sprite: HTMLCanvasElement | null = null;
  private static spriteDpr = 0;
  private static readonly HALF = 26;
  private static readonly SIZE = 52;

  constructor(x: number, y: number, row: number) {
    super(x, y, 25, 20, 1, 300, 40, row); // Normal speed, 40 damage
  }

  private static getSprite(): HTMLCanvasElement {
    const dpr = getEffectiveDpr();
    if (Butter.sprite && Butter.spriteDpr === dpr) return Butter.sprite;
    const c = document.createElement('canvas');
    c.width = Math.ceil(Butter.SIZE * dpr);
    c.height = Math.ceil(Butter.SIZE * dpr);
    const sctx = c.getContext('2d')!;
    sctx.scale(dpr, dpr);
    sctx.translate(Butter.HALF, Butter.HALF);

    // Glowing Amber Aura
    sctx.shadowBlur = 10;
    sctx.shadowColor = '#f59e0b';

    // Flask bulb body (round glass)
    const bulbGrad = sctx.createRadialGradient(-3, -3, 2, 0, 0, 10);
    bulbGrad.addColorStop(0, '#fef08a');
    bulbGrad.addColorStop(0.5, '#f59e0b');
    bulbGrad.addColorStop(1, '#b45309');
    sctx.fillStyle = bulbGrad;
    sctx.strokeStyle = '#78350f';
    sctx.lineWidth = 1.2;

    sctx.beginPath();
    sctx.arc(0, 2, 9, 0, Math.PI * 2);
    sctx.fill();
    sctx.stroke();

    // Flask neck & cork
    sctx.shadowBlur = 0;
    sctx.fillStyle = '#92400e';
    sctx.fillRect(-3, -11, 6, 5);
    sctx.fillStyle = '#d97706';
    sctx.fillRect(-4, -13, 8, 3);

    // Iron reinforcement band
    sctx.strokeStyle = '#44403c';
    sctx.lineWidth = 1.5;
    sctx.beginPath();
    sctx.ellipse(0, 2, 9, 3, 0, 0, Math.PI * 2);
    sctx.stroke();

    Butter.sprite = c;
    Butter.spriteDpr = dpr;
    return c;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.x * 0.05);
    ctx.drawImage(Butter.getSprite(), -Butter.HALF, -Butter.HALF, Butter.SIZE, Butter.SIZE);
    ctx.restore();
  }
}
