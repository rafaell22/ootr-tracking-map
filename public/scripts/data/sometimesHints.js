import domUtils from '../domUtils.js';
import { sometimesHintsLocations } from './s9/sometimesHints.js';

export function addSometimesHints() {
	const locationsList = domUtils.datalist(sometimesHintsLocations, 'sometimes-hints-locations');
  document.body.appendChild(locationsList);
}
