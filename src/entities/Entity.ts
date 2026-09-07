export abstract class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  maxHealth: number;
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
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.flashTimer = 100;
    this.lastDamageTimer = 2500;
    if (this.health <= 0) {
      this.markedForDeletion = true;
    }
  }

  update(deltaTime: number, ..._args: any[]): void {
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }
    if (this.lastDamageTimer > 0) {
      this.lastDamageTimer -= deltaTime;
    }
    if (Math.abs(this.recoilX) > 0.1) {
      this.recoilX -= this.recoilX * (deltaTime / 50);
    } else {
      this.recoilX = 0;
    }
  }

  drawHealthBar(ctx: CanvasRenderingContext2D) {
    if (this.health >= this.maxHealth || this.lastDamageTimer <= 0 || this.markedForDeletion) return;
    
    ctx.save();
    const barW = Math.min(48, Math.max(32, this.width * 0.8));
    const barH = 5;
    const bx = this.x + (this.width - barW) / 2;
    const by = this.y - 10;
    const pct = Math.max(0, Math.min(1, this.health / this.maxHealth));
    const alpha = Math.min(1, this.lastDamageTimer / 500);

    ctx.globalAlpha = alpha;
    
    // Background
    ctx.fillStyle = 'rgba(10, 14, 20, 0.85)';
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(bx - 1, by - 1, barW + 2, barH + 2, 3);
    ctx.fill();
    ctx.stroke();

    // HP Fill gradient
    const hpGrad = ctx.createLinearGradient(bx, by, bx + barW, by);
    if (pct > 0.5) {
      hpGrad.addColorStop(0, '#4caf50');
      hpGrad.addColorStop(1, '#81c784');
    } else if (pct > 0.25) {
      hpGrad.addColorStop(0, '#ff9800');
      hpGrad.addColorStop(1, '#ffc107');
    } else {
      hpGrad.addColorStop(0, '#d32f2f');
      hpGrad.addColorStop(1, '#ff5252');
    }

    ctx.fillStyle = hpGrad;
    ctx.beginPath();
    ctx.roundRect(bx, by, barW * pct, barH, 2);
    ctx.fill();

    ctx.restore();
  }

  drawWithTransform(ctx: CanvasRenderingContext2D, drawFn: () => void) {
    ctx.save();
    
    if ((this as any).isSlowed) {
      ctx.filter = 'sepia(100%) hue-rotate(180deg) saturate(200%) brightness(1.2)';
    }

    ctx.translate(this.x + this.width / 2 + this.offsetX + this.recoilX, this.y + this.height / 2 + this.offsetY);
    ctx.rotate(this.rotation);
    ctx.scale(this.scaleX, this.scaleY);
    ctx.translate(-(this.x + this.width / 2), -(this.y + this.height / 2));
    
    drawFn();

    if (this.flashTimer > 0) {
      ctx.globalCompositeOperation = 'source-atop';
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    
    ctx.restore();

    // Draw health bar on top
    this.drawHealthBar(ctx);
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}

