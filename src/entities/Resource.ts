import { Entity } from './Entity';

export abstract class Resource extends Entity {
  amount: number;

  constructor(x: number, y: number, width: number, height: number, amount: number) {
    super(x, y, width, height, 1);
    this.amount = amount;
  }
}
