import NOOP from './NOOP.js';

export default class GameObject {
  constructor() {
      this.initialize = NOOP;
      this.update = NOOP;
      this.draw = NOOP;
      this.destroy = NOOP;
  }

  setInitialize(initializeFunction) {
    this.initialize = initializeFunction;
    return this;
  }

  setUpdate(updateFunction) {
    this.update = updateFunction;
    return this;
  }

  setDraw(drawFunction) {
    this.draw = drawFunction;
    return this;
  }

  setDestroy(destroyFunction) {
    this.destroy = destroyFunction;
    return this;
  }
}

