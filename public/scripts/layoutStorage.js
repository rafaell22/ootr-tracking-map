export const STORAGE_KEY = 'oot-routing:selected-layout';

/**
 * @returns {string|null}
 */
export function getStoredLayoutId() {
  return localStorage.getItem(STORAGE_KEY);
}

/**
 * @param {string} id
 */
export function storeLayoutId(id) {
  localStorage.setItem(STORAGE_KEY, id);
}

/**
 * @param {{id: string}[]} manifest
 * @param {string|null|undefined} storedId
 * @returns {string|null}
 */
export function resolvePreselectedLayoutId(manifest, storedId) {
  if(!storedId) return null;

  const isStoredIdInManifest = manifest.some((entry) => entry.id === storedId);
  return isStoredIdInManifest ? storedId : null;
}
