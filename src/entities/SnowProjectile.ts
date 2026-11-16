import { Projectile } from './Projectile';
import { getEffectiveDpr } from '../engine/GameConfig';

export class SnowProjectile extends Projectile {
  private static sprite: HTMLCanvasElement | null = null;
  private static spriteDpr = 0;
  private static readonly ORIGIN_X = 34;
  private static readonly ORIGIN_Y = 24;
  private static readonly LOGICAL_W = 62;
  private static readonly LOGICAL_H = 48;

  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 20, row);
  }

  private static getSprite(): HTMLCanvasElement {
    const dpr = getEffectiveDpr();
    if (SnowProjectile.sprite && SnowProjectile.spriteDpr === dpr) return SnowProjectile.sprite;
    const c = document.createElement('canvas');
    c.width = Math.ceil(SnowProjectile.LOGICAL_W * dpr);
    c.height = Math.ceil(SnowProjectile.LOGICAL_H * dpr);
    const sctx = c.getContext('2d')!;
    sctx.scale(dpr, dpr);
    const cx = SnowProjectile.ORIGIN_X;
    const cy = SnowProjectile.ORIGIN_Y;

    // 1. Niflheim Rime Vapor Trail
    const tailGrad = sctx.createLinearGradient(cx - 28, cy, cx, cy);
    tailGrad.addColorStop(0, 'rgba(56, 189, 248, 0)');
    tailGrad.addColorStop(0.55, 'rgba(125, 211, 252, 0.4)');
    tailGrad.addColorStop(1, 'rgba(224, 242, 254, 0.85)');
    sctx.fillStyle = tailGrad;
    sctx.beginPath();
    sctx.moveTo(cx - 28, cy);
    sctx.lineTo(cx, cy - 6);
    sctx.lineTo(cx, cy + 6);
    sctx.closePath();
    sctx.fill();

    // 2. Faceted Ice Crystal Lance Head
    const grad = sctx.createLinearGradient(cx - 10, cy - 8, cx + 11, cy + 8);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.45, '#7dd3fc');
    grad.addColorStop(0.85, '#0284c7');
    grad.addColorStop(1, '#0c4a6e');

    sctx.shadowBlur = 12;
    sctx.shadowColor = '#38bdf8';
    sctx.fillStyle = grad;
    sctx.strokeStyle = '#075985';
    sctx.lineWidth = 1.1;
    sctx.beginPath();
    sctx.moveTo(cx + 11, cy);
    sctx.lineTo(cx + 2, cy - 7.5);
    sctx.lineTo(cx - 9, cy - 4.5);
    sctx.lineTo(cx - 6, cy);
    sctx.lineTo(cx - 9, cy + 4.5);
    sctx.lineTo(cx + 2, cy + 7.5);
    sctx.closePath();
    sctx.fill();
    sctx.stroke();

    // 3. Inner Crystalline Facet & Core Glint
    sctx.shadowBlur = 0;
    sctx.fillStyle = '#ffffff';
    sctx.beginPath();
    sctx.moveTo(cx + 7, cy);
    sctx.lineTo(cx + 1, cy - 3.2);
    sctx.lineTo(cx - 4, cy);
    sctx.lineTo(cx + 1, cy + 3.2);
    sctx.closePath();
    sctx.fill();

    SnowProjectile.sprite = c;
    SnowProjectile.spriteDpr = dpr;
    return c;
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;
    ctx.drawImage(
      SnowProjectile.getSprite(),
      cx - SnowProjectile.ORIGIN_X,
      cy - SnowProjectile.ORIGIN_Y,
      SnowProjectile.LOGICAL_W,
      SnowProjectile.LOGICAL_H
    );
  }
}
