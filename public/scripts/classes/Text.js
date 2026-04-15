export default class Text {
  constructor(value) {
    this.value = value || 'Text';

    this.el = document.createElement('label');
    this.el.classList.add('text-label');
    this.el.textContent = this.value;
  }

  appendTo(container) {
    return container.append(this.el);
  }

  el() {
    return this.el;
  }
}
