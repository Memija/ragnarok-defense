import { getEffectiveDpr } from '../engine/GameConfig';

export abstract class Entity {
  private static scratchCanvas: HTMLCanvasElement | null = null;
  private static scratchCtx: CanvasRenderingContext2D | null = null;
  private static frostGrad: CanvasGradient | null = null;
  private static frostGradH: number = 0;
  private static hpGradHigh: CanvasGradient | null = null;
  private static hpGradMid: CanvasGradient | null = null;
  private static hpGradLow: CanvasGradient | null = null;

  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
  trailHealth: number;
  markedForDeletion: boolean = false;
  
  animTimer: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;
  rotation: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  recoilX: number = 0;
  flashTimer: number = 0;
  lastDamageTimer: number = 0;

  constructor(x: number, y: number, width: number, height: number, health: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
    this.maxHealth = health;
    this.trailHealth = health;
  }

  getHeadClearance(): number {
    return 10;
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.flashTimer = 115;
    this.lastDamageTimer = 2600;
    if (this.health <= 0) {
      this.markedForDeletion = true;
    }
  }

  update(deltaTime: number, _game?: any): void {
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) {
      this.flashTimer = Math.max(0, this.flashTimer - deltaTime);
    }
    if (this.lastDamageTimer > 0) {
      this.lastDamageTimer = Math.max(0, this.lastDamageTimer - deltaTime);
    }
    if (this.trailHealth > this.health) {
      const catchup = Math.max(
        this.maxHealth * 0.0014 * deltaTime,
        (this.trailHealth - this.health) * Math.min(1, deltaTime / 140)
      );
      this.trailHealth = Math.max(this.health, this.trailHealth - catchup);
    } else {
      this.trailHealth = this.health;
    }

    if (Math.abs(this.recoilX) > 0.1) {
      this.recoilX -= this.recoilX * Math.min(1, deltaTime / 55);
    } else {
      this.recoilX = 0;
    }

    const springRate = Math.min(1, deltaTime / 85);
    if (Math.abs(this.scaleX - 1) > 0.002) {
      this.scaleX += (1 - this.scaleX) * springRate;
    } else {
      this.scaleX = 1;
    }
    if (Math.abs(this.scaleY - 1) > 0.002) {
      this.scaleY += (1 - this.scaleY) * springRate;
    } else {
      this.scaleY = 1;
    }
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    if (this.health >= this.maxHealth || this.lastDamageTimer <= 0 || this.markedForDeletion) return;
    
    ctx.save();
    const barW = Math.min(48, Math.max(32, this.width * 0.8));
    const barH = 5;
    const bx = this.x + (this.width - barW) * 0.5;
    const by = this.y - this.getHeadClearance();
    const pct = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const trailPct = Math.max(pct, Math.min(1, this.trailHealth / this.maxHealth));
    const alpha = Math.min(1, this.lastDamageTimer / 500);

    ctx.translate(bx, by);
    ctx.globalAlpha = alpha;
    
    // Background
    ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(-1, -1, barW + 2, barH + 2, 3);
    ctx.fill();
    ctx.stroke();

    // Damage trail bar
    if (trailPct > pct + 0.005) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.roundRect(0, 0, barW * trailPct, barH, 2);
      ctx.fill();
    }

    // HP Fill gradient (cached across all defenders)
    if (pct > 0.5) {
      if (!Entity.hpGradHigh) {
        const g = ctx.createLinearGradient(0, 0, 48, 0);
        g.addColorStop(0, '#4caf50');
        g.addColorStop(1, '#81c784');
        Entity.hpGradHigh = g;
      }
      ctx.fillStyle = Entity.hpGradHigh;
    } else if (pct > 0.25) {
      if (!Entity.hpGradMid) {
        const g = ctx.createLinearGradient(0, 0, 48, 0);
        g.addColorStop(0, '#ff9800');
        g.addColorStop(1, '#ffc107');
        Entity.hpGradMid = g;
      }
      ctx.fillStyle = Entity.hpGradMid;
    } else {
      if (!Entity.hpGradLow) {
        const g = ctx.createLinearGradient(0, 0, 48, 0);
        g.addColorStop(0, '#d32f2f');
        g.addColorStop(1, '#ff5252');
        Entity.hpGradLow = g;
      }
      ctx.fillStyle = Entity.hpGradLow;
    }

    ctx.beginPath();
    ctx.roundRect(0, 0, barW * pct, barH, 2);
    ctx.fill();

    ctx.restore();
  }

  private static getScratchBuffer(reqW: number, reqH: number): { canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null {
    if (typeof document === 'undefined') return null;
    if (!Entity.scratchCanvas) {
      Entity.scratchCanvas = document.createElement('canvas');
      Entity.scratchCanvas.width = Math.max(512, reqW);
      Entity.scratchCanvas.height = Math.max(512, reqH);
      Entity.scratchCtx = Entity.scratchCanvas.getContext('2d');
    } else {
      if (Entity.scratchCanvas.width < reqW) {
        Entity.scratchCanvas.width = reqW + 64;
        Entity.frostGrad = null;
      }
      if (Entity.scratchCanvas.height < reqH) {
        Entity.scratchCanvas.height = reqH + 64;
        Entity.frostGrad = null;
      }
    }
    if (!Entity.scratchCtx) return null;
    return { canvas: Entity.scratchCanvas, ctx: Entity.scratchCtx };
  }

  drawWithTransform(ctx: CanvasRenderingContext2D, drawFn: (targetCtx: CanvasRenderingContext2D) => void) {
    const isSlowed = Boolean((this as any).isSlowed);
    const needsSilhouetteOverlay = isSlowed || this.flashTimer > 0;
    const isIdentity =
      this.offsetX === 0 &&
      this.recoilX === 0 &&
      this.offsetY === 0 &&
      this.rotation === 0 &&
      this.scaleX === 1 &&
      this.scaleY === 1;

    if (isIdentity && !needsSilhouetteOverlay) {
      drawFn(ctx);
      this.drawHealthBar(ctx);
      return;
    }

    ctx.save();

    if (!isIdentity) {
      const pivotX = this.x + this.width * 0.5;
      const pivotY = this.y + this.height * 0.5;
      ctx.translate(pivotX + this.offsetX + this.recoilX, pivotY + this.offsetY);
      if (this.rotation !== 0) ctx.rotate(this.rotation);
      if (this.scaleX !== 1 || this.scaleY !== 1) ctx.scale(this.scaleX, this.scaleY);
      ctx.translate(-pivotX, -pivotY);
    }

    if (needsSilhouetteOverlay && drawFn.length >= 1) {
      const isLarge = this.width > 70;
      const padX = isLarge ? 42 : 28;
      const padTop = isLarge ? 54 : 38;
      const padBottom = 14;
      const boxW = this.width + padX * 2;
      const boxH = this.height + padTop + padBottom;
      const dpr = getEffectiveDpr();
      const pxW = Math.ceil(boxW * dpr);
      const pxH = Math.ceil(boxH * dpr);
      const scratch = Entity.getScratchBuffer(pxW, pxH);

      if (scratch) {
        const sctx = scratch.ctx;
        sctx.setTransform(1, 0, 0, 1, 0, 0);
        sctx.clearRect(0, 0, pxW, pxH);
        sctx.scale(dpr, dpr);

        sctx.save();
        sctx.translate(padX - this.x, padTop - this.y);
        drawFn(sctx);
        sctx.restore();

        sctx.globalCompositeOperation = 'source-atop';
        if (isSlowed) {
          if (!Entity.frostGrad || Entity.frostGradH !== boxH) {
            const fg = sctx.createLinearGradient(0, 0, 0, boxH);
            fg.addColorStop(0, 'rgba(186, 230, 253, 0.5)');
            fg.addColorStop(0.5, 'rgba(56, 189, 248, 0.42)');
            fg.addColorStop(1, 'rgba(14, 116, 144, 0.46)');
            Entity.frostGrad = fg;
            Entity.frostGradH = boxH;
          }
          sctx.fillStyle = Entity.frostGrad;
          sctx.fillRect(0, 0, boxW, boxH);
        }
        if (this.flashTimer > 0) {
          const flashAlpha = Math.min(1, this.flashTimer / 115) * 0.78;
          sctx.fillStyle = `rgba(255, 255, 255, ${flashAlpha})`;
          sctx.fillRect(0, 0, boxW, boxH);
        }
        sctx.globalCompositeOperation = 'source-over';

        ctx.drawImage(scratch.canvas, 0, 0, pxW, pxH, this.x - padX, this.y - padTop, boxW, boxH);
      } else {
        drawFn(ctx);
      }
    } else {
      if (this.flashTimer > 0) {
        ctx.filter = 'brightness(1.65) saturate(0.7)';
      }
      drawFn(ctx);
    }

    ctx.restore();

    // Draw health bar on top
    this.drawHealthBar(ctx);
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
