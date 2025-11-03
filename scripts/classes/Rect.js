// @ts-check

import Point from './Point.js';

export default class Rect {
  /**
    * @param {number} x
    * @param {number} y
    * @param {number} w
    * @param {number} h
    */
  constructor(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
  }

  /**
    * @param {Point} p
    */
  isPointInside(p) {
    return p.x > this.x && 
      p.x < (this.w - this.x) &&
      p.y > this.y &&
      p.y < (this.h - this.y);
  }
}
