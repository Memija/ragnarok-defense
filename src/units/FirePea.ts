import { Projectile } from '../entities/Projectile';
import type { Game } from '../engine/Game';
import { getEffectiveDpr } from '../engine/GameConfig';

export class FirePea extends Projectile {
  animTimer: number = 0;
  private static coreSprite: HTMLCanvasElement | null = null;
  private static coreDpr = 0;
  private static tailGrad: CanvasGradient | null = null;
  private static readonly CORE_HALF = 28;
  private static readonly CORE_SIZE = 56;

  constructor(x: number, y: number, row: number) {
    super(x, y, 20, 20, 1, 300, 40, row); // Double damage (40 instead of 20)
  }

  private static getCoreSprite(): HTMLCanvasElement {
    const dpr = getEffectiveDpr();
    if (FirePea.coreSprite && FirePea.coreDpr === dpr) return FirePea.coreSprite;
    const c = document.createElement('canvas');
    c.width = Math.ceil(FirePea.CORE_SIZE * dpr);
    c.height = Math.ceil(FirePea.CORE_SIZE * dpr);
    const sctx = c.getContext('2d')!;
    sctx.scale(dpr, dpr);
    const mid = FirePea.CORE_HALF;

    const grad = sctx.createRadialGradient(mid + 1, mid, 1.5, mid, mid, 11.5);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, '#fef08a');
    grad.addColorStop(0.65, '#f97316');
    grad.addColorStop(1, '#dc2626');

    sctx.shadowBlur = 16;
    sctx.shadowColor = '#f97316';
    sctx.fillStyle = grad;
    sctx.beginPath();
    sctx.arc(mid, mid, 10.5, 0, Math.PI * 2);
    sctx.fill();

    FirePea.coreSprite = c;
    FirePea.coreDpr = dpr;
    return c;
  }

  update(deltaTime: number, game: Game) {
    super.update(deltaTime, game);
    if (this.markedForDeletion) return;
    this.animTimer += deltaTime;
    if (Math.random() < 0.3) {
      game.particles.emit(this.x + this.width * 0.5, this.y + this.height * 0.5, '#ff9800', 3, 2, 1, 200);
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const cx = this.x + this.width * 0.5;
    const cy = this.y + this.height * 0.5;
    const flicker = Math.sin(this.animTimer / 35) * 2.5;

    ctx.save();
    ctx.translate(cx, cy);

    // 1. Roaring Muspelheim Flame Comet Tail (cached local gradient)
    if (!FirePea.tailGrad) {
      const g = ctx.createLinearGradient(-32, 0, 4, 0);
      g.addColorStop(0, 'rgba(220, 38, 38, 0)');
      g.addColorStop(0.45, 'rgba(239, 68, 68, 0.55)');
      g.addColorStop(0.8, 'rgba(249, 115, 22, 0.85)');
      g.addColorStop(1, '#fef08a');
      FirePea.tailGrad = g;
    }
    ctx.fillStyle = FirePea.tailGrad;
    ctx.beginPath();
    ctx.moveTo(-32, flicker);
    ctx.quadraticCurveTo(-14, -10, 2, -9.5);
    ctx.lineTo(2, 9.5);
    ctx.quadraticCurveTo(-14, 10, -32, flicker);
    ctx.closePath();
    ctx.fill();

    // 2. Blazing Fireball Core (pre-baked HiDPI sprite)
    ctx.drawImage(FirePea.getCoreSprite(), -FirePea.CORE_HALF, -FirePea.CORE_HALF, FirePea.CORE_SIZE, FirePea.CORE_SIZE);
    ctx.restore();
  }
}
