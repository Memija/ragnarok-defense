import { Projectile } from '../entities/Projectile';
import { getEffectiveDpr } from '../engine/GameConfig';

export class Kernel extends Projectile {
  private static sprite: HTMLCanvasElement | null = null;
  private static spriteDpr = 0;
  private static readonly HALF = 11;
  private static readonly SIZE = 22;

  constructor(x: number, y: number, row: number) {
    super(x, y, 15, 15, 1, 300, 20, row); // Normal damage 20
  }

  private static getSprite(): HTMLCanvasElement {
    const dpr = getEffectiveDpr();
    if (Kernel.sprite && Kernel.spriteDpr === dpr) return Kernel.sprite;
    const c = document.createElement('canvas');
    c.width = Math.ceil(Kernel.SIZE * dpr);
    c.height = Math.ceil(Kernel.SIZE * dpr);
    const sctx = c.getContext('2d')!;
    sctx.scale(dpr, dpr);
    sctx.translate(Kernel.HALF, Kernel.HALF);

    // Stone sphere shadow & core
    const boulderGrad = sctx.createRadialGradient(-2, -2, 1, 0, 0, 7);
    boulderGrad.addColorStop(0, '#78716c');
    boulderGrad.addColorStop(0.5, '#44403c');
    boulderGrad.addColorStop(1, '#1c1917');
    sctx.fillStyle = boulderGrad;
    sctx.strokeStyle = '#0f172a';
    sctx.lineWidth = 1.3;

    sctx.beginPath();
    sctx.arc(0, 0, 7, 0, Math.PI * 2);
    sctx.fill();
    sctx.stroke();

    // Glowing impact rune fissure
    sctx.strokeStyle = '#f59e0b';
    sctx.lineWidth = 1.2;
    sctx.beginPath();
    sctx.moveTo(-3, -3);
    sctx.lineTo(0, 0);
    sctx.lineTo(3, -2);
    sctx.moveTo(0, 0);
    sctx.lineTo(-1, 3);
    sctx.stroke();

    Kernel.sprite = c;
    Kernel.spriteDpr = dpr;
    return c;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(this.x * 0.08);
    ctx.drawImage(Kernel.getSprite(), -Kernel.HALF, -Kernel.HALF, Kernel.SIZE, Kernel.SIZE);
    ctx.restore();
  }
}
