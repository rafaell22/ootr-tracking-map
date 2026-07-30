const { contextBridge, ipcRenderer } = require('electron');

// Sandboxed preload scripts can't require() local project files, so these values are duplicated from ipcChannels.cjs.
const VOICE_CONTROL_TOGGLE = 'voice-control:toggle';
const VOICE_CONTROL_FAILURE = 'voice-control:failure';

contextBridge.exposeInMainWorld('electronAPI', {
  /**
   * @param {(enabled: boolean) => void} callback
   */
  onVoiceControlToggle(callback) {
    ipcRenderer.on(VOICE_CONTROL_TOGGLE, (_event, enabled) => callback(enabled));
  },
  reportVoiceControlFailure() {
    ipcRenderer.send(VOICE_CONTROL_FAILURE);
  },
});
