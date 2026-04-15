export default class DisplayItem {
  constructor(itemId, name) {
    this.itemId = itemId;
    this.name = name;
    this.img = document.createElement('img');
    this.img.title = this.name;

    this.addImg(`${this.itemId}_32x32.png`);
  }

  addImg(imgName) {
    this.img.src = `./assets/${imgName}`;
  }

  appendTo(container) {
    return container.append(this.img);
  }

  el() {
    return this.img;
  }
}
