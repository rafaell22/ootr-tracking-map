// @ts-check

/**
 * @param {(enabled: boolean) => void} callback
 */
function onVoiceControlToggle(callback) {
    window.electronAPI?.onVoiceControlToggle?.(callback);
}

function reportVoiceControlFailure() {
    window.electronAPI?.reportVoiceControlFailure?.();
}

export { onVoiceControlToggle, reportVoiceControlFailure };
