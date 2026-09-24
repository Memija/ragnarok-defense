export class Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
  gravity: number;

  constructor(x: number, y: number, color: string, speedX: number, speedY: number, size: number, life: number, gravity: number = 0.05) {
    this.x = x;
    this.y = y;
    this.vx = speedX;
    this.vy = speedY;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.gravity = gravity;
  }

  reset(x: number, y: number, color: string, speedX: number, speedY: number, size: number, life: number, gravity: number = 0.05) {
    this.x = x;
    this.y = y;
    this.vx = speedX;
    this.vy = speedY;
    this.color = color;
    this.size = size;
    this.life = life;
    this.maxLife = life;
    this.gravity = gravity;
  }

  update(deltaTime: number) {
    const timeScale = deltaTime / 16;
    this.x += this.vx * timeScale;
    this.vy += this.gravity * timeScale;
    this.y += this.vy * timeScale;
    this.life -= deltaTime;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.globalAlpha = Math.max(0, this.life / this.maxLife);
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
  }
}

export class ParticleSystem {
  particles: Particle[] = [];
  private pool: Particle[] = [];

  emit(x: number, y: number, color: string, count: number, speed: number, size: number, life: number, gravity: number = 0.05) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const currentSpeed = Math.random() * speed;
      const vx = Math.cos(angle) * currentSpeed;
      const vy = Math.sin(angle) * currentSpeed;
      const pSize = size + Math.random() * size;

      const p = this.pool.pop();
      if (p) {
        p.reset(x, y, color, vx, vy, pSize, life, gravity);
        this.particles.push(p);
      } else {
        this.particles.push(new Particle(x, y, color, vx, vy, pSize, life, gravity));
      }
    }
  }
  
  emitExplosion(x: number, y: number) {
     this.emit(x, y, '#ff5722', 40, 8, 5, 600, 0); 
     this.emit(x, y, '#ffeb3b', 20, 10, 4, 400, 0); 
     this.emit(x, y, '#757575', 30, 4, 8, 800, -0.01); 
  }

  update(deltaTime: number) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.update(deltaTime);
      if (p.life <= 0) {
        if (this.pool.length < 300) {
          this.pool.push(p);
        }
        const last = this.particles.pop();
        if (i < this.particles.length && last) {
          this.particles[i] = last;
        }
      }
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    const len = this.particles.length;
    if (len === 0) return;
    for (let i = 0; i < len; i++) {
      this.particles[i].draw(ctx);
    }
    ctx.globalAlpha = 1.0;
  }
}
