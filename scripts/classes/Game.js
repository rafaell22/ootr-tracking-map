import Mainloop from './Mainloop.js';
import Fsm from './Fsm.js';
import Canvas from './Canvas.js';

class Game extends Fsm {
  constructor(options = {}) {
    super([
      { name: 'loadGame', from: 'setup', to: 'menu' },
      { name: 'startGame', from: 'menu', to: 'game' },
      { name: 'pauseGame', from: 'game', to: 'paused' },
      { name: 'unpauseGame', from: 'paused', to: 'game' },
      { name: 'endGame', from: 'game', to: 'gameover' },
      { name: 'restartGame', from: ['gameover', 'game'], to: 'menu' }],
      {},
      'setup'
     );

    this.canvas = new Canvas();
    document.querySelector('body').appendChild(this.canvas.canvas);
    this.context = this.canvas.context;

    this.version = options.version;

    this.imageCache = options.imageCache || {};
    this.jsonCache = options.jsonCache || {};
    this.cache = {
      images: [],
      jsons: []
    };
    
    this.mainloop = new Mainloop();
  };

  setInitialize(fn) {
    this.mainloop.setInitialize(fn.bind(this));
  }

  setUpdate(fn) {
    this.mainloop.setUpdate(fn.bind(this));
  }

  setDraw(fn) {
    this.mainloop.setDraw(fn.bind(this));
  }

  loadImage(src) {
    return new Promise((resolve, reject) => {
      const elImage = document.createElement('IMG');
      elImage.addEventListener('load', function() {
        resolve(elImage);
      });
      elImage.src = src;
    });
  }

  async loadImages(sources) {
    for(let sourceIndex = (sources.length - 1); sourceIndex > -1; sourceIndex--) {
      this.cache.images[sources[sourceIndex]] = await this.loadImage(sources[sourceIndex]);
    }
  }

  loadJson(url) {
    return new Promise((resolve, reject) => {
      const request = new XMLHttpRequest();
      request.onreadystatechange = function() {
        // if DONE and SUCCESS
        if ((request.readyState == 4) && (request.status == 200)) {
          resolve(JSON.parse(request.responseText));
        }
      }
      request.open("GET", url + ".json", true);
      request.onError = function(event) { 
        console.log('ERROR!')
        throw new Error(event); 
      };
      request.send();
    });
  }

  async loadJsons(urls) {
    for(let urlIndex = (urls.length - 1); urlIndex > -1; urlIndex--) {
      this.cache.jsons[urls[urlIndex]] = await this.loadJson(urls[urlIndex]);
    }
  }
}

export default Game;
