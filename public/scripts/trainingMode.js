import domUtils from './domUtils.js';

const trainingModeContainer = domUtils.el('#training-mode');
domUtils.show(trainingModeContainer);

let spoilerLog;
const loadSpoilerLog = domUtils.el('#load-spoiler-log');
domUtils.addListener(loadSpoilerLog, 'change', (event) => {
  const file = event.target.files[0];

  if(!file) {
    // handle file not selected
    return;
  }

  console.log(file.type);
  if(file.type !== 'application/json') {
    // handle wrong file type
  }

  const reader = new FileReader();
  reader.onload = () => {
    spoilerLog = JSON.parse(reader.result);
    console.log(spoilerLog)

    const spoilerLocations = spoilerLog.locations;
    const spoilerLocationNames = Object.keys(spoilerLocations).sort();
    const spoilerLocationsList = domUtils.datalist(spoilerLocationNames, 'training-list-checks');

    const spoilerHints = spoilerLog.gossip_stones;
    const spoilerHintsNames = Object.keys(spoilerHints).sort();
    const spoilerHintsList = domUtils.datalist(Object.keys(spoilerHints), 'training-list-hints');

    const spoilerEntrances = spoilerLog.entrances;
    const spoilerEntrancesNames = Object.keys(spoilerEntrances);
    const spoilerEntrancesList = domUtils.datalist(Object.keys(spoilerEntrances), 'training-list-entrances');

    const spawn = spoilerLog.randomized_settings.starting_age;
    const spawnText = domUtils.el('#training-spawn');
    spawnText.textContent = spawn;

    trainingModeContainer.appendChild(spoilerLocationsList);
    trainingModeContainer.appendChild(spoilerHintsList);
    trainingModeContainer.appendChild(spoilerEntrancesList);

    const checkInput = domUtils.el('#training-checks')
    const checkReward = domUtils.el('#training-check-reward');
    domUtils.addListener(checkInput, 'change', () => {
      const checkIndex = spoilerLocationNames.findIndex(n => n === checkInput.value);
      if(checkIndex >= 0) {
        const reward = spoilerLocations[spoilerLocationNames[checkIndex]];
        if(typeof reward === 'string') {
          checkReward.textContent = reward;
        } else {
          checkReward.textContent = reward.item;
        }
      }
    });

    const hintInput = domUtils.el('#training-hints')
    const hintText = domUtils.el('#training-hint-text');
    domUtils.addListener(hintInput, 'change', () => {
      const hintIndex = spoilerHintsNames.findIndex(n => n === hintInput.value);
      if(hintIndex >= 0) {
        const hint = spoilerHints[spoilerHintsNames[hintIndex]];
        hintText.textContent = hint.text;
      }
    });

    const entranceInput = domUtils.el('#training-entrances')
    const entranceText = domUtils.el('#training-entrance-text');
    domUtils.addListener(entranceInput, 'change', () => {
      const entranceIndex = spoilerEntrancesNames.findIndex(n => n === entranceInput.value);
      if(entranceIndex >= 0) {
        const entrance = spoilerEntrances[spoilerEntrancesNames[entranceIndex]];

        if(typeof entrance === 'string') {
          entranceText.textContent = entrance;
        } else {
          entranceText.textContent = `${entrance.region} from ${entrance.from}`
        }
      }
    });
  };
  reader.onerror = (e) => {
    console.log('Error reading file')
    console.log(e)
  };
  reader.readAsText(file);
});
