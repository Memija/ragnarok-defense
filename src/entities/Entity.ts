export abstract class Entity {
  x: number;
  y: number;
  width: number;
  height: number;
  health: number;
  markedForDeletion: boolean = false;
  
  animTimer: number = 0;
  scaleX: number = 1;
  scaleY: number = 1;
  rotation: number = 0;
  offsetX: number = 0;
  offsetY: number = 0;
  recoilX: number = 0;
  flashTimer: number = 0;

  constructor(x: number, y: number, width: number, height: number, health: number) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.health = health;
  }

  takeDamage(amount: number) {
    this.health -= amount;
    this.flashTimer = 100;
    if (this.health <= 0) {
      this.markedForDeletion = true;
    }
  }

  update(deltaTime: number, ..._args: any[]): void {
    this.animTimer += deltaTime;
    if (this.flashTimer > 0) {
      this.flashTimer -= deltaTime;
    }
    if (Math.abs(this.recoilX) > 0.1) {
      this.recoilX -= this.recoilX * (deltaTime / 50);
    } else {
      this.recoilX = 0;
    }
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
  }

  abstract draw(ctx: CanvasRenderingContext2D): void;
}
