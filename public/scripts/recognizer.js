import { alwaysHintsButtons } from '/data/alwaysHints.js';

const recognizerWorker = new Worker('/scripts/workers/recognizerWorker.js');
recognizerWorker.addEventListener('message', function(event) {
    console.log('Message from recognizerWorker...');
    console.log(event);
    const { eventType, eventData } = event.data;

    switch(eventType) {
        case 'LOADED_WASM': 
            recognizerWorker.postMessage({ eventType: 'INITIALIZE_RECOGNIZER' })
            break;
        case 'INITIALIZED_RECOGNIZER':
            console.log('Recognizer successfully initialized!');
            break;
        case 'PROCESSED':
            console.log('Audio processed!')
            console.log(eventData);
            break;
        case 'STOPPED':
            console.log('Stopped recognition');
            console.log(eventData);
            break;
        case 'ERROR':
            console.log('Error in recognizerWorker!')
            console.log(eventData);
            break;
        default:
            console.log(`Event from Worker ${eventType} not recognized`);
    }
});

recognizerWorker.addEventListener("error", function(error) {
    console.log('Worker raised error!');
    console.log(error);
});

recognizerWorker.postMessage({ eventType: 'LOAD_WASM' });


const audioContext = new AudioContext();
if (navigator.mediaDevices.getUserMedia) {
  navigator.mediaDevices
        .getUserMedia({audio: true})
        .then(startUserMedia)
        .catch((e) => {
            console.log('No live audio input');
            console.log(e);
        });
} else {
  console.log('No web audio support')
}

let recorder;
function startUserMedia(stream) {
  const input = audioContext.createMediaStreamSource(stream);
  window.firefox_audio_hack = input; 

  recorder = new AudioRecorder(input);

  const intervalId = setInterval(() => {
    if (recognizerWorker) { 
      recorder.consumers = [recognizerWorker];
      clearInterval(intervalId);
    }
  }, 1000);
}

export { recorder };
