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
    ctx.globalAlpha = 1.0;
  }
}

export class ParticleSystem {
  particles: Particle[] = [];

  emit(x: number, y: number, color: string, count: number, speed: number, size: number, life: number, gravity: number = 0.05) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const currentSpeed = Math.random() * speed;
      const vx = Math.cos(angle) * currentSpeed;
      const vy = Math.sin(angle) * currentSpeed;
      this.particles.push(new Particle(x, y, color, vx, vy, size + Math.random() * size, life, gravity));
    }
  }
  
  emitExplosion(x: number, y: number) {
     this.emit(x, y, '#ff5722', 40, 8, 5, 600, 0); 
     this.emit(x, y, '#ffeb3b', 20, 10, 4, 400, 0); 
     this.emit(x, y, '#757575', 30, 4, 8, 800, -0.01); 
  }

  update(deltaTime: number) {
    this.particles.forEach(p => p.update(deltaTime));
    this.particles = this.particles.filter(p => p.life > 0);
  }

  draw(ctx: CanvasRenderingContext2D) {
    this.particles.forEach(p => p.draw(ctx));
  }
}
