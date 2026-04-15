export default class VerticalSeparator {
  constructor(width) {
    this.width = width;
    this._el = document.createElement('div');
    this.el().style.width = this.width;
  }

  appendTo(container) {
    return container.append(this.el());
  }

  el() {
    return this._el;
  }
}
