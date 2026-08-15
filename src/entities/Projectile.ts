import { Entity } from './Entity';

export abstract class Projectile extends Entity {
  speed: number;
  damage: number;
  row: number;

  constructor(x: number, y: number, width: number, height: number, health: number, speed: number, damage: number, row: number) {
    super(x, y, width, height, health);
    this.speed = speed;
    this.damage = damage;
    this.row = row;
  }

  update(deltaTime: number, ..._args: any[]) {
    this.x += this.speed * (deltaTime / 1000);
  }
}
