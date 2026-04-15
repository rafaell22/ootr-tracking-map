export default class HorizontalSeparator {
  constructor(height) {
    this.height = height;
    this._el = document.createElement('div');
    this.el().style.width = '100%';
    this.el().style.height = this.height;
  }

  appendTo(container) {
    return container.append(this.el());
  }

  el() {
    return this._el;
  }
}
