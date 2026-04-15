import Canvas from './Canvas.js';
import pubSub from './PubSub.js';
import Point from './Point.js';
import SetLineColorEvent from './events/SetLineColorEvent.js';
import Rect from './Rect.js';
import Line from './Line.js';

export default class Map extends Canvas {
  constructor(options = {}) {
    super(options);

    this.point1;
    this.lines = [];
    this.lineColor = '#0000ff';
    this.shape = new Rect(0, 0, 687, 400)

    pubSub.subscribe('path-to', this.onPathTo.bind(this));
    pubSub.subscribe('show-select-items', this.onShowSelectItems.bind(this));
    pubSub.subscribe('set-line-color', this.onSetLineColor.bind(this));
    pubSub.subscribe('remove-line', this.onRemoveLastLine.bind(this));
  }

  /**
    * @param {Point} point
    */
  onPathTo(point) {
    if(this.point1) {
      this.lines.push(new Line(this.point1, point, this.lineColor));
      this.point1 = null;
      pubSub.publish('new-change');
      return;
    }

    this.point1 = point;
  }

  onShowSelectItems() {
    this.point1 = null;
  }

  /**
    * @param {SetLineColorEvent} event
    */
  onSetLineColor(event) {
    console.log(event)
    this.lineColor = event.colorHex;
  }

  onRemoveLastLine() {
    this.lines.pop();
    pubSub.publish('new-change');
  }
}
