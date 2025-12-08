let recognizer;
let segmentation;
let audioBuffer;
let graph;

self.addEventListener('message', async function(event) {
    console.log('Message from main...');
    console.log(event);
    const { eventType, data } = event.data;

    switch(eventType) {
        case 'LOAD_WASM': 
            try {
                await loadWasm();
                self.postMessage({ eventType: 'LOADED_WASM' })
            } catch(e) {
                self.postMessage({ eventType: 'ERROR', eventData: `Error loading wasm module: ${e.message}` });
            }
            break;
        case 'INITIALIZE_RECOGNIZER':
            try {
                initializeRecognizer();
                self.postMessage({ eventType: 'INITIALIZED_RECOGNIZER' })
            } catch(e) {
                self.postMessage({ eventType: 'ERROR', eventData: `Error initializing recognizer: ${e.message}` });
            }
            break;
        case 'START_RECORDING':
            startRecording();
            break;
        case 'STOP_RECORDING':
            const message = stopRecording();
            self.postMessage({ 
                eventType: 'STOPPED',
                eventData: message,
            });
            break;
        case 'PROCESS':
            const processMessage = process(data);
            self.postMessage({
              eventType: 'PROCESSED',
              eventData: processMessage,
            })
            break;
        default:
            self.postMessage({ eventType: 'ERROR', eventData: `Event ${eventType} not recognized` });
    }
});

function loadWasm() {
    return new Promise((resolve) => {
        importScripts('/scripts/wasm/pocketsphinx.js');

        Module.locateFile = function() {
            return '/scripts/wasm/pocketsphinx.wasm';
        }

        Module.onRuntimeInitialized = function(...a) {
            resolve();
        }
    }).then(() => Promise.all([
        import('/scripts/data/voiceRecData/grammar.js'),
    ]))
        .then(modules => {
            graph = modules[0].default;
        });
}

function initializeRecognizer() {
    console.log('Initializing recognizer...')
    audioBuffer = new Module.AudioBuffer();
    segmentation = new Module.Segmentation();
    recognizer = new Module.Recognizer();

    const words = new Module.VectorWords();
    for(const word of graph.words) {
        words.push_back(word);
    }
    console.log('Adding words...')
    const resultAddingWords = recognizer.addWords(words);
    words.delete();
    if(resultAddingWords != Module.ReturnType.SUCCESS) {
        throw new Error(`Error adding words to recognizer: ${JSON.stringify(resultAddingWords)}`);
    }

    const transitions = new Module.VectorTransitions();
    for(const transition of graph.transitions.transitions) {
        if(!transition.logp) {
            transition.logp = 0;
        }
        transitions.push_back(transition);
    }
    const ids = new Module.Integers();
    console.log('Adding grammar...');
    const resultAddingGrammars = recognizer.addGrammar(ids, {
        start: graph.transitions.start,
        end: graph.transitions.end,
        numStates: graph.transitions.numStates,
        transitions: transitions,
    });
    transitions.delete();
    ids.delete();
    if(resultAddingGrammars != Module.ReturnType.SUCCESS) {
        throw new Error('Error adding grammars to recognizer');
    }
    console.log('Initialization complete!');
}

function startRecording() {
    console.log('Switching search...');
    const resultSwitchingSearch = recognizer.switchSearch(1);
    if(resultSwitchingSearch !== Module.ReturnType.SUCCESS) {
        throw new Error('Error switching search!');
    }

    console.log('Starting recognizer...')
    const resultStartingRecognizer = recognizer.start();
    if(resultStartingRecognizer !== Module.ReturnType.SUCCESS) {
        throw new Error('Error starting recognizer!');
    }

    console.log('Recognizer succesfully started!');
}

function stopRecording() {
    recognizer.getHypseg(segmentation);
    const result = {
        hyp: Utf8Decode(recognizer.getHyp()),
        hypseg: segToArray(segmentation),
        final: true,
    };

    const resultStopingRecognizer = recognizer.stop();
    if(resultStopingRecognizer !== Module.ReturnType.SUCCESS) {
        throw new Error('Error stopping recognizer!');
    }

    return result;
}

function segToArray(segmentation) {
	const output = [];
	for (let i = 0 ; i < segmentation.size() ; i++) {
		output.push({
			'word': Utf8Decode(segmentation.get(i).word),
			'start': segmentation.get(i).start,
		  'end': segmentation.get(i).end
		});
	}

	return output;
};

function process(arrayBuffer) {
  while (audioBuffer.size() < arrayBuffer.length) {
	  audioBuffer.push_back(0);
	}

  for (let i = 0 ; i < arrayBuffer.length ; i++) {
    audioBuffer.set(i, arrayBuffer[i]);
  }

	const output = recognizer.process(audioBuffer);

	if (output != Module.ReturnType.SUCCESS) {
    throw new Error('Error processing audio audio buffer');
  } 

  recognizer.getHypseg(segmentation);
  return {
    hyp: Utf8Decode(recognizer.getHyp()),
    hypseg: segToArray(segmentation),
  };
}

function Utf8Encode(strUni) {
    var strUtf = strUni.replace(
        /[\u0080-\u07ff]/g,  // U+0080 - U+07FF => 2 bytes 110yyyyy, 10zzzzzz
        function(c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xc0 | cc>>6, 0x80 | cc&0x3f); }
    );
    strUtf = strUtf.replace(
        /[\u0800-\uffff]/g,  // U+0800 - U+FFFF => 3 bytes 1110xxxx, 10yyyyyy, 10zzzzzz
        function(c) {
            var cc = c.charCodeAt(0);
            return String.fromCharCode(0xe0 | cc>>12, 0x80 | cc>>6&0x3F, 0x80 | cc&0x3f); }
    );
    return strUtf;
}

function Utf8Decode(strUtf) {
    // note: decode 3-byte chars first as decoded 2-byte strings could appear to be 3-byte char!
    var strUni = strUtf.replace(
        /[\u00e0-\u00ef][\u0080-\u00bf][\u0080-\u00bf]/g,  // 3-byte chars
        function(c) {  // (note parentheses for precedence)
            var cc = ((c.charCodeAt(0)&0x0f)<<12) | ((c.charCodeAt(1)&0x3f)<<6) | ( c.charCodeAt(2)&0x3f);
            return String.fromCharCode(cc); }
    );
    strUni = strUni.replace(
        /[\u00c0-\u00df][\u0080-\u00bf]/g,                 // 2-byte chars
        function(c) {  // (note parentheses for precedence)
            var cc = (c.charCodeAt(0)&0x1f)<<6 | c.charCodeAt(1)&0x3f;
            return String.fromCharCode(cc); }
    );
    return strUni;
}
