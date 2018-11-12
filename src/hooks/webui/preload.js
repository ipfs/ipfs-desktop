const { ipcRenderer } = require('electron')

ipcRenderer.on('updatedPage', (_, url) => {
  window.location.hash = url
})

window.ipfsDesktop = {
  name: 'ipfs-desktop',

  reducer: (state = {}, action) => {
    if (!action.type.startsWith('DESKTOP_')) {
      return state
    }

    if (action.type === 'DESKTOP_SETTINGS_CHANGED') {
      return action.payload
    }

    return state
  },

  selectDesktopSettings: state => state.ipfsDesktop,

  doDesktopStartListening: () => async ({ dispatch }) => {
    ipcRenderer.on('config.changed', (_, config) => {
      dispatch({
        type: 'DESKTOP_SETTINGS_CHANGED',
        payload: config
      })
    })

    ipcRenderer.send('config.get')
  },

  doDesktopSettingsToggle: (setting) => async () => {
    ipcRenderer.send('config.toggle', setting)
  },

  init: store => {
    store.doDesktopStartListening()
  }
}

// This preload script creates the window.ipfs object with
// the apiAddress in the URL.
const urlParams = new URLSearchParams(window.location.search)
const apiAddress = urlParams.get('api')

// Inject api address
window.localStorage.setItem('ipfsApi', apiAddress)
