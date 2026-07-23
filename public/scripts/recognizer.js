import { alwaysHintsButtons } from '/data/alwaysHints.js';
import pubSub from './classes/PubSub.js';
import ItemFoundEvent from './classes/events/ItemFoundEvent.js';
import ItemSelectedEvent from './classes/events/ItemSelectedEvent.js';
import { locationItems } from './data/locations.js';
import { parseCommandHyp } from './voiceCommandParser.js';

let recorder;
let respawnInProgress = false;

/**
 * Creates a `recognizerWorker` and wires its message handling. Used both for
 * the initial bootstrap worker and, on respawn (see RESPAWN_DUE below), for
 * its replacement — `isReplacement` selects which `INITIALIZED_RECOGNIZER`
 * behavior applies.
 * @param {{ isReplacement: boolean }} options
 * @returns {Worker}
 */
function createRecognizerWorker({ isReplacement }) {
    const worker = new Worker('/scripts/workers/recognizerWorker.js');

    worker.addEventListener('message', function(event) {
        handleWorkerMessage(worker, isReplacement, event);
    });

    worker.addEventListener('error', function(error) {
        console.error('Worker raised error!');
        console.error(error);
    });

    worker.postMessage({ eventType: 'LOAD_WASM' });

    return worker;
}

function handleWorkerMessage(worker, isReplacement, event) {
    console.log('Message from recognizerWorker...');
    console.log(event);
    const { eventType, eventData } = event.data;

    switch(eventType) {
        case 'LOADED_WASM':
            worker.postMessage({ eventType: 'INITIALIZE_RECOGNIZER' })
            break;
        case 'INITIALIZED_RECOGNIZER':
            console.log('Recognizer successfully initialized!');
            if(isReplacement) {
                swapToReplacementWorker(worker);
            } else {
                beginBootstrapSession(worker);
            }
            break;
        case 'WAKE_DETECTED':
            pubSub.publish('voice-wake-detected');
            break;
        case 'COMMAND_RECOGNIZED':
            handleCommandRecognized(eventData);
            break;
        case 'COMMAND_TIMEOUT':
            console.log('Command window timed out with no recognized speech');
            break;
        case 'RESPAWN_DUE':
            respawnRecognizerWorker();
            break;
        case 'ERROR':
            console.error('Error in recognizerWorker!')
            console.error(eventData);
            break;
        default:
            console.log(`Event from Worker ${eventType} not recognized`);
    }
}

/**
 * @param {{ hyp: string, hypseg: unknown }} eventData
 */
function handleCommandRecognized(eventData) {
    const parsedCommand = parseCommandHyp(eventData.hyp);

    if(!parsedCommand) {
        pubSub.publish('voice-command-result', {
            success: false,
            message: `Sorry, I didn't understand that command.`,
        });
        return;
    }

    const { intent, itemId, locationId } = parsedCommand;
    const itemName = getItemDisplayName(itemId);
    const locationName = locationItems[locationId]?.name ?? locationId;

    if(intent === 'found') {
        pubSub.publish('item-found', new ItemFoundEvent(locationId, itemId, itemName));
    } else {
        pubSub.publish('item-selected', new ItemSelectedEvent(locationId, itemId, itemName));
    }

    pubSub.publish('voice-command-result', {
        success: true,
        message: `${itemName} placed at ${locationName}`,
    });
}

/**
 * Mirrors `SelectItems.description()`'s lookup so voice-placed items get the
 * same tooltip text a manual click would have shown.
 * @param {string} itemId
 * @returns {string}
 */
function getItemDisplayName(itemId) {
    const option = document.querySelector(`#select-items option[value="${itemId}"]`);
    if(option) {
        return option.textContent;
    }

    return itemId
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

/**
 * First-time-only setup: requests mic access, builds the `AudioRecorder`,
 * wires it to `worker`, and starts the always-on capture/forward pipeline
 * before handing off to the worker's own autonomous wake/command loop.
 * @param {Worker} worker
 */
function beginBootstrapSession(worker) {
    if(!navigator.mediaDevices.getUserMedia) {
        console.log('No web audio support')
        return;
    }

    const audioContext = new AudioContext();
    navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then((stream) => {
            const input = audioContext.createMediaStreamSource(stream);
            window.firefox_audio_hack = input;

            recorder = new AudioRecorder(input);
            recorder.consumers = [worker];
            recorder.startCapturing();
            recorder.start();

            worker.postMessage({ eventType: 'BEGIN_SESSION' });
        })
        .catch((e) => {
            console.log('No live audio input');
            console.log(e);
        });
}

/**
 * Atomically swaps the live `recorder`'s consumer over to the (already
 * initialized) replacement worker, starts its session, then terminates the
 * old worker — preserving capture continuity across the handoff (per task 2's
 * design intent: `startCapturing()`/`start()` are session-scoped, not
 * per-worker, so they are deliberately NOT re-invoked here).
 * @param {Worker} worker
 */
function swapToReplacementWorker(worker) {
    if(!recorder) {
        console.error('Cannot swap to replacement recognizer worker: no active recorder');
        return;
    }

    const previousWorker = recorder.consumers[0];
    recorder.consumers = [worker];
    worker.postMessage({ eventType: 'BEGIN_SESSION' });

    if(previousWorker) {
        previousWorker.terminate();
    }

    respawnInProgress = false;
}

/**
 * Mitigates WASM heap growth (see recognizerWorker.js RESPAWN_THRESHOLD_MS)
 * by spinning up a replacement worker; the actual consumer swap happens once
 * that replacement reports `INITIALIZED_RECOGNIZER` (see
 * `swapToReplacementWorker`). Guarded so a repeated `RESPAWN_DUE` can't
 * trigger a second swap while one is already in flight.
 */
function respawnRecognizerWorker() {
    if(respawnInProgress) {
        return;
    }

    respawnInProgress = true;
    console.log('Respawning recognizer worker to mitigate WASM heap growth...');
    createRecognizerWorker({ isReplacement: true });
}

/**
 * Entry point for wiring voice control into the app (called from main.js).
 * Creates the initial recognizer worker and starts the load/init handshake.
 */
function startVoiceControl() {
    createRecognizerWorker({ isReplacement: false });
}

export { recorder, startVoiceControl };
