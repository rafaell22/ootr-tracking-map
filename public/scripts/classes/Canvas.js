export default class Canvas {
  constructor(options = {}) {
    this.canvas = document.createElement('CANVAS');
    this.context = this.canvas.getContext('2d');
    this.canvas.style.position = 'absolute';
    this.canvas.style.top = options && options.y ? options.y : 0;
    this.canvas.style.left = options && options.x ? options.x : 0;
    this.canvas.width = options && options.width ? options.width : window.innerWidth;
    this.canvas.height = options && options.height ? options.height : window.innerHeight;
  }
}
