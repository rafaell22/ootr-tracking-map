const WAKE_PHRASE = 'hey navi';

/**
 * PocketSphinx keyword-spotting threshold for the wake phrase. Smaller
 * (more-negative-exponent) values are more sensitive (more false accepts);
 * larger values are less sensitive (more risk of missed detections).
 */
const KWS_THRESHOLD = '1e-45';

/**
 * Minimum peak sample amplitude (of a possible 32767) an idle window must
 * contain for a KWS "hey navi" hit to be accepted.
 */
const WAKE_MIN_PEAK_AMPLITUDE = 5000;

// One idle listening window before checking whether the wake phrase was
// heard. Each PROCESS chunk carries ~4000 samples at AudioRecorder's 16kHz
// output rate (~0.25s each); 6 chunks (~1.5s) comfortably covers "hey navi"
// (well under 1s of speech) plus pocketsphinx's own segmentation/endpointing
// padding, while keeping wake-word latency and the gap between
// respawn-threshold checks (see RESPAWN_THRESHOLD_MS) short.
const IDLE_CYCLE_CHUNK_COUNT = 6;

// Product-decided command window length: how long the recognizer listens for
// a command after the wake phrase is heard.
const COMMAND_WINDOW_MS = 5000;

// WASM heap growth from continuously-processed audio is only released by
// fully respawning the Worker (reIniting the decoder does not free it). 50
// minutes sits within the agreed 45-60 minute mitigation cadence.
const RESPAWN_THRESHOLD_MS = 50 * 60 * 1000;

const SESSION_STATE = {
    STOPPED: 'stopped',
    IDLE: 'idle',
    COMMAND_WINDOW: 'command_window',
};

let recognizer;
let segmentation;
let audioBuffer;
let wakeGrammar;
let commandGrammar;
let wakeSearchId;
let commandSearchId;

let sessionState = SESSION_STATE.STOPPED;
let idleChunkCount = 0;
let idleWindowPeakAmplitude = 0;
let sessionStartTime = null;
let respawnAlreadyReported = false;
let commandWindowTimeoutId = null;

self.addEventListener('message', async function(event) {
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
        case 'BEGIN_SESSION':
            try {
                beginSession();
            } catch(e) {
                self.postMessage({ eventType: 'ERROR', eventData: `Error beginning voice control session: ${e.message}` });
            }
            break;
        case 'START_RECORDING':
        case 'STOP_RECORDING':
            // AudioRecorder still emits these once, at session bootstrap (see
            // recognizer.js), but they no longer drive per-cycle behavior:
            // the recognizer's own start()/stop() cycling is now handled
            // autonomously by this worker's session state machine (see
            // BEGIN_SESSION and the IDLE/COMMAND_WINDOW handling below).
            break;
        case 'PROCESS':
            try {
                handleAudioChunk(data);
            } catch(e) {
                self.postMessage({ eventType: 'ERROR', eventData: `Error processing audio chunk: ${e.message}` });
            }
            break;
        default:
            self.postMessage({ eventType: 'ERROR', eventData: `Event ${eventType} not recognized` });
    }
});

/**
 * Emscripten's `Module.print`/`Module.printErr` hooks are the only way to
 * observe pocketsphinx's native (C-side) log output — some failure states
 * (e.g. "Final result does not match the grammar") are only ever logged this
 * way and never reflected in a `ReturnType` return code. Both hooks are read
 * once, synchronously, the moment `pocketsphinx.js`'s top-level script body
 * runs, so `self.Module` must already carry them before `importScripts`
 * executes below — setting `Module.print`/`Module.printErr` afterwards has no
 * effect, since the glue script has already captured whatever was (or
 * wasn't) there into its own internal logging closures.
 */
function forwardWasmLogLine(text) {
    if(WASM_NOTEWORTHY_LOG_PATTERN.test(text)) {
        self.postMessage({ eventType: 'ERROR', eventData: `WASM: ${text}` });
    }
}

const WASM_NOTEWORTHY_LOG_PATTERN = /^(WARN|ERROR|FATAL):/;

function loadWasm() {
    return new Promise((resolve) => {
        self.Module = {
            print: forwardWasmLogLine,
            printErr: forwardWasmLogLine,
        };

        importScripts('../wasm/pocketsphinx.js');

        Module.locateFile = function() {
            return '../wasm/pocketsphinx.wasm';
        }

        Module.onRuntimeInitialized = function(...a) {
            resolve();
        }
    }).then(() => Promise.all([
        import('../data/voiceRecData/wakeGrammar.js'),
        import('../data/voiceRecData/commandGrammar.js'),
    ]))
        .then(modules => {
            wakeGrammar = modules[0].default;
            commandGrammar = modules[1].default;
        });
}

function initializeRecognizer() {
    console.log('Initializing recognizer...')
    audioBuffer = new Module.AudioBuffer();
    segmentation = new Module.Segmentation();

    const config = new Module.Config();
    config.push_back(['-kws_threshold', KWS_THRESHOLD]);
    recognizer = new Module.Recognizer(config);
    config.delete();

    const words = new Module.VectorWords();
    for(const word of mergedVocabulary(wakeGrammar, commandGrammar)) {
        words.push_back(word);
    }
    console.log('Adding words...')
    const resultAddingWords = recognizer.addWords(words);
    words.delete();
    if(resultAddingWords !== Module.ReturnType.SUCCESS) {
        throw new Error(`Error adding words to recognizer: ${JSON.stringify(resultAddingWords)}`);
    }

    console.log('Adding wake keyword...');
    wakeSearchId = addKeywordToRecognizer(WAKE_PHRASE);
    console.log(`Wake search id: ${wakeSearchId}`);
    console.log('Adding command grammar...');
    commandSearchId = addGrammarToRecognizer(commandGrammar);
    console.log(`Command search id: ${commandSearchId}`);
    console.log('Initialization complete!');
}

/**
 * `addWords` is a single, global dictionary shared by every grammar
 * registered on a `Recognizer` — it is not scoped per grammar. Two grammars
 * defining the same word (same id) would otherwise be pushed twice; dedupe
 * defensively by id even though the current wake/command vocabularies are
 * not expected to overlap.
 * @param {...{ words: Array<[string, string]> }} grammars
 * @returns {Array<[string, string]>}
 */
function mergedVocabulary(...grammars) {
    const seenIds = new Set();
    const merged = [];

    for(const grammar of grammars) {
        for(const word of grammar.words) {
            const [id] = word;
            if(seenIds.has(id)) {
                continue;
            }
            seenIds.add(id);
            merged.push(word);
        }
    }

    return merged;
}

/**
 * Registers one grammar's transitions on the shared `recognizer` and returns
 * the real search id it was assigned. `addGrammar` fills `ids` with a real
 * sequential integer per call rather than the caller choosing it, so callers
 * must capture and reuse this id with `switchSearch`.
 * @param {{ transitions: { start: number, end: number, numStates: number, transitions: Array<object> } }} grammar
 * @returns {number}
 */
function addGrammarToRecognizer(grammar) {
    const graphTransitions = grammar.transitions;
    const transitions = new Module.VectorTransitions();
    for(const transition of graphTransitions.transitions) {
        if(!transition.logp) {
            transition.logp = 0;
        }
        transitions.push_back(transition);
    }

    const ids = new Module.Integers();
    const resultAddingGrammar = recognizer.addGrammar(ids, {
        start: graphTransitions.start,
        end: graphTransitions.end,
        numStates: graphTransitions.numStates,
        transitions: transitions,
    });
    transitions.delete();

    if(resultAddingGrammar !== Module.ReturnType.SUCCESS) {
        ids.delete();
        throw new Error('Error adding grammar to recognizer');
    }

    const searchId = ids.get(0);
    ids.delete();
    return searchId;
}

/**
 * Registers a keyphrase on the shared `recognizer`'s keyword-spotting search
 * and returns the real search id it was assigned, mirroring
 * `addGrammarToRecognizer`'s shape for the FSG path.
 * @param {string} phrase
 * @returns {number}
 */
function addKeywordToRecognizer(phrase) {
    const ids = new Module.Integers();
    const resultAddingKeyword = recognizer.addKeyword(ids, phrase);

    if(resultAddingKeyword !== Module.ReturnType.SUCCESS) {
        ids.delete();
        throw new Error('Error adding keyword to recognizer');
    }

    const searchId = ids.get(0);
    ids.delete();
    return searchId;
}

/**
 * Kicks off the autonomous wake/command session loop: switches to the wake
 * grammar, starts the recognizer, and enters IDLE. From here on, PROCESS
 * messages (fed continuously by AudioRecorder for the rest of the session)
 * drive the state machine below — no further START_RECORDING/STOP_RECORDING
 * messages are needed.
 */
function beginSession() {
    sessionStartTime = Date.now();
    respawnAlreadyReported = false;
    idleChunkCount = 0;
    idleWindowPeakAmplitude = 0;

    switchToWakeSearch();
    assertSuccess(recognizer.start(), 'Error starting recognizer at session begin');
    sessionState = SESSION_STATE.IDLE;
}

function handleAudioChunk(arrayBuffer) {
    if(sessionState === SESSION_STATE.STOPPED) {
        return;
    }

    pushAudioChunkToRecognizer(arrayBuffer);

    if(sessionState === SESSION_STATE.IDLE) {
        idleChunkCount += 1;
        idleWindowPeakAmplitude = Math.max(idleWindowPeakAmplitude, peakAmplitude(arrayBuffer));
        if(idleChunkCount >= IDLE_CYCLE_CHUNK_COUNT) {
            completeIdleCycle();
        }
    }
}

function pushAudioChunkToRecognizer(arrayBuffer) {
    while(audioBuffer.size() < arrayBuffer.length) {
        audioBuffer.push_back(0);
    }

    for(let i = 0; i < arrayBuffer.length; i++) {
        audioBuffer.set(i, arrayBuffer[i]);
    }

    assertSuccess(recognizer.process(audioBuffer), 'Error processing audio buffer');
}

function peakAmplitude(arrayBuffer) {
    let peak = 0;
    for(let i = 0; i < arrayBuffer.length; i++) {
        const abs = Math.abs(arrayBuffer[i]);
        if(abs > peak) {
            peak = abs;
        }
    }
    return peak;
}

/**
 * Ends the current idle listening window (per fact: every grammar switch
 * must be preceded by stop()), checks whether the wake phrase was heard, and
 * either hands off to the command window or starts a fresh idle window.
 */
function completeIdleCycle() {
    idleChunkCount = 0;
    assertSuccess(recognizer.stop(), 'Error stopping recognizer at end of idle cycle');
    const hyp = Utf8Decode(recognizer.getHyp());
    const peak = idleWindowPeakAmplitude;
    idleWindowPeakAmplitude = 0;

    if(isWakePhrase(hyp) && peak >= WAKE_MIN_PEAK_AMPLITUDE) {
        handleWakeDetected();
        return;
    }

    switchToWakeSearch();
    assertSuccess(recognizer.start(), 'Error restarting recognizer for next idle cycle');
    maybeReportRespawnDue();
}

function handleWakeDetected() {
    switchToCommandSearch();
    assertSuccess(recognizer.start(), 'Error starting recognizer for command window');
    sessionState = SESSION_STATE.COMMAND_WINDOW;

    self.postMessage({ eventType: 'WAKE_DETECTED' });
    commandWindowTimeoutId = setTimeout(handleCommandWindowTimeout, COMMAND_WINDOW_MS);
}

function handleCommandWindowTimeout() {
    try {
        commandWindowTimeoutId = null;
        assertSuccess(recognizer.stop(), 'Error stopping recognizer at end of command window');
        const hyp = Utf8Decode(recognizer.getHyp());
        recognizer.getHypseg(segmentation);
        const hypseg = segToArray(segmentation);

        switchToWakeSearch();
        assertSuccess(recognizer.start(), 'Error restarting recognizer after command window');
        sessionState = SESSION_STATE.IDLE;
        idleChunkCount = 0;

        if(isBlankHyp(hyp)) {
            self.postMessage({ eventType: 'COMMAND_TIMEOUT' });
        } else {
            self.postMessage({ eventType: 'COMMAND_RECOGNIZED', eventData: { hyp, hypseg } });
        }

        maybeReportRespawnDue();
    } catch(e) {
        self.postMessage({ eventType: 'ERROR', eventData: `Error finishing command window: ${e.message}` });
    }
}

/**
 * Reports (once) that this worker has crossed its memory-mitigation respawn
 * threshold. Only called between idle cycles, never mid-cycle or mid-command
 * window, so a respawn handoff on the main thread can never interrupt an
 * in-progress recognition.
 */
function maybeReportRespawnDue() {
    if(respawnAlreadyReported) {
        return;
    }

    if(Date.now() - sessionStartTime < RESPAWN_THRESHOLD_MS) {
        return;
    }

    respawnAlreadyReported = true;
    self.postMessage({ eventType: 'RESPAWN_DUE' });
}

function switchToWakeSearch() {
    assertSuccess(recognizer.switchSearch(wakeSearchId), 'Error switching to wake search');
}

function switchToCommandSearch() {
    assertSuccess(recognizer.switchSearch(commandSearchId), 'Error switching to command search');
}

function assertSuccess(result, message) {
    if(result !== Module.ReturnType.SUCCESS) {
        throw new Error(message);
    }
}

function isWakePhrase(hyp) {
    return hyp.trim() === WAKE_PHRASE;
}

function isBlankHyp(hyp) {
    return hyp.trim().length === 0;
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
