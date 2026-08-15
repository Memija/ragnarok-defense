import { Entity } from './Entity';

export abstract class Defender extends Entity {
  cost: number;
  row: number;
  col: number;

  constructor(x: number, y: number, width: number, height: number, health: number, cost: number, row: number, col: number) {
    super(x, y, width, height, health);
    this.cost = cost;
    this.row = row;
    this.col = col;
  }

  update(deltaTime: number, ..._args: any[]) {
    super.update(deltaTime, ..._args);
  }
}
