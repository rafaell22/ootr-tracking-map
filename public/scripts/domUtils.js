const domUtils = {};

domUtils.listeners = {};

domUtils.el = (query) => {
  return document.querySelector(query);
}

/**
 * @param {String|Element} query
 */
domUtils.hide = (query) => {
  let el = getEl(query);
  if(!el) return;
  el.classList.add('hidden');
};

/**
 * @param {String|Element} query
 */
domUtils.show = (query) => {
  let el = getEl(query);
  if(!el) return;
  el.classList.remove('hidden');
};

/**
 * @param {String|Element} query
 */
domUtils.toggle = (query) => {
  let el = getEl(query);
  if(!el) return;
  el.classList.toggle('hidden');
};

domUtils.addListener = (query, event, cb, options = {}) => {
  let el = getEl(query);
  if(!el) return;
  if(!options.once) {
    const id = `${query}${event}`;
    if(domUtils.listeners[id]) {
      el.removeEventListener(event, domUtils.listeners[id]); 
    }
    domUtils.listeners[id] = cb;
  }

  el.addEventListener(event, cb, options);
}

domUtils.addListener.once = (query, event, cb) => {
  domUtils.addListener(query, event, cb, { once: true });
}

domUtils.createElement = (tagName, options) => {
  const el = document.createElement(tagName);

  for(const option in options) {
    switch(option) {
      case 'class': 
        el.classList.add(...options[option]);
        break;
      default:
        el[option] = options[option];
    }
  }

  return el;
}

/**
  * @param {string[]} data
  * @param {string} [id]
  */
domUtils.datalist = (data, id) => {
  const el = domUtils.createElement('datalist', { id });

  data.forEach(d => {
    const option = domUtils.createElement('option', { value: d });
    el.appendChild(option);
  });

  return el;
}

function getEl(query) {
  if(typeof query === 'string') {
    return domUtils.el(query);
  }

  return query;
}

export default domUtils;
