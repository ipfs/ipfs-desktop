import { ipcRenderer } from 'electron'

const defaultState = {
  configs: {}
}

const bundle = {
  name: 'settings',

  reducer: (state = defaultState, action) => {
    if (!action.type.startsWith('SETTINGS_')) {
      return state
    }

    if (action.type === 'SETTINGS_CHANGED') {
      return action.payload
    }

    return state
  },

  selectSettings: state => state.settings,

  doSettingsStartListening: () => async ({ dispatch }) => {
    ipcRenderer.on('config.changed', (_, config) => {
      dispatch({
        type: 'SETTINGS_CHANGED',
        payload: config
      })
    })

    ipcRenderer.send('config.get')
  },

  doSettingsToggle: (setting) => async () => {
    ipcRenderer.send('config.toggle', setting)
  },

  doSettingsSaveConfig: (id, opts, makeDefault) => async () => {
    ipcRenderer.send('config.ipfs.changed', id, opts, makeDefault)
  },

  doSettingsRemoveConfig: (id) => async () => {
    ipcRenderer.send('config.ipfs.remove', id)
  }
}

export default bundle
