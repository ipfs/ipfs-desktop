const ipcMainEvents = Object.freeze({
  CONFIG_UPDATED: 'configUpdated',
  GC_ENDED: 'gcEnded',
  GC_RUNNING: 'gcRunning',
  IPFSD: 'ipfsd',
  IPFS_CONFIG_CHANGED: 'ipfsConfigChanged',
  LANG_UPDATED: 'languageUpdated',
  LANG_UPDATED_SUCCEEDED: 'languageUpdatedSucceeded',
  MENUBAR_CLOSE: 'menubar-will-close',
  MENUBAR_OPEN: 'menubar-will-open',
  UPDATING: 'updating',
  UPDATING_ENDED: 'updatingEnded',
  SCREENSHOT: 'screenshot',
  COUNTLY_ADD_CONSENT: 'countly.addConsent',
  COUNTLY_REMOVE_CONSENT: 'countly.removeConsent',
  ONLINE_STATUS_CHANGED: 'online-status-changed',
  TOGGLE: (key) => `toggle_${key}`
})

module.exports = ipcMainEvents
