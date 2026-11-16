import { Projectile } from '../entities/Projectile';
import { getEffectiveDpr } from '../engine/GameConfig';

export class Pea extends Projectile {
  private static sprite: HTMLCanvasElement | null = null;
  private static spriteDpr = 0;
  private static readonly ORIGIN_X = 30;
  private static readonly ORIGIN_Y = 24;
  private static readonly LOGICAL_W = 54;
  private static readonly LOGICAL_H = 48;

  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 20, row);
  }

  private static getSprite(): HTMLCanvasElement {
    const dpr = getEffectiveDpr();
    if (Pea.sprite && Pea.spriteDpr === dpr) return Pea.sprite;
    const c = document.createElement('canvas');
    c.width = Math.ceil(Pea.LOGICAL_W * dpr);
    c.height = Math.ceil(Pea.LOGICAL_H * dpr);
    const sctx = c.getContext('2d')!;
    sctx.scale(dpr, dpr);
    const cx = Pea.ORIGIN_X;
    const cy = Pea.ORIGIN_Y;

    // 1. Vanaheim Emerald Motion Tail
    const tailGrad = sctx.createLinearGradient(cx - 24, cy, cx, cy);
    tailGrad.addColorStop(0, 'rgba(74, 222, 128, 0)');
    tailGrad.addColorStop(0.6, 'rgba(74, 222, 128, 0.35)');
    tailGrad.addColorStop(1, 'rgba(134, 239, 172, 0.75)');
    sctx.fillStyle = tailGrad;
    sctx.beginPath();
    sctx.moveTo(cx - 24, cy);
    sctx.lineTo(cx, cy - 5.5);
    sctx.lineTo(cx, cy + 5.5);
    sctx.closePath();
    sctx.fill();

    // 2. Luminous Emerald Orb Body
    const grad = sctx.createRadialGradient(cx - 2, cy - 3, 1.5, cx, cy, 9.5);
    grad.addColorStop(0, '#f0fdf4');
    grad.addColorStop(0.35, '#86efac');
    grad.addColorStop(0.75, '#22c55e');
    grad.addColorStop(1, '#14532d');

    sctx.shadowBlur = 10;
    sctx.shadowColor = '#4ade80';
    sctx.fillStyle = grad;
    sctx.strokeStyle = '#052e16';
    sctx.lineWidth = 1.1;
    sctx.beginPath();
    sctx.arc(cx, cy, 8.8, 0, Math.PI * 2);
    sctx.fill();
    sctx.stroke();

    // 3. Specular Glint
    sctx.shadowBlur = 0;
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.arc(cx - 2.5, cy - 2.8, 2.2, 0, Math.PI * 2);
    sctx.fill();

    Pea.sprite = c;
    Pea.spriteDpr = dpr;
    return c;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;
    ctx.drawImage(Pea.getSprite(), cx - Pea.ORIGIN_X, cy - Pea.ORIGIN_Y, Pea.LOGICAL_W, Pea.LOGICAL_H);
  }
}
