function Mainloop() {
  this.isRunning = false;
  this.maxFps = 60;
  this.timestep = 1000 / 30;
  this.lastFrameTimeMs = 0;
  this.delta = 0;
  this.fps = 60;
  this.framesThisSecond = 0;
  this.lastFpsUpdate = 0;
  this.hasStarted = false;
  this.frameId = 0;
  this.NOOP = () => {};
  this.initialize = this.NOOP
  this.update = this.NOOP;
  this.draw = this.NOOP;

  this.panic = function() {
    this.delta = 0;
  }
};

Mainloop.prototype.__loop = function(timestamp) {
  if (this.isRunning) {
    // Throttle the frame rate.
    if (timestamp < this.lastFrameTimeMs + (1000 / this.maxFps)) {
      this.frameId = requestAnimationFrame(this.__loop.bind(this));
      return;
    }
    this.delta += timestamp - this.lastFrameTimeMs;
    this.lastFrameTimeMs = timestamp;

    if (timestamp > this.lastFpsUpdate + 1000) {
      this.fps = 0.25 * this.framesThisSecond + 0.75 * this.fps;

      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
    }
    this.framesThisSecond++;

    let numUpdateSteps = 0;
    while (this.delta >= this.timestep) {
      this.update(this.timestep);
      this.delta -= this.timestep;
      if (++numUpdateSteps >= 240) {
        this.panic();
        break;
      }
    }

    this.draw(this.delta / this.timestep);
    this.frameId = requestAnimationFrame(this.__loop.bind(this));
  }
}

Mainloop.prototype.getMaxFps = function() {
  return this.maxFps;
}

Mainloop.prototype.setMaxFps = function(newMaxFps) {
  this.maxFps = newMaxFps;
  return this;
}

Mainloop.prototype.getTimestep = function() {
  return this.timestep;
}

Mainloop.prototype.setTimestep = function(timestepPerSecond) {
  this.timestep = 1000 / timestepPerSecond;
  return this;
}

Mainloop.prototype.setInitialize = function(initializeFunction) {
  this.initialize = initializeFunction;
  return this;
}

Mainloop.prototype.setUpdate = function(updateFunction) {
  this.update = updateFunction;
  return this;
}

Mainloop.prototype.setDraw = function(drawFunction) {
  this.draw = drawFunction;
  return this;
}

Mainloop.prototype.setEnd = function(endFunction) {
  this.end = endFunction;
  return this;
}

Mainloop.prototype.setPanic = function(panicFunction) {
  this.panic = panicFunction;
  return this;
}

Mainloop.prototype.start = async function() {
  if (!this.hasStarted) {
    this.hasStarted = true;

    await this.initialize();
    this.frameId = requestAnimationFrame((function(timestamp) {
      this.draw(1);
      this.isRunning = true;
      this.lastFrameTimeMs = timestamp;
      this.lastFpsUpdate = timestamp;
      this.framesThisSecond = 0;
      this.frameId = requestAnimationFrame(this.__loop.bind(this));
    }).bind(this));
  }
}

Mainloop.prototype.stop = function() {
  this.isRunning = false;
  this.hasStarted = false;
  cancelAnimationFrame(this.frameId);
}

export default Mainloop;
