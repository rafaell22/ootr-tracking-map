export default class TextLocation {
  constructor(value) {
    this.value = value || '';

    this.el = document.createElement('input');
    this.el.type = 'text';
    this.el.classList.add('sometimes-hint');
    this.el.setAttribute('list', 'location-list');
    this.el.value = this.value;
  }

  appendTo(container) {
    return container.append(this.el);
  }

  el() {
    return this.img;
  }
}
