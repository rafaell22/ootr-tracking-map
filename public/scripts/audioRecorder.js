window.AudioRecorder = class AudioRecorder {
  constructor(audioSource, config = {}) {
    this.audioSource = audioSource;
    this.context = audioSource.context;

    this.inputBufferLength = config.inputBufferLength || 4096;
    this.outputBufferLength = config.outputBufferLength || 4000;
    this.node = this.context.createScriptProcessor(this.inputBufferLength);
    this.node.onaudioprocess = this.onAudioProcess.bind(this);
    this.audioSource.connect(this.node);
    this.node.connect(this.context.destination);

    this.worker = new Worker('/scripts/workers/audioRecorderWorker.js');
    this.initWorker();

    this.recording = false;
    this.consumers = [];
  }

  initWorker() {
    this.worker.postMessage({
        eventType: 'INIT',
        config: {
          sampleRate: this.context.sampleRate,
          outputBufferLength: this.outputBufferLength,
          outputSampleRate: 16000
        }
    });

    this.worker.onmessage = this.onWorkerMessage.bind(this);
  }

  onWorkerMessage(e) {
    if (
      e.data.error && 
      e.data.error === "silent"
    ) {
      throw new Error('Worker is silent');
    }

	  if (
      e.data.eventType === 'NEW_BUFFER' &&
      this.recording
    ) {
      this.consumers.forEach((consumer, y, z) => {
        consumer.postMessage({ 
          eventType: 'PROCESS', 
          data: e.data.data
        });
		  });
	  }
  }

  onAudioProcess(e) {
    if (!this.recording) {
      return;
    }

	  this.worker.postMessage({
      eventType: 'RECORD',
      buffer: [
          e.inputBuffer.getChannelData(0),
          e.inputBuffer.getChannelData(1)
      ]
    });
	}

  start(data) {
    this.consumers.forEach((consumer, y, z) => {
      consumer.postMessage({ 
        eventType: 'START_RECORDING', 
        data: data 
      });
    });

    this.recording = true;
    return (this.consumers.length > 0);
  }

  stop() {
    if(this.recording) {
      this.consumers.forEach((consumer) => {
        consumer.postMessage({
          eventType: 'STOP_RECORDING',
        });
      });

      this.recording = false;
    }

    this.worker.postMessage({ 
      eventType: 'CLEAR',
    });
  }
}
