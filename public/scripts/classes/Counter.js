const MAX_COUNT = 9;
const START_VALUE = 0;

export default class Counter {
  constructor(name, value) {
    this.name = name;
    this.value = value || START_VALUE;

    this.el = document.createElement('span');
    this.el.classList.add('counter');
    this.el.textContent = this.value;

    this.el.addEventListener('wheel', this.changeCounterValue.bind(this))
  }

  changeCounterValue(event) {
    event.preventDefault();

    if(event.deltaY > 0) {
      if(this.value < MAX_COUNT){
        this.value += 1;
      }
    } else if(this.value > 0) {
      this.value -= 1;
    }

    this.el.textContent = this.value;
  }

  appendTo(container) {
    return container.append(this.el);
  }
}
