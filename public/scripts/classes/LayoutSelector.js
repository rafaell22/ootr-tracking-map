// @ts-check
import domUtils from '../domUtils.js';

export default class LayoutSelector {
  /**
    * @param {HTMLDialogElement} dialogEl
    */
  constructor(dialogEl) {
    this.el = dialogEl;
    this.optionsEl = this.el.querySelector('#layout-options');
  }

  /**
    * @param {{id: string, name: string, loadModule: () => Promise<any>}[]} manifest
    * @param {string|null} preselectedId
    * @returns {Promise<{id: string, name: string, loadModule: () => Promise<any>}>}
    */
  pickLayout(manifest, preselectedId) {
    this.optionsEl.innerHTML = '';

    for(const entry of manifest) {
      const optionEl = domUtils.createElement('button', {
        type: 'button',
        class: ['layout-option'],
        textContent: entry.name,
      });
      optionEl.dataset.layoutId = entry.id;
      if(entry.id === preselectedId) {
        optionEl.classList.add('selected');
      }
      this.optionsEl.appendChild(optionEl);
    }

    domUtils.addListener(this.el, 'cancel', (event) => event.preventDefault());

    this.el.showModal();

    return new Promise((resolve) => {
      domUtils.addListener(this.optionsEl, 'click', (event) => {
        const optionEl = event.target.closest('.layout-option');
        if(!optionEl) return;

        const chosenEntry = manifest.find(entry => entry.id === optionEl.dataset.layoutId);
        this.el.close();
        resolve(chosenEntry);
      });
    });
  }
}
