import { Entity } from './Entity';

export abstract class Attacker extends Entity {
  speed: number;
  damage: number;
  row: number;
  isEating: boolean = false;
  isSlowed: boolean = false;
  slowTimer: number = 0;
  isStunned: boolean = false;
  stunTimer: number = 0;

  constructor(x: number, y: number, width: number, height: number, health: number, speed: number, damage: number, row: number) {
    super(x, y, width, height, health);
    this.speed = speed;
    this.damage = damage;
    this.row = row;
  }
  
  update(deltaTime: number, ..._args: any[]) {
    let effectiveDeltaTime = deltaTime;
    
    if (this.slowTimer > 0) {
      this.slowTimer -= deltaTime;
      if (this.slowTimer <= 0) {
        this.slowTimer = 0;
        this.isSlowed = false;
      } else {
        this.isSlowed = true;
        effectiveDeltaTime = deltaTime / 2;
      }
    }
    
    if (this.stunTimer > 0) {
      this.stunTimer -= deltaTime;
      if (this.stunTimer <= 0) {
        this.stunTimer = 0;
        this.isStunned = false;
      } else {
        this.isStunned = true;
        effectiveDeltaTime = 0; // Stunned means no movement and no animation update
      }
    }

    super.update(effectiveDeltaTime, ..._args);
    const game = _args[0];

    if (!this.isEating && !this.isStunned) {
      this.x -= this.speed * (effectiveDeltaTime / 1000);
      
      if (game && Math.random() < 0.05) {
         game.particles.emit(this.x + this.width / 2, this.y + this.height, '#5d4037', 3, 2, 3, 300);
      }
    } else if (this.isEating && !this.isStunned) {
      if (game && Math.random() < 0.1) {
         game.particles.emit(this.x + 10, this.y + this.height / 2, '#4caf50', 2, 3, 3, 400); 
      }
    }
  }
}
