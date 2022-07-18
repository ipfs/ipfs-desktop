
const ipcMainEvents = Object.freeze({
  CONFIG_UPDATED: 'configUpdated',
  GC_ENDED: 'gcEnded',
  GC_RUNNING: 'gcRunning',
  IPFSD: 'ipfsd',
  IPFS_CONFIG_CHANGED: 'ipfsConfigChanged',
  LANG_UPDATED: 'languageUpdated',
  MENUBAR_CLOSE: 'menubar-will-close',
  MENUBAR_OPEN: 'menubar-will-open',
  UPDATING: 'updating',
  UPDATING_ENDED: 'updatingEnded',
  TOGGLE: (key) => `toggle_${key}`
})

module.exports = ipcMainEvents
